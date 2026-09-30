import React from 'react';
import { useNavigate } from 'react-router-dom';

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col relative overflow-y-auto overflow-x-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#e8fff5] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#f3e8ff] rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 opacity-70"></div>

      {/* Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex -space-x-2">
             <div className="w-5 h-8 bg-[#8b8cf8] rounded-full"></div>
             <div className="w-5 h-8 bg-[#6366f1] rounded-full"></div>
             <div className="w-5 h-8 bg-[#4f46e5] rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-[#1e1b4b] tracking-tight">SYS</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
          <button onClick={() => navigate('/')} className="hover:text-[#8b8cf8] transition cursor-pointer">Home</button>
          <button className="text-gray-900 transition">About Us</button>
          <button onClick={() => navigate('/contact')} className="hover:text-[#8b8cf8] transition cursor-pointer">Contact Us</button>
        </nav>
        
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-sm font-bold bg-[#8b8cf8] text-white px-6 py-2.5 rounded-full shadow-sm hover:bg-[#7778f2] transition transform hover:-translate-y-0.5 cursor-pointer">
            Go Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 z-10 w-full max-w-4xl mx-auto pt-10 pb-20 relative">
        <div className="bg-white/80 backdrop-blur-xl p-12 md:p-16 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-6">About SYS</h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            <strong>SYS</strong> is a modern website brand. We built SYS to transform how modern companies handle their workforce. It's an all-in-one platform designed from the ground up to eliminate administrative headaches and empower both employees and managers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50">
              <h3 className="text-xl font-bold text-indigo-900 mb-3">Our Mission</h3>
              <p className="text-sm text-indigo-700/80 font-medium leading-relaxed">
                To simplify workplace operations and foster an environment where people can focus on their actual work, not administrative hurdles.
              </p>
            </div>
            <div className="p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50">
              <h3 className="text-xl font-bold text-emerald-900 mb-3">Our Vision</h3>
              <p className="text-sm text-emerald-700/80 font-medium leading-relaxed">
                To become the industry standard for transparent, effortless, and delightful HR and employee management solutions globally.
              </p>
            </div>
            <div className="p-8 bg-purple-50/50 rounded-[2rem] border border-purple-100/50">
              <h3 className="text-xl font-bold text-purple-900 mb-3">Our Values</h3>
              <p className="text-sm text-purple-700/80 font-medium leading-relaxed">
                We believe in continuous innovation, absolute transparency, uncompromising security, and designing for the end user first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
