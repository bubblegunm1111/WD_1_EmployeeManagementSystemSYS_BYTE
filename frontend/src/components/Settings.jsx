import React, { useState } from 'react';
import { 
  Building2, Clock, CalendarDays, Wallet, Users, 
  BellRing, ShieldCheck, LockKeyhole, Monitor, Save
} from 'lucide-react';

const TABS = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: Wallet },
  { id: 'employee', label: 'Employee', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
  { id: 'admin', label: 'Admin & Permissions', icon: ShieldCheck },
  { id: 'security', label: 'Security', icon: LockKeyhole },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('organization');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfcfa] overflow-hidden">
      {/* Header */}
      <div className="h-20 shrink-0 px-8 flex items-center justify-between border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827]">Settings</h1>
          <p className="text-sm font-medium text-gray-500">Manage platform configuration and rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46e5] text-white rounded-xl font-bold hover:bg-[#4338ca] transition-all shadow-md disabled:opacity-70"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Body: Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-64 shrink-0 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar p-4">
          <nav className="flex flex-col gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left
                    ${isActive 
                      ? 'bg-[#4f46e5]/10 text-[#4f46e5]' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#111827]'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-[#4f46e5]' : 'text-gray-400'} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#fdfcfa]">
          <div className="max-w-4xl mx-auto pb-12">
            {activeTab === 'organization' && <OrganizationSettings />}
            {activeTab === 'attendance' && <AttendanceSettings />}
            {activeTab === 'leave' && <LeaveSettings />}
            {activeTab === 'payroll' && <PayrollSettings />}
            {activeTab === 'employee' && <EmployeeSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'admin' && <AdminSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'system' && <SystemSettings />}
          </div>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   SUBCOMPONENTS FOR EACH TAB
========================================================= */

function OrganizationSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">Organization</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Basic company details and regional settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Company Name" defaultValue="SYS Inc." />
        <FormInput label="Currency" defaultValue="EGP (Egyptian Pound)" />
        <FormInput label="Contact Email" defaultValue="admin@sys.com" type="email" />
        <FormInput label="Contact Phone" defaultValue="+20 100 123 4567" />
      </div>

      <FormInput label="Company Address" defaultValue="123 Smart Village, Cairo, Egypt" className="col-span-full" />

      <div className="border-t border-gray-200 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Working Days</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>Sunday - Thursday</option>
            <option>Monday - Friday</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Time Zone</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>Africa/Cairo (UTC+2)</option>
            <option>UTC (UTC+0)</option>
          </select>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <FormInput label="Work Start Time" type="time" defaultValue="09:00" />
          <FormInput label="Work End Time" type="time" defaultValue="17:00" />
        </div>
      </div>
    </div>
  );
}

function AttendanceSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">Attendance Settings</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Configure rules for clock-ins, breaks, and overtime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Grace Period for Late Arrival (Minutes)" type="number" defaultValue="15" />
        <FormInput label="Standard Break Duration (Minutes)" type="number" defaultValue="60" />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Overtime Rules</h3>
        <div className="space-y-4">
          <FormToggle label="Enable Overtime Tracking" description="Automatically calculate hours logged beyond the standard work schedule." defaultChecked={true} />
          <FormToggle label="Require Manager Approval" description="Overtime must be explicitly approved to count towards payroll." defaultChecked={false} />
        </div>
      </div>
    </div>
  );
}

function LeaveSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">Leave Settings</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Manage leave allowances and request workflows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Annual Leave Allowance (Days)" type="number" defaultValue="21" />
        <FormInput label="Maximum Consecutive Leave (Days)" type="number" defaultValue="14" />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Leave Types</h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <span className="font-bold text-gray-700 text-sm">Type</span>
            <span className="font-bold text-gray-700 text-sm">Paid</span>
          </div>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50">
            <span className="font-medium text-gray-900">Annual Leave</span>
            <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">Yes</span>
          </div>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50">
            <span className="font-medium text-gray-900">Sick Leave</span>
            <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">Yes</span>
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-gray-50">
            <span className="font-medium text-gray-900">Unpaid Leave</span>
            <span className="text-gray-500 font-bold text-sm bg-gray-100 px-2 py-1 rounded">No</span>
          </div>
        </div>
        <button className="mt-3 text-sm font-bold text-[#4f46e5] hover:text-[#4338ca]">
          + Add Leave Type
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Rules & Carry-over</h3>
        <div className="space-y-4">
          <FormToggle label="Enable Annual Leave Carry-over" description="Allow employees to carry remaining days to the next year." defaultChecked={true} />
          <FormToggle label="Require Medical Certificate" description="For sick leave requests exceeding 2 days." defaultChecked={true} />
        </div>
      </div>
    </div>
  );
}

function PayrollSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">Payroll Settings</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Configure payroll generation cycles and salary components.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Payroll Period</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>Monthly (1st to end of month)</option>
            <option>Bi-Weekly</option>
          </select>
        </div>
        <FormInput label="Pay Date (Day of Month)" type="number" defaultValue="28" />
        <FormInput label="Overtime Rate Multiplier" type="number" step="0.1" defaultValue="1.5" />
        <FormInput label="Absence Deduction Rate Multiplier" type="number" step="0.1" defaultValue="1.0" />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Salary Components</h3>
        <p className="text-sm text-gray-500 font-medium mb-4">Define standard components attached to employee profiles.</p>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded-lg text-sm font-bold">Basic Salary</span>
          <span className="px-3 py-1.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded-lg text-sm font-bold">Accommodation</span>
          <span className="px-3 py-1.5 bg-[#4f46e5]/10 text-[#4f46e5] rounded-lg text-sm font-bold">Transportation</span>
        </div>
      </div>
    </div>
  );
}

function EmployeeSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">Employee Settings</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Configure employee profile requirements and formats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Employee ID Format" defaultValue="SYS-YYYY-###" />
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Default Employment Type</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>Full-Time</option>
            <option>Part-Time</option>
            <option>Contractor</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Required Onboarding Information</h3>
        <div className="space-y-4">
          <FormToggle label="Require Phone Number" description="Mandatory contact number." defaultChecked={true} />
          <FormToggle label="Require National ID/Passport" description="Must be provided before account activation." defaultChecked={false} />
          <FormToggle label="Require Emergency Contact" description="Name and phone number." defaultChecked={true} />
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">Notifications</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Manage automated emails and in-app alerts sent by the system.</p>
      </div>

      <div className="space-y-6">
        <FormToggle label="Leave Request Notifications" description="Email managers when employees submit leave requests." defaultChecked={true} />
        <FormToggle label="Attendance Alerts" description="Notify admins when an employee is excessively late." defaultChecked={false} />
        <FormToggle label="Payroll Notifications" description="Email employees when their payslip is ready to view." defaultChecked={true} />
        <FormToggle label="Onboarding Notifications" description="Email employees a welcome package when an account is created." defaultChecked={true} />
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827] mb-4">Admin & Permissions</h2>
          <p className="text-gray-500 font-medium text-sm">Manage administrators and their system access levels.</p>
        </div>
        <button className="px-4 py-2 bg-[#111827] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#1f2937]">
          + Add Administrator
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Admin</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-4 px-4 font-bold text-[#111827]">Ana Administrator</td>
              <td className="py-4 px-4"><span className="px-2 py-1 bg-[#4f46e5]/10 text-[#4f46e5] text-xs font-bold rounded">Super Admin</span></td>
              <td className="py-4 px-4 text-right text-sm font-bold text-[#4f46e5] cursor-pointer">Edit</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Default Admin Permissions</h3>
        <div className="space-y-4">
          <FormToggle label="View Payroll Data" description="Can access the payroll module and salaries." defaultChecked={true} />
          <FormToggle label="Approve Leave" description="Can approve or reject leave globally." defaultChecked={true} />
          <FormToggle label="Edit Employee Information" description="Can update employee profiles and assign departments." defaultChecked={true} />
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">Security</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Protect your account and monitor active sessions.</p>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-[#111827]">Change Password</h3>
        <FormInput label="Current Password" type="password" />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="New Password" type="password" />
          <FormInput label="Confirm New Password" type="password" />
        </div>
        <button className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200">
          Update Password
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6 space-y-6">
        <FormToggle label="Two-Factor Authentication (2FA)" description="Require a security code upon login." defaultChecked={false} />
        <FormToggle label="Force Password Reset on Next Login" description="Apply this globally to all users." defaultChecked={false} />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-gray-900 mb-4">Active Sessions</h3>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <p className="font-bold text-[#111827] text-sm">Windows • Chrome</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Cairo, Egypt • Current Session</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-[#111827] mb-4">System Preferences</h2>
        <p className="text-gray-500 font-medium text-sm mb-6">Customize the look and feel of your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>English (US)</option>
            <option>Arabic (Egypt)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Theme</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>System Default</option>
            <option>Light</option>
            <option>Dark</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Date Format</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Time Format</label>
          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#4f46e5] transition-colors">
            <option>12-hour (AM/PM)</option>
            <option>24-hour</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-bold text-[#111827] mb-2">Export Data</h3>
        <p className="text-sm text-gray-500 font-medium mb-4">Download a complete backup of all system configurations and data.</p>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
          Request Backup Archive
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   UI HELPERS
========================================================= */

function FormInput({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <input 
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:border-[#4f46e5] transition-colors"
        {...props}
      />
    </div>
  );
}

function FormToggle({ label, description, defaultChecked }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div>
        <h4 className="font-bold text-[#111827] text-sm">{label}</h4>
        {description && <p className="text-xs text-gray-500 font-medium mt-1">{description}</p>}
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors shrink-0 ${checked ? 'bg-[#4f46e5]' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
