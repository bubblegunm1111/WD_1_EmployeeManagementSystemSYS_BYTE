import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

function ContactUs() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
          <button onClick={() => navigate('/about')} className="hover:text-[#8b8cf8] transition cursor-pointer">About Us</button>
          <button className="text-gray-900 transition">Contact Us</button>
        </nav>
        
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="text-sm font-bold bg-[#8b8cf8] text-white px-6 py-2.5 rounded-full shadow-sm hover:bg-[#7778f2] transition transform hover:-translate-y-0.5 cursor-pointer">
            Go Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 z-10 w-full max-w-5xl mx-auto pt-10 pb-20 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          
          {/* Left Side: Contact Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-6">Get in Touch</h1>
            <p className="text-lg text-gray-500 mb-10 max-w-md leading-relaxed font-medium">
              Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="font-bold text-[#111827]">sys1.admin.system@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                  <p className="font-bold text-[#111827]">+20 10939XXXXX</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">HQ Address</p>
                  <p className="font-bold text-[#111827]">Arthimatrix</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">First Name <span className="text-red-500 ml-1">*</span></label>
                    <input type="text" required className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Last Name <span className="text-red-500 ml-1">*</span></label>
                    <input type="text" required className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Email Address <span className="text-red-500 ml-1">*</span></label>
                  <input type="email" required className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm" placeholder="jane.doe@company.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Message <span className="text-red-500 ml-1">*</span></label>
                  <textarea required rows="4" className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] font-bold text-gray-700 transition shadow-sm resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="w-full mt-2 bg-[#1a1a1a] text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-0.5 cursor-pointer">
                  Send Message
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 animate-in zoom-in duration-500 text-center">
                <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center text-[#16a34a] mb-6 shadow-sm">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-extrabold text-[#1e293b] mb-2">Message Sent!</h3>
                <p className="text-gray-500 font-bold max-w-sm mb-8">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="px-8 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer">
                  Send another message
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ContactUs;
