import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, MapPin, Briefcase, Calendar, User as UserIcon, Shield, Activity, Users, Loader, Edit2, X, Check, CreditCard } from 'lucide-react';
import api from '../../api';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/employees/by-email?email=${encodeURIComponent(user.email)}`);
      setEmployeeData(res.data);
      setFormData({
        dob: res.data.dob || '',
        gender: res.data.gender || '',
        phone: res.data.phone_number || '',
        personalEmail: res.data.personal_email || '',
        address: res.data.address || '',
        city: res.data.city || '',
        country: res.data.country || '',
        emergencyName: res.data.emergency_name || '',
        emergencyRelation: res.data.emergency_relation || '',
        emergencyPhone: res.data.emergency_phone || '',
        bankName: res.data.bank_name || '',
        bankAccount: res.data.bank_account || ''
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
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
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile information.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#fdfcfa]">
        <Loader className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#fdfcfa] p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <UserIcon size={32} />
        </div>
        <h2 className="text-2xl font-black text-[#111827] mb-2">Profile Not Found</h2>
        <p className="text-gray-500 max-w-md">
          We could not find an employee record associated with your email address ({user?.email}). Please contact your HR administrator to ensure you have been added to the system.
        </p>
      </div>
    );
  }

  // Fallback to user context or mock data if not found in DB
  const profileData = {
    firstName: employeeData.first_name,
    lastName: employeeData.last_name,
    role: employeeData.position,
    department: employeeData.department_name || employeeData.department || 'Not Assigned',
    email: employeeData.email,
    phone: employeeData.phone_number || 'Not Set',
    location: employeeData.city ? `${employeeData.city}, ${employeeData.country}` : 'Not Set',
    joinDate: new Date(employeeData.hire_date).toLocaleDateString(),
    employmentType: 'Full-time',
    manager: employeeData.manager_first_name ? `${employeeData.manager_first_name} ${employeeData.manager_last_name}` : 'Not Assigned',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
    bio: 'Passionate team member focusing on delivering high-quality work and collaborating cross-functionally.'
  };

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar relative">
        
        {/* Profile Header Card */}
        <div className="bg-[#111827] rounded-[3rem] p-10 mb-8 relative shadow-xl text-white">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 pt-4">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-[#111827] text-4xl font-black shrink-0 border-4 border-[#111827] shadow-xl relative -mt-4">
              {profileData.firstName?.[0]}{profileData.lastName?.[0]}
            </div>
            
            <div className="flex-1 text-center md:text-left mt-2">
              <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase mb-3 text-white/80 border border-white/10">
                {profileData.department}
              </div>
              <h1 className="text-4xl font-black mb-1">{profileData.firstName} {profileData.lastName}</h1>
              <p className="text-xl text-indigo-200 font-bold mb-6">{profileData.role}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium text-white/70">
                <div className="flex items-center gap-2"><Mail size={16} /> {profileData.email}</div>
                <div className="flex items-center gap-2"><MapPin size={16} /> {profileData.location}</div>
                <div className="flex items-center gap-2"><Calendar size={16} /> Joined {profileData.joinDate}</div>
              </div>
            </div>
            
            <div className="shrink-0 mt-4 md:mt-0">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white text-[#111827] rounded-xl font-bold text-sm shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer">
                  <Edit2 size={18} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors flex items-center gap-2 cursor-pointer">
                    <X size={18} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={submitting} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-400 transition-colors flex items-center gap-2 cursor-pointer">
                    <Check size={18} /> {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm mb-10 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-extrabold text-[#111827] mb-8 flex items-center gap-2">
              <UserIcon className="text-indigo-500" size={24} /> Edit Your Information
            </h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Personal Email</label>
                  <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-widest mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-widest mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Contact Name</label>
                    <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Relationship</label>
                    <input type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                    <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-sm font-extrabold text-[#111827] uppercase tracking-widest mb-4">Banking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Account / IBAN</label>
                    <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-semibold transition" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            {/* Left Column: Personal & Contact Info */}
            <div className="col-span-1 flex flex-col gap-8">
              
              <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                  <UserIcon className="text-gray-400" size={20} /> Personal Details
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="font-bold text-[#111827]">{profileData.firstName} {profileData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                    <p className="font-bold text-[#111827]">{employeeData.dob || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                    <p className="font-bold text-[#111827]">{employeeData.gender || 'Not Set'}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Work Email</p>
                    <p className="font-bold text-[#111827]">{profileData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Personal Email</p>
                    <p className="font-bold text-[#111827]">{employeeData.personal_email || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="font-bold text-[#111827]">{profileData.phone}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Home Address</p>
                    <p className="font-bold text-[#111827]">{employeeData.address || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="font-bold text-[#111827]">{profileData.location}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Work Info, Emergency, Bank Info */}
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
              
              <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                  <Briefcase className="text-indigo-500" size={20} /> Work Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Employment Type</p>
                      <p className="font-bold text-[#111827] text-lg">{profileData.employmentType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Direct Manager</p>
                      <p className="font-bold text-[#111827] text-lg">{profileData.manager}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8 shadow-sm">
                  <h2 className="text-xl font-extrabold text-red-900 mb-6 flex items-center gap-2">
                    <Shield className="text-red-500" size={20} /> Emergency Contact
                  </h2>
                  <div className="space-y-4">
                    {employeeData.emergency_name ? (
                      <>
                        <div>
                          <p className="font-bold text-[#111827]">{employeeData.emergency_name}</p>
                          <p className="text-sm font-medium text-gray-500">{employeeData.emergency_relation}</p>
                        </div>
                        <div className="flex items-center gap-2 text-red-600 font-bold bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                          <Phone size={16} /> {employeeData.emergency_phone}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-red-400">No emergency contact provided.</p>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 shadow-sm">
                  <h2 className="text-xl font-extrabold text-emerald-900 mb-6 flex items-center gap-2">
                    <CreditCard className="text-emerald-500" size={20} /> Banking Details
                  </h2>
                  <div className="space-y-4">
                    {employeeData.bank_account ? (
                      <>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bank Name</p>
                          <p className="font-bold text-[#111827]">{employeeData.bank_name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Number / IBAN</p>
                          <p className="font-bold font-mono bg-white px-3 py-2 rounded-xl border border-emerald-100 text-[#111827]">{employeeData.bank_account}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-emerald-600">No banking information provided.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
