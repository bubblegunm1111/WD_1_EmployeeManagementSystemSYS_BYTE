import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, 
  Send, 
  Plane, 
  ShieldAlert, 
  User, 
  Heart,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import api from '../api';

const LEAVE_TYPES = [
  { id: 'Annual Leave', icon: <Plane size={16} />, color: 'text-[#8b8cf8]', bg: 'bg-[#e0e7ff]', border: 'border-[#c7d2fe]' },
  { id: 'Sick Leave', icon: <ShieldAlert size={16} />, color: 'text-[#ef4444]', bg: 'bg-[#fee2e2]', border: 'border-[#fecaca]' },
  { id: 'Vacation', icon: <Plane size={16} />, color: 'text-[#3b82f6]', bg: 'bg-[#dbeafe]', border: 'border-[#bfdbfe]' },
  { id: 'Personal', icon: <User size={16} />, color: 'text-[#10b981]', bg: 'bg-[#d1fae5]', border: 'border-[#a7f3d0]' },
  { id: 'Other', icon: <MoreHorizontal size={16} />, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
];

function EmployeeLeave() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(null);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchMyLeaves = async (id) => {
    try {
      const response = await api.get('/leave');
      // Filter leaves to only this employee
      const mine = response.data.filter(l => l.employee_id === id);
      setMyLeaves(mine);
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    }
  };

  useEffect(() => {
    let interval;
    if (user?.email) {
      fetch(`http://localhost:3000/api/employees/by-email?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          setEmployeeId(data.id);
          fetchMyLeaves(data.id);
          // Poll every 5 seconds for live status updates from admin
          interval = setInterval(() => {
            fetchMyLeaves(data.id);
          }, 5000);
        })
        .catch(console.error);
    }
    return () => clearInterval(interval);
  }, [user]);

  const handleDateClick = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
    } else if (selected < startDate) {
      setStartDate(selected);
    } else {
      setEndDate(selected);
    }
  };

  const getDaysDiff = () => {
    if (!startDate || !endDate) return startDate ? 1 : 0;
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  };

  const handleSubmit = async () => {
    if (!employeeId || !startDate || !endDate) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/leave', {
        employee_id: employeeId,
        leave_type: leaveType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        duration_days: getDaysDiff(),
        reason: notes
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setStartDate(null);
      setEndDate(null);
      setNotes('');
      fetchMyLeaves(employeeId); // Refresh history list immediately
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const isSelected = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }
    if (startDate) {
      return date.getTime() === startDate.getTime();
    }
    return false;
  };
  
  const isStart = (day) => {
    if (!startDate) return false;
    return new Date(currentYear, currentMonth, day).getTime() === startDate.getTime();
  };
  
  const isEnd = (day) => {
    if (!endDate) return false;
    return new Date(currentYear, currentMonth, day).getTime() === endDate.getTime();
  };

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden p-0 font-sans">
      <div className="flex-1 flex flex-col h-full px-12 py-10 min-h-0 min-w-0 overflow-y-auto">
        
        <div className="mb-8 shrink-0">
          <button className="flex items-center gap-2 text-gray-400 hover:text-[#1a1a1a] transition mb-4 font-bold text-sm">
            <ChevronLeft size={16} /> Back
          </button>
          <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">Request Time Off</h1>
          <p className="text-gray-500 font-medium mt-1">Take a break, recharge, and come back stronger.</p>
        </div>

        <div className="flex gap-8">
          
          {/* Main Form Area */}
          <div className="flex-1 max-w-3xl flex flex-col gap-8">
            
            {/* Reason for Leave */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Reason for Leave</h3>
              <p className="text-sm font-medium text-gray-400 mb-4">Select the type of leave you are requesting.</p>
              
              <div className="flex flex-wrap gap-3">
                {LEAVE_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setLeaveType(type.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm transition border ${
                      leaveType === type.id 
                        ? `${type.bg} ${type.color} ${type.border} ring-2 ring-offset-1 ring-[${type.color.replace('text-', '')}]` 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {type.icon}
                    {type.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Date Range</h3>
              <p className="text-sm font-medium text-gray-400 mb-4">Choose the start and end date for your leave.</p>
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={20} className="text-gray-400" />
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Start Date</div>
                      <div className="font-bold text-[#1a1a1a]">{startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}</div>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
                
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalendarIcon size={20} className="text-gray-400" />
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">End Date</div>
                      <div className="font-bold text-[#1a1a1a]">{endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}</div>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>

              <div className="flex gap-6">
                {/* Calendar UI */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex-1 max-w-[340px]">
                  <div className="flex items-center justify-between mb-6">
                    <ChevronLeft size={20} className="cursor-pointer text-gray-400 hover:text-[#1a1a1a]" onClick={handlePrevMonth} />
                    <h3 className="font-extrabold text-[#1a1a1a]">{monthNames[currentMonth]} {currentYear}</h3>
                    <ChevronRight size={20} className="cursor-pointer text-gray-400 hover:text-[#1a1a1a]" onClick={handleNextMonth} />
                  </div>
                  
                  <div className="grid grid-cols-7 text-center gap-y-2 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-xs font-extrabold text-gray-400 mb-2">{day}</div>
                    ))}
                    
                    {[...Array(firstDay)].map((_, i) => (
                      <div key={`empty-${i}`}></div>
                    ))}
                    
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const active = isSelected(day);
                      const isS = isStart(day);
                      const isE = isEnd(day);
                      
                      let classes = "w-10 h-10 flex items-center justify-center text-sm font-bold cursor-pointer transition rounded-full mx-auto ";
                      
                      if (active && !isS && !isE) {
                        classes += "bg-[#e0e7ff] text-[#4f46e5]";
                      } else if (isS || isE) {
                        classes += "bg-[#4f46e5] text-white shadow-md transform scale-110 z-10 relative";
                      } else {
                        classes += "text-gray-600 hover:bg-gray-100";
                      }

                      return (
                        <div key={day} className="relative py-1">
                          {/* Background connector for range */}
                          {active && !isS && !isE && (
                            <div className="absolute inset-y-1 left-0 right-0 bg-[#e0e7ff] -z-10"></div>
                          )}
                          {isS && endDate && (
                            <div className="absolute inset-y-1 left-1/2 right-0 bg-[#e0e7ff] -z-10"></div>
                          )}
                          {isE && startDate && (
                            <div className="absolute inset-y-1 left-0 right-1/2 bg-[#e0e7ff] -z-10"></div>
                          )}
                          
                          <div onClick={() => handleDateClick(day)} className={classes}>
                            {day}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total Days & Info */}
                <div className="bg-[#f8f9ff] rounded-[2rem] border border-[#e0e7ff] p-8 flex flex-col justify-center flex-1 max-w-[240px]">
                  <div className="flex items-center gap-3 text-[#4f46e5] mb-2">
                    <CalendarIcon size={20} />
                  </div>
                  <div className="text-gray-500 font-extrabold text-sm uppercase tracking-wider mb-1">Total Days</div>
                  <div className="text-5xl font-black text-[#1a1a1a] mb-6">{getDaysDiff()} <span className="text-2xl font-bold text-gray-400 tracking-normal">days</span></div>
                  
                  <div className="bg-white/60 p-4 rounded-xl border border-[#e0e7ff]/50 flex items-start gap-3">
                    <Info size={16} className="text-[#4f46e5] mt-0.5 shrink-0" />
                    <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                      Your request will be sent to your manager for approval. You'll be notified once a decision is made.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">Notes (optional)</h3>
              <p className="text-sm font-medium text-gray-400 mb-4">Add any additional information (e.g. travel plans, handover details).</p>
              
              <div className="relative">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  placeholder="Type here..."
                  className="w-full bg-white border border-gray-200 rounded-[2rem] p-6 min-h-[160px] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] resize-none pb-14"
                ></textarea>
                <div className="absolute bottom-6 left-6 text-xs font-bold text-gray-400">
                  {notes.length}/500
                </div>
                <div className="absolute bottom-4 right-4">
                  <button 
                    onClick={handleSubmit}
                    disabled={!startDate || !endDate || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-lg transition ${
                      (!startDate || !endDate) ? 'bg-gray-300 cursor-not-allowed' : 
                      success ? 'bg-green-500' : 'bg-[#4f46e5] hover:bg-[#4338ca] hover:scale-105 transform'
                    }`}
                  >
                    {success ? 'Sent!' : (
                      <>
                        <Send size={16} /> Send Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Info Panel / History */}
          <div className="hidden xl:flex flex-col w-[380px] shrink-0">
            <div className="bg-[#f8f9ff] rounded-[3rem] p-8 flex-1 border border-[#e0e7ff] flex flex-col h-[700px]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-[#1a1a1a]">Leave History</h2>
                <span className="text-xs font-bold text-[#4f46e5] bg-[#e0e7ff] px-3 py-1 rounded-full">{myLeaves.length} Requests</span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar">
                {myLeaves.length === 0 ? (
                  <div className="text-center text-gray-400 font-medium mt-10 text-sm">
                    You haven't made any leave requests yet.
                  </div>
                ) : (
                  myLeaves.map(leave => {
                    let statusBg = 'bg-gray-100 text-gray-600 border-gray-200';
                    let iconBg = 'bg-gray-200';
                    
                    if (leave.status === 'Approved') {
                      statusBg = 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]';
                      iconBg = 'bg-[#16a34a]';
                    } else if (leave.status === 'Rejected') {
                      statusBg = 'bg-[#fee2e2] text-[#ef4444] border-[#fecaca]';
                      iconBg = 'bg-[#ef4444]';
                    } else if (leave.status === 'Pending') {
                      statusBg = 'bg-[#fef08a] text-[#ca8a04] border-[#fde047]';
                      iconBg = 'bg-[#ca8a04]';
                    }

                    return (
                      <div key={leave.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col transition hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${iconBg}`}></div>
                            <span className="font-extrabold text-[#1a1a1a] text-sm">{leave.leave_type}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusBg}`}>
                            {leave.status}
                          </span>
                        </div>
                        
                        <div className="text-xs font-semibold text-gray-500 mb-1">
                          {new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        
                        <div className="text-xs font-bold text-[#4f46e5] mb-3">
                          {leave.duration_days} Day{leave.duration_days > 1 ? 's' : ''}
                        </div>

                        {leave.reason && (
                          <div className="text-xs font-medium text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                            "{leave.reason}"
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default EmployeeLeave;
