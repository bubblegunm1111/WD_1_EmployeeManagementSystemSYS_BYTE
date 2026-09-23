import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Briefcase, User, FileText, CheckCircle, Clock } from 'lucide-react';

function EmployeeProfileSlideOver({ employee, isOpen, onClose, onEditEmployee }) {
  const [viewState, setViewState] = useState('profile'); // 'profile', 'attendance', 'contract'
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    if (isOpen && viewState === 'attendance' && employee) {
      // Fetch attendance
      fetch(`http://localhost:3000/api/attendance/${employee.id}`)
        .then(res => res.json())
        .then(data => setAttendanceRecords(data))
        .catch(console.error);
    }
  }, [viewState, isOpen, employee]);

  if (!isOpen || !employee) {
    if (viewState !== 'profile') setViewState('profile');
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Slide-over Panel */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#fdfcfa] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-start bg-white">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-[#e0e7ff] text-[#4f46e5] rounded-full flex items-center justify-center font-bold text-2xl shadow-sm">
                {employee.first_name[0]}{employee.last_name[0]}
             </div>
             <div>
               <h2 className="text-2xl font-extrabold text-[#1e293b]">{employee.first_name} {employee.last_name}</h2>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-sm font-bold text-gray-400">EMP-{String(employee.id).padStart(3, '0')}</span>
                 <span className="text-gray-300">•</span>
                 <span className="flex items-center gap-1.5 text-xs font-bold text-[#16a34a] bg-[#dcfce7] px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full"></span> Active
                 </span>
               </div>
             </div>
          </div>
          <button onClick={() => {
            if (viewState !== 'profile') {
              setViewState('profile');
            } else {
              onClose();
            }
          }} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-[#fdfcfa]">
          
          {viewState === 'profile' && (
            <>
              {/* Section: Personal */}
              <section>
            <h3 className="text-lg font-extrabold text-[#1e293b] mb-4 flex items-center gap-2">
              <User size={18} className="text-[#8b8cf8]" /> Personal Information
            </h3>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {employee.email}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Phone size={14} className="text-gray-400"/> +1 (555) 123-4567</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</span>
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> San Francisco, CA</span>
              </div>
            </div>
          </section>

          {/* Section: Employment */}
          <section>
            <h3 className="text-lg font-extrabold text-[#1e293b] mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-[#fca5a5]" /> Employment Details
            </h3>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 gap-y-4 gap-x-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Job Title</span>
                <span className="text-sm font-bold text-gray-700">{employee.position}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department</span>
                <span className="text-sm font-bold text-gray-700">{employee.department}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employment Type</span>
                <span className="text-sm font-bold text-gray-700">Full-time</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Joined</span>
                <span className="text-sm font-bold text-gray-700 flex items-center gap-1"><Calendar size={14} className="text-gray-400"/> {new Date(employee.hire_date).toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          {/* Section: Work & Documents */}
          <section>
             <h3 className="text-lg font-extrabold text-[#1e293b] mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#fcd34d]" /> Work & Documents
            </h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => setViewState('attendance')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-[#8b8cf8] transition cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#9333ea]"><Clock size={16}/></div>
                  <span className="font-bold text-sm text-gray-700 group-hover:text-[#8b8cf8] transition">Attendance Records</span>
                </div>
                <span className="text-gray-400 font-bold">&rarr;</span>
              </button>
              
              <button onClick={() => setViewState('contract')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-[#8b8cf8] transition cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#e0e7ff] flex items-center justify-center text-[#4f46e5]"><FileText size={16}/></div>
                  <span className="font-bold text-sm text-gray-700 group-hover:text-[#8b8cf8] transition">Employment Contract</span>
                </div>
                <span className="text-gray-400 font-bold">&rarr;</span>
              </button>
            </div>
          </section>
            </>
          )}

          {viewState === 'attendance' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-extrabold text-[#1e293b] mb-4 flex items-center gap-2">
                <Clock size={20} className="text-[#8b8cf8]" /> Attendance Log
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Clock In</th>
                      <th className="px-4 py-3">Clock Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendanceRecords.map(record => (
                      <tr key={record.id}>
                        <td className="px-4 py-3 font-bold text-gray-700">{record.date}</td>
                        <td className="px-4 py-3 font-bold text-[#16a34a]">{record.clock_in}</td>
                        <td className="px-4 py-3 font-bold text-[#ea580c]">{record.clock_out || 'Active'}</td>
                      </tr>
                    ))}
                    {attendanceRecords.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-6 text-center text-gray-400 font-bold">No attendance records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewState === 'contract' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-extrabold text-[#1e293b] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#4f46e5]" /> Contract Document
              </h3>
              <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 text-sm text-gray-700 leading-relaxed font-serif">
                <h4 className="text-center font-bold text-lg mb-6 uppercase tracking-widest border-b pb-4">Employment Agreement</h4>
                <p className="mb-4">This Employment Agreement (the "Agreement") is entered into on <strong>{new Date(employee.hire_date).toLocaleDateString()}</strong>, by and between <strong>SYS Inc.</strong> ("Employer"), and <strong>{employee.first_name} {employee.last_name}</strong> ("Employee").</p>
                <p className="mb-4"><strong>1. Position and Duties</strong><br/>
                Employer hereby employs Employee as <strong>{employee.position}</strong> in the <strong>{employee.department || 'General'}</strong> department. Employee shall perform duties as reasonably assigned by the Employer.</p>
                <p className="mb-4"><strong>2. Compensation</strong><br/>
                For services rendered under this Agreement, Employer shall pay Employee an annual base salary of <strong>${employee.salary.toLocaleString()}</strong>, payable in accordance with the Employer's standard payroll practices.</p>
                <p className="mb-4"><strong>3. Employment Status</strong><br/>
                The Employee is classified as a <strong>Full-time</strong> employee and their current standing is <strong>{employee.status || 'Active'}</strong>.</p>
                <div className="mt-12 flex justify-between">
                  <div className="border-t border-gray-400 pt-2 w-32 text-center text-xs">Employer Signature</div>
                  <div className="border-t border-gray-400 pt-2 w-32 text-center text-xs">Employee Signature</div>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
          {viewState === 'profile' && (
            <button 
              onClick={() => {
                onClose();
                onEditEmployee(employee);
              }}
              className="px-5 py-2.5 rounded-full font-bold text-sm text-gray-500 hover:bg-gray-50 transition cursor-pointer"
            >
              Edit Employee
            </button>
          )}
          <button className="px-5 py-2.5 rounded-full font-bold text-sm bg-[#1e293b] text-white hover:bg-black transition shadow-md cursor-pointer">
            Message
          </button>
        </div>

      </div>
    </>
  );
}

export default EmployeeProfileSlideOver;
