import React, { useState, useEffect } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeModal from './EmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import { Search, Bell, Users, UserCheck, UserMinus, UserX, Plus, List, LayoutGrid, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { EventBus } from './Layout';

function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [stats, setStats] = useState({ total: 0, active: 0, onLeave: 0, inactive: 0 });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const handleCreate = () => setIsCreateModalOpen(true);
    EventBus.on('create-employee', handleCreate);
    return () => EventBus.off('create-employee', handleCreate);
  }, []);

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden px-8 py-6 max-w-[1600px] mx-auto">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div onClick={() => setStatusFilter('')} className="bg-[#f3e8ff] p-5 rounded-3xl border border-[#e9d5ff] flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center text-[#9333ea]">
                <Users size={24} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1e293b]">{stats.total}</p>
                <p className="text-xs font-bold text-[#9333ea]/70">Total Employees</p>
              </div>
            </div>
            <ChevronRight className="text-[#9333ea]/40" size={20} />
          </div>
          
          <div onClick={() => setStatusFilter('Active')} className="bg-[#dcfce7] p-5 rounded-3xl border border-[#bbf7d0] flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center text-[#16a34a]">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1e293b]">{stats.active}</p>
                <p className="text-xs font-bold text-[#16a34a]/70">Active</p>
              </div>
            </div>
            <ChevronRight className="text-[#16a34a]/40" size={20} />
          </div>

          <div onClick={() => setStatusFilter('On Leave')} className="bg-[#ffedd5] p-5 rounded-3xl border border-[#fed7aa] flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center text-[#ea580c]">
                <UserMinus size={24} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1e293b]">{stats.onLeave}</p>
                <p className="text-xs font-bold text-[#ea580c]/70">On Leave</p>
              </div>
            </div>
            <ChevronRight className="text-[#ea580c]/40" size={20} />
          </div>

          <div onClick={() => setStatusFilter('Inactive')} className="bg-[#fee2e2] p-5 rounded-3xl border border-[#fecaca] flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center text-[#dc2626]">
                <UserX size={24} />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1e293b]">{stats.inactive}</p>
                <p className="text-xs font-bold text-[#dc2626]/70">Inactive</p>
              </div>
            </div>
            <ChevronRight className="text-[#dc2626]/40" size={20} />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-medium text-sm transition"
              />
            </div>
            
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-full border border-gray-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition ${viewMode === 'list' ? 'bg-white shadow-sm text-[#8b8cf8]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-full transition ${viewMode === 'card' ? 'bg-white shadow-sm text-[#8b8cf8]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative">
          <EmployeeList 
            refreshTrigger={refreshTrigger} 
            searchQuery={searchQuery}
            departmentFilter={departmentFilter}
            statusFilter={statusFilter}
            viewMode={viewMode}
            onEmployeesLoaded={(data) => {
              setStats({
                total: data.length,
                active: data.filter(e => e.status === 'Active').length,
                onLeave: data.filter(e => e.status === 'On Leave').length,
                inactive: data.filter(e => e.status === 'Inactive').length
              });
            }}
            onEditEmployee={(emp) => {
              setSelectedEmployee(emp);
              setIsEditModalOpen(true);
            }}
          />
        </div>

      </div>

      <EmployeeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      <EditEmployeeModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }} 
        onSuccess={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
          setRefreshTrigger(prev => prev + 1);
        }}
        initialData={selectedEmployee}
      />
    </div>
  );
}

export default Dashboard;
