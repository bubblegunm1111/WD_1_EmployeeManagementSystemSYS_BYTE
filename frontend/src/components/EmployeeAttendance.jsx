import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, ArrowRight, Play, Square, Pause } from 'lucide-react';
import api from '../api';

const EmployeeAttendance = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(null);

  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [onBreak, setOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState(null);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [history, setHistory] = useState([]);
  const [todaySummary, setTodaySummary] = useState({ clockOut: null });

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employee ID via api (not localhost)
  useEffect(() => {
    if (user?.email) {
      api.get(`/employees/by-email?email=${encodeURIComponent(user.email)}`)
        .then(res => setEmployeeId(res.data.id))
        .catch(console.error);
    }
  }, [user]);

  // Sync today's attendance state + full history
  const syncAttendance = useCallback(() => {
    if (!employeeId) return;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    api.get(`/attendance/${employeeId}`)
      .then(res => {
        const data = res.data;
        setHistory(data);

        const todaysRecord = data.find(r => r.date === todayStr);
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
          setTodaySummary({ clockOut: null });
        } else if (todaysRecord && todaysRecord.clock_out) {
          setClockedIn(false);
          setClockInTime(todaysRecord.clock_in);
          setBreakDurationMinutes(todaysRecord.break_duration_minutes || 0);
          setTodaySummary({ clockOut: todaysRecord.clock_out });
        } else {
          setClockedIn(false);
          setClockInTime(null);
          setOnBreak(false);
          setBreakDurationMinutes(0);
          setTodaySummary({ clockOut: null });
        }
      })
      .catch(console.error);
  }, [employeeId]);

  useEffect(() => {
    syncAttendance();
    const interval = setInterval(syncAttendance, 10000); // poll every 10s to stay in sync with dashboard
    return () => clearInterval(interval);
  }, [syncAttendance]);

  const handleClock = async () => {
    if (!employeeId) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    try {
      if (!clockedIn) {
        await api.post('/attendance', { employee_id: employeeId, clock_in: timeStr, date: dateStr });
      } else {
        await api.post('/attendance', { employee_id: employeeId, clock_out: timeStr, date: dateStr });
      }
      syncAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBreak = async () => {
    if (!employeeId || !clockedIn) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    try {
      await api.post('/attendance/break', { employee_id: employeeId, time: timeStr, date: dateStr });
      syncAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  // Live elapsed time string
  const getElapsedTimeString = () => {
    if (!clockedIn || !clockInTime) return '00:00:00';
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
  };

  // Compute live worked hours in minutes for progress bar
  const getWorkedMinutes = () => {
    if (!clockInTime) return 0;
    const inDate = new Date();
    const timeParts = clockInTime.match(/(\d+):(\d+)\s(AM|PM)/i);
    if (!timeParts) return 0;
    let hours = parseInt(timeParts[1], 10);
    const mins = parseInt(timeParts[2], 10);
    const isPM = timeParts[3].toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    inDate.setHours(hours, mins, 0, 0);
    let diff = currentTime - inDate;
    if (diff < 0) diff = 0;
    let diffMinutes = Math.floor(diff / 60000) - breakDurationMinutes;
    if (diffMinutes < 0) diffMinutes = 0;
    return diffMinutes;
  };

  const workedMinutes = getWorkedMinutes();
  const expectedMinutes = 8 * 60; // 8 hours
  const progressPct = Math.min(100, Math.round((workedMinutes / expectedMinutes) * 100));
  const workedH = Math.floor(workedMinutes / 60);
  const workedM = workedMinutes % 60;

  // Format history date label
  const formatDate = (dateStr) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const d = new Date(dateStr + 'T00:00:00');
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Compute worked hours for a history row
  const computeTotal = (record) => {
    if (!record.clock_in || !record.clock_out) return '--';
    const parseTime = (t) => {
      const m = t.match(/(\d+):(\d+)\s(AM|PM)/i);
      if (!m) return null;
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      if (m[3].toUpperCase() === 'PM' && h < 12) h += 12;
      if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return h * 60 + min;
    };
    const inM = parseTime(record.clock_in);
    const outM = parseTime(record.clock_out);
    if (inM === null || outM === null) return '--';
    let total = outM - inM - (record.break_duration_minutes || 0);
    if (total < 0) total = 0;
    return `${Math.floor(total / 60)}h ${total % 60}m`;
  };

  const displayDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar">

        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827]">Attendance</h1>
            <p className="text-gray-500 font-medium mt-1">Track your hours, breaks, and view your history.</p>
          </div>
          <div className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 shadow-sm flex items-center gap-2">
            <Calendar size={16} /> {displayDate}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Action Area */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">

            {/* Time Tracker Card */}
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#111827] mb-1">Time Tracker</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${clockedIn ? (onBreak ? 'bg-orange-400' : 'bg-green-500 animate-pulse') : 'bg-gray-300'}`}></div>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {clockedIn ? (onBreak ? 'On Break' : 'Clocked In') : 'Not Clocked In'}
                  </span>
                </div>
              </div>

              <div className="text-4xl font-mono font-black tracking-tight text-[#111827] bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
                {getElapsedTimeString()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClock}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                    clockedIn
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                      : 'bg-[#111827] text-white hover:bg-[#1f2937]'
                  }`}
                >
                  {clockedIn ? <><Square size={16}/> Clock Out</> : <><Play size={16}/> Clock In</>}
                </button>
                <button
                  onClick={handleBreak}
                  disabled={!clockedIn}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                    !clockedIn ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border border-gray-200' :
                    onBreak ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {onBreak ? <><Play size={16}/> Resume</> : <><Pause size={16}/> Break</>}
                </button>
              </div>
            </div>

            {/* Attendance History Table */}
            <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-extrabold text-lg text-[#111827]">Recent Activity</h3>
                <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">{history.length} records <ArrowRight size={16}/></span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Clock In</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Clock Out</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Break</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-medium">No attendance records yet.</td></tr>
                  ) : (
                    history.slice(0, 10).map((record, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-bold text-[#111827] text-sm">{formatDate(record.date)}</td>
                        <td className="py-4 px-6 font-medium text-gray-600 text-sm">{record.clock_in || '--'}</td>
                        <td className="py-4 px-6 font-medium text-gray-600 text-sm">{record.clock_out || <span className="text-green-600 font-bold">Active</span>}</td>
                        <td className="py-4 px-6 font-medium text-gray-600 text-sm">{record.break_duration_minutes ? `${record.break_duration_minutes}m` : '0m'}</td>
                        <td className="py-4 px-6 font-bold text-indigo-600 text-sm">{computeTotal(record)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Side Summary */}
          <div className="col-span-1 flex flex-col gap-8">
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#111827] mb-6">Today's Summary</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Clock In</span>
                  <span className="font-bold text-[#111827]">{clockInTime || '--:--'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Clock Out</span>
                  <span className="font-bold text-[#111827]">{todaySummary.clockOut || (clockedIn ? <span className="text-green-600">Active</span> : '--:--')}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Break Taken</span>
                  <span className="font-bold text-[#111827]">{Math.floor(breakDurationMinutes / 60)}h {breakDurationMinutes % 60}m</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Worked</span>
                  <span className="font-bold text-indigo-600">{workedH}h {workedM}m</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Expected</span>
                  <span className="font-bold text-[#111827]">8h 00m</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Daily Progress</span>
                    <span className="text-sm font-bold text-indigo-600">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-[#4f46e5] h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
