import { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Menu, 
  X, 
  ChevronDown, 
  UserCheck, 
  GraduationCap, 
  Sun, 
  Moon,
  FileText
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  onOpenLoginModal,
  onOpenAdmissionModal = null,
  currentUser = null,
  setCurrentUser = null,
  currentRole = null,
  setCurrentRole = null,
  onLogout = null,
  isDarkMode = false,
  onToggleDarkMode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coursesDropdown, setCoursesDropdown] = useState(false);
  const [examDropdown, setExamDropdown] = useState(false);
  const [admissionDropdown, setAdmissionDropdown] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [activeNav, setActiveNav] = useState('home'); // active clicked top tab (defaults to 'home')

  // Close dropdowns on outside click
  const navRef = useRef(null);
  useEffect(() => {
    if (currentView === 'admission') {
      setActiveNav('admission');
    } else if (currentView === 'centers') {
      setActiveNav('centers');
    } else if (currentView === 'about') {
      setActiveNav('about');
    } else if (currentView === 'contact') {
      setActiveNav('contact');
    } else if (currentView === 'gtse' || currentView === 'gtse-registration') {
      setActiveNav('gtse');
    } else if (currentView === 'home') {
      setActiveNav('home');
    }
  }, [currentView]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setCoursesDropdown(false);
        setExamDropdown(false);
        setAdmissionDropdown(false);
        setLoginDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllDropdowns = () => {
    setCoursesDropdown(false);
    setExamDropdown(false);
    setAdmissionDropdown(false);
    setLoginDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (tabName) => {
    setActiveNav(tabName);
    closeAllDropdowns();
  };

  return (
    <header 
      ref={navRef} 
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-slate-950/98 backdrop-blur-xl border-b border-slate-800 shadow-md text-slate-100' 
          : 'bg-white/98 backdrop-blur-xl border-b border-slate-200 shadow-sm text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo (Official Goyal Coaching Centre Emblem in Blue Theme) */}
          <button
            onClick={() => { handleNavClick('home'); setCurrentView('home'); }}
            className="flex items-center gap-3.5 text-left cursor-pointer group shrink-0"
          >
            <div className="relative">
              <img
                src="/goyal-logo.png"
                alt="Goyal Coaching Centre"
                className="w-13 h-13 rounded-full object-cover border-2 border-blue-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all duration-300 bg-white p-0.5"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">
                ★
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5 leading-none font-outfit">
                <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>GOYAL</span>
                <span className="text-blue-600 dark:text-blue-400">COACHING</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider hidden sm:inline-block ${
                  isDarkMode 
                    ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300' 
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                }`}>
                  CENTRE
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-serif italic tracking-wide font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  "Build a Better Future"
                </span>
                <span className={`${isDarkMode ? 'text-slate-400' : 'text-black'} hidden md:inline font-bold`}>•</span>
                <span className={`text-[10px] tracking-wider font-bold uppercase hidden md:inline ${isDarkMode ? 'text-slate-200' : 'text-black'}`}>
                  8th–10th (Sci & Maths) • 11th–12th Commerce
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links (All buttons turn BLUE when clicked!) */}
          <div className={`hidden xl:flex items-center space-x-7 text-xs font-bold tracking-wider uppercase ${
            isDarkMode ? 'text-slate-200' : 'text-slate-800'
          }`}>
            
            {/* HOME (Highlights in BLUE upon click!) */}
            <button
              onClick={() => { handleNavClick('home'); setCurrentView('home'); }}
              className={`flex flex-col items-center py-1.5 cursor-pointer transition-all ${
                activeNav === 'home'
                  ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.55)] scale-105'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-blue-400'
                  : 'text-slate-800 hover:text-blue-600'
              }`}
            >
              <span>HOME</span>
              <span className={`w-3.5 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'home' ? 'bg-blue-600 dark:bg-blue-400 w-5 h-1 shadow-sm shadow-blue-500/50' : 'bg-transparent'}`} />
            </button>

            {/* COURSES DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setActiveNav('courses');
                  setCoursesDropdown(!coursesDropdown);
                  setExamDropdown(false);
                  setAdmissionDropdown(false);
                  setLoginDropdown(false);
                }}
                className={`flex flex-col items-center cursor-pointer py-1.5 transition-all ${
                  activeNav === 'courses'
                    ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.55)] scale-105'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-blue-400'
                    : 'text-slate-800 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>COURSES</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 transition-transform" />
                </div>
                {/* Blue indicator marker under COURSES */}
                <span className={`w-2.5 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'courses' ? 'bg-blue-600 dark:bg-blue-400 w-5 h-1' : 'bg-blue-600 dark:bg-blue-400'}`} />
              </button>

              {coursesDropdown && (
                <div 
                  className={`absolute top-full -left-10 sm:-left-24 md:-left-32 mt-3 w-[700px] max-w-[92vw] rounded-3xl p-6 sm:p-8 z-50 shadow-2xl backdrop-blur-2xl transition-all animate-fadeIn ${
                    isDarkMode 
                      ? 'bg-slate-950/98 border-2 border-slate-800 shadow-blue-950/40 text-slate-100' 
                      : 'bg-white/98 border-2 border-slate-200/90 shadow-slate-300/60 text-slate-900'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-left">
                    
                    {/* COLUMN 1: FOUNDATION */}
                    <div>
                      {/* Main Subpart Header: Highlighted in Accent Color */}
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-4 pb-1.5 border-b border-blue-500/20">
                        Foundation
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-7');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 7th Foundation
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-8');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 8th Foundation
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-9');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 9th Foundation
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-10');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 10th Foundation
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 2: COMMERCE */}
                    <div>
                      {/* Main Subpart Header: Highlighted in Accent Color */}
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-4 pb-1.5 border-b border-blue-500/20">
                        Commerce
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-11-commerce');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 11th Commerce
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-12-commerce');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 12th Commerce
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-accounts-eco');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Accounts & Economics Special
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 3: SCIENCE & MATHEMATICS */}
                    <div>
                      {/* Main Subpart Header: Highlighted in Accent Color */}
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-4 pb-1.5 border-b border-blue-500/20">
                        Science & Mathematics
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-8-sci-maths');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 8th Science & Maths
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-9-sci-maths');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 9th Science & Maths
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-class-10-champions');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 10th Board Champions (100/100)
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('course-pre-board-simulators');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Pre-Board Simulator Test Series
                          </button>
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* EXAM DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => {
                  setActiveNav('exam');
                  setExamDropdown(!examDropdown);
                  setCoursesDropdown(false);
                  setAdmissionDropdown(false);
                  setLoginDropdown(false);
                }}
                className={`flex flex-col items-center cursor-pointer py-1.5 transition-all ${
                  activeNav === 'exam'
                    ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.55)] scale-105'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-blue-400'
                    : 'text-slate-800 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>EXAM</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 transition-transform" />
                </div>
                {/* Blue indicator marker under EXAM */}
                <span className={`w-2.5 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'exam' ? 'bg-blue-600 dark:bg-blue-400 w-5 h-1' : 'bg-blue-600 dark:bg-blue-400'}`} />
              </button>

              {examDropdown && (
                <div 
                  className={`absolute top-full -left-20 sm:-left-36 md:-left-48 mt-3 w-[700px] max-w-[92vw] rounded-3xl p-6 sm:p-8 z-50 shadow-2xl backdrop-blur-2xl transition-all animate-fadeIn ${
                    isDarkMode 
                      ? 'bg-slate-950/98 border-2 border-slate-800 shadow-blue-950/40 text-slate-100' 
                      : 'bg-white/98 border-2 border-slate-200/90 shadow-slate-300/60 text-slate-900'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-left">
                    
                    {/* COLUMN 1: SCHOLARSHIP TESTS */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-4 pb-1.5 border-b border-blue-500/20">
                        Scholarship Tests
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('gtse');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            GTSE Scholarship Exam
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('gtse-registration');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left w-full cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Registration Form</span>
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              setCurrentView('gtse');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Exam Pattern & Syllabus
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('news-events');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Stage 1 & 2 Results
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 2: BOARD SIMULATIONS */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-4 pb-1.5 border-b border-blue-500/20">
                        Board Simulations
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Sunday Simulated Board Tests
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 10 Full Syllabus Mocks
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Class 12 Accounts & Eco Mocks
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Topper Step-Marking Guidelines
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* COLUMN 3: DAILY EVALUATION */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-4 pb-1.5 border-b border-blue-500/20">
                        Daily Evaluation
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Daily Problem Practice (DPPs)
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Unit Assessment Question Banks
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            1-on-1 Performance Reviews
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              closeAllDropdowns();
                              const el = document.getElementById('courses');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1 transition-all text-left block w-full cursor-pointer"
                          >
                            Weekly Parent Assessment Reports
                          </button>
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* ADMISSION (DIRECT CLICKABLE - OPENS DEDICATED ADMISSION PAGE) */}
            <button
              onClick={() => {
                setActiveNav('admission');
                closeAllDropdowns();
                if (setCurrentView) {
                  setCurrentView('admission');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex flex-col items-center cursor-pointer py-1.5 transition-all ${
                activeNav === 'admission' || currentView === 'admission'
                  ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_10px_rgba(37,99,235,0.6)] scale-105'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-blue-400'
                  : 'text-slate-800 hover:text-blue-600'
              }`}
            >
              <span>ADMISSION</span>
              {/* Blue Indicator Bar */}
              <span className={`w-3.5 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'admission' || currentView === 'admission' ? 'bg-blue-600 dark:bg-blue-400 w-6 h-1 shadow-sm shadow-blue-500/50' : 'bg-transparent'}`} />
            </button>



            {/* CENTERS */}
            <button
              onClick={() => {
                handleNavClick('centers');
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center py-1.5 cursor-pointer transition-all ${
                activeNav === 'centers' || currentView === 'centers'
                  ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.55)] scale-105'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-blue-400'
                  : 'text-slate-800 hover:text-blue-600'
              }`}
            >
              <span>CENTERS</span>
              <span className={`w-2 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'centers' || currentView === 'centers' ? 'bg-blue-600 dark:bg-blue-400 w-5 h-1 shadow-sm shadow-blue-500/50' : 'bg-transparent'}`} />
            </button>

            {/* ABOUT US */}
            <button
              onClick={() => {
                handleNavClick('about');
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center py-1.5 cursor-pointer transition-all ${
                activeNav === 'about' || currentView === 'about'
                  ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.55)] scale-105'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-blue-400'
                  : 'text-slate-800 hover:text-blue-600'
              }`}
            >
              <span>ABOUT US</span>
              <span className={`w-2 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'about' || currentView === 'about' ? 'bg-blue-600 dark:bg-blue-400 w-5 h-1 shadow-sm shadow-blue-500/50' : 'bg-transparent'}`} />
            </button>

            {/* CONTACT */}
            <button
              onClick={() => {
                handleNavClick('contact');
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center py-1.5 cursor-pointer transition-all ${
                activeNav === 'contact' || currentView === 'contact'
                  ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.55)] scale-105'
                  : isDarkMode
                  ? 'text-slate-300 hover:text-blue-400'
                  : 'text-slate-800 hover:text-blue-600'
              }`}
            >
              <span>CONTACT</span>
              <span className={`w-2 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'contact' || currentView === 'contact' ? 'bg-blue-600 dark:bg-blue-400 w-5 h-1 shadow-sm shadow-blue-500/50' : 'bg-transparent'}`} />
            </button>

            {/* LOGIN DROPDOWN (with BLUE accent) */}
            {currentRole ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (currentRole === 'student') setCurrentView('parent');
                    else if (currentRole === 'teacher') setCurrentView('teacher');
                    else if (currentRole === 'admin') setCurrentView('admin');
                    closeAllDropdowns();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-600/30 text-xs font-bold cursor-pointer hover:bg-blue-600/25 transition-all"
                  title="Open Your Portal"
                >
                  {currentRole === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
                  {currentRole === 'teacher' && <UserCheck className="w-3.5 h-3.5" />}
                  {currentRole === 'admin' && <Lock className="w-3.5 h-3.5" />}
                  <span>
                    {currentRole === 'student' ? (currentUser?.name ? currentUser.name.split(' ')[0] : 'Student Portal') :
                     currentRole === 'teacher' ? (currentUser?.name ? currentUser.name : 'Teacher Portal') :
                     'Main Admin'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setCurrentView('home');
                    closeAllDropdowns();
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer px-1 py-1"
                  title="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveNav('login');
                    setLoginDropdown(!loginDropdown);
                    setCoursesDropdown(false);
                    setExamDropdown(false);
                    setAdmissionDropdown(false);
                  }}
                  className={`flex flex-col items-center cursor-pointer py-1.5 transition-all ${
                    activeNav === 'login'
                      ? 'text-blue-600 dark:text-blue-400 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.55)] scale-105'
                      : isDarkMode
                      ? 'text-slate-200 hover:text-blue-400 font-bold'
                      : 'text-slate-800 hover:text-blue-600 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>LOGIN</span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 transition-transform" />
                  </div>
                  {/* Blue indicator marker under LOGIN */}
                  <span className={`w-2.5 h-0.5 rounded-full mt-0.5 transition-all ${activeNav === 'login' ? 'bg-blue-600 dark:bg-blue-400 w-5 h-1' : 'bg-blue-600 dark:bg-blue-400'}`} />
                </button>

                {loginDropdown && (
                  <div 
                    style={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#ffffff' : '#000000' }}
                    className={`absolute top-full right-0 mt-2 w-80 rounded-2xl p-3 z-50 shadow-2xl backdrop-blur-xl animate-fadeIn ${
                      isDarkMode ? 'border border-slate-800' : 'border-2 border-slate-300 shadow-slate-400/50'
                    }`}
                  >
                    <div 
                      style={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', 
                        color: isDarkMode ? '#f8fafc' : '#000000',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0'
                      }}
                      className="text-[11px] font-black px-3 py-1.5 uppercase tracking-wider border-b mb-2.5 rounded-lg"
                    >
                      Select Your Login Role
                    </div>

                    {/* Student Login */}
                    <button
                      onClick={() => {
                        closeAllDropdowns();
                        onOpenLoginModal('student');
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center gap-3 cursor-pointer group mb-2 ${
                        isDarkMode ? 'bg-slate-800/80 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 shadow-sm">
                        <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }} className="font-black text-sm">Student Portal</div>
                      </div>
                    </button>

                    {/* Faculty Login */}
                    <button
                      onClick={() => {
                        closeAllDropdowns();
                        onOpenLoginModal('teacher');
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center gap-3 cursor-pointer group mb-2 ${
                        isDarkMode ? 'bg-slate-800/80 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-sm">
                        <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }} className="font-black text-sm">Faculty Desk</div>
                      </div>
                    </button>

                    {/* Main Admin Login */}
                    <button
                      onClick={() => {
                        closeAllDropdowns();
                        onOpenLoginModal('admin');
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center gap-3 cursor-pointer group ${
                        isDarkMode ? 'bg-slate-800/80 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-sm">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }} className="font-black text-sm">Main Admin Portal</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dark/Light Action Badge (Right corner icon: Moon shape in light mode, Sun in dark mode with BLUE border) */}
            <div className={`pl-2 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={onToggleDarkMode}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                  isDarkMode 
                    ? 'border-blue-400/60 text-blue-400 bg-slate-900 hover:bg-blue-400/10' 
                    : 'border-blue-600 text-blue-600 bg-white hover:bg-blue-50 shadow-blue-500/10'
                }`}
                title={isDarkMode ? "Click to switch to Light Mode" : "Click Moon to turn on Dark Mode"}
                aria-label="Toggle Theme Mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-blue-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Action */}
          <div className="xl:hidden flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Dark/Light Moon toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode 
                  ? 'border-blue-400/60 text-blue-400 bg-slate-900' 
                  : 'border-blue-600 text-blue-600 bg-white shadow-sm'
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentRole ? (
              <button
                onClick={() => {
                  if (currentRole === 'student') setCurrentView('parent');
                  else if (currentRole === 'teacher') setCurrentView('teacher');
                  else if (currentRole === 'admin') setCurrentView('admin');
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-600/30 text-[11px] sm:text-xs font-bold"
              >
                PORTAL
              </button>
            ) : (
              <button
                onClick={() => onOpenLoginModal('student')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-600/30 text-[11px] sm:text-xs font-bold"
              >
                LOGIN
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border cursor-pointer ${
                isDarkMode 
                  ? 'text-slate-300 hover:text-white bg-slate-900 border-slate-800' 
                  : 'text-slate-800 hover:text-black bg-slate-100 border-slate-200'
              }`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`xl:hidden border-b px-5 pt-4 pb-6 space-y-3 backdrop-blur-2xl animate-fadeIn ${
          isDarkMode 
            ? 'bg-slate-950/98 border-slate-800 text-slate-200' 
            : 'bg-white/98 border-slate-200 text-slate-800 shadow-xl'
        }`}>
          <button
            onClick={() => { handleNavClick('home'); setCurrentView('home'); }}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-extrabold ${
              activeNav === 'home' ? 'text-blue-600 bg-blue-50/80 dark:bg-slate-900' : isDarkMode ? 'text-white hover:text-blue-400' : 'text-black hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            HOME
          </button>
          <div>
            <button
              onClick={() => {
                setActiveNav('courses');
                setCoursesDropdown(!coursesDropdown);
              }}
              className={`flex items-center justify-between w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold cursor-pointer ${
                activeNav === 'courses' ? 'text-blue-600 bg-blue-50/80 dark:bg-slate-900 font-extrabold' : isDarkMode ? 'text-white hover:text-blue-400' : 'text-black hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              <span>COURSES</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${coursesDropdown ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
            {coursesDropdown && (
              <div className="pl-4 pr-2 py-3 space-y-4 text-xs bg-slate-50/50 dark:bg-slate-900/50 rounded-xl mt-1 border border-slate-200 dark:border-slate-800">
                <div>
                  <h5 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2 border-b border-blue-500/20 pb-1">
                    Foundation
                  </h5>
                  <div className="space-y-2 pl-1">
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-7'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 7th Foundation
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-8'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 8th Foundation
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-9'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 9th Foundation
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-10'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 10th Foundation
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2 border-b border-blue-500/20 pb-1">
                    Commerce
                  </h5>
                  <div className="space-y-2 pl-1">
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-11-commerce'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 11th Commerce
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-12-commerce'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 12th Commerce
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-accounts-eco'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Accounts & Economics Special
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2 border-b border-blue-500/20 pb-1">
                    Science & Mathematics
                  </h5>
                  <div className="space-y-2 pl-1">
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-8-sci-maths'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 8th Science & Maths
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-9-sci-maths'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 9th Science & Maths
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-class-10-champions'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 10th Board Champions (100/100)
                    </div>
                    <div onClick={() => { 
                      closeAllDropdowns(); 
                      setCurrentView('course-pre-board-simulators'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Pre-Board Simulator Test Series
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile EXAM Menu */}
          <div>
            <button
              onClick={() => {
                setActiveNav('exam');
                setExamDropdown(!examDropdown);
                setCoursesDropdown(false);
                setAdmissionDropdown(false);
              }}
              className={`flex items-center justify-between w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold cursor-pointer ${
                activeNav === 'exam' ? 'text-blue-600 bg-blue-50/80 dark:bg-slate-900 font-extrabold' : isDarkMode ? 'text-white hover:text-blue-400' : 'text-black hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              <span>EXAM</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${examDropdown ? 'rotate-180 text-blue-600' : ''}`} />
            </button>
            {examDropdown && (
              <div className="pl-4 pr-2 py-3 space-y-4 text-xs bg-slate-50/50 dark:bg-slate-900/50 rounded-xl mt-1 border border-slate-200 dark:border-slate-800">
                <div>
                  <h5 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2 border-b border-blue-500/20 pb-1">
                    Scholarship Tests
                  </h5>
                  <div className="space-y-2 pl-1">
                    <div onClick={() => { closeAllDropdowns(); setCurrentView('gtse'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      GTSE Scholarship Exam
                    </div>
                    <div onClick={() => { closeAllDropdowns(); setCurrentView('gtse-registration'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Registration Form</span>
                    </div>
                    <div onClick={() => { closeAllDropdowns(); setCurrentView('gtse'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Exam Pattern & Syllabus
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2 border-b border-blue-500/20 pb-1">
                    Board Simulations
                  </h5>
                  <div className="space-y-2 pl-1">
                    <div onClick={() => { closeAllDropdowns(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Sunday Simulated Board Tests
                    </div>
                    <div onClick={() => { closeAllDropdowns(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 10 Full Syllabus Mocks
                    </div>
                    <div onClick={() => { closeAllDropdowns(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Class 12 Accounts & Eco Mocks
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] mb-2 border-b border-blue-500/20 pb-1">
                    Daily Evaluation
                  </h5>
                  <div className="space-y-2 pl-1">
                    <div onClick={() => { closeAllDropdowns(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Daily Problem Practice (DPPs)
                    </div>
                    <div onClick={() => { closeAllDropdowns(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-slate-800 dark:text-slate-200 font-medium py-0.5 cursor-pointer hover:text-blue-600">
                      Unit Assessment Question Banks
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile ADMISSION (Direct clickable - opens Dedicated Admission Page) */}
          <button
            onClick={() => {
              setActiveNav('admission');
              setMobileMenuOpen(false);
              closeAllDropdowns();
              if (setCurrentView) {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold cursor-pointer ${
              activeNav === 'admission' || currentView === 'admission' ? 'text-blue-600 bg-blue-50/80 dark:bg-slate-900 font-extrabold' : isDarkMode ? 'text-white hover:text-blue-400' : 'text-black hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            ADMISSION
          </button>
          <button
            onClick={() => {
              handleNavClick('centers');
              setCurrentView('centers');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold cursor-pointer ${
              activeNav === 'centers' || currentView === 'centers' ? 'text-blue-600 bg-blue-50/80 dark:bg-slate-900 font-extrabold' : isDarkMode ? 'text-white hover:text-blue-400' : 'text-black hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            CENTERS
          </button>
          <button
            onClick={() => {
              handleNavClick('contact');
              setCurrentView('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold ${
              activeNav === 'contact' || currentView === 'contact' ? 'text-blue-600 bg-blue-50/80 dark:bg-slate-900 font-extrabold' : isDarkMode ? 'text-white hover:text-blue-400' : 'text-black hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            CONTACT
          </button>
          <button
            onClick={() => {
              handleNavClick('about');
              setCurrentView('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`block w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold ${
              activeNav === 'about' || currentView === 'about' ? 'text-blue-600 bg-blue-50/80 dark:bg-slate-900 font-extrabold' : isDarkMode ? 'text-white hover:text-blue-400' : 'text-black hover:bg-slate-100 hover:text-blue-600'
            }`}
          >
            ABOUT US
          </button>

          {/* Role Login Buttons for Mobile */}
          <div className={`pt-4 border-t space-y-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
              Portal Access:
            </div>
            <button
              onClick={() => { closeAllDropdowns(); onOpenLoginModal('student'); }}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-600/30 text-xs font-bold flex items-center justify-between"
            >
              <span>Student Portal</span>
              <GraduationCap className="w-4 h-4" />
            </button>
            <button
              onClick={() => { closeAllDropdowns(); onOpenLoginModal('teacher'); }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-between"
            >
              <span>Faculty Desk</span>
              <UserCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => { closeAllDropdowns(); onOpenLoginModal('admin'); }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center justify-between"
            >
              <span>Main Admin Portal</span>
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Broad Blue Running Marquee Strip (Under the navigation bar) */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-blue-700 via-blue-600 to-indigo-800 border-t border-blue-400/30 border-b border-blue-500/40 py-2 overflow-hidden shadow-md">
        <div className="animate-marquee-scroll whitespace-nowrap flex items-center select-none">
          {/* Repeating sequence 1 */}
          <div className="flex items-center shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Building Strong Foundations. Shaping Bright Futures.
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Where Discipline Meets Excellence.
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Guiding Every Student Toward Success.
            </span>
          </div>

          {/* Repeating sequence 2 (Ensures seamless infinite continuous scroll) */}
          <div className="flex items-center shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Building Strong Foundations. Shaping Bright Futures.
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Where Discipline Meets Excellence.
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Guiding Every Student Toward Success.
            </span>
          </div>

          {/* Repeating sequence 3 (For wide displays) */}
          <div className="flex items-center shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Building Strong Foundations. Shaping Bright Futures.
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Where Discipline Meets Excellence.
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-3.5 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-white text-xs sm:text-[13px] font-bold tracking-wide">
              Guiding Every Student Toward Success.
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
