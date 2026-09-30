import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Plus, CheckCircle, Hourglass, XCircle, 
  Search, ChevronDown, MoreHorizontal, Plane, PlaneTakeoff, ShieldAlert,
  User, Heart, ChevronLeft, ChevronRight, Send
} from 'lucide-react';
import api from '../api';

function Leave() {
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // New state for calendar filtering
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    fetchLeaves();
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(console.error);
    const interval = setInterval(fetchLeaves, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leave');
      setLeaveData(response.data);
      
      const newStats = {
        total: response.data.length,
        approved: response.data.filter(l => l.status === 'Approved').length,
        pending: response.data.filter(l => l.status === 'Pending').length,
        rejected: response.data.filter(l => l.status === 'Rejected').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/leave/${id}/status`, { status });
      fetchLeaves();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]';
      case 'Pending': return 'bg-[#fef9c3] text-[#ca8a04] border-[#fde047]';
      case 'Rejected': return 'bg-[#fee2e2] text-[#ef4444] border-[#fecaca]';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Vacation': return 'text-[#8b8cf8]';
      case 'Sick Leave': return 'text-[#ef4444]';
      case 'Personal': return 'text-[#3b82f6]';
      case 'Bereavement': return 'text-[#64748b]';
      case 'Leaving Forever': return 'text-[#a855f7]';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Vacation': return <Plane size={14} />;
      case 'Sick Leave': return <ShieldAlert size={14} />;
      case 'Personal': return <User size={14} />;
      case 'Bereavement': return <Heart size={14} />;
      case 'Leaving Forever': return <PlaneTakeoff size={14} />;
      default: return null;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  // Derived filtered data
  const filteredLeaves = leaveData.filter(l => {
    const matchType = activeTab === 'All' || l.leave_type === activeTab;
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    const matchDept = deptFilter === 'All' || l.department === deptFilter;
    const matchSearch = !searchQuery || 
                        (l.first_name + ' ' + l.last_name).toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchDate = true;
    if (selectedDate) {
      const start = new Date(l.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(l.end_date);
      end.setHours(0, 0, 0, 0);
      
      const checkDate = new Date(selectedDate);
      checkDate.setHours(0, 0, 0, 0);
      
      matchDate = checkDate >= start && checkDate <= end;
    }

    return matchType && matchStatus && matchDept && matchSearch && matchDate;
  });

  // Calendar Logic
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Helper to check if a day has a leave
  const getLeaveStatusForDay = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);

    for (const leave of filteredLeaves) {
      const start = new Date(leave.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(leave.end_date);
      end.setHours(0, 0, 0, 0);

      if (checkDate >= start && checkDate <= end) {
        return leave.status;
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col xl:flex-row flex-1 xl:h-full w-full bg-[#fdfcfa] overflow-y-auto xl:overflow-hidden p-0">
      
      {/* Left Column - Main Content */}
      <div className="flex-1 flex flex-col xl:h-full px-6 sm:px-12 py-10 min-h-0 min-w-0 xl:overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f3e8ff] rounded-2xl flex items-center justify-center text-[#8b8cf8] shrink-0">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">Leave</h1>
              <p className="text-gray-500 font-medium text-sm sm:text-base">Manage employee leave requests, track balances and view leave history.</p>
            </div>
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 shrink-0">
          <div 
            onClick={() => setStatusFilter('All')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${statusFilter === 'All' ? 'bg-[#e0e7ff] border-[#c7d2fe] ring-2 ring-[#8b8cf8]' : 'bg-[#f3e8ff] border-[#e9d5ff] hover:bg-[#e0e7ff]'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <CalendarIcon size={18} className="text-[#8b8cf8]" />
              <span className="text-sm font-semibold text-gray-600">Total Requests</span>
            </div>
            <div className="text-3xl font-bold text-[#1e293b] mb-1">{stats.total}</div>
            <div className="text-xs font-bold text-[#16a34a]">↑ 12% vs last month</div>
          </div>
          
          <div 
            onClick={() => setStatusFilter('Approved')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${statusFilter === 'Approved' ? 'bg-[#dcfce7] border-[#bbf7d0] ring-2 ring-[#16a34a]' : 'bg-[#f0fdf4] border-[#dcfce7] hover:bg-[#dcfce7]'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-[#16a34a] rounded-full flex items-center justify-center text-white">
                <CheckCircle size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-600">Approved</span>
            </div>
            <div className="text-3xl font-bold text-[#1e293b] mb-1">{stats.approved}</div>
            <div className="text-xs font-bold text-[#16a34a]">↑ 8% vs last month</div>
          </div>

          <div 
            onClick={() => setStatusFilter('Pending')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${statusFilter === 'Pending' ? 'bg-[#fef08a] border-[#fde047] ring-2 ring-[#ca8a04]' : 'bg-[#fffbeb] border-[#fef3c7] hover:bg-[#fef9c3]'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-[#ca8a04]">
                <Hourglass size={18} />
              </div>
              <span className="text-sm font-semibold text-gray-600">Pending</span>
            </div>
            <div className="text-3xl font-bold text-[#1e293b] mb-1">{stats.pending}</div>
            <div className="text-xs font-bold text-[#ef4444]">↓ 2% vs last month</div>
          </div>

          <div 
            onClick={() => setStatusFilter('Rejected')}
            className={`p-5 rounded-2xl border cursor-pointer transition ${statusFilter === 'Rejected' ? 'bg-[#fecaca] border-[#fca5a5] ring-2 ring-[#ef4444]' : 'bg-[#fef2f2] border-[#fee2e2] hover:bg-[#fee2e2]'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-[#ef4444] rounded-full flex items-center justify-center text-white">
                <XCircle size={14} />
              </div>
              <span className="text-sm font-semibold text-gray-600">Rejected</span>
            </div>
            <div className="text-3xl font-bold text-[#1e293b] mb-1">{stats.rejected}</div>
            <div className="text-xs font-bold text-[#ef4444]">↓ 1% vs last month</div>
          </div>
        </div>

        {/* Tabs - Leave Types */}
        <div className="flex items-center gap-8 mb-6 overflow-x-auto no-scrollbar pb-2 shrink-0">
          {['All', 'Vacation', 'Sick Leave', 'Personal', 'Bereavement', 'Unpaid', 'Leaving Forever'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition cursor-pointer ${
                activeTab === tab 
                ? 'bg-[#e0e7ff] text-[#4f46e5]' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-3 shrink-0 overflow-x-auto no-scrollbar pb-2">
            <div className="relative">
              <select 
                onChange={(e) => {
                  if (e.target.value === 'All') setSelectedDate(null);
                  else setSelectedDate(new Date()); // Quick mock for "Today"
                }}
                className="w-40 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">
                Date Range
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">
                Status
              </div>
            </div>

            <div className="relative">
              <select 
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-48 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="All">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">
                Department
              </div>
            </div>
          </div>
          
          <div className="relative w-full xl:w-64">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-medium text-sm transition"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 min-h-[300px] bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Leave Type</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">End Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-[#e0e7ff] text-[#4f46e5]`}>
                          {getInitials(leave.first_name, leave.last_name)}
                        </div>
                        <div>
                          <div className="font-bold text-[#1e293b] text-sm">{leave.first_name} {leave.last_name}</div>
                          <div className="text-xs font-medium text-gray-400">{leave.department || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className={`flex items-center gap-1.5 font-bold text-sm bg-gray-50 w-max px-3 py-1 rounded-full ${getTypeColor(leave.leave_type)}`}>
                        {getTypeIcon(leave.leave_type)}
                        {leave.leave_type}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm font-semibold text-gray-600">{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-sm font-semibold text-gray-600">{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-sm font-semibold text-gray-600">{leave.duration_days} days</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {leave.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                            title="Approve"
                            className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition shadow-sm"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                            title="Reject"
                            className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <button className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
                          <MoreHorizontal size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                
                {filteredLeaves.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500 font-medium">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Widgets */}
      <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-6 xl:overflow-y-auto custom-scrollbar pt-6 pr-6 pb-6 border-t xl:border-t-0 xl:border-l border-gray-200 pl-6 bg-gray-50/30">
        
        {/* Calendar Widget */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-[#1e293b]">{monthNames[currentMonth]} {currentYear}</h3>
            <div className="flex gap-2 text-gray-400">
              <ChevronLeft size={18} className="cursor-pointer hover:text-gray-600" onClick={handlePrevMonth} />
              <ChevronRight size={18} className="cursor-pointer hover:text-gray-600" onClick={handleNextMonth} />
            </div>
          </div>
          
          <div className="grid grid-cols-7 text-center gap-y-4 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-[10px] font-bold text-gray-400 uppercase">{day}</div>
            ))}
            
            {/* Empty slots for start of month */}
            {[...Array(firstDay)].map((_, i) => (
              <div key={`empty-${i}`} className="text-sm font-semibold text-gray-300"></div>
            ))}
            
            {/* Days of month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const status = getLeaveStatusForDay(day);
              const checkDate = new Date(currentYear, currentMonth, day);
              
              const isSelected = selectedDate && 
                                 selectedDate.getFullYear() === currentYear && 
                                 selectedDate.getMonth() === currentMonth && 
                                 selectedDate.getDate() === day;

              let bgClass = "text-gray-600 hover:bg-gray-100";
              
              if (isSelected) {
                bgClass = "bg-[#4f46e5] text-white ring-2 ring-offset-2 ring-[#4f46e5]";
              } else if (status === 'Approved') { 
                bgClass = "bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]"; 
              } else if (status === 'Pending') { 
                bgClass = "bg-[#fef9c3] text-[#ca8a04] border border-[#fde047]"; 
              } else if (status === 'Rejected') { 
                bgClass = "bg-[#fee2e2] text-[#ef4444] border border-[#fecaca]"; 
              }

              return (
                <div key={day} className="flex justify-center">
                  <div 
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDate(null); // Toggle off
                      } else {
                        setSelectedDate(checkDate);
                      }
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer transition ${bgClass}`}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-[#1e293b]">Leave Balance</h3>
            <span className="text-xs font-bold text-[#8b8cf8] cursor-pointer hover:underline">View All</span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Plane size={16} className="text-[#8b8cf8]" />
                <span className="text-sm font-bold text-gray-600">Vacation Leave</span>
              </div>
              <span className="text-sm font-extrabold text-[#8b8cf8]">12 days</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert size={16} className="text-[#ef4444]" />
                <span className="text-sm font-bold text-gray-600">Sick Leave</span>
              </div>
              <span className="text-sm font-extrabold text-[#ef4444]">8 days</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#3b82f6]" />
                <span className="text-sm font-bold text-gray-600">Personal Leave</span>
              </div>
              <span className="text-sm font-extrabold text-[#3b82f6]">5 days</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-600">Bereavement</span>
              </div>
              <span className="text-sm font-extrabold text-gray-400">3 days</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Leave;
