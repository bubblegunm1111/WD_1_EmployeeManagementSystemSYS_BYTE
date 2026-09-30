import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Building, FileText, Calendar, CheckCircle, Activity, Gift } from 'lucide-react';
import api from '../api';

function AdminOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, workingToday: 0, onLeave: 0, departments: 0 });
  const [activity, setActivity] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [orgName, setOrgName] = useState('your organization');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attRes, leaveRes, deptRes, orgRes] = await Promise.all([
          api.get('/employees'),
          api.get(`/attendance?date=${new Date().toISOString().split('T')[0]}`),
          api.get('/leave'),
          api.get('/departments'),
          api.get('/auth/organization').catch(() => null)
        ]);
        
        const employees = empRes.data;
        const attendance = attRes.data;
        const leaves = leaveRes.data;
        const departmentsData = deptRes.data;
        
        setStats({
          total: employees.length,
          workingToday: attendance.length,
          onLeave: employees.filter(e => e.status === 'On Leave').length,
          departments: departmentsData.length
        });

        setActivity(attendance.slice(0, 5)); // Just take latest 5 clocks
        
        const pending = leaves.filter(l => l.status === 'Pending');
        setPendingLeaves(pending);
        
        if (orgRes && orgRes.data && orgRes.data.name) {
          setOrgName(orgRes.data.name);
        }
      } catch (err) {
        console.error('Failed to load overview data', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6 max-w-[1600px] mx-auto">
        
        {pendingLeaves.length > 0 && (
          <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-5 mb-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#b45309] text-base flex items-center gap-2">
                Action Required: {pendingLeaves.length} Pending Leave Request{pendingLeaves.length > 1 ? 's' : ''}
              </span>
              <a href="/admin/leave" className="px-4 py-2 bg-white text-[#b45309] rounded-full font-bold text-xs shadow-sm hover:bg-gray-50 transition border border-[#fef08a]">
                Review Now
              </a>
            </div>
            <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
              {pendingLeaves.map(leave => (
                <div key={leave.id} className="text-sm font-medium text-[#b45309]/90 bg-white/50 p-2 rounded-lg border border-[#fef08a]/50">
                  <span className="font-bold">{leave.first_name} {leave.last_name}</span> requested {leave.duration_days} days off ({leave.leave_type}).
                  {leave.reason && <span className="italic block mt-0.5 text-xs">Message: "{leave.reason}"</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight">Overview</h1>
            <p className="text-gray-500 mt-1 font-medium">Welcome back, {user?.username || 'Admin'}. Here is what is happening today at <strong className="text-[#4f46e5]">{orgName}</strong>.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#e0e7ff] p-6 rounded-3xl border border-[#c7d2fe] shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/60 rounded-xl text-[#4f46e5]"><Users size={24} /></div>
              <p className="font-bold text-[#4f46e5]/80">Total Employees</p>
            </div>
            <p className="text-4xl font-extrabold text-[#1e293b]">{stats.total}</p>
          </div>
          
          <div className="bg-[#dcfce7] p-6 rounded-3xl border border-[#bbf7d0] shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/60 rounded-xl text-[#16a34a]"><CheckCircle size={24} /></div>
              <p className="font-bold text-[#16a34a]/80">Working Today</p>
            </div>
            <p className="text-4xl font-extrabold text-[#1e293b]">{stats.workingToday}</p>
          </div>

          <div className="bg-[#ffedd5] p-6 rounded-3xl border border-[#fed7aa] shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/60 rounded-xl text-[#ea580c]"><Calendar size={24} /></div>
              <p className="font-bold text-[#ea580c]/80">On Leave</p>
            </div>
            <p className="text-4xl font-extrabold text-[#1e293b]">{stats.onLeave}</p>
          </div>

          <div className="bg-[#fce7f3] p-6 rounded-3xl border border-[#fbcfe8] shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/60 rounded-xl text-[#db2777]"><Building size={24} /></div>
              <p className="font-bold text-[#db2777]/80">Departments</p>
            </div>
            <p className="text-4xl font-extrabold text-[#1e293b]">{stats.departments}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-[#1e293b]">
              <Activity size={22} className="text-gray-400" /> Recent Activity
            </h3>
            <div className="flex flex-col gap-4">
              {activity.length === 0 ? (
                <p className="text-gray-500 font-medium">No recent activity today.</p>
              ) : (
                activity.map(act => (
                  <div key={act.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-sm text-[#1e293b]">
                        {act.first_name} {act.last_name} {act.clock_out ? 'clocked out' : 'clocked in'}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        {act.clock_out ? act.clock_out : act.clock_in}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col-span-1 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-[#1e293b]">
              <Gift size={22} className="text-gray-400" /> Upcoming Birthdays
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-[#f0f9ff] rounded-2xl border border-[#e0f2fe]">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-sm">JS</div>
                <div>
                  <p className="font-bold text-sm text-[#0369a1]">John Smith</p>
                  <p className="text-xs text-[#0369a1]/70 font-semibold mt-1">Tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
