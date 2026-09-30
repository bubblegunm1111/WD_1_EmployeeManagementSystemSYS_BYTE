import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle } from 'lucide-react';
import api from '../api';

function Payroll() {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Default to current month YYYY-MM
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    fetchPayroll();
  }, [selectedMonth]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/payroll?month=${selectedMonth}`);
      setPayrolls(response.data);
      
      const issuesRes = await api.get('/payroll/issues/all');
      setIssues(issuesRes.data.filter(i => i.status === 'Open'));
    } catch (error) {
      console.error('Error fetching payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIssue = async (id) => {
    try {
      await api.put(`/payroll/issues/${id}`);
      setIssues(issues.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error resolving issue:', error);
    }
  };

  const totals = payrolls.reduce((acc, curr) => {
    const fixed = (curr.basic_salary || 0) + (curr.accommodation || 0) + (curr.transportation || 0);
    const bonus = curr.bonus || 0;
    const overtime = curr.overtime || 0;
    const deductions = (curr.loan || 0) + (curr.absence || 0) + (curr.penalty || 0) + (curr.personal_expenses || 0) + (curr.others || 0);
    
    return {
      salary: acc.salary + fixed,
      bonus: acc.bonus + bonus,
      overtime: acc.overtime + overtime,
      deductions: acc.deductions + deductions,
      net: acc.net + (fixed + bonus + overtime - deductions)
    };
  }, { salary: 0, bonus: 0, overtime: 0, deductions: 0, net: 0 });

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6 max-w-[1600px] mx-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight mb-2">Payroll</h1>
            <p className="text-gray-500 font-medium">Manage employee salaries, additions, deductions, and final payroll.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] shadow-sm"
            />
            <button className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#333333] transition flex items-center gap-2">
              <Play size={16} fill="currentColor" /> Run Payroll
            </button>
          </div>
        </div>

        {/* Issues Banner */}
        {issues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {issues.length} Open Payroll {issues.length === 1 ? 'Issue' : 'Issues'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map(issue => (
                <div key={issue.id} className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wider">{issue.issue_type}</span>
                      <p className="font-bold text-[#1e293b]">{issue.first_name} {issue.last_name}</p>
                      <p className="text-xs font-medium text-gray-500">For {issue.month}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium my-3 bg-white p-3 rounded-lg border border-red-50">"{issue.description}"</p>
                  <div className="flex justify-between items-center mt-4">
                    <button onClick={() => navigate(`/admin/payroll/${issue.employee_id}?month=${issue.month}`)} className="text-sm font-bold text-[#4f46e5] hover:underline">View Payroll</button>
                    <button onClick={() => handleResolveIssue(issue.id)} className="text-xs font-bold bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Mark Resolved</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1e293b] mb-4">Payroll Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Total Salary</span>
              <div className="font-extrabold text-xl text-[#1e293b]">
                EGP {totals.salary.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Total Bonus</span>
              <div className="font-extrabold text-xl text-green-600">
                EGP {totals.bonus.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Total Overtime</span>
              <div className="font-extrabold text-xl text-blue-600">
                EGP {totals.overtime.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Total Deductions</span>
              <div className="font-extrabold text-xl text-red-600">
                EGP {totals.deductions.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#4f46e5] p-5 rounded-2xl border border-[#4338ca] shadow-md text-white">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block mb-2">Net Payroll</span>
              <div className="font-extrabold text-2xl">
                EGP {totals.net.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div>
          <h2 className="text-lg font-bold text-[#1e293b] mb-4">Employee Payroll</h2>
          
          {loading ? (
            <div className="flex justify-center mt-10"><div className="w-8 h-8 border-4 border-[#8b8cf8] border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Fixed Salary</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Bonus</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Overtime</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Deductions</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Total Net</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payrolls.map(p => {
                    const fixed = (p.basic_salary || 0) + (p.accommodation || 0) + (p.transportation || 0);
                    const deductions = (p.loan || 0) + (p.absence || 0) + (p.penalty || 0) + (p.personal_expenses || 0) + (p.others || 0);
                    const net = fixed + (p.bonus || 0) + (p.overtime || 0) - deductions;
                    
                    return (
                      <tr 
                        key={p.id} 
                        onClick={() => navigate(`/admin/payroll/${p.employee_id}?month=${selectedMonth}`)}
                        className="hover:bg-gray-50 transition cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-sm text-[#1e293b]">{p.employee_first_name} {p.employee_last_name}</span>
                          <span className="block text-xs text-gray-500 mt-1">{p.department_name}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-sm text-gray-600 text-right">{fixed.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-sm text-green-600 text-right">+{p.bonus.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-sm text-blue-600 text-right">+{p.overtime.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-sm text-red-600 text-right">-{deductions.toLocaleString()}</td>
                        <td className="px-6 py-4 font-extrabold text-sm text-[#1e293b] text-right">{net.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          {p.status === 'Paid' ? (
                            <span className="inline-flex items-center justify-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                              <CheckCircle size={12} /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                              {p.status || 'Draft'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {payrolls.length === 0 && (
                <div className="p-8 text-center text-gray-500 font-medium text-sm">
                  No employees found to run payroll.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payroll;
