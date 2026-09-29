import React, { useState, useRef } from 'react';
import { FileText, Download, Eye, Upload, Filter, Search, AlertCircle, Folder, CheckCircle, X } from 'lucide-react';

const CATEGORIES = ['Employment', 'Personal', 'HR', 'Payslips', 'Other'];

const MOCK_DOCUMENTS = [
  { id: 1, name: 'Employment Contract', category: 'Employment', status: 'Active', uploaded: 'Jan 12, 2026', expires: '-', by: 'HR' },
  { id: 2, name: 'Employee Agreement', category: 'Employment', status: 'Active', uploaded: 'Jan 12, 2026', expires: '-', by: 'HR' },
  { id: 3, name: 'ID Document', category: 'Personal', status: 'Active', uploaded: 'Jan 10, 2026', expires: 'Dec 31, 2030', by: 'Employee' },
  { id: 4, name: 'Company Policies', category: 'HR', status: 'Active', uploaded: 'Feb 1, 2026', expires: '-', by: 'HR' },
  { id: 5, name: 'September 2026 Payslip', category: 'Payslips', status: 'Generated', uploaded: 'Sep 28, 2026', expires: '-', by: 'System' },
  { id: 6, name: 'August 2026 Payslip', category: 'Payslips', status: 'Generated', uploaded: 'Aug 28, 2026', expires: '-', by: 'System' }
];

export default function MyDocuments() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const fileInputRef = useRef(null);

  const filteredDocs = MOCK_DOCUMENTS.filter(d => {
    if (activeCategory !== 'All' && d.category !== activeCategory) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827]">My Documents</h1>
            <p className="text-gray-500 font-medium mt-1">Manage, sign, and organize your files.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} /> Filter
            </button>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 bg-[#111827] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#1f2937] flex items-center gap-2"
            >
              <Upload size={16} /> Upload
            </button>
          </div>
        </div>

        {/* Action Required */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-red-500" />
            <h2 className="text-lg font-extrabold text-red-900">Action Required</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#fff1f2] border border-[#ffe4e6] p-5 rounded-2xl flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-[#111827]">Employee Handbook</p>
                <p className="text-sm font-medium text-gray-600 mt-0.5">Please acknowledge the updated policy.</p>
              </div>
              <button className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap">
                Review & Acknowledge
              </button>
            </div>
            <div className="bg-[#fff1f2] border border-[#ffe4e6] p-5 rounded-2xl flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-[#111827]">Updated Tax Form</p>
                <p className="text-sm font-medium text-gray-600 mt-0.5">Please complete your information.</p>
              </div>
              <button className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap">
                Complete
              </button>
            </div>
          </div>
        </div>

        {/* Folders & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === 'All' ? 'bg-[#111827] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All Files
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeCategory === cat ? 'bg-[#111827] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Folder size={14} className={activeCategory === cat ? 'text-white' : 'text-gray-400'} />
                {cat}
              </button>
            ))}
          </div>

          <div className="relative shrink-0 w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Document Name</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Uploaded</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">By</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-[#111827] text-sm">{doc.name}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                      <CheckCircle size={12} />
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 hidden md:table-cell">
                    {doc.uploaded}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 hidden lg:table-cell">
                    {doc.by}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">
                    No documents found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-[#111827]">Upload Document</h2>
              <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
              <input type="file" className="hidden" ref={fileInputRef} onChange={() => { alert('Mock File selected!'); setIsUploadOpen(false); }} />
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                <Upload size={24} />
              </div>
              <p className="font-bold text-[#111827] mb-1">Click to upload or drag and drop</p>
              <p className="text-sm font-medium text-gray-500">PDF, DOCX, JPG or PNG (max. 10MB)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-indigo-500 mb-6">
                {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsUploadOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => { alert('Upload started!'); setIsUploadOpen(false); }} className="flex-1 py-3 bg-[#4f46e5] text-white rounded-xl font-bold hover:bg-[#4338ca] transition-colors">
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
