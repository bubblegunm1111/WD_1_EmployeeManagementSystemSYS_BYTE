import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, CheckCircle, FileText, X, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

function EmployeePayroll() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // By default select the most recent month if available
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentPayroll, setCurrentPayroll] = useState(null);

  // Modals state
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [issueData, setIssueData] = useState({ issue_type: 'Salary', description: '' });

  useEffect(() => {
    if (user?.email) {
      api.get(`/employees/by-email?email=${user.email}`)
        .then(res => setEmployeeId(res.data.id))
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (employeeId) {
      fetchHistory();
    }
  }, [employeeId]);

  useEffect(() => {
    if (selectedMonth && employeeId) {
      fetchCurrentPayroll();
    }
  }, [selectedMonth, employeeId]);

  const fetchHistory = async () => {
    if (!employeeId) return;
    try {
      const response = await api.get(`/payroll/history/${employeeId}`);
      setHistory(response.data);
      if (response.data.length > 0 && !history.find(h => h.month === selectedMonth)) {
        // Just leave selectedMonth as is if they manually picked, otherwise this might update it.
      }
    } catch (error) {
      console.error('Error fetching payroll history:', error);
    }
  };

  const fetchCurrentPayroll = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const response = await api.get(`/payroll/${employeeId}?month=${selectedMonth}`);
      setCurrentPayroll(response.data);
    } catch (error) {
      console.error('Error fetching current payroll:', error);
      setCurrentPayroll(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payroll/issues', {
        employee_id: employeeId,
        month: selectedMonth,
        ...issueData
      });
      setIsIssueOpen(false);
      setIssueData({ issue_type: 'Salary', description: '' });
      toast.success('Issue reported successfully. Admin has been notified.');
    } catch (error) {
      toast.error('Failed to report issue.');
    }
  };

  if (loading && !currentPayroll) {
    return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-[#8b8cf8] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Safe calculations for the selected month
  const fixedTotal = currentPayroll ? (currentPayroll.basic_salary || 0) + (currentPayroll.accommodation || 0) + (currentPayroll.transportation || 0) : 0;
  const totalEarnings = fixedTotal + (currentPayroll?.bonus || 0) + (currentPayroll?.overtime || 0);
  const totalDeductions = (currentPayroll?.loan || 0) + (currentPayroll?.absence || 0) + (currentPayroll?.penalty || 0) + (currentPayroll?.personal_expenses || 0) + (currentPayroll?.others || 0);
  const netSalary = totalEarnings - totalDeductions;
  
  // Format payment date (last day of the selected month)
  const [year, month] = selectedMonth.split('-');
  const paymentDate = new Date(year, month, 0).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6 max-w-[1200px] mx-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight mb-2">My Payroll</h1>
            <p className="text-gray-500 font-medium">View your salary, payments, deductions, and payslips.</p>
          </div>
          <div className="relative group">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-gray-200 hover:border-gray-300 text-[#1e293b] font-extrabold text-sm px-4 py-2.5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5] transition-all cursor-pointer text-center flex items-center justify-center"
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {currentPayroll ? (
          <>
            <div className="bg-[#1a1a1a] rounded-3xl p-8 shadow-xl text-white mb-10 relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileText size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                      <CalendarIcon size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                      {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentPayroll.status === 'Paid' ? (
                      <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full font-bold text-sm border border-green-500/30">
                        <CheckCircle size={14} /> PAID
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 bg-gray-500/20 text-gray-400 px-3 py-1.5 rounded-full font-bold text-sm border border-gray-500/30">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
                
                <span className="block text-sm font-bold text-gray-400 mb-2">Net Salary</span>
                <div className="text-5xl font-extrabold tracking-tight mb-8">
                  EGP {netSalary.toLocaleString()}
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-800">
                  <div className="text-sm font-medium text-gray-400">
                    Payment date: <span className="font-bold text-white">{paymentDate}</span>
                  </div>
                  <button onClick={() => setIsPayslipOpen(true)} className="bg-white text-[#1a1a1a] px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-100 transition flex items-center gap-2">
                    <FileText size={16} /> View Payslip
                  </button>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="mb-10 shrink-0">
              <h2 className="text-xl font-extrabold text-[#1e293b] mb-6">Salary Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Earnings */}
                <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Earnings</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-500">Basic</span>
                      <span className="font-extrabold text-[#1e293b]">EGP {(currentPayroll.basic_salary || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-500">Accommodation</span>
                      <span className="font-extrabold text-[#1e293b]">EGP {(currentPayroll.accommodation || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-500">Transportation</span>
                      <span className="font-extrabold text-[#1e293b]">EGP {(currentPayroll.transportation || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600 pt-2 border-t border-gray-50">
                      <span className="font-bold">Bonus</span>
                      <span className="font-extrabold">+{currentPayroll.bonus?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-600">
                      <span className="font-bold">Overtime</span>
                      <span className="font-extrabold">+{currentPayroll.overtime?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="font-bold text-gray-500 text-sm">Total Earnings</span>
                      <span className="font-extrabold text-[#1e293b] text-lg">EGP {totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Deductions</h3>
                  <div className="space-y-4">
                    {['loan', 'absence', 'penalty', 'personal_expenses', 'others'].map(field => {
                      const amount = currentPayroll[field] || 0;
                      return (
                        <div key={field} className="flex justify-between text-sm">
                          <span className="font-bold text-gray-500 capitalize">{field.replace('_', ' ')}</span>
                          <span className="font-extrabold text-[#1e293b]">EGP {amount.toLocaleString()}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                      <span className="font-bold text-gray-500 text-sm">Total Deductions</span>
                      <span className="font-extrabold text-red-600 text-lg">EGP {totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 mb-10">
            <h3 className="text-lg font-bold text-gray-600">No Payroll Record Found</h3>
            <p className="text-gray-400 text-sm mt-2">No payroll data has been generated for {selectedMonth} yet.</p>
          </div>
        )}

        {/* Payment History */}
        <div className="mb-12 shrink-0">
          <h2 className="text-xl font-extrabold text-[#1e293b] mb-6">Payment History</h2>
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Earnings</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Deductions</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Net Salary</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(record => {
                  const rFixed = (record.basic_salary || 0) + (record.accommodation || 0) + (record.transportation || 0);
                  const rEarn = rFixed + (record.bonus || 0) + (record.overtime || 0);
                  const rDed = (record.loan || 0) + (record.absence || 0) + (record.penalty || 0) + (record.personal_expenses || 0) + (record.others || 0);
                  const rNet = rEarn - rDed;
                  const [y, m] = record.month.split('-');
                  const monthName = new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long' });

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-sm text-[#1e293b]">{monthName} {y}</td>
                      <td className="px-6 py-4 font-bold text-sm text-gray-600 text-right">{rEarn.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-sm text-red-600 text-right">-{rDed.toLocaleString()}</td>
                      <td className="px-6 py-4 font-extrabold text-sm text-[#1e293b] text-right">{rNet.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        {record.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle size={12}/> Paid</span>
                        ) : (
                          <span className="text-gray-400 font-bold text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedMonth(record.month); setIsPayslipOpen(true); }}
                          className="text-[#4f46e5] hover:text-[#4338ca] font-bold text-sm transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium text-sm">No payroll history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Issue Footer */}
        <div className="mt-8 flex flex-col items-center justify-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-bold mb-4">Think something is incorrect in your payroll?</p>
          <button onClick={() => setIsIssueOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 text-[#1e293b] px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition">
            <AlertCircle size={18} className="text-orange-500" /> Report an Issue
          </button>
        </div>

      </div>

      {/* --- MODALS --- */}

      {/* Payslip Modal */}
      {isPayslipOpen && currentPayroll && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsPayslipOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition"><X size={24} /></button>
            
            <div className="p-12 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-[#1e293b] tracking-tighter mb-1">SYS PAYSLIP</h2>
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{currentPayroll.department_name || 'Company'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">Pay Period</p>
                <p className="text-sm font-medium text-gray-500">{new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})} - {paymentDate}</p>
              </div>
            </div>

            <div className="p-12 grid grid-cols-2 gap-8 bg-gray-50">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Employee</p>
                <p className="font-extrabold text-lg text-[#1e293b]">{currentPayroll.employee_first_name} {currentPayroll.employee_last_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Position</p>
                <p className="font-bold text-gray-700">{currentPayroll.position}</p>
              </div>
            </div>

            <div className="p-12">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h4 className="font-extrabold border-b border-gray-200 pb-2 mb-4 text-[#1e293b]">EARNINGS</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Basic Salary</span><span className="font-bold">{(currentPayroll.basic_salary || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Accommodation</span><span className="font-bold">{(currentPayroll.accommodation || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 font-medium">Transportation</span><span className="font-bold">{(currentPayroll.transportation || 0).toLocaleString()}</span></div>
                    {currentPayroll.bonus > 0 && <div className="flex justify-between"><span className="text-gray-600 font-medium">Bonus</span><span className="font-bold">{currentPayroll.bonus.toLocaleString()}</span></div>}
                    {currentPayroll.overtime > 0 && <div className="flex justify-between"><span className="text-gray-600 font-medium">Overtime</span><span className="font-bold">{currentPayroll.overtime.toLocaleString()}</span></div>}
                  </div>
                  <div className="flex justify-between border-t border-gray-200 mt-4 pt-2 font-extrabold">
                    <span>Total Earnings</span>
                    <span>{totalEarnings.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold border-b border-gray-200 pb-2 mb-4 text-[#1e293b]">DEDUCTIONS</h4>
                  <div className="space-y-3 text-sm">
                    {['loan', 'absence', 'penalty', 'personal_expenses', 'others'].map(field => {
                      if (currentPayroll[field] > 0) {
                        return (
                          <div key={field} className="flex justify-between">
                            <span className="text-gray-600 font-medium capitalize">{field.replace('_', ' ')}</span>
                            <span className="font-bold">{currentPayroll[field].toLocaleString()}</span>
                          </div>
                        )
                      }
                      return null;
                    })}
                  </div>
                  <div className="flex justify-between border-t border-gray-200 mt-4 pt-2 font-extrabold">
                    <span>Total Deductions</span>
                    <span>{totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-[#1a1a1a] text-white p-6 rounded-lg flex justify-between items-center">
                <span className="font-bold text-gray-400">NET PAY</span>
                <span className="text-3xl font-black">EGP {netSalary.toLocaleString()}</span>
              </div>
              
              <div className="mt-8 text-center">
                <button onClick={() => window.print()} className="text-[#4f46e5] font-bold text-sm hover:underline flex items-center justify-center gap-2 mx-auto">
                  <Download size={16} /> Download Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {isIssueOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-[#1e293b] mb-2">Report an Issue</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Think something is incorrect for your {month} payroll? Let Admin know.</p>
            
            <form onSubmit={handleReportIssue} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">What is the issue?</label>
                <select 
                  value={issueData.issue_type}
                  onChange={e => setIssueData({...issueData, issue_type: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4f46e5]"
                >
                  <option value="Salary">Salary</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Overtime">Overtime</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={issueData.description}
                  onChange={e => setIssueData({...issueData, description: e.target.value})}
                  placeholder="E.g., My overtime for September isn't included."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4f46e5] resize-none"
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsIssueOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a1a1a] text-white font-bold rounded-xl shadow-sm hover:bg-[#333333] transition">Submit Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeePayroll;
