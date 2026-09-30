import toast from 'react-hot-toast';
import React from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ReportViewer({ reportData, onBack }) {
  if (!reportData) return null;

  // Export to CSV Function
  const exportToCSV = () => {
    if (!reportData.data || reportData.data.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    const headers = reportData.columns.map(col => col.label).join(',');
    
    const rows = reportData.data.map(row => {
      return reportData.columns.map(col => {
        let val = row[col.key];
        if (val === null || val === undefined) val = '';
        // Escape quotes and commas
        val = val.toString().replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportData.name.replace(/ /g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF Function using jsPDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add Header
    doc.setFontSize(22);
    doc.text(reportData.name, 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date(reportData.generated_at).toLocaleString()}`, 14, 30);

    // Prepare Table Data
    const headers = reportData.columns.map(col => col.label);
    const data = reportData.data.map(row => {
      return reportData.columns.map(col => {
        let val = row[col.key];
        return (val === null || val === undefined) ? '' : val.toString();
      });
    });

    // AutoTable
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
    });

    doc.save(`${reportData.name.replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfcfa] overflow-hidden">
      
      {/* Header Bar */}
      <div className="h-16 border-b border-gray-200 px-8 flex items-center justify-between shrink-0 bg-white shadow-sm z-10 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#111827] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-[#111827]">{reportData.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} className="text-[#4f46e5]" />
            Export PDF
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} className="text-[#16a34a]" />
            Export Excel
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-bold hover:bg-[#1f2937] transition-colors shadow-md">
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 print:p-0 custom-scrollbar">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10 print:shadow-none print:border-none print:max-w-full print:p-4">
          
          {/* Report Header */}
          <div className="mb-12 print:mb-8">
            <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight mb-2">{reportData.name}</h1>
            <p className="text-lg text-gray-500 font-medium mb-6">Generated on {new Date(reportData.generated_at).toLocaleString()}</p>
            
            {/* Dynamic Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(reportData.summary).map(([key, value], idx) => {
                if (key === 'message') return null; // Skip messages
                
                // Format label
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                // Format value
                let formattedValue = value;
                if (typeof value === 'number' && value > 1000) {
                   formattedValue = value.toLocaleString();
                }

                return (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <p className="text-sm font-bold text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-extrabold text-[#111827]">{formattedValue}</p>
                  </div>
                );
              })}
            </div>
            {reportData.summary.message && (
              <p className="mt-4 text-sm font-medium text-[#4f46e5] bg-[#4f46e5]/10 p-3 rounded-lg border border-[#4f46e5]/20">
                {reportData.summary.message}
              </p>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {reportData.columns?.map((col, idx) => (
                    <th key={idx} className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.data?.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                    {reportData.columns?.map((col, colIndex) => {
                      const val = row[col.key];
                      // Simple formatting check for numbers to add commas
                      const formattedVal = (typeof val === 'number' && val > 999) ? val.toLocaleString() : val;
                      
                      return (
                        <td key={colIndex} className="py-4 px-6 text-sm font-medium text-gray-700">
                          {colIndex === 0 ? <span className="font-bold text-[#111827]">{formattedVal}</span> : formattedVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {(!reportData.data || reportData.data.length === 0) && (
                  <tr>
                    <td colSpan={reportData.columns?.length || 1} className="py-12 text-center text-gray-500 font-medium">
                      No data found for this period.
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

export default ReportViewer;
