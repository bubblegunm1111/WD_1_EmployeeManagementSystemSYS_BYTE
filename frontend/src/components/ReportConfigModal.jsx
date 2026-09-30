import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

function ReportConfigModal({ isOpen, onClose, reportType, onGenerate }) {
  const [period, setPeriod] = useState('September 2026');
  const [department, setDepartment] = useState('all');
  const [employee, setEmployee] = useState('all');
  const [includes, setIncludes] = useState({
    salary: true,
    bonus: true,
    overtime: true,
    deductions: true,
    net_total: true
  });

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setIncludes({ ...includes, [key]: !includes[key] });
  };

  const handleGenerate = () => {
    onGenerate({
      type: reportType,
      period,
      departmentId: department,
      employeeId: employee,
      includes
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#fdfcfa]">
          <h2 className="text-2xl font-extrabold text-[#111827]">{reportType} Report</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Period</label>
            <div className="relative">
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
              >
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
              <Calendar size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Departments</label>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            >
              <option value="all">All Departments</option>
              <option value="1">Engineering</option>
              <option value="2">Design</option>
              <option value="3">Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Employees</label>
            <select 
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent transition-all"
            >
              <option value="all">All Employees</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Include</label>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {Object.entries(includes).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={value}
                      onChange={() => handleToggle(key)}
                    />
                    <div className={`w-5 h-5 rounded border ${value ? 'bg-[#4f46e5] border-[#4f46e5]' : 'bg-white border-gray-300 group-hover:border-[#4f46e5]'} transition-colors flex items-center justify-center`}>
                      {value && <X size={14} className="text-white transform rotate-45 scale-75" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' }} />}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 capitalize">
                    {key.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-[#fdfcfa]">
          <button 
            onClick={handleGenerate}
            className="w-full py-4 bg-[#111827] text-white rounded-xl font-bold shadow-lg hover:bg-[#1f2937] hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2"
          >
            Generate Report
          </button>
        </div>

      </div>
    </div>
  );
}

export default ReportConfigModal;
