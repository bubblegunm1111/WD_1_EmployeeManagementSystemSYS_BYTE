import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Users, Briefcase, Clock, Calendar as CalendarIcon, 
  DollarSign, PieChart, Settings, LogOut, FileText, User, Monitor
} from 'lucide-react';

function Sidebar({ isCollapsed, setIsMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, role } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentPath = location.pathname;

  const NavItem = ({ icon: Icon, label, path }) => {
    const isActive = currentPath === path;
    
    return (
      <button 
        onClick={() => handleNavigation(path)}
        className={`flex items-center gap-4 px-4 py-3 rounded-[14px] transition-all w-full text-left cursor-pointer overflow-hidden whitespace-nowrap
          ${isActive 
            ? 'bg-[#e0e7ff] text-[#4f46e5] font-bold' 
            : 'text-gray-400 hover:bg-white/5 font-semibold'
          }
          ${isCollapsed ? 'justify-center px-0' : ''}
        `}
        title={isCollapsed ? label : ''}
      >
        <Icon size={20} className={`shrink-0 ${isActive ? 'text-[#4f46e5]' : ''}`} />
        {!isCollapsed && <span className="transition-opacity duration-200">{label}</span>}
      </button>
    );
  };

  const Section = ({ title, children }) => (
    <div className="mb-6">
      {!isCollapsed && (
        <div className="text-gray-500 text-[10px] uppercase font-extrabold tracking-widest mb-3 pl-2 transition-opacity duration-200">
          {title}
        </div>
      )}
      <nav className="flex flex-col gap-1.5">
        {children}
      </nav>
    </div>
  );

  return (
    <div className={`relative h-full md:h-[calc(100vh-6rem)] bg-[#1a1a1a] text-white rounded-r-[2.5rem] md:rounded-[2.5rem] p-6 flex flex-col justify-between shadow-2xl overflow-y-auto overflow-x-hidden no-scrollbar transition-all duration-300 ease-in-out group ${isCollapsed ? 'md:w-24 md:p-4 w-64' : 'w-64'}`}>
      
      <div>
        {role === 'admin' ? (
          <>
            <Section title="Overview">
              <NavItem icon={Home} label="Dashboard" path="/admin" />
            </Section>
            
            <Section title="People">
              <NavItem icon={Users} label="Employees" path="/admin/employees" />
              <NavItem icon={Briefcase} label="Departments" path="/admin/departments" />
            </Section>

            <Section title="Management">
              <NavItem icon={Clock} label="Attendance" path="/admin/attendance" />
              <NavItem icon={CalendarIcon} label="Leave" path="/admin/leave" />
              <NavItem icon={DollarSign} label="Payroll" path="/admin/payroll" />
            </Section>

            <Section title="Insights">
              <NavItem icon={PieChart} label="Reports" path="/admin/reports" />
            </Section>
          </>
        ) : (
          <>
            <Section title="Overview">
              <NavItem icon={Home} label="Dashboard" path="/employee" />
            </Section>
            
            <Section title="People">
              <NavItem icon={User} label="My Profile" path="/employee/profile" />
            </Section>

            <Section title="Work">
              <NavItem icon={FileText} label="My Tasks" path="/employee/tasks" />
              <NavItem icon={CalendarIcon} label="My Schedule" path="/employee/schedule" />
              <NavItem icon={FileText} label="My Documents" path="/employee/documents" />
              <NavItem icon={Briefcase} label="My Training" path="/employee/training" />
              <NavItem icon={Monitor} label="My Equipment" path="/employee/equipment" />
            </Section>

            <Section title="Management">
              <NavItem icon={Clock} label="Attendance" path="/employee/attendance" />
              <NavItem icon={CalendarIcon} label="My Leave" path="/employee/leave" />
              <NavItem icon={DollarSign} label="My Payroll" path="/employee/payroll" />
            </Section>
          </>
        )}
      </div>

      <div className="mt-4">
        <Section title="System">
          <NavItem icon={Settings} label="Settings" path={role === 'admin' ? '/admin/settings' : '/employee/settings'} />
          <button 
            onClick={handleLogout} 
            className={`flex items-center gap-4 px-4 py-3 rounded-[14px] text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left font-semibold cursor-pointer overflow-hidden whitespace-nowrap
              ${isCollapsed ? 'justify-center px-0' : ''}`}
            title={isCollapsed ? 'Log out' : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </Section>
      </div>
    </div>
  );
}

export default Sidebar;
