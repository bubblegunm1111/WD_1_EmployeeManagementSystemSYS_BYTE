import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, Users, Calendar, Umbrella, DollarSign, BarChart2, ShieldCheck } from 'lucide-react';

function Welcome() {
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  
  const line1 = "The Hub for Your";
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
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="h-screen w-full bg-[#fcfcfd] flex flex-col font-sans overflow-y-auto overflow-x-hidden">
      
      {/* Decorative background shape */}
      <div className="absolute top-40 left-[-20%] w-[800px] h-[800px] bg-[#eef0ff] rounded-full blur-[100px] opacity-70 pointer-events-none"></div>

      {/* Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-20 relative">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5 opacity-90">
             <div className="w-5 h-8 bg-[#8b8cf8] rounded-full"></div>
             <div className="w-5 h-8 bg-[#6366f1] rounded-full mix-blend-multiply"></div>
             <div className="w-5 h-8 bg-[#4f46e5] rounded-full mix-blend-multiply"></div>
          </div>
          <span className="text-2xl font-black text-[#111827] tracking-tight">SYS</span>
        </div>
        
        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-10 font-bold text-gray-500">
          <button onClick={() => navigate('/')} className="text-[#4f46e5] border-b-2 border-[#4f46e5] pb-1 transition cursor-pointer">Home</button>
          <button onClick={() => navigate('/about')} className="hover:text-[#4f46e5] pb-1 transition cursor-pointer">About Us</button>
          <button onClick={() => navigate('/contact')} className="hover:text-[#4f46e5] pb-1 transition cursor-pointer">Contact Us</button>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-6">
          <button onClick={() => setShowRoleSelection(true)} className="font-bold text-[#111827] hover:text-[#4f46e5] transition cursor-pointer">
            Login
          </button>
          <button onClick={() => setShowRoleSelection(true)} className="flex items-center gap-2 font-bold bg-[#6366f1] text-white px-6 py-2.5 rounded-full shadow-md shadow-indigo-500/20 hover:bg-[#4f46e5] transition transform hover:-translate-y-0.5 cursor-pointer">
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 z-10 relative mt-16 md:mt-24">
        
        {/* Role Selection Overlay (Hidden by default) */}
        {showRoleSelection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center bg-white p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100 max-w-2xl w-full mx-4 relative animate-in fade-in zoom-in-95 duration-300">
               <button onClick={() => setShowRoleSelection(false)} className="absolute top-6 right-8 text-gray-400 hover:text-gray-900 font-bold cursor-pointer">✕</button>
               <h2 className="text-4xl font-black text-[#111827] mb-3">Who are you?</h2>
               <p className="text-gray-500 mb-10 font-medium">Select your role to continue logging in or signing up.</p>
               
               <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                 <button 
                   onClick={() => handleRoleSelect('employee')}
                   className="flex flex-col items-center justify-center gap-5 p-10 rounded-[2rem] border-2 border-gray-100 bg-white hover:border-[#6366f1] hover:bg-[#f8f9ff] transition flex-1 group shadow-sm hover:shadow-md cursor-pointer"
                 >
                   <div className="w-20 h-20 bg-[#f8f9ff] group-hover:bg-white rounded-full flex items-center justify-center text-[#6366f1] transition shadow-sm">
                     <Users size={36} />
                   </div>
                   <span className="font-extrabold text-2xl text-[#111827]">Employee</span>
                 </button>
                 
                 <button 
                   onClick={() => handleRoleSelect('admin')}
                   className="flex flex-col items-center justify-center gap-5 p-10 rounded-[2rem] border-2 border-gray-100 bg-white hover:border-[#6366f1] hover:bg-[#f8f9ff] transition flex-1 group shadow-sm hover:shadow-md cursor-pointer"
                 >
                   <div className="w-20 h-20 bg-[#f8f9ff] group-hover:bg-white rounded-full flex items-center justify-center text-[#6366f1] transition shadow-sm">
                     <ShieldCheck size={36} />
                   </div>
                   <span className="font-extrabold text-2xl text-[#111827]">Admin</span>
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-8 transition-opacity duration-500 ${showRoleSelection ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Left: Text & CTA */}
          <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
            <div className="flex items-center gap-2 bg-[#f4f5ff] text-[#6366f1] px-4 py-1.5 rounded-full font-bold text-sm mb-8 border border-[#e5e7ff]">
              <Sparkles size={16} /> Modern HR Management Platform
            </div>
            
            <h1 className="text-6xl md:text-[68px] font-black text-[#111827] tracking-tight leading-[1.1] mb-6 h-[140px] md:h-[160px] flex flex-col justify-end">
              <div>
                {typedText.substring(0, line1.length)}
              </div>
              <div className="text-[#6366f1] whitespace-nowrap">
                {typedText.length > line1.length ? typedText.substring(line1.length) : ' '}
                <span className="animate-pulse text-[#6366f1]">|</span>
              </div>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 font-medium max-w-xl">
              The all-in-one platform to streamline your HR processes, from payroll and attendance to leave management and announcements. Empower your workforce and simplify your administration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
              <button 
                onClick={() => setShowRoleSelection(true)}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#6366f1] text-white font-bold text-lg hover:bg-[#4f46e5] shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-1 cursor-pointer w-full sm:w-auto"
              >
                Get Started <ArrowRight size={20} />
              </button>
              <button 
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-[#111827] font-bold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer w-full sm:w-auto"
              >
                <Play size={18} className="text-[#6366f1]" /> Watch Demo
              </button>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-12 md:gap-16 pt-8 border-t border-gray-100 w-full">
              <div>
                <h4 className="text-xl font-black text-[#111827]">Lightning Fast</h4>
                <p className="text-sm font-medium text-gray-400 mt-1">Real-time updates</p>
              </div>
              <div>
                <h4 className="text-xl font-black text-[#111827]">Bank-Grade</h4>
                <p className="text-sm font-medium text-gray-400 mt-1">Security & Privacy</p>
              </div>
              <div>
                <h4 className="text-xl font-black text-[#111827]">24/7</h4>
                <p className="text-sm font-medium text-gray-400 mt-1">Expert Support</p>
              </div>
            </div>
          </div>

          {/* Right: Mockup Graphic */}
          <div className="flex-1 w-full flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[800px] xl:max-w-[900px] lg:scale-110 lg:translate-x-12 xl:translate-x-20">
              <img 
                src="/hero-mockup.png" 
                alt="SYS Dashboard Mockup" 
                className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
              />
            </div>
          </div>
        </div>

      </main>

      {/* Features Grid */}
      <FeaturesCarousel />

    </div>
  );
}

const FeaturesCarousel = () => {
  const scrollRef = useRef(null);
  const [scrollX, setScrollX] = useState(0);
  const [viewportW, setViewportW] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportW(window.innerWidth);
      const handleResize = () => setViewportW(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleScroll = (e) => {
    setScrollX(e.target.scrollLeft);
  };

  const features = [
    { title: "Employee Management", icon: <Users size={24} />, desc: "Keep your team organized with centralized employee records and easy management tools." },
    { title: "Attendance Tracking", icon: <Calendar size={24} />, desc: "Monitor working hours, absences and overtime with real-time insights." },
    { title: "Leave Management", icon: <Umbrella size={24} />, desc: "Handle leave requests, approvals and balances effortlessly." },
    { title: "Payroll Processing", icon: <DollarSign size={24} />, desc: "Automate calculations and manage salaries, bonuses and deductions." },
    { title: "Powerful Reports", icon: <BarChart2 size={24} />, desc: "Get the data you need with customizable and exportable reports." },
    { title: "Secure & Reliable", icon: <ShieldCheck size={24} />, desc: "Your data is protected with enterprise-grade security and privacy." },
  ];

  const CARD_WIDTH = 340;
  const GAP = 48; // 3rem

  return (
    <section className="w-full mt-32 py-32 relative overflow-hidden bg-gradient-to-br from-[#f8f9ff] via-[#fcfcfd] to-[#f4f5ff]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-r from-[#eef0ff] via-[#e5e7ff] to-[#f4f5ff] blur-[120px] rounded-full opacity-60 pointer-events-none"></div>
      
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar relative z-20 flex"
        style={{ perspective: '1500px', scrollBehavior: 'smooth' }}
      >
        <div 
          className="flex items-center h-[450px]"
          style={{ 
            paddingLeft: `calc(50vw - ${CARD_WIDTH / 2}px)`, 
            paddingRight: `calc(50vw - ${CARD_WIDTH / 2}px)`,
            gap: \`\${GAP}px\`
          }}
        >
          {features.map((feature, i) => {
            const paddingLeft = viewportW / 2 - CARD_WIDTH / 2;
            const cardLeft = paddingLeft + i * (CARD_WIDTH + GAP);
            const cardCenterAbs = cardLeft + CARD_WIDTH / 2;
            const viewCenterAbs = scrollX + viewportW / 2;
            
            const distance = cardCenterAbs - viewCenterAbs;
            
            // Normalize distance relative to viewport width
            const maxDist = viewportW * 0.6; 
            let normalized = maxDist > 0 ? distance / maxDist : 0;
            if (normalized > 1) normalized = 1;
            if (normalized < -1) normalized = -1;

            const rotateY = normalized * 35; // rotate up to 35 degrees
            const scale = 1 - Math.abs(normalized) * 0.15; // scale down to 0.85
            const opacity = 1 - Math.abs(normalized) * 0.4; // fade slightly
            const translateZ = -Math.abs(normalized) * 100; // push back 100px
            const zIndex = 100 - Math.abs(Math.round(normalized * 100));

            return (
              <div 
                key={i}
                className="snap-center shrink-0 bg-white/90 backdrop-blur-md border border-gray-100 shadow-[0_20px_60px_rgb(0,0,0,0.06)] rounded-[2.5rem] p-10 flex flex-col items-start transition-transform duration-75 will-change-transform cursor-pointer hover:border-[#6366f1]/30 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)]"
                style={{
                  width: \`\${CARD_WIDTH}px\`,
                  transform: \`rotateY(\${rotateY}deg) scale(\${scale}) translateZ(\${translateZ}px)\`,
                  opacity: opacity,
                  zIndex: zIndex,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#f4f5ff] to-[#eef0ff] rounded-2xl flex items-center justify-center text-[#6366f1] mb-8 shadow-sm">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-[#111827] mb-4 text-xl">{feature.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Welcome;
