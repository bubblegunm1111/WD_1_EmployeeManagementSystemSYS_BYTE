import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

function EmployeeOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    dob: '',
    gender: '',
    phone: '',
    personalEmail: '',
    address: '',
    city: '',
    country: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    bankName: '',
    bankAccount: '',
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/by-email?email=${encodeURIComponent(user.email)}`);
        setEmployeeData(res.data);
        setFormData(prev => ({ ...prev, phone: res.data.phone_number || '' }));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch employee", err);
        setLoading(false);
      }
    };
    if (user?.email) fetchEmployee();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.put(`/employees/${employeeData.id}/onboarding`, {
        dob: formData.dob,
        gender: formData.gender,
        personal_email: formData.personalEmail,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        emergency_name: formData.emergencyName,
        emergency_relation: formData.emergencyRelation,
        emergency_phone: formData.emergencyPhone,
        bank_name: formData.bankName,
        bank_account: formData.bankAccount
      });
      // Optionally update phone in main table if changed
      await api.put(`/employees/${employeeData.id}`, {
        ...employeeData,
        phone_number: formData.phone
      });
      navigate('/employee');
    } catch (err) {
      console.error(err);
      alert('Failed to save profile information.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !employeeData) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">Loading...</div>;
  }

  return (
    <div className="h-full w-full overflow-y-auto flex items-start justify-center bg-[#f8f9fc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Decorative blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[80px] opacity-40 bg-[#b5cdff]"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[60px] opacity-30 bg-[#ffb5d4]"></div>

      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative z-10 transition-all duration-300 my-8">
        
        {step === 1 ? (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">Complete your profile</h2>
              <p className="text-sm font-semibold text-gray-400">Let's get your information ready.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-8">
              {/* Personal Information */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                    <input type="text" disabled value={`${employeeData.first_name} ${employeeData.last_name}`} className="w-full px-4 py-3 bg-gray-100 border border-transparent rounded-xl text-gray-500 font-semibold cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
                    <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Gender</label>
                    <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold">
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Personal Email</label>
                    <input type="email" name="personalEmail" required value={formData.personalEmail} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Address</label>
                    <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Country</label>
                    <input type="text" name="country" required value={formData.country} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                    <input type="text" name="emergencyName" required value={formData.emergencyName} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Relationship</label>
                    <input type="text" name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                    <input type="tel" name="emergencyPhone" required value={formData.emergencyPhone} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">Banking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Bank Name</label>
                    <input type="text" name="bankName" required value={formData.bankName} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Account Number / IBAN</label>
                    <input type="text" name="bankAccount" required value={formData.bankAccount} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] focus:outline-none font-semibold" />
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">Profile Picture</h3>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-bold">Click to upload</span> or drag and drop</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-0.5">
                Continue
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">Your Employment Information</h2>
              <p className="text-sm font-semibold text-gray-400">Please review your employment information. If something is incorrect, contact HR.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employee ID</p>
                <p className="text-lg font-bold text-[#1a1a1a]">EMP-{employeeData.id.toString().padStart(4, '0')}</p>
              </div>
              <div className="border-t border-gray-200"></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Department</p>
                <p className="text-lg font-bold text-[#1a1a1a]">{employeeData.department || 'Not Assigned'}</p>
              </div>
              <div className="border-t border-gray-200"></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Job Title</p>
                <p className="text-lg font-bold text-[#1a1a1a]">{employeeData.position}</p>
              </div>
              <div className="border-t border-gray-200"></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manager</p>
                <p className="text-lg font-bold text-[#1a1a1a]">{employeeData.manager_first_name ? `${employeeData.manager_first_name} ${employeeData.manager_last_name}` : 'Not Assigned'}</p>
              </div>
              <div className="border-t border-gray-200"></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start Date</p>
                <p className="text-lg font-bold text-[#1a1a1a]">{employeeData.hire_date}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="w-full bg-[#8b8cf8] text-white font-bold py-4 rounded-2xl hover:bg-[#7778f2] transition shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Everything looks correct'}
              </button>
              <button 
                onClick={() => setStep(1)} 
                className="w-full bg-white border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-50 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeOnboarding;
