import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Grid, Bell, Plus, PanelLeftClose, PanelLeftOpen, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function TopHeader({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, onCreateEmployee }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  
  const searchInputRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [orgName, setOrgName] = useState('SYS');

  useEffect(() => {
    if (role) {
      api.get('/auth/organization')
        .then(res => {
          if (res.data?.name) setOrgName(res.data.name);
        })
        .catch(console.error);
    }
  }, [role]);

  useEffect(() => {
    if (role) {
      const fetchNotifs = async () => {
        try {
          if (role === 'employee' && user?.email) {
            const empRes = await api.get(`/employees/by-email?email=${user.email}`);
            const empData = empRes.data;
            const notifRes = await api.get(`/notifications/${empData.id}`);
            setNotifications(notifRes.data);
          } else if (role === 'admin') {
            const notifRes = await api.get('/notifications/admin');
            setNotifications(notifRes.data);
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchNotifs();
      const interval = setInterval(fetchNotifs, 3000);
      return () => clearInterval(interval);
    }
  }, [role, user]);

  // Handle Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const markAllRead = async () => {
    try {
      if (role === 'admin') {
        await api.put('/notifications/mark-all-read/admin');
      } else if (user?.email) {
        const empRes = await api.get(`/employees/by-email?email=${encodeURIComponent(user.email)}`);
        if (empRes.data?.id) {
          await api.put(`/notifications/mark-all-read/${empRes.data.id}`);
        }
      }
      // Re-fetch notifications after marking read
      setNotifications(prev => Array.isArray(prev) ? prev.map(n => ({...n, is_read: 1})) : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Create a nice title from the path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageName = pathParts.length > 1 
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1)
    : 'Overview';

  return (
    <div className="w-full h-16 bg-[#fdfcfa] border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20">
      
      {/* Left side: Logo, Toggle, Title */}
      <div className="flex items-center gap-6 h-full">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 scale-75 origin-left">
             <div className="w-5 h-8 bg-[#8b8cf8] rounded-full"></div>
             <div className="w-5 h-8 bg-[#6366f1] rounded-full"></div>
             <div className="w-5 h-8 bg-[#4f46e5] rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">{orgName}</span>
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        {/* Sidebar Toggle Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

        {/* Sidebar Toggle Mobile */}
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          <Menu size={24} />
        </button>

        {/* Page Title */}
        <h1 className="text-lg font-bold text-[#1e293b] hidden sm:block">{pageName}</h1>
      </div>

      {/* Right side: Search, Icons, Avatar */}
      <div className="flex items-center gap-4 relative">
        
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-12 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-medium text-sm transition"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <span className="bg-gray-100 text-gray-400 text-[10px] px-1.5 py-0.5 rounded font-bold border border-gray-200">⌘K</span>
          </div>
        </div>

        <button 
          onClick={() => toast.success("Powered by SYS")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#4f46e5] transition cursor-pointer p-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-[#c7d2fe]"
          title="SYS Signature"
        >
          <Grid size={16} />
          <span className="text-xs font-black tracking-widest uppercase">SYS</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative text-gray-400 hover:text-gray-600 transition cursor-pointer p-1"
          >
            <Bell size={20} />
            {Array.isArray(notifications) && notifications.filter(n => !n.is_read).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#fca5a5] rounded-full border-2 border-[#fdfcfa]"></span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-800">Notifications</span>
                <span onClick={markAllRead} className="text-xs text-[#4f46e5] font-semibold cursor-pointer">Mark all read</span>
              </div>
              
              {(!Array.isArray(notifications) || notifications.length === 0) ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No new notifications
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.map((n, i) => (
                    <div key={i} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${!n.is_read ? 'bg-indigo-50/30' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-bold ${!n.is_read ? 'text-[#4f46e5]' : 'text-gray-800'}`}>{n.title}</p>
                        <span className="text-[10px] font-medium text-gray-400">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {role === 'admin' && location.pathname.includes('/employees') && (
          <button 
            onClick={onCreateEmployee}
            className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#333333] transition flex items-center gap-2 cursor-pointer ml-2"
          >
            <Plus size={16} /> New
          </button>
        )}

        <div className="relative ml-2">
          <div 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-[#e0e7ff] text-[#4f46e5] flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer border border-[#c7d2fe] hover:ring-2 ring-offset-2 ring-[#4f46e5] transition"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          
          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">{user?.username || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@sys.com'}</p>
              </div>
              <div className="py-1">
                <button onClick={() => navigate(role === 'admin' ? '/admin/settings' : '/employee/profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                  <User size={14} /> Profile
                </button>
                <button onClick={() => navigate(role === 'admin' ? '/admin/settings' : '/employee/settings')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                  <Settings size={14} /> Settings
                </button>
              </div>
              <div className="py-1 border-t border-gray-100">
                <button 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default TopHeader;
