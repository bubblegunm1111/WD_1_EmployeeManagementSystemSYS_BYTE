import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, CheckCircle, Users, Search, 
  ChevronDown, MoreHorizontal, AlertCircle, PlayCircle, LogOut
} from 'lucide-react';
import api from '../api';

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('Today');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Force re-render every minute for live elapsed time in table
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(console.error);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        api.get('/employees'),
        api.get('/attendance') // Fetch all attendance to allow filtering on frontend
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setAttendanceData(attRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  // Compute stats and statuses for the selected date range
  // For simplicity, we'll default to "Today" computing
  const _now = new Date();
  const todayDateStr = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

  // Helper to determine status based on today's attendance
  const computeDailyStatus = (empId, dateStr) => {
    const record = attendance.find(a => a.employee_id === empId && a.date === dateStr);
    
    if (!record) return { label: 'Absent', color: 'bg-[#fee2e2] text-[#e11d48] border-[#fecdd3]', icon: '🔴', clockIn: '—', hours: '—', isLate: false };

    const clockInTime = record.clock_in;
    const clockOutTime = record.clock_out;
    const breakStart = record.break_start;
    const breakDuration = record.break_duration_minutes || 0;
    
    // Calculate hours if both exist
    let hoursStr = '—';
    if (clockInTime) {
      const inDate = new Date();
      const inMatch = clockInTime.match(/(\d+):(\d+)\s(AM|PM)/i);
      if (inMatch) {
        let h = parseInt(inMatch[1], 10);
        let m = parseInt(inMatch[2], 10);
        let isPM = inMatch[3].toUpperCase() === 'PM';
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
        inDate.setHours(h, m, 0, 0);
      }

      let outDate = new Date();
      if (clockOutTime) {
        const outMatch = clockOutTime.match(/(\d+):(\d+)\s(AM|PM)/i);
        if (outMatch) {
          let h = parseInt(outMatch[1], 10);
          let m = parseInt(outMatch[2], 10);
          let isPM = outMatch[3].toUpperCase() === 'PM';
          if (isPM && h < 12) h += 12;
          if (!isPM && h === 12) h = 0;
          outDate.setHours(h, m, 0, 0);
        }
      } else {
        outDate = currentTime;
      }
      
      // If it's today and not clocked out, calculate diff with current time
      if (!clockOutTime && dateStr === todayDateStr) {
        let diffMs = outDate - inDate;
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // handle overnight wrap
        
        // Subtract break duration
        diffMs -= breakDuration * 60000;
        if (diffMs < 0) diffMs = 0;

        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        hoursStr = `${hrs}h ${mins}m`;
      } else if (clockOutTime) {
        let diffMs = outDate - inDate;
        if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
        
        diffMs -= breakDuration * 60000;
        if (diffMs < 0) diffMs = 0;

        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        hoursStr = `${hrs}h ${mins}m`;
      }
    }

    // Determine specific status
    // Late if clock in after exactly 9:00 AM
    let isLate = false;
    if (clockInTime) {
      const inMatch = clockInTime.match(/(\d+):(\d+)\s(AM|PM)/i);
      if (inMatch) {
        let hour24 = parseInt(inMatch[1], 10);
        let mins = parseInt(inMatch[2], 10);
        let isPM = inMatch[3].toUpperCase() === 'PM';
        if (isPM && hour24 !== 12) hour24 += 12;
        if (!isPM && hour24 === 12) hour24 = 0;
        
        if (hour24 > 9 || (hour24 === 9 && mins > 0)) {
          isLate = true;
        }
      }
    }

    if (!clockOutTime) {
      if (breakStart) {
        return { label: 'On Break', color: 'bg-orange-100 text-orange-600 border-orange-200', icon: '⏸️', clockIn: clockInTime, hours: hoursStr, isLate };
      }
      return { label: 'Working', color: 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]', icon: '🟢', clockIn: clockInTime, hours: hoursStr, isLate };
    }

    // Present (Clocked out)
    if (isLate) return { label: 'Late', color: 'bg-[#fef9c3] text-[#ca8a04] border-[#fde047]', icon: '🟡', clockIn: clockInTime, hours: hoursStr, isLate };
    return { label: 'Present', color: 'bg-[#e0e7ff] text-[#4f46e5] border-[#c7d2fe]', icon: '🔵', clockIn: clockInTime, hours: hoursStr, isLate };
  };

  // Generate table rows based on selected date range
  let targetDateStr = todayDateStr; 
  
  const tableData = employees.map(emp => {
    const statusData = computeDailyStatus(emp.id, targetDateStr);
    return {
      ...emp,
      ...statusData
    };
  });

  // Apply Filters
  const filteredData = tableData.filter(row => {
    const matchDept = selectedDept === 'All' || row.department === selectedDept;
    const matchStatus = statusFilter === 'All' || row.label === statusFilter || 
      (statusFilter === 'Present' && (row.label === 'Present' || row.label === 'Working' || row.label === 'Late' || row.label === 'On Break'));
    
    const matchSearch = !searchQuery || 
      `${row.first_name} ${row.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());

    return matchDept && matchStatus && matchSearch;
  });

  // KPI Calculations
  const presentCount = tableData.filter(r => r.label !== 'Absent').length;
  const workingCount = tableData.filter(r => r.label === 'Working').length;
  const lateCount = tableData.filter(r => r.isLate).length;
  const absentCount = tableData.filter(r => r.label === 'Absent').length;

  return (
    <div className="flex flex-1 h-full w-full bg-[#fdfcfa] overflow-hidden p-0">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full px-12 py-10 min-h-0 min-w-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#e0f2fe] rounded-2xl flex items-center justify-center text-[#0284c7]">
              <Clock size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Attendance</h1>
              <p className="text-gray-500 font-medium">Monitor employee attendance, working hours and daily activity.</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 shrink-0">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition hover:shadow-md">
            <div className="flex items-center gap-3 mb-3 text-gray-500">
              <CheckCircle size={16} className="text-[#16a34a]" />
              <span className="text-sm font-bold">Present Today</span>
            </div>
            <div className="text-4xl font-extrabold text-[#1e293b]">{presentCount}</div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition hover:shadow-md">
            <div className="flex items-center gap-3 mb-3 text-gray-500">
              <PlayCircle size={16} className="text-[#3b82f6]" />
              <span className="text-sm font-bold">Currently Working</span>
            </div>
            <div className="text-4xl font-extrabold text-[#1e293b]">{workingCount}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition hover:shadow-md">
            <div className="flex items-center gap-3 mb-3 text-gray-500">
              <Clock size={16} className="text-[#ca8a04]" />
              <span className="text-sm font-bold">Late Today</span>
            </div>
            <div className="text-4xl font-extrabold text-[#1e293b]">{lateCount}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition hover:shadow-md">
            <div className="flex items-center gap-3 mb-3 text-gray-500">
              <AlertCircle size={16} className="text-[#ef4444]" />
              <span className="text-sm font-bold">Absent Today</span>
            </div>
            <div className="text-4xl font-extrabold text-[#1e293b]">{absentCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 mb-6 shrink-0 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-3 shrink-0">
            {/* Date Range */}
            <div className="relative">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-40 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Custom">Custom</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">Date Range</div>
            </div>

            {/* Department */}
            <div className="relative">
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="All">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">Department</div>
            </div>

            {/* Status */}
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="All">All Statuses</option>
                <option value="Working">Working</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Break">On Break</option>
                <option value="Left Early">Left Early</option>
                <option value="Missing Clock Out">Missing Clock Out</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">Status</div>
            </div>

            {/* Shift */}
            <div className="relative">
              <select 
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-36 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="All">All Shifts</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">Shift</div>
            </div>

            {/* Location */}
            <div className="relative">
              <select 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-40 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1e293b] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] pt-6 pb-2"
              >
                <option value="All">All Locations</option>
                <option value="HQ">Main HQ</option>
                <option value="Branch 1">Branch 1</option>
                <option value="Remote">Remote</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <div className="absolute left-4 top-1 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">Location</div>
            </div>
          </div>
          
          <div className="relative w-64 shrink-0">
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
        <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Clock In</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Hours</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-[#e0f2fe] text-[#0284c7]`}>
                          {getInitials(row.first_name, row.last_name)}
                        </div>
                        <div>
                          <div className="font-bold text-[#1e293b] text-sm">{row.first_name} {row.last_name}</div>
                          <div className="text-xs font-medium text-gray-400">EMP-{String(row.id).padStart(3, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm font-semibold text-gray-600">{row.department || 'N/A'}</td>
                    <td className="py-3 px-6 text-sm font-extrabold text-[#1e293b]">
                      <div className="flex items-center gap-2">
                        {row.clockIn}
                        {row.isLate && row.clockIn !== '—' && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Late</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-sm font-extrabold text-[#1e293b]">{row.hours}</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 w-max ${row.color}`}>
                        <span>{row.icon}</span> <span>{row.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <button className="text-gray-400 hover:text-[#1e293b] transition cursor-pointer">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">
                      No attendance records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Attendance;
