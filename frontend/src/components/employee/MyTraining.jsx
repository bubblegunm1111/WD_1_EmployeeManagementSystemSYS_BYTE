import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle, Clock, PlayCircle, Download, X, Play } from 'lucide-react';

const REQUIRED_COURSES = [
  { id: 1, title: 'Cybersecurity Awareness', due: 'Sep 25', status: 'Not Started', duration: '45 mins' },
  { id: 2, title: 'Anti-Harassment Training 2026', due: 'Oct 15', status: 'Not Started', duration: '60 mins' }
];

const IN_PROGRESS_COURSES = [
  { id: 3, title: 'Leadership Fundamentals', progress: 65, lastAccessed: '2 days ago', duration: '2.5 hrs' }
];

const COMPLETED_COURSES = [
  { id: 4, title: 'Workplace Safety Guidelines', completedOn: 'Jan 15, 2026', certificate: true },
  { id: 5, title: 'New Employee Orientation', completedOn: 'Jan 14, 2026', certificate: false }
];

export default function MyTraining() {
  const [activeCourse, setActiveCourse] = useState(null);

  const openCourse = (course) => {
    setActiveCourse(course);
  };

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-8 custom-scrollbar">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#111827]">My Training</h1>
          <p className="text-gray-500 font-medium mt-1">Complete your required courses and track your learning progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Required & In Progress */}
          <div className="space-y-8">
            
            {/* Required Training */}
            <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <AlertCircleIcon className="text-red-500" size={20} /> Required
              </h2>
              <div className="space-y-4">
                {REQUIRED_COURSES.map(course => (
                  <div key={course.id} className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                    <div>
                      <p className="font-bold text-[#111827] text-lg">{course.title}</p>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Clock size={12} /> Due {course.due}
                        </span>
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <BookOpen size={14} /> {course.duration}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => openCourse(course)}
                      className="px-5 py-2.5 bg-[#111827] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#1f2937] shrink-0 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={18} /> Start Course
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <PlayCircle className="text-blue-500" size={20} /> In Progress
              </h2>
              <div className="space-y-4">
                {IN_PROGRESS_COURSES.map(course => (
                  <div key={course.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-[#111827] text-lg">{course.title}</p>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Last accessed {course.lastAccessed}</p>
                      </div>
                      <button 
                        onClick={() => openCourse(course)}
                        className="text-sm font-bold text-[#4f46e5] hover:text-[#4338ca] bg-indigo-50 px-4 py-2 rounded-lg"
                      >
                        Continue
                      </button>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-indigo-600">{course.progress}% Complete</span>
                        <span className="text-gray-500">{course.duration} total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-[#4f46e5] h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Completed */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#111827] mb-6 flex items-center gap-2">
                <Award className="text-green-500" size={20} /> Completed
              </h2>
              <div className="space-y-4">
                {COMPLETED_COURSES.map(course => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[#111827]">{course.title}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-0.5">Completed {course.completedOn}</p>
                      </div>
                    </div>
                    {course.certificate && (
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1" title="Download Certificate">
                        <Download size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Course Viewer Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#111827] text-white">
              <h2 className="text-lg font-bold">{activeCourse.title}</h2>
              <button onClick={() => setActiveCourse(null)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Video Area */}
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px]">
                <button className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
                  <Play size={32} className="ml-1" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 text-white text-sm font-medium">
                  <span>0:00</span>
                  <div className="flex-1 h-1 bg-white/30 rounded-full"></div>
                  <span>{activeCourse.duration}</span>
                </div>
              </div>

              {/* Sidebar Modules */}
              <div className="w-full md:w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto p-6">
                <h3 className="font-bold text-[#111827] mb-4 text-lg">Course Modules</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-indigo-200 shadow-sm rounded-xl border-l-4 border-l-indigo-500">
                    <p className="font-bold text-[#111827] text-sm">1. Introduction</p>
                    <p className="text-xs text-gray-500 mt-1">10 mins</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl opacity-60">
                    <p className="font-bold text-[#111827] text-sm">2. Core Principles</p>
                    <p className="text-xs text-gray-500 mt-1">20 mins</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl opacity-60">
                    <p className="font-bold text-[#111827] text-sm">3. Assessment</p>
                    <p className="text-xs text-gray-500 mt-1">15 mins</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Simple wrapper for the red alert circle to avoid importing another icon explicitly if missed
function AlertCircleIcon({ className, size }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}
