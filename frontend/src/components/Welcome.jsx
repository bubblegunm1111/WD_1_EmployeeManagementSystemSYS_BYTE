import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';

function Welcome() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  
  const line1 = "The Hub for Your\n";
  const line2 = "Entire Workplace";
  const fullText = line1 + line2;

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col relative overflow-hidden transition-colors duration-1000">
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#e8fff5] rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#f3e8ff] rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 opacity-70"></div>

      {/* Header */}
      <header className="w-full px-8 py-6 flex justify-between items-center z-20 absolute top-0 left-0">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
             <div className="w-5 h-8 bg-[#8b8cf8] rounded-full"></div>
             <div className="w-5 h-8 bg-[#6366f1] rounded-full"></div>
             <div className="w-5 h-8 bg-[#4f46e5] rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-[#1e1b4b] tracking-tight">SYS</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
          <button onClick={() => navigate('/')} className="text-gray-900 transition cursor-pointer">Home</button>
          <button onClick={() => navigate('/about')} className="hover:text-[#8b8cf8] transition cursor-pointer">About Us</button>
          <button onClick={() => navigate('/contact')} className="hover:text-[#8b8cf8] transition cursor-pointer">Contact Us</button>
        </nav>
        
        <div className="flex items-center gap-6">
          <button onClick={() => setShowRoleSelection(true)} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition cursor-pointer">
            Login
          </button>
          <button onClick={() => setShowRoleSelection(true)} className="text-sm font-bold bg-[#8b8cf8] text-white px-6 py-2.5 rounded-full shadow-sm hover:bg-[#7778f2] transition transform hover:-translate-y-0.5 cursor-pointer">
            Get Started
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 z-10 w-full max-w-4xl mx-auto text-center pt-20 relative h-full">
        
        {/* State 1: Welcome Message */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full transition-all duration-700 ease-in-out flex flex-col items-center ${showRoleSelection ? 'opacity-0 scale-95 pointer-events-none -translate-y-[60%]' : 'opacity-100 scale-100'}`}>
             <div className="mb-6 min-h-[140px] md:min-h-[160px] w-full">
               <h1 className="text-5xl md:text-7xl font-extrabold text-[#111827] tracking-tight whitespace-pre-line leading-[1.1]">
                 {typedText.substring(0, line1.length)}
                 <span className="text-[#8b8cf8]">
                   {typedText.substring(line1.length)}
                 </span>
                 <span className="animate-pulse text-[#8b8cf8]">|</span>
               </h1>
             </div>

             <p className="text-lg md:text-xl text-gray-500 max-w-3xl leading-relaxed mb-10 font-medium">
               The all-in-one platform to streamline your HR processes, from payroll and attendance to leave management and announcements. Empower your workforce and simplify your administration.
             </p>

             <div className="flex flex-col sm:flex-row gap-4 items-center">
               <button 
                 onClick={() => setShowRoleSelection(true)}
                 className="flex items-center justify-center px-10 py-4 rounded-full bg-[#8b8cf8] text-white font-bold text-lg hover:bg-[#7778f2] transition shadow-lg w-56 transform hover:-translate-y-1 cursor-pointer"
               >
                 Get started
               </button>
             </div>
        </div>

        {/* State 2: Role Selection */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl transition-all duration-700 ease-in-out ${showRoleSelection ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-105 pointer-events-none translate-y-[40%]'}`}>
          <div className="flex flex-col items-center bg-white/60 backdrop-blur-xl p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
             <h2 className="text-4xl font-extrabold text-[#111827] mb-3">Who are you?</h2>
             <p className="text-gray-400 mb-10 font-bold">Select your role to continue logging in or signing up.</p>
             
             <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
               <button 
                 onClick={() => handleRoleSelect('employee')}
                 className="flex flex-col items-center justify-center gap-5 p-10 rounded-[2rem] border-2 border-transparent bg-white hover:border-[#8b8cf8] hover:bg-[#f5f5ff] transition flex-1 group shadow-sm hover:shadow-md cursor-pointer"
               >
                 <div className="w-20 h-20 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center text-gray-300 group-hover:text-[#8b8cf8] transition shadow-sm">
                   <Users size={36} />
                 </div>
                 <span className="font-extrabold text-2xl text-gray-900">Employee</span>
               </button>
               
               <button 
                 onClick={() => handleRoleSelect('admin')}
                 className="flex flex-col items-center justify-center gap-5 p-10 rounded-[2rem] border-2 border-transparent bg-white hover:border-[#8b8cf8] hover:bg-[#f5f5ff] transition flex-1 group shadow-sm hover:shadow-md cursor-pointer"
               >
                 <div className="w-20 h-20 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center text-gray-300 group-hover:text-[#8b8cf8] transition shadow-sm">
                   <ShieldCheck size={36} />
                 </div>
                 <span className="font-extrabold text-2xl text-gray-900">Admin</span>
               </button>
             </div>
             
             <button onClick={() => setShowRoleSelection(false)} className="mt-10 text-sm font-bold text-gray-400 hover:text-gray-900 transition cursor-pointer">
               &larr; Back
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Welcome;
