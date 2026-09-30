import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

// We use an event system to trigger modals from the TopHeader to the specific page
export const EventBus = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
};

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-[#fdfcfa] overflow-hidden">
      
      {/* Persistent Top Header spanning the full width */}
      <TopHeader 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onCreateEmployee={() => EventBus.emit('create-employee')}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden px-2 md:px-4 pb-2 md:pb-4 pt-0 gap-0 md:gap-4 relative">
        
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          ></div>
        )}

        {/* Sidebar Container */}
        <div className={`shrink-0 items-start fixed md:relative z-50 md:z-0 top-16 md:top-0 h-[calc(100vh-4rem)] md:h-auto transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0 flex' : '-translate-x-full md:translate-x-0 hidden md:flex'}`}>
          <Sidebar isCollapsed={isCollapsed} setIsMobileOpen={setIsMobileOpen} />
        </div>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto relative no-scrollbar rounded-[2rem]">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default Layout;
