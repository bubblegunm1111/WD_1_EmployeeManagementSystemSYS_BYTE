import React, { useState, useEffect } from 'react';
import { FileText, Users, Clock, Calendar as CalendarIcon, Download, MoreHorizontal, Plus } from 'lucide-react';
import ReportConfigModal from './ReportConfigModal';
import ReportViewer from './ReportViewer';
import api from '../api';

function Reports() {
  const [activeReport, setActiveReport] = useState(null); // The generated report data
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [history, setHistory] = useState([]);
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
    fetchHistory();
    fetchSaved();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/reports/history');
      setHistory(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSaved = async () => {
    try {
      const response = await api.get('/reports/saved');
      setSavedReports(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenConfig = (type) => {
    setSelectedReportType(type);
    setIsConfigOpen(true);
  };

  const handleGenerate = async (config) => {
    try {
      const response = await api.post('/reports/generate', config);
      setActiveReport(response.data);
      setIsConfigOpen(false);
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error('Failed to generate report', err);
      alert('Failed to generate report');
    }
  };

  // If viewing a generated report, render the viewer
  if (activeReport) {
    return <ReportViewer reportData={activeReport} onBack={() => setActiveReport(null)} />;
  }

  // Otherwise, render the Reports homepage
  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfcfa] overflow-y-auto px-8 py-6 custom-scrollbar">
      
      {/* Header */}
      <div className="mb-10 shrink-0">
        <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Reports</h1>
        <p className="text-gray-500 font-medium">Generate, view, and export reports across your organization.</p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50">
            Date Range: Sep 1 – Sep 30 ▾
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50">
            Department ▾
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50">
            Employee ▾
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-[#4f46e5] shadow-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 ml-auto">
            <Download size={16} /> Export ▾
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 shrink-0 mb-12">
        {/* Employee Reports */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={16} /> Employee Reports
          </h2>
          <div className="space-y-4">
            <ReportCard 
              title="Employee Directory" 
              description="Complete employee information and employment details."
              onGenerate={() => handleOpenConfig('Employee Directory')}
            />
            <ReportCard 
              title="New Hires" 
              description="Employees who joined during a selected period."
              onGenerate={() => handleOpenConfig('New Hires')}
            />
            <ReportCard 
              title="Employee Changes" 
              description="New hires, department changes, promotions, etc."
              onGenerate={() => handleOpenConfig('Employee Changes')}
            />
          </div>
        </div>

        {/* Attendance Reports */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={16} /> Attendance Reports
          </h2>
          <div className="space-y-4">
            <ReportCard 
              title="Attendance Report" 
              description="Working days, absences, late arrivals, and attendance records."
              onGenerate={() => handleOpenConfig('Attendance')}
            />
            <ReportCard 
              title="Absence Report" 
              description="Employees and days absent during a selected period."
              onGenerate={() => handleOpenConfig('Absence')}
            />
            <ReportCard 
              title="Overtime Report" 
              description="Overtime hours and employees who worked them."
              onGenerate={() => handleOpenConfig('Overtime')}
            />
          </div>
        </div>

        {/* Leave Reports */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarIcon size={16} /> Leave Reports
          </h2>
          <div className="space-y-4">
            <ReportCard 
              title="Leave Summary" 
              description="Leave taken by employees during a selected period."
              onGenerate={() => handleOpenConfig('Leave Summary')}
            />
            <ReportCard 
              title="Leave by Department" 
              description="Compare leave usage across departments."
              onGenerate={() => handleOpenConfig('Leave by Department')}
            />
            <ReportCard 
              title="Leave Requests" 
              description="All approved, rejected, and pending requests."
              onGenerate={() => handleOpenConfig('Leave Requests')}
            />
          </div>
        </div>

        {/* Payroll Reports */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={16} /> Payroll Reports
          </h2>
          <div className="space-y-4">
            <ReportCard 
              title="Payroll Report" 
              description="Complete payroll breakdown including additions and deductions."
              onGenerate={() => handleOpenConfig('Payroll')}
              isHighlighted={true}
            />
            <ReportCard 
              title="Salary Report" 
              description="Basic salary, accommodation, transportation."
              onGenerate={() => handleOpenConfig('Salary')}
            />
            <ReportCard 
              title="Deductions Report" 
              description="Loan, absence, penalty, personal expenses, others."
              onGenerate={() => handleOpenConfig('Deductions')}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-12 shrink-0"></div>

      {/* Saved Reports */}
      <div className="mb-12 shrink-0">
        <h2 className="text-xl font-extrabold text-[#111827] mb-6">Saved Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedReports.map(report => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-[#4f46e5] hover:shadow-md transition-all">
              <div>
                <h3 className="font-extrabold text-[#111827] text-lg mb-1">{report.name}</h3>
                <p className="text-sm text-gray-500 font-medium">Last generated {new Date(report.last_generated).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center justify-between mt-6">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
                  View
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 mb-12 shrink-0"></div>

      {/* Recently Generated */}
      <div className="mb-12 shrink-0">
        <h2 className="text-xl font-extrabold text-[#111827] mb-6">Recently Generated</h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Report</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Generated</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">By</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-[#111827]">{item.report_name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-600">{new Date(item.created_at).toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-gray-700">{item.admin_first ? `${item.admin_first} ${item.admin_last}` : 'Ana'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md font-bold text-xs">{item.format}</span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500 font-medium">No reports generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Report Card */}
      <div className="mb-12 shrink-0">
        <button className="w-full border-2 border-dashed border-gray-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:border-[#4f46e5] hover:bg-[#4f46e5]/5 transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#4f46e5] rounded-full flex items-center justify-center mb-4 transition-colors">
            <Plus size={24} className="text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-xl font-extrabold text-[#111827] mb-2 group-hover:text-[#4f46e5] transition-colors">Create Custom Report</h3>
          <p className="text-gray-500 font-medium">Select the information you want to analyze and build your own report.</p>
        </button>
      </div>

      <ReportConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        reportType={selectedReportType}
        onGenerate={handleGenerate}
      />

    </div>
  );
}

// Subcomponent for Report Cards
function ReportCard({ title, description, onGenerate, isHighlighted }) {
  return (
    <div className={`p-5 rounded-2xl border ${isHighlighted ? 'border-[#4f46e5]/30 bg-[#4f46e5]/5' : 'border-gray-200 bg-white hover:border-[#4f46e5] hover:shadow-md'} transition-all group flex items-start justify-between gap-4`}>
      <div>
        <h3 className="font-bold text-[#111827] text-base mb-1 group-hover:text-[#4f46e5] transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 font-medium">{description}</p>
      </div>
      <button 
        onClick={onGenerate}
        className="shrink-0 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-[#4f46e5] hover:text-white transition-colors cursor-pointer"
      >
        Generate
      </button>
    </div>
  );
}

export default Reports;
