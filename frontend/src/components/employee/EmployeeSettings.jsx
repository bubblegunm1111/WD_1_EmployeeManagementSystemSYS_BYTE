import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Palette, Shield, Link2, LogOut, Check } from 'lucide-react';

export default function EmployeeSettings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const TABS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'connected', label: 'Connected Apps', icon: Link2 },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      
      {/* Settings Navigation */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col p-6 overflow-y-auto custom-scrollbar">
        <h1 className="text-2xl font-extrabold text-[#111827] mb-2">Settings</h1>
        <p className="text-sm font-medium text-gray-500 mb-8">Manage your account and preferences.</p>
        
        <nav className="flex flex-col gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left
                  ${isActive ? 'bg-[#111827] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-8">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar">
        <div className="max-w-3xl">
          
          {activeTab === 'account' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Account</h2>
              
              <div className="space-y-8">
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="font-bold text-[#111827] mb-1">Email address</h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">The email used for logging into SYS.</p>
                  <input type="email" disabled value={user?.email || 'employee@company.com'} className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-500 cursor-not-allowed" />
                </div>
                
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="font-bold text-[#111827] mb-1">Phone number</h3>
                  <input type="text" defaultValue="+20 123 456 7890" className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-indigo-500 shadow-sm mt-2" />
                </div>

                <div className="pb-8 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#111827] mb-1">Password</h3>
                    <p className="text-sm font-medium text-gray-500">••••••••</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">Change Password</button>
                </div>

                <div className="pb-8 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#111827] mb-1">Two-factor authentication</h3>
                    <p className="text-sm font-medium text-green-600 flex items-center gap-1.5"><Check size={14} /> Enabled</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">Manage</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Notifications</h2>
              
              <div className="space-y-8">
                <NotificationGroup 
                  title="Tasks" 
                  items={['New task assigned', 'Task deadline approaching', 'Task completed']} 
                />
                <NotificationGroup 
                  title="Schedule" 
                  items={['Schedule changes', 'Upcoming meetings']} 
                />
                <NotificationGroup 
                  title="Leave" 
                  items={['Leave request approved/rejected', 'Leave request updates']} 
                />
                <NotificationGroup 
                  title="Payroll" 
                  items={['Payslip available', 'Payroll updates']} 
                />
                <NotificationGroup 
                  title="Documents" 
                  items={['Document requires action', 'New company document']} 
                />
                
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="font-extrabold text-[#111827] mb-4">Notification method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#111827] focus:ring-[#111827]" />
                      <span className="font-medium text-gray-700">In-app</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#111827] focus:ring-[#111827]" />
                      <span className="font-medium text-gray-700">Email</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Appearance</h2>
              
              <div className="space-y-8">
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="font-bold text-[#111827] mb-4">Theme</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" defaultChecked className="w-4 h-4 text-[#111827]" /> Light
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" className="w-4 h-4 text-[#111827]" /> Dark
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="theme" className="w-4 h-4 text-[#111827]" /> System default
                    </label>
                  </div>
                </div>

                <div className="pb-8 border-b border-gray-200">
                  <h3 className="font-bold text-[#111827] mb-2">Language</h3>
                  <select className="w-full max-w-xs px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-indigo-500 shadow-sm">
                    <option>English</option>
                    <option>Arabic</option>
                  </select>
                </div>

                <div className="pb-8 border-b border-gray-200 grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-[#111827] mb-2">Date format</h3>
                    <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-indigo-500 shadow-sm">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] mb-2">Time format</h3>
                    <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-indigo-500 shadow-sm">
                      <option>12-hour (AM/PM)</option>
                      <option>24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Privacy & Security</h2>
              
              <div className="space-y-8">
                <div className="pb-8 border-b border-gray-200">
                  <h3 className="font-bold text-[#111827] mb-4">Active Sessions</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <p className="font-bold text-[#111827] flex items-center gap-2">Windows · Chrome</p>
                    <p className="text-sm font-medium text-gray-500 mt-1">Cairo · <span className="text-green-600 font-bold">Current session</span></p>
                  </div>
                  <button className="text-red-600 font-bold text-sm hover:underline">Sign out of other sessions</button>
                </div>

                <div className="pb-8 border-b border-gray-200">
                  <h3 className="font-bold text-[#111827] mb-1">Login history</h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">View recent account activity.</p>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">View History</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connected' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-extrabold text-[#111827] mb-8">Connected Apps</h2>
              
              <div className="space-y-8">
                <div className="pb-8 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[#111827] mb-1">Calendar</h3>
                    <p className="text-sm font-medium text-gray-500">Connect your company calendar.</p>
                  </div>
                  <button className="px-4 py-2 bg-[#111827] text-white rounded-lg font-bold text-sm hover:bg-[#1f2937] transition-colors">Connect</button>
                </div>
                
                <div className="pb-8 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[#111827] mb-1">Email</h3>
                    <p className="text-sm font-medium text-gray-500">Connect your work email inbox.</p>
                  </div>
                  <button className="px-4 py-2 bg-[#111827] text-white rounded-lg font-bold text-sm hover:bg-[#1f2937] transition-colors">Connect</button>
                </div>
              </div>
            </div>
          )}

          {/* Global Save Button */}
          <div className="mt-10 pt-6">
            <button onClick={() => alert('Settings Saved!')} className="px-6 py-3 bg-[#4f46e5] text-white rounded-xl font-bold hover:bg-[#4338ca] transition-colors shadow-md">
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function NotificationGroup({ title, items }) {
  return (
    <div className="pb-8 border-b border-gray-200">
      <h3 className="font-extrabold text-[#111827] mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <label key={idx} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#111827] focus:ring-[#111827]" />
            <span className="font-medium text-gray-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
