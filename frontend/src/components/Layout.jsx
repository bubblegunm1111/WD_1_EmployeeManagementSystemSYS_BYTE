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

  return (
    <div className="flex flex-col h-screen w-full bg-[#fdfcfa] overflow-hidden">
      
      {/* Persistent Top Header spanning the full width */}
      <TopHeader 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onCreateEmployee={() => EventBus.emit('create-employee')}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden px-4 pb-4 pt-0 gap-4">
        
        {/* Sidebar Container */}
        <div className="flex shrink-0 items-start">
          <Sidebar isCollapsed={isCollapsed} />
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
