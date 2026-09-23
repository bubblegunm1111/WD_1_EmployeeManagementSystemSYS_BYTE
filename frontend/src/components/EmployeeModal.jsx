import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Key, Mail, CheckCircle, Copy } from 'lucide-react';
import { auth } from '../firebase';
import api from '../api';

function EmployeeModal({ isOpen, onClose, onSuccess, initialData }) {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', position: '', department: '', status: 'Active', salary: '', role: 'employee'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.first_name,
        lastName: initialData.last_name,
        email: initialData.email,
        position: initialData.position,
        department: initialData.department || '',
        status: initialData.status || 'Active',
        salary: initialData.salary,
        role: initialData.role || 'employee'
      });
    } else {
      setFormData({ firstName: '', lastName: '', email: '', position: '', department: '', status: 'Active', salary: '', role: 'employee' });
    }
    setStep(1);
    setIsSuccess(false);
    setTempPassword('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        position: formData.position,
        department: formData.department,
        status: formData.status,
        salary: Number(formData.salary)
      };

      if (!payload.first_name || !payload.last_name || !payload.email || !payload.position || !payload.salary) {
        alert('Please fill in all required fields (Name, Email, Position, Salary).');
        return;
      }

      if (initialData) {
        await api.put(`/employees/${initialData.id}`, payload);
        // Reset and close for edit
        setStep(1);
        setFormData({ firstName: '', lastName: '', email: '', position: '', department: '', status: 'Active', salary: '', role: 'employee' });
        onSuccess();
      } else {
        const response = await api.post('/employees', payload);
        
        if (response.data.tempPassword) {
          setTempPassword(response.data.tempPassword);
        }

        setIsSuccess(true);
      }
      
    } catch (error) {
      console.error('Failed to save employee', error);
      const errMsg = error.response?.data?.error || 'Error saving employee';
      alert(`Error: ${errMsg}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.12)] w-full max-w-xl overflow-hidden flex flex-col transform transition-all">
        
        {/* Header */}
        <div className="px-10 py-8 flex justify-between items-center border-b border-gray-50 bg-white">
          <h2 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">{initialData ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-10 py-6 bg-white flex justify-between items-center relative border-b border-gray-50">
          <div className="absolute top-1/2 left-16 right-16 h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 ${step >= 1 ? 'bg-[#8b8cf8] text-white shadow-lg shadow-[#8b8cf8]/30 scale-110' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}><User size={20}/></div>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${step >= 1 ? 'text-[#8b8cf8]' : 'text-gray-400'}`}>Basic</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 ${step >= 2 ? 'bg-[#8b8cf8] text-white shadow-lg shadow-[#8b8cf8]/30 scale-110' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}><Briefcase size={20}/></div>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${step >= 2 ? 'text-[#8b8cf8]' : 'text-gray-400'}`}>Work</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 ${step >= 3 ? 'bg-[#8b8cf8] text-white shadow-lg shadow-[#8b8cf8]/30 scale-110' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}><Key size={20}/></div>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest ${step >= 3 ? 'text-[#8b8cf8]' : 'text-gray-400'}`}>Account</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-10 py-10 bg-[#fdfcfa] flex-1">
          {isSuccess && (
            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center text-[#16a34a] mb-6 shadow-sm">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#1e293b] mb-2 text-center">Employee Created!</h3>
              <p className="text-gray-500 font-bold text-center max-w-sm">An official invitation email containing their temporary password has been dispatched to <span className="text-[#8b8cf8]">{formData.email}</span>.</p>
              
              <button onClick={() => {
                setStep(1);
                setIsSuccess(false);
                setFormData({ firstName: '', lastName: '', email: '', position: '', department: '', status: 'Active', salary: '', role: 'employee' });
                onSuccess();
              }} className="mt-8 px-8 py-3 rounded-full font-extrabold bg-[#1e293b] text-white hover:bg-black transition shadow-lg cursor-pointer hover:-translate-y-0.5">
                Done
              </button>
            </div>
          )}

          {!isSuccess && step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="jane.doe@company.com" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Job Title</label>
                  <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 appearance-none transition shadow-sm cursor-pointer">
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Salary (Annual)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-extrabold">$</span>
                    <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full pl-10 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="85000" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 appearance-none transition shadow-sm cursor-pointer">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">System Role</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.role === 'employee' ? 'border-[#8b8cf8] bg-[#f5f5ff] text-[#8b8cf8] shadow-md' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                    <input type="radio" name="role" value="employee" checked={formData.role === 'employee'} onChange={handleChange} className="hidden" />
                    <User size={24} />
                    <span className="font-extrabold text-lg">Employee</span>
                  </label>
                  <label className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.role === 'admin' ? 'border-[#8b8cf8] bg-[#f5f5ff] text-[#8b8cf8] shadow-md' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                    <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} className="hidden" />
                    <Briefcase size={24} />
                    <span className="font-extrabold text-lg">Admin</span>
                  </label>
                </div>
              </div>
              <div className="bg-[#f0f9ff] p-5 rounded-2xl border border-[#bae6fd] mt-2 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#e0f2fe] flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#0369a1]" />
                </div>
                <p className="text-sm font-bold text-[#0369a1] leading-relaxed">An invitation email will be automatically sent to <span className="font-extrabold">{formData.email || 'the new employee'}</span> with instructions to set their password and log in.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="px-10 py-8 border-t border-gray-100 bg-white flex justify-between items-center">
            {step > 1 ? (
              <button onClick={handleBack} className="px-8 py-3.5 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer">
                Back
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button onClick={handleNext} className="px-10 py-3.5 rounded-full font-extrabold bg-[#1e293b] text-white hover:bg-black transition shadow-lg cursor-pointer ml-auto hover:-translate-y-0.5">
                Continue
              </button>
            ) : (
              <button onClick={handleSubmit} className="px-10 py-3.5 rounded-full font-extrabold bg-[#8b8cf8] text-white hover:bg-[#7778f2] transition shadow-lg cursor-pointer ml-auto hover:-translate-y-0.5">
                {initialData ? 'Save Changes' : 'Create Employee'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default EmployeeModal;
