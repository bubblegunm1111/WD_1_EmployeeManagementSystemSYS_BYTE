import React, { useState } from 'react';
import { Laptop, Monitor, Headphones, AlertTriangle, PlusCircle } from 'lucide-react';

const MY_EQUIPMENT = [
  { 
    id: 'SYS-00124', 
    type: 'Laptop', 
    model: 'MacBook Pro 14" (M3 Pro)', 
    assigned: 'Jan 12, 2026', 
    icon: Laptop,
    status: 'Active'
  },
  { 
    id: 'SYS-00482', 
    type: 'Monitor', 
    model: 'Dell UltraSharp 27" 4K', 
    assigned: 'Jan 15, 2026', 
    icon: Monitor,
    status: 'Active'
  },
  { 
    id: 'SYS-00911', 
    type: 'Headset', 
    model: 'Logitech MX Zone Wireless', 
    assigned: 'Jan 15, 2026', 
    icon: Headphones,
    status: 'Active'
  }
];

export default function MyEquipment() {
  const [showIssueModal, setShowIssueModal] = useState(false);

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111827]">My Equipment</h1>
            <p className="text-gray-500 font-medium mt-1">Manage and track company assets assigned to you.</p>
          </div>
          <button className="px-5 py-2.5 bg-[#111827] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#1f2937] flex items-center gap-2">
            <PlusCircle size={18} /> Request Equipment
          </button>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MY_EQUIPMENT.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon size={24} />
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#111827] mb-1">{item.type}</h3>
                  <p className="text-gray-500 font-medium mb-4">{item.model}</p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-xs">Asset ID</span>
                    <span className="font-bold text-[#111827]">{item.id}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-sm">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-xs">Assigned</span>
                    <span className="font-bold text-[#111827]">{item.assigned}</span>
                  </div>
                  <button 
                    onClick={() => setShowIssueModal(true)}
                    className="w-full py-2.5 bg-gray-50 text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={16} /> Report an Issue
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Simple Mock Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-extrabold text-[#111827] mb-2">Report an Issue</h2>
            <p className="text-sm text-gray-500 font-medium mb-6">Describe the problem you are experiencing with your assigned equipment. IT will contact you shortly.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Equipment</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-indigo-500">
                  {MY_EQUIPMENT.map(item => <option key={item.id}>{item.type} ({item.id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500 resize-none" placeholder="What's wrong?"></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowIssueModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => {
                alert('Issue reported successfully. IT will reach out to you.');
                setShowIssueModal(false);
              }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
