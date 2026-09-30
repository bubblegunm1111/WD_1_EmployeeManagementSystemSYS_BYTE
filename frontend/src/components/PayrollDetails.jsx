import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Save } from 'lucide-react';
import api from '../api';

function PayrollDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const month = queryParams.get('month');
  
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    bonus: 0,
    overtime: 0,
    loan: 0,
    absence: 0,
    penalty: 0,
    personal_expenses: 0,
    others: 0
  });

  useEffect(() => {
    if (!month) {
      navigate('/admin/payroll');
      return;
    }
    fetchPayrollDetails();
  }, [id, month]);

  const fetchPayrollDetails = async () => {
    try {
      const response = await api.get(`/payroll/${id}?month=${month}`);
      setPayroll(response.data);
      setFormData({
        bonus: response.data.bonus || 0,
        overtime: response.data.overtime || 0,
        loan: response.data.loan || 0,
        absence: response.data.absence || 0,
        penalty: response.data.penalty || 0,
        personal_expenses: response.data.personal_expenses || 0,
        others: response.data.others || 0
      });
    } catch (error) {
      console.error('Error fetching payroll details:', error);
      toast.error('Failed to load payroll details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/payroll/${id}`, { ...formData, month });
      fetchPayrollDetails();
      // maybe show a toast
    } catch (error) {
      toast.error('Failed to save adjustments');
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await api.post(`/payroll/${id}/pay`, { month });
      fetchPayrollDetails();
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-[#8b8cf8] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!payroll) return null;

  const fixedTotal = (payroll.basic_salary || 0) + (payroll.accommodation || 0) + (payroll.transportation || 0);
  
  const totalEarnings = fixedTotal + Number(formData.bonus) + Number(formData.overtime);
  const totalDeductions = Number(formData.loan) + Number(formData.absence) + Number(formData.penalty) + Number(formData.personal_expenses) + Number(formData.others);
  const netSalary = totalEarnings - totalDeductions;

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6 max-w-[1200px] mx-auto custom-scrollbar">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin/payroll')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition mb-4">
            <ArrowLeft size={16} /> Payroll Overview
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight mb-2">
                {payroll.employee_first_name} {payroll.employee_last_name}
              </h1>
              <p className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full w-fit">
                {payroll.position} · {payroll.department_name}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg">
                Period: {month}
              </span>
              {payroll.status === 'Paid' ? (
                <span className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
                  <CheckCircle size={16} /> Paid
                </span>
              ) : (
                <button onClick={handleMarkAsPaid} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-green-700 transition flex items-center gap-2">
                  <CheckCircle size={16} /> Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Fixed & Adjustments */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Fixed Payroll */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#1e293b] mb-6">Fixed Payroll</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <span className="font-bold text-gray-500">Basic Salary</span>
                  <span className="font-extrabold text-[#1e293b]">EGP {(payroll.basic_salary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <span className="font-bold text-gray-500">Accommodation</span>
                  <span className="font-extrabold text-[#1e293b]">EGP {(payroll.accommodation || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                  <span className="font-bold text-gray-500">Transportation</span>
                  <span className="font-extrabold text-[#1e293b]">EGP {(payroll.transportation || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-extrabold text-[#1e293b] text-lg">Fixed Salary</span>
                  <span className="font-extrabold text-[#1e293b] text-lg">EGP {fixedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Adjustments (Additions & Deductions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Additional Earnings */}
              <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <h2 className="text-xl font-extrabold text-[#1e293b] mb-6">Additional Earnings</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bonus</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">EGP</span>
                      <input 
                        type="number" 
                        disabled={payroll.status === 'Paid'}
                        value={formData.bonus}
                        onChange={e => setFormData({...formData, bonus: e.target.value})}
                        className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#1e293b] focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Overtime</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">EGP</span>
                      <input 
                        type="number" 
                        disabled={payroll.status === 'Paid'}
                        value={formData.overtime}
                        onChange={e => setFormData({...formData, overtime: e.target.value})}
                        className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#1e293b] focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <h2 className="text-xl font-extrabold text-[#1e293b] mb-6">Deductions</h2>
                <div className="space-y-5">
                  {['loan', 'absence', 'penalty', 'personal_expenses', 'others'].map(field => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{field.replace('_', ' ')}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">EGP</span>
                        <input 
                          type="number" 
                          disabled={payroll.status === 'Paid'}
                          value={formData[field]}
                          onChange={e => setFormData({...formData, [field]: e.target.value})}
                          className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[#1e293b] focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Final Summary Stickied */}
          <div>
            <div className="bg-[#1a1a1a] rounded-3xl p-8 shadow-xl sticky top-8 text-white">
              <h2 className="text-xl font-extrabold mb-8 text-gray-300">Final Salary</h2>
              
              <div className="space-y-4 mb-8 text-sm font-bold">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Total Earnings</span>
                  <span className="text-white">EGP {totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Total Deductions</span>
                  <span className="text-white">EGP {totalDeductions.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 mb-8">
                <span className="block text-sm font-bold text-gray-400 mb-1">Net Salary</span>
                <span className="text-4xl font-extrabold tracking-tight">EGP {netSalary.toLocaleString()}</span>
              </div>

              {payroll.status !== 'Paid' && (
                <button type="submit" className="w-full bg-[#4f46e5] text-white py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-[#4338ca] transition flex justify-center items-center gap-2">
                  <Save size={20} /> Save Adjustments
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

export default PayrollDetails;
