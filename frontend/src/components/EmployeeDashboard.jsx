import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, CheckCircle, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api';

function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [onBreak, setOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState(null);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [orgName, setOrgName] = useState('your organization');

  // Live timer for current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch organization name
    api.get('/auth/organization').then(res => {
      if (res.data && res.data.name) setOrgName(res.data.name);
    }).catch(console.error);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch real employee ID from DB using Auth email
  useEffect(() => {
    if (user?.email) {
      api.get(`/employees/by-email?email=${encodeURIComponent(user.email)}`)
        .then(res => setEmployeeId(res.data.id))
        .catch(console.error);
    }
  }, [user]);

  // Sync today's attendance state
  const syncAttendance = () => {
    if (employeeId) {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      api.get(`/attendance/${employeeId}`)
        .then(res => {
          const data = res.data;
          const todaysRecord = data.find(r => r.date === today);
          if (todaysRecord && !todaysRecord.clock_out) {
            setClockedIn(true);
            setClockInTime(todaysRecord.clock_in);
            if (todaysRecord.break_start) {
              setOnBreak(true);
              setBreakStart(todaysRecord.break_start);
            } else {
              setOnBreak(false);
              setBreakStart(null);
            }
            setBreakDurationMinutes(todaysRecord.break_duration_minutes || 0);
          } else {
            setClockedIn(false);
            setClockInTime(todaysRecord ? todaysRecord.clock_in : null);
            setOnBreak(false);
            setBreakDurationMinutes(todaysRecord ? todaysRecord.break_duration_minutes : 0);
          }
        })
        .catch(console.error);
    }
  };

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    syncAttendance();
    
    if (employeeId) {
      const fetchTasks = () => {
        api.get(`/tasks/${employeeId}`)
          .then(res => setTasks(res.data))
          .catch(console.error);
      };
      
      fetchTasks();
      const interval = setInterval(fetchTasks, 3000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [employeeId]);

  const handleClock = async () => {
    if (!employeeId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    try {
      if (!clockedIn) {
        await api.post('/attendance', {
          employee_id: employeeId,
          clock_in: timeStr,
          date: dateStr
        });
        setClockInTime(timeStr);
        setClockedIn(true);
      } else {
        await api.post('/attendance', {
          employee_id: employeeId,
          clock_out: timeStr,
          date: dateStr
        });
      }
      syncAttendance();
    } catch (err) {
      console.error('Failed to log time', err);
    }
  };

  const handleBreak = async () => {
    if (!employeeId || !clockedIn) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    try {
      await api.post('/attendance/break', {
        employee_id: employeeId,
        time: timeStr,
        date: dateStr
      });
      syncAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper function to format greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">{getGreeting()}, {user?.username?.split(' ')[0] || 'Employee'} 👋</h1>
          <p className="text-gray-500 font-medium mt-2 text-lg">Here's your agenda for today at <strong className="text-[#4f46e5]">{orgName}</strong>, {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer" onClick={() => navigate('/employee/attendance')}>
            <div className="flex items-center gap-3 text-gray-500 font-bold mb-4">
              <Clock size={20} className="text-[#4f46e5]" />
              Work Hours
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#111827]">9:00 AM – 5:00 PM</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Standard Schedule</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer" onClick={() => navigate('/employee/tasks')}>
            <div className="flex items-center gap-3 text-gray-500 font-bold mb-4">
              <CheckCircle size={20} className="text-green-500" />
              My Tasks
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#111827]">{tasks.filter(t => t.status !== 'Done').length} remaining</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Active tasks</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer" onClick={() => navigate('/employee/schedule')}>
            <div className="flex items-center gap-3 text-gray-500 font-bold mb-4">
              <Calendar size={20} className="text-orange-500" />
              Next Event
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#111827]">10:00 AM</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Team Meeting • Engineering</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition cursor-pointer" onClick={() => navigate('/employee/documents')}>
            <div className="flex items-center gap-3 text-gray-500 font-bold mb-4">
              <FileText size={20} className="text-red-500" />
              Documents
            </div>
            <div>
              <p className="text-2xl font-extrabold text-red-600">1 action required</p>
              <p className="text-sm font-medium text-gray-500 mt-1">Employee Handbook</p>
            </div>
          </div>

        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Tasks & Action Items */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
            
            {/* Priority Tasks */}
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl text-[#111827]">Priority Tasks</h3>
                <button onClick={() => navigate('/employee/tasks')} className="text-sm font-bold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1">
                  View all <ArrowRight size={16} />
                </button>
              </div>
              <div className="space-y-4">
                {tasks.filter(t => t.status !== 'Done').slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-[#4f46e5] transition" onClick={() => navigate('/employee/tasks')}>
                    <div className="flex items-center gap-4">
                      <button className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-green-500 transition-colors"></button>
                      <div>
                        <p className="font-bold text-[#111827]">{t.title}</p>
                        <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${t.priority === 'High' ? 'text-red-500' : t.priority === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                          {t.priority} Priority • {t.due}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status !== 'Done').length === 0 && (
                  <p className="text-sm font-bold text-gray-400 text-center py-4">No priority tasks right now!</p>
                )}
              </div>
            </div>

            {/* Action Required Documents */}
            <div className="bg-[#fff1f2] border border-[#ffe4e6] rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={24} className="text-red-500" />
                <h3 className="font-extrabold text-xl text-red-900">Action Required</h3>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-[#111827]">Employee Handbook Update</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">Please acknowledge that you have read the updated policy.</p>
                </div>
                <button onClick={() => navigate('/employee/documents')} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
                  Review
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Time Tracker & Schedule */}
          <div className="col-span-1 flex flex-col gap-8">
            
            {/* Time Tracker Widget */}
            <div className="bg-[#1a1a1a] rounded-[2rem] p-8 shadow-lg flex flex-col justify-between relative overflow-hidden text-white">
              {/* Subtle glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#4f46e5]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

              <div className="w-full flex justify-between items-center mb-6 relative z-10">
                <div className="text-xs font-extrabold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} /> Time Tracker
                </div>
                <div className={`w-3 h-3 rounded-full ${clockedIn ? (onBreak ? 'bg-orange-400' : 'bg-green-400 animate-pulse') : 'bg-white/20'}`}></div>
              </div>

              <div className="flex flex-col items-center justify-center flex-1 my-4 relative z-10">
                <div className="text-5xl font-mono font-black tracking-tighter text-white drop-shadow-md">
                  {(() => {
                    if (!clockedIn || !clockInTime) return currentTime.toLocaleTimeString('en-US', { hour12: false });
                    if (onBreak && breakStart) return 'PAUSED';

                    const inDate = new Date();
                    const timeParts = clockInTime.match(/(\d+):(\d+)\s(AM|PM)/i);
                    if (timeParts) {
                      let hours = parseInt(timeParts[1], 10);
                      const mins = parseInt(timeParts[2], 10);
                      const isPM = timeParts[3].toUpperCase() === 'PM';
                      if (isPM && hours < 12) hours += 12;
                      if (!isPM && hours === 12) hours = 0;
                      inDate.setHours(hours, mins, 0, 0);
                      
                      let diff = currentTime - inDate;
                      if (diff < 0) diff += 24 * 3600 * 1000;
                      
                      diff -= breakDurationMinutes * 60000;
                      if (diff < 0) diff = 0;

                      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                      return `${h}:${m}:${s}`;
                    }
                    return '00:00:00';
                  })()}
                </div>
                <p className="mt-4 font-semibold text-white/80">{clockedIn ? (onBreak ? 'Paused' : 'Currently Working') : 'Not Clocked In'}</p>
                <p className="text-xs font-medium text-white/50 mt-1">{clockInTime ? `Clocked in at ${clockInTime}` : 'Ready to start your day?'}</p>
              </div>

              <div className="flex gap-3 relative z-10 w-full mt-4">
                <button 
                  onClick={handleClock} 
                  className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition ${
                    clockedIn 
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
                      : 'bg-[#4f46e5] text-white hover:bg-[#4338ca]'
                  }`}
                >
                  {clockedIn ? 'Clock Out' : 'Clock In'}
                </button>
                <button 
                  onClick={handleBreak}
                  disabled={!clockedIn}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition ${
                    !clockedIn ? 'opacity-30 cursor-not-allowed bg-white/10 text-white' : 
                    onBreak ? 'bg-[#fef08a] text-[#1a1a1a] hover:bg-[#fde047]' : 'bg-white text-[#1a1a1a] hover:bg-gray-100'
                  }`}
                >
                  {onBreak ? 'Resume Work' : 'Take Break'}
                </button>
              </div>
            </div>

            {/* Quick Schedule */}
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm flex-1">
              <h3 className="font-extrabold text-xl text-[#111827] mb-6">Today's Schedule</h3>
              <div className="relative border-l-2 border-gray-100 pl-6 pb-2 space-y-6">
                
                <div className="relative">
                  <div className="absolute -left-[31px] w-3 h-3 rounded-full bg-gray-300 ring-4 ring-white"></div>
                  <p className="text-sm font-bold text-gray-500 mb-1">9:00 AM</p>
                  <p className="font-bold text-[#111827]">Team Meeting</p>
                  <p className="text-sm text-gray-500">Engineering</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[31px] w-3 h-3 rounded-full bg-[#4f46e5] ring-4 ring-white"></div>
                  <p className="text-sm font-bold text-[#4f46e5] mb-1">11:30 AM <span className="text-xs bg-[#4f46e5]/10 px-2 py-0.5 rounded-full ml-2">Up Next</span></p>
                  <p className="font-bold text-[#111827]">1:1 with Manager</p>
                  <p className="text-sm text-gray-500">Conference Room B</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] w-3 h-3 rounded-full bg-gray-300 ring-4 ring-white"></div>
                  <p className="text-sm font-bold text-gray-500 mb-1">2:00 PM</p>
                  <p className="font-bold text-[#111827]">Project Review</p>
                  <p className="text-sm text-gray-500">Main Office</p>
                </div>

              </div>
              <button onClick={() => navigate('/employee/schedule')} className="w-full mt-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                View Full Calendar
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default EmployeeDashboard;
