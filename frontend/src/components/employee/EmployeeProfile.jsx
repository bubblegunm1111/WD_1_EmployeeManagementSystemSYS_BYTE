import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, MapPin, Briefcase, Calendar, User as UserIcon, Shield, Activity, Users, Loader } from 'lucide-react';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:3000/api/employees/by-email?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          setEmployeeData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#fdfcfa]">
        <Loader className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  // Fallback to user context or mock data if not found in DB
  const profileData = {
    firstName: employeeData?.first_name || user?.username?.split(' ')[0] || 'Sarah',
    lastName: employeeData?.last_name || user?.username?.split(' ')[1] || 'Johnson',
    role: employeeData?.job_title || 'Senior Product Designer',
    department: employeeData?.department || 'Design & UX',
    email: employeeData?.email || user?.email || 'sarah.j@company.com',
    phone: employeeData?.phone_number || '+1 (555) 123-4567',
    location: 'Main Office',
    joinDate: employeeData?.hire_date ? new Date(employeeData.hire_date).toLocaleDateString() : 'March 15, 2024',
    employmentType: employeeData?.employment_type || 'Full-time',
    manager: 'David Chen',
    emergencyContact: {
      name: 'Michael Johnson',
      relation: 'Spouse',
      phone: '+1 (555) 987-6543'
    },
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems'],
    bio: 'Passionate product designer with over 8 years of experience creating intuitive, user-centered digital experiences. Lead designer for the core platform team.'
  };

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar">
        
        {/* Profile Header Card */}
        <div className="bg-[#111827] rounded-[3rem] p-10 mb-8 relative shadow-xl text-white">
          {/* Decorative background elements wrapped in overflow-hidden */}
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
              <button className="px-6 py-3 bg-white text-[#111827] rounded-xl font-bold text-sm shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                <UserIcon size={18} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

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
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="font-bold text-[#111827]">{profileData.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                  <p className="font-bold text-[#111827]">{profileData.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="font-bold text-[#111827]">{profileData.location}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-red-900 mb-6 flex items-center gap-2">
                <Shield className="text-red-500" size={20} /> Emergency Contact
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-[#111827]">{profileData.emergencyContact.name}</p>
                  <p className="text-sm font-medium text-gray-500">{profileData.emergencyContact.relation}</p>
                </div>
                <div className="flex items-center gap-2 text-red-600 font-bold bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                  <Phone size={16} /> {profileData.emergencyContact.phone}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Work Info & Bio */}
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

            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm flex-1">
              <h2 className="text-xl font-extrabold text-[#111827] mb-4">About Me</h2>
              <p className="text-gray-600 font-medium leading-relaxed mb-8">
                {profileData.bio}
              </p>

              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-gray-50 border border-gray-200 text-[#111827] font-bold text-sm rounded-xl">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
