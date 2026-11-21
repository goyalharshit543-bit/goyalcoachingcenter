import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard,
  Clock, 
  CalendarDays,
  Bell, 
  FileText, 
  PlayCircle,
  Film,
  HardDrive,
  HelpCircle,
  Zap,
  BarChart2, 
  Bookmark, 
  AlertCircle, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Lock,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Printer,
  Send,
  BookOpen,
  Award,
  Video,
  FileCheck,
  Building2,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  ZoomIn,
  Upload,
  Check,
  Trophy,
  Camera,
  Eye,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';

export default function ParentPortal({ onBackToHome, initialSession = null, onLogout }) {
  const [session, setSession] = useState(initialSession);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Login form state (if unauthenticated)
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard date navigator state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  });

  // Leave intimation form state
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Feedback form state
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-Time Live Session Synchronizer
  const refreshStudentData = async (showSpin = true) => {
    const sId = session?.student?.id || session?.student?.rollNo || initialSession?.student?.id || initialSession?.student?.rollNo;
    if (!sId) return;
    if (showSpin) setIsRefreshing(true);
    try {
      const fresh = await api.getStudentSession(sId);
      if (fresh && fresh.student) {
        setSession(fresh);
      }
      await Promise.allSettled([
        loadLiveAssignments(),
        loadLiveLectures(),
        loadLiveOnlineTests(),
        loadLiveOfflineTests()
      ]);
    } catch (err) {
      console.warn('Silent live session sync failed', err);
    } finally {
      if (showSpin) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  // Live assignments state for student portal
  const [liveAssignments, setLiveAssignments] = useState([]);
  const [answerPhotosMap, setAnswerPhotosMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [submittingAsgId, setSubmittingAsgId] = useState(null);
  const [submissionSuccessMap, setSubmissionSuccessMap] = useState({});
  const [studentLightboxImage, setStudentLightboxImage] = useState(null);
  const [studentLightboxTitle, setStudentLightboxTitle] = useState('');
  const [showReuploadFor, setShowReuploadFor] = useState({});

  const loadLiveAssignments = async () => {
    try {
      const data = await api.getAssignments();
      if (Array.isArray(data)) {
        setLiveAssignments(data);
      }
    } catch (err) {
      console.warn('Failed to fetch assignments:', err);
    }
  };

  // Live lectures state for student portal
  const [liveLectures, setLiveLectures] = useState([]);
  const [activeStudentVideo, setActiveStudentVideo] = useState(null);
  const [studentVideoSpeed, setStudentVideoSpeed] = useState(1);
  const studentVideoRef = useRef(null);

  const loadLiveLectures = async () => {
    try {
      const data = await api.getLectures();
      if (Array.isArray(data)) {
        setLiveLectures(data);
      }
    } catch (err) {
      console.warn('Failed to fetch lectures:', err);
    }
  };

  // Live online tests & Olympiad testing engine state
  const [liveOnlineTests, setLiveOnlineTests] = useState([]);
  const [testSubTab, setTestSubTab] = useState('active'); // 'active' | 'upcoming' | 'completed' | 'missed'
  const [activeExam, setActiveExam] = useState(null);
  const [examAnswers, setExamAnswers] = useState({});
  const [examMarkedMap, setExamMarkedMap] = useState({});
  const [examCurrentQIndex, setExamCurrentQIndex] = useState(0);
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [examIsPractice, setExamIsPractice] = useState(false);
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [examResultModal, setExamResultModal] = useState(null);
  const [reviewingTest, setReviewingTest] = useState(null);
  const [reviewingAttempt, setReviewingAttempt] = useState(null);
  const [liveOfflineTests, setLiveOfflineTests] = useState([]);
  const [previewStudentSheet, setPreviewStudentSheet] = useState(null);
  const examTimerRef = useRef(null);
  const autoSubmitRef = useRef(null);

  const loadLiveOnlineTests = async () => {
    try {
      const data = await api.getOnlineTests();
      if (Array.isArray(data)) {
        setLiveOnlineTests(data);
      }
    } catch (err) {
      console.warn('Failed to load online tests:', err);
    }
  };

  const loadLiveOfflineTests = async () => {
    try {
      const data = await api.getTests();
      if (Array.isArray(data)) {
        setLiveOfflineTests(data);
      }
    } catch (err) {
      console.warn('Failed to load offline tests:', err);
    }
  };

  useEffect(() => {
    if (session?.student) {
      loadLiveAssignments();
      loadLiveLectures();
      loadLiveOnlineTests();
      loadLiveOfflineTests();
    }
  }, [session?.student?.grade, activeTab]);

  // Exam Countdown Timer
  useEffect(() => {
    if (activeExam && examTimeLeft > 0) {
      examTimerRef.current = setInterval(() => {
        setExamTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(examTimerRef.current);
            autoSubmitRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
  }, [activeExam]);

  const handleStartExam = (test, isPractice = false) => {
    setActiveExam(test);
    setExamIsPractice(isPractice);
    setExamAnswers({});
    setExamMarkedMap({});
    setExamCurrentQIndex(0);
    setExamTimeLeft((test.durationMinutes || 30) * 60);
  };

  const handleSelectExamOption = (qId, optionId) => {
    setExamAnswers(prev => ({
      ...prev,
      [qId]: optionId
    }));
  };

  const handleToggleMarkForReview = (qId) => {
    setExamMarkedMap(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleClearExamAnswer = (qId) => {
    setExamAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const handleSubmitExam = async (overrideAnswers = null) => {
    if (!activeExam) return;
    const answersToSend = overrideAnswers || examAnswers;

    try {
      setExamSubmitting(true);
      const studentObj = session?.student || {};
      const payload = {
        studentId: studentObj.id || studentObj.rollNo || 'student',
        studentName: studentObj.name || 'Student',
        rollNo: studentObj.rollNo || studentObj.id || '1',
        grade: studentObj.grade || activeExam.grade,
        answers: answersToSend,
        timeTakenSeconds: ((activeExam.durationMinutes || 30) * 60) - examTimeLeft,
        isPractice: examIsPractice
      };

      const res = await api.submitOnlineTestAttempt(activeExam.id, payload);
      if (res && res.attempt) {
        setExamResultModal({
          test: activeExam,
          attempt: res.attempt
        });

        // Trigger victory celebration if score >= 60%
        if (res.attempt.accuracy >= 60) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {}
        }
      }

      setActiveExam(null);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
      await loadLiveOnlineTests();
      await refreshStudentData(false);
    } catch (err) {
      alert(err.message || 'Error submitting test answers.');
    } finally {
      setExamSubmitting(false);
    }
  };

  autoSubmitRef.current = handleSubmitExam;

  const handleAutoSubmitExam = () => {
    handleSubmitExam();
  };

  const handleStudentAnswerUpload = (asgId, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image. Please select JPG, PNG, or WEBP photos of your handwritten answer sheet.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAnswerPhotosMap(prev => ({
            ...prev,
            [asgId]: [...(prev[asgId] || []), event.target.result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveStudentAnswerPhoto = (asgId, pIdx) => {
    setAnswerPhotosMap(prev => ({
      ...prev,
      [asgId]: (prev[asgId] || []).filter((_, i) => i !== pIdx)
    }));
  };

  const handleSubmitStudentAnswer = async (asgId) => {
    const photos = answerPhotosMap[asgId] || [];
    if (photos.length === 0) {
      alert('Please upload at least 1 photo of your handwritten answer sheet before submitting.');
      return;
    }

    try {
      setSubmittingAsgId(asgId);
      const studentObj = session?.student || {};
      const payload = {
        studentId: studentObj.id || studentObj.rollNo || 'student',
        studentName: studentObj.name || 'Student',
        rollNo: studentObj.rollNo || studentObj.id || '1',
        grade: studentObj.grade || 'Class 10',
        answerPhotos: photos,
        notes: notesMap[asgId] || ''
      };

      await api.submitAssignmentAnswer(asgId, payload);
      setSubmissionSuccessMap(prev => ({
        ...prev,
        [asgId]: '✓ Answer sheet uploaded and submitted to teacher successfully!'
      }));
      setShowReuploadFor(prev => ({ ...prev, [asgId]: false }));

      await loadLiveAssignments();
      await refreshStudentData(false);

      setTimeout(() => {
        setSubmissionSuccessMap(prev => {
          const next = { ...prev };
          delete next[asgId];
          return next;
        });
      }, 5000);
    } catch (err) {
      alert(err.message || 'Failed to submit answer sheet. Please try again.');
    } finally {
      setSubmittingAsgId(null);
    }
  };

  // Sync initialSession & start live polling
  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      const sId = initialSession?.student?.id || initialSession?.student?.rollNo;
      if (sId) {
        api.getStudentSession(sId).then(fresh => {
          if (fresh && fresh.student) setSession(fresh);
        }).catch(() => {});
      }
    }
  }, [initialSession]);

  // Live polling every 5 seconds while in Student Portal so teacher updates appear instantly
  useEffect(() => {
    const targetId = session?.student?.id || session?.student?.rollNo;
    if (!targetId) return;

    // Refresh immediately on tab switch
    refreshStudentData(false);

    const interval = setInterval(() => {
      refreshStudentData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [session?.student?.id, session?.student?.rollNo, activeTab]);

  const handleUserLogout = () => {
    setSession(null);
    if (onLogout) onLogout();
  };

  // Direct login from portal page
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login({
        role: 'student',
        username: rollNo.trim(),
        rollNo: rollNo.trim(),
        password: password.trim(),
        phone: password.trim()
      });
      setSession(data);
    } catch (err) {
      setError(err.message || 'Invalid Student ID or Password. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

    // Dynamic Day Schedule calculation for "Today's Classes"
  const getSelectedDayClasses = () => {
    try {
      const [m, d, y] = selectedDate.split('/').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      const weeklySchedule = {
        Monday: [
          { time: '04:00 PM - 05:30 PM', subject: 'Mathematics (Real Numbers & Trigonometry)', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' },
          { time: '05:45 PM - 07:15 PM', subject: 'Science (Physics: Light & Electricity)', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' }
        ],
        Tuesday: [
          { time: '04:00 PM - 05:30 PM', subject: 'Science (Chemistry: Chemical Reactions)', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' },
          { time: '05:45 PM - 07:00 PM', subject: 'Maths Olympiad Problem Solving', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' }
        ],
        Wednesday: [
          { time: '04:00 PM - 05:30 PM', subject: 'Mathematics (Polynomials & Quadratic Equations)', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' },
          { time: '05:45 PM - 07:15 PM', subject: 'Science (Biology: Life Processes)', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' }
        ],
        Thursday: [
          { time: '04:00 PM - 05:30 PM', subject: 'Science (Physics: Magnetic Effects of Current)', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' },
          { time: '05:45 PM - 07:00 PM', subject: 'Maths Advanced Proofs & NCERT Exemplar', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' }
        ],
        Friday: [
          { time: '04:00 PM - 05:30 PM', subject: 'Mathematics (Arithmetic Progressions & Coordinate Geometry)', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Active Session' },
          { time: '05:45 PM - 07:15 PM', subject: 'Science Doubts & Board Formula Testing', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Upcoming' }
        ],
        Saturday: [
          { time: '03:30 PM - 05:00 PM', subject: 'Weekly CBSE Board PYQ Marathon', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' },
          { time: '05:15 PM - 06:45 PM', subject: 'Olympiad & NTSE Advanced Rapid Fire', faculty: 'Er. Alok Goyal', hall: 'Hall 1', status: 'Scheduled' }
        ],
        Sunday: [
          { time: '09:00 AM - 12:00 PM', subject: 'Sunday Center Grand Mock Examination Series', faculty: 'Er. Alok Goyal', hall: 'Main Exam Hall', status: 'Center Offline Test Day' }
        ]
      };

      return { dayName, classes: weeklySchedule[dayName] || [] };
    } catch (e) {
      return { dayName: 'Today', classes: [] };
    }
  };

  // Date navigation handlers for "Today's Classes"
  const handlePrevDay = () => {
    const [m, d, y] = selectedDate.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    setSelectedDate(`${mm}/${dd}/${yyyy}`);
  };

  const handleNextDay = () => {
    const [m, d, y] = selectedDate.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    setSelectedDate(`${mm}/${dd}/${yyyy}`);
  };

  // Leave submit handler
  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) return;
    setLeaveSuccess(true);
    setTimeout(() => {
      setLeaveSuccess(false);
      setLeaveDate('');
      setLeaveReason('');
    }, 4000);
  };

  // Feedback submit handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setFeedbackSubject('');
      setFeedbackText('');
    }, 4000);
  };

  // =========================================================================
  // 1. UNAUTHENTICATED STATE: Clean Student Portal Login Form
  // =========================================================================
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Blue Header */}
          <div className="bg-[#1976d2] px-6 py-8 text-center text-white relative">
            <img
              src="/goyal-logo.png"
              alt="Goyal Coaching Centre"
              className="w-16 h-16 rounded-full object-cover border-2 border-white bg-white mx-auto mb-3 shadow-md"
            />
            <h1 className="text-xl font-bold tracking-tight">
              Goyal Coaching Centre
            </h1>
            <p className="text-blue-100 text-xs italic mt-0.5">
              "Build a Better Future"
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
              Student & Parent Portal
            </div>
          </div>

          {/* Login Form Body */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Student Roll Number / Name / ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roll No or Name"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password or Registered Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Enter password or phone"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span>Verifying credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Student Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
              <button
                onClick={onBackToHome}
                className="text-xs text-slate-500 hover:text-[#1976d2] transition-colors cursor-pointer font-medium"
              >
                ← Return to Goyal Coaching Centre Website
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED STATE: Clean LMS Student Dashboard matching Image 2
  // =========================================================================
  const { student = {}, attendance = {}, tests = [], notices = [] } = session;

  const totalClasses = attendance?.totalClasses ?? 0;
  const attendanceRate = totalClasses > 0 ? (attendance?.percentage ?? 0) : 0;
  const attendedDays = (attendance?.presentCount ?? 0) + ((attendance?.lateCount ?? 0) * 0.5);
  const studentDisplayName = student?.name || 'Student';

  // Menu items list matching Image 2
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'noticeboard', label: 'Noticeboard', icon: Bell },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'lectures', label: 'Online Lectures', icon: PlayCircle },
    { id: 'my-tests', label: 'My Tests', icon: HelpCircle },
    { id: 'offline-tests', label: 'Offline Tests', icon: Zap },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'bookmarked', label: 'Bookmarked Qs.', icon: Bookmark },
    { id: 'feedback', label: 'Feedback', icon: AlertCircle },
    { id: 'logout', label: 'Logout', icon: LogOut, isAction: true },
  ];

  const handleMenuClick = (item) => {
    if (item.id === 'logout') {
      handleUserLogout();
    } else {
      setActiveTab(item.id);
      setIsMobileMenuOpen(false);
    }
  };

  const getActiveTabLabel = () => {
    const item = menuItems.find(m => m.id === activeTab);
    return item ? item.label : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans">
      <div className="flex flex-1 relative">
        {/* ================================================================= */}
        {/* LEFT SIDEBAR (Clean White Sidebar with Brand & Menu Items)       */}
        {/* ================================================================= */}
        <aside
          className={`bg-white border-r border-slate-200 transition-all duration-300 z-30 flex flex-col shrink-0 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          } ${
            isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' : 'hidden md:flex'
          }`}
        >
          {/* Sidebar Top: Logo + Brand + Toggle */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 h-16">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src="/goyal-logo.png"
                alt="Goyal Coaching Centre"
                className="w-10 h-10 rounded-full object-cover border border-blue-200 bg-white p-0.5 shrink-0"
              />
              {isSidebarOpen && (
                <div className="truncate">
                  <div className="font-extrabold text-slate-900 text-sm tracking-tight truncate leading-tight font-outfit">
                    GOYAL
                  </div>
                  <div className="text-[11px] font-bold text-[#1976d2] uppercase tracking-wider leading-none">
                    Coaching Centre
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-8 h-8 rounded-lg bg-[#0288d1] hover:bg-[#0277bd] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Items List */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1976d2] text-white font-bold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  } ${!isSidebarOpen ? 'justify-center px-2' : ''}`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  {isSidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer with Student ID */}
          {isSidebarOpen && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="font-mono">Roll: {student?.rollNo || 'GCC-STU'}</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                {student?.grade || 'Class 10'}
              </span>
            </div>
          )}
        </aside>

        {/* Backdrop for mobile drawer */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
          />
        )}

        {/* ================================================================= */}
        {/* RIGHT AREA: Top Blue Header Bar + Main Body Content               */}
        {/* ================================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Blue Header Bar */}
          <header className="bg-[#1976d2] text-white h-16 px-4 sm:px-6 flex items-center justify-between shadow-md z-10 shrink-0">
            {/* Left: Mobile hamburger + Tab Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {getActiveTabLabel()}
              </h1>
            </div>

            {/* Right: Sync Live + Website Home + Student Avatar & Name */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => refreshStudentData(true)}
                disabled={isRefreshing}
                className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border border-white/20"
                title="Refresh live attendance and assessment records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Live</span>
              </button>

              <button
                onClick={onBackToHome}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Website Home
              </button>

              <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-blue-400/40">
                <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-xs shadow-sm overflow-hidden border border-white">
                  {student?.photo ? (
                    <img src={student.photo} alt={studentDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{studentDisplayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold leading-tight capitalize text-white">
                    {studentDisplayName}
                  </div>
                  <div className="text-[10px] text-blue-100 leading-tight">
                    {student?.grade || 'Class 10'}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Body Area */}
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {/* ============================================================= */}
            {/* 1. DASHBOARD VIEW (Exact match to Image 2)                    */}
            {/* ============================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Main Card: Today's Classes */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Card Header: "Today's Classes" + Date Navigator */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-sm sm:text-base font-bold text-slate-800">
                      Today's Classes
                    </h2>

                    {/* Date Navigator: < MM/DD/YYYY [calendar] > */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-xs text-xs font-semibold text-slate-700">
                      <button
                        onClick={handlePrevDay}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                        title="Previous day"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="px-2 font-mono">{selectedDate}</span>

                      <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1" />

                      <button
                        onClick={handleNextDay}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                        title="Next day"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body: Dynamic schedule for selected date */}
                  {(() => {
                    const { dayName, classes } = getSelectedDayClasses();
                    if (classes.length === 0) {
                      return (
                        <div className="p-12 sm:p-20 text-center flex flex-col items-center justify-center min-h-[300px]">
                          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                            <CalendarDays className="w-8 h-8 stroke-1" />
                          </div>
                          <p className="text-slate-500 text-sm font-medium">
                            No batch schedule for {dayName} (Self-Study Revision Day)
                          </p>
                          <p className="text-slate-400 text-xs mt-1 max-w-sm">
                            Classes for your batch ({student?.grade || 'Class 10'}) run Monday through Sunday as per center roster.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="p-4 sm:p-5 divide-y divide-slate-100">
                        <div className="pb-3 flex items-center justify-between text-xs text-slate-500 font-semibold">
                          <span>Class Schedule for <strong className="text-slate-800">{dayName}</strong> ({student?.grade || 'Class 10'})</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-[#1976d2] font-bold">
                            {classes.length} Sessions Scheduled
                          </span>
                        </div>

                        <div className="space-y-3 pt-3">
                          {classes.map((c, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#1976d2]">
                                    {c.status}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {c.time}
                                  </span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">{c.subject}</h3>
                                <div className="text-xs text-slate-500 flex items-center gap-3">
                                  <span>Mentor: <strong className="text-slate-700">{c.faculty}</strong></span>
                                  <span>•</span>
                                  <span>Venue: <strong className="text-slate-700">{c.hall}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {c.status === 'Center Offline Test Day' ? (
                                  <button
                                    onClick={() => setActiveTab('offline-tests')}
                                    className="px-3.5 py-2 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  >
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>View Center Tests</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setActiveTab('timetable')}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Batch Timetable</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Academic Snapshot Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#1976d2] flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Attendance Rate</div>
                      <div className="text-base font-bold text-slate-800">
                        {totalClasses > 0 ? `${attendanceRate}%` : 'New Admission'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Enrolled Batch</div>
                      <div className="text-base font-bold text-slate-800 truncate">
                        {student?.grade || 'Class 10'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Completed Tests</div>
                      <div className="text-base font-bold text-slate-800">
                        {tests?.length || 0} Tests
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Active Notices</div>
                      <div className="text-base font-bold text-slate-800">
                        {notices?.length || 0} Announcements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 2. ATTENDANCE VIEW                                            */}
            {/* ============================================================= */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#1976d2]" />
                        <span>Attendance Records & Working Days Percentage</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Attendance is calculated strictly according to total working days held so far.
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#1976d2] font-bold text-xs self-start sm:self-auto">
                      Overall: {totalClasses > 0 ? `${attendanceRate}%` : 'New Admission (0%)'}
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 font-medium">Total Working Days</div>
                      <div className="text-xl font-bold text-slate-900 mt-1">{totalClasses} Days</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Classes held so far</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-xs text-emerald-700 font-semibold">Days Attended</div>
                      <div className="text-xl font-bold text-emerald-800 mt-1">{attendedDays} Days</div>
                      <div className="text-[10px] text-emerald-600 mt-0.5">{attendance?.presentCount ?? 0} Full + {attendance?.lateCount ?? 0} Late</div>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="text-xs text-amber-700 font-semibold">Late Arrivals</div>
                      <div className="text-xl font-bold text-amber-800 mt-1">{attendance?.lateCount ?? 0} Days</div>
                      <div className="text-[10px] text-amber-600 mt-0.5">Counted as 0.5 Day</div>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                      <div className="text-xs text-rose-700 font-semibold">Absences</div>
                      <div className="text-xl font-bold text-rose-800 mt-1">{attendance?.absentCount ?? 0} Days</div>
                      <div className="text-[10px] text-rose-600 mt-0.5">Unattended sessions</div>
                    </div>
                  </div>

                  {/* Working Days Calculation Formula Banner */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-[#1976d2] uppercase tracking-wider text-[11px] mb-1">
                        Working Days Percentage Formula:
                      </div>
                      <div className="font-mono text-xs">
                        Attendance Rate = (Attended Days ÷ Total Working Days) × 100
                      </div>
                      {totalClasses > 0 ? (
                        <div className="font-mono text-xs text-slate-600 mt-0.5">
                          = ({attendedDays} ÷ {totalClasses}) × 100 = <strong className="text-[#1976d2]">{attendanceRate}%</strong>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Awaiting first attendance session for your enrolled class.
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 block">Class Policy</span>
                      <span className="font-bold text-emerald-700 text-xs">≥ 85% Recommended for Boards</span>
                    </div>
                  </div>

                  {/* Attendance Log Table */}
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Official Working Days Attendance Log
                  </h3>
                  {attendance?.logs && attendance.logs.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
                          <tr>
                            <th className="p-3">Working Date</th>
                            <th className="p-3">Class / Batch</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Time In</th>
                            <th className="p-3">Teacher Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attendance.logs.map((log, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-semibold text-slate-900">{log.date}</td>
                              <td className="p-3 font-medium text-slate-700">{log.className || student?.grade || 'Class Core'}</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                  log.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                                  'bg-rose-100 text-rose-800'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-500">{log.timeIn || '04:00 PM'}</td>
                              <td className="p-3 text-slate-600">{log.remarks || 'Standard session presence'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50">
                      No attendance marked yet. When teacher records your class attendance, your working days and percentage will update here in real-time.
                    </div>
                  )}

                  {/* Leave Application Form */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">
                      Submit Student Leave Application
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Notify mentor Er. Alok Goyal in advance of planned leave for medical or family reasons.
                    </p>

                    {leaveSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Leave request recorded successfully. Faculty desk notified.</span>
                      </div>
                    )}

                    <form onSubmit={handleLeaveSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Leave Date
                          </label>
                          <input
                            type="date"
                            required
                            value={leaveDate}
                            onChange={(e) => setLeaveDate(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Reason for Leave
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Medical illness, family function"
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1976d2] hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Submit Leave Application
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 3. TIMETABLE VIEW                                             */}
            {/* ============================================================= */}
            {activeTab === 'timetable' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#1976d2]" />
                  <span>Weekly Academic Timetable ({student?.grade || 'Class 10'})</span>
                </h2>
                <p className="text-xs text-slate-500 mb-5">
                  Classes conducted at Goyal Coaching Centre, Main Academic Center under mentorship of Er. Alok Goyal.
                </p>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-[#1976d2] text-white uppercase font-bold text-[11px]">
                      <tr>
                        <th className="p-3">Day</th>
                        <th className="p-3">Timing</th>
                        <th className="p-3">Subject & Topic</th>
                        <th className="p-3">Faculty / Mentor</th>
                        <th className="p-3">Hall</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { day: 'Monday', time: '4:00 PM - 5:30 PM', subject: 'Mathematics (Algebra & Trigonometry)', faculty: 'Er. Alok Goyal', hall: 'Hall 1' },
                        { day: 'Tuesday', time: '4:00 PM - 5:30 PM', subject: 'Science / Physics (Mechanics & Optics)', faculty: 'Er. Alok Goyal', hall: 'Hall 1' },
                        { day: 'Wednesday', time: '4:00 PM - 5:30 PM', subject: 'Science / Chemistry & Biology', faculty: 'Er. Alok Goyal', hall: 'Hall 1' },
                        { day: 'Thursday', time: '4:00 PM - 5:30 PM', subject: 'Mathematics (Problem Solving & Doubts)', faculty: 'Er. Alok Goyal', hall: 'Hall 1' },
                        { day: 'Friday', time: '4:00 PM - 5:30 PM', subject: 'Board Exam Test Paper Solving', faculty: 'Er. Alok Goyal', hall: 'Hall 1' },
                        { day: 'Sunday', time: '10:00 AM - 1:00 PM', subject: 'Weekly Sunday Offline Mock Test', faculty: 'Er. Alok Goyal', hall: 'Exam Wing' }
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{item.day}</td>
                          <td className="p-3 font-mono text-[#1976d2] font-semibold">{item.time}</td>
                          <td className="p-3 font-medium text-slate-800">{item.subject}</td>
                          <td className="p-3 text-slate-600">{item.faculty}</td>
                          <td className="p-3 text-slate-500">{item.hall}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 4. NOTICEBOARD VIEW                                           */}
            {/* ============================================================= */}
            {activeTab === 'noticeboard' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#1976d2]" />
                  <span>Official Noticeboard</span>
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Official announcements, schedules, and alerts for parents and students.
                </p>

                {notices && notices.length > 0 ? (
                  <div className="space-y-3">
                    {notices.map((n, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#1976d2]">
                            {n.category || 'Announcement'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{n.date || 'Active Session'}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No new announcements at this time.
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* 5. ASSIGNMENTS VIEW (DYNAMIC & LIVE ANSWER SHEET SUBMISSION)  */}
            {/* ============================================================= */}
            {activeTab === 'assignments' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#1976d2]" />
                      <span>Assignments & Daily Practice Problems (DPP)</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View question papers uploaded by faculty and submit your handwritten answer sheet photos.
                    </p>
                  </div>

                  <button
                    onClick={loadLiveAssignments}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Assignments List */}
                {(() => {
                  const sGrade = (student?.grade || '').trim().toLowerCase();
                  // Show matching grade or All Classes; fallback to all if empty
                  let displayList = (liveAssignments && liveAssignments.length > 0) ? liveAssignments : (session?.assignments || []);
                  
                  // Filter to student's relevant grade if available
                  const filtered = displayList.filter(a => {
                    if (!a.grade || a.grade === 'All Classes' || a.grade === 'All') return true;
                    if (!sGrade) return true;
                    return a.grade.toLowerCase() === sGrade || sGrade.includes(a.grade.toLowerCase()) || a.grade.toLowerCase().includes(sGrade);
                  });

                  const finalList = filtered.length > 0 ? filtered : displayList;

                  if (finalList.length === 0) {
                    return (
                      <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        No active assignments uploaded yet for {student?.grade || 'your class'}. Check back soon!
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {finalList.map((asn) => {
                        const photos = Array.isArray(asn.photos) ? asn.photos : [];
                        const sId = (student?.id || '').toString().trim().toLowerCase();
                        const sRoll = (student?.rollNo || '').toString().trim().toLowerCase();
                        
                        const submission = (asn.submissions || []).find(sub => {
                          const subSid = (sub.studentId || '').toString().trim().toLowerCase();
                          const subRoll = (sub.rollNo || '').toString().trim().toLowerCase();
                          return (sId && subSid === sId) || (sRoll && subRoll === sRoll) || (sId && subRoll === sId);
                        });

                        const isOverdue = asn.dueDate && new Date(asn.dueDate) < new Date();
                        const isReuploading = showReuploadFor[asn.id];
                        const selectedAnswerPhotos = answerPhotosMap[asn.id] || [];
                        const isSubmittingThis = submittingAsgId === asn.id;
                        const successMsg = submissionSuccessMap[asn.id];

                        return (
                          <div 
                            key={asn.id} 
                            className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-sm space-y-4"
                          >
                            {/* Assignment Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#1976d2]">
                                    {asn.subject}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                    {asn.grade}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">
                                    ID: {asn.id}
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                  {asn.title}
                                </h3>
                                {asn.description && (
                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    {asn.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
                                <span className={`text-[11px] font-bold flex items-center gap-1 ${
                                  isOverdue ? 'text-rose-600' : 'text-slate-600'
                                }`}>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Due: {asn.dueDate || 'No deadline'}</span>
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Max: {asn.totalMarks || 20} Marks
                                </span>
                              </div>
                            </div>

                            {/* ======================================================= */}
                            {/* 1. FACULTY'S UPLOADED QUESTION PHOTOS                   */}
                            {/* ======================================================= */}
                            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                  <ImageIcon className="w-4 h-4 text-[#1976d2]" />
                                  <span>Assignment Question Paper ({photos.length} {photos.length === 1 ? 'Page' : 'Pages'})</span>
                                </span>
                                <span className="text-[10px] text-slate-400">Click photo to view full size</span>
                              </div>

                              {photos.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                                  {photos.map((photo, pIdx) => (
                                    <div 
                                      key={pIdx} 
                                      onClick={() => {
                                        setStudentLightboxImage(photo);
                                        setStudentLightboxTitle(`${asn.title} - Question Paper Page ${pIdx + 1}`);
                                      }}
                                      className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 cursor-pointer shadow-sm hover:shadow"
                                    >
                                      <img 
                                        src={photo} 
                                        alt={`Question Sheet Page ${pIdx + 1}`} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                      />
                                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                        <ZoomIn className="w-4 h-4 mr-1" /> View Sheet
                                      </div>
                                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                                        Page {pIdx + 1}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">
                                  No question photos attached by faculty.
                                </p>
                              )}
                            </div>

                            {/* Success Notification Alert */}
                            {successMsg && (
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{successMsg}</span>
                              </div>
                            )}

                            {/* ======================================================= */}
                            {/* 2. STUDENT ANSWER SHEET SUBMISSION STATUS / FORM        */}
                            {/* ======================================================= */}
                            {submission && !isReuploading ? (
                              /* Case A: Already Submitted */
                              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <div>
                                      <div className="text-xs font-bold text-emerald-900">
                                        ✓ Answer Sheet Submitted Successfully
                                      </div>
                                      <div className="text-[10px] text-emerald-700">
                                        Submitted on {new Date(submission.submittedAt).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {submission.marksObtained !== null && submission.marksObtained !== undefined ? (
                                      <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-sm">
                                        Marks: {submission.marksObtained} / {asn.totalMarks}
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold">
                                        Awaiting Faculty Evaluation
                                      </span>
                                    )}

                                    <button
                                      onClick={() => setShowReuploadFor(prev => ({ ...prev, [asn.id]: true }))}
                                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                                    >
                                      Re-upload Answer Sheet
                                    </button>
                                  </div>
                                </div>

                                {/* Teacher remarks if graded */}
                                {submission.teacherRemarks && (
                                  <div className="p-3 rounded-lg bg-white border border-emerald-200 text-xs text-emerald-900">
                                    <span className="font-bold">Faculty Feedback:</span> "{submission.teacherRemarks}"
                                  </div>
                                )}

                                {/* Submitted photos gallery */}
                                {Array.isArray(submission.answerPhotos) && submission.answerPhotos.length > 0 && (
                                  <div>
                                    <div className="text-[11px] font-bold text-emerald-800 mb-1.5">
                                      Your Submitted Answer Pages ({submission.answerPhotos.length}):
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                      {submission.answerPhotos.map((photo, aIdx) => (
                                        <div 
                                          key={aIdx} 
                                          onClick={() => {
                                            setStudentLightboxImage(photo);
                                            setStudentLightboxTitle(`Your Submitted Answer Sheet - Page ${aIdx + 1}`);
                                          }}
                                          className="relative group rounded-lg overflow-hidden border border-emerald-300 aspect-square bg-white cursor-pointer shadow-sm hover:shadow"
                                        >
                                          <img 
                                            src={photo} 
                                            alt={`Answer page ${aIdx + 1}`} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                          />
                                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                            <ZoomIn className="w-3.5 h-3.5 mr-1" /> View
                                          </div>
                                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded font-mono">
                                            Pg {aIdx + 1}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Case B: Not Submitted Yet or in Re-upload mode */
                              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-bold uppercase tracking-wider text-[#1976d2] flex items-center gap-1.5">
                                    <Upload className="w-4 h-4" />
                                    <span>{isReuploading ? 'Re-upload Answer Sheet' : 'Upload Your Answer Sheet'}</span>
                                  </div>
                                  {isReuploading && (
                                    <button
                                      onClick={() => setShowReuploadFor(prev => ({ ...prev, [asn.id]: false }))}
                                      className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
                                    >
                                      Cancel Re-upload
                                    </button>
                                  )}
                                </div>

                                <p className="text-xs text-slate-600">
                                  Take clear photos of your handwritten answer sheets using your phone or browse from device. You can attach multiple pages.
                                </p>

                                {/* File selector */}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    id={`student-answer-upload-${asn.id}`}
                                    onChange={(e) => handleStudentAnswerUpload(asn.id, e)}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={`student-answer-upload-${asn.id}`}
                                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-blue-300 text-[#1976d2] text-xs font-bold cursor-pointer inline-flex items-center gap-2 transition-colors shadow-sm"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>📷 Choose / Click Answer Photos</span>
                                  </label>
                                  {selectedAnswerPhotos.length > 0 && (
                                    <span className="text-xs font-bold text-[#1976d2]">
                                      {selectedAnswerPhotos.length} {selectedAnswerPhotos.length === 1 ? 'Page' : 'Pages'} Selected
                                    </span>
                                  )}
                                </div>

                                {/* Preview of selected answer photos with delete option */}
                                {selectedAnswerPhotos.length > 0 && (
                                  <div className="space-y-1.5 pt-1">
                                    <div className="text-[11px] font-semibold text-slate-700">
                                      Attached Pages (Click ✕ to remove any blurry photo):
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                      {selectedAnswerPhotos.map((photo, pIdx) => (
                                        <div key={pIdx} className="relative group rounded-lg overflow-hidden border border-slate-300 aspect-square bg-white shadow-sm">
                                          <img 
                                            src={photo} 
                                            alt={`Page ${pIdx + 1}`} 
                                            className="w-full h-full object-cover" 
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveStudentAnswerPhoto(asn.id, pIdx)}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow"
                                            title="Delete photo"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded font-mono">
                                            Page {pIdx + 1}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes input */}
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Optional note for teacher (e.g. Solved 5 questions on 2 pages)..."
                                    value={notesMap[asn.id] || ''}
                                    onChange={(e) => setNotesMap({ ...notesMap, [asn.id]: e.target.value })}
                                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#1976d2]"
                                  />
                                </div>

                                {/* Submit button */}
                                <div className="pt-1">
                                  <button
                                    onClick={() => handleSubmitStudentAnswer(asn.id)}
                                    disabled={isSubmittingThis || selectedAnswerPhotos.length === 0}
                                    className="px-5 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-500/20"
                                  >
                                    {isSubmittingThis ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Send className="w-4 h-4" />
                                    )}
                                    <span>Submit Answer Sheet to Faculty</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ============================================================= */}
            {/* 6. ONLINE LECTURES VIEW (CLEARED DUMMIES & DYNAMIC STREAMING) */}
            {/* ============================================================= */}
            {activeTab === 'lectures' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-[#1976d2]" />
                      <span>Online Recorded Lectures & Video Masterclasses</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Classroom video recordings uploaded by faculty. Supports fast streaming and instant seeking.
                    </p>
                  </div>

                  <button
                    onClick={loadLiveLectures}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {(() => {
                  const sGrade = (student?.grade || '').trim().toLowerCase();
                  let lectureList = (liveLectures && liveLectures.length > 0) ? liveLectures : (session?.lectures || []);
                  
                  const filtered = lectureList.filter(l => {
                    if (!l.grade || l.grade === 'All Classes' || l.grade === 'All') return true;
                    if (!sGrade) return true;
                    return l.grade.toLowerCase() === sGrade || sGrade.includes(l.grade.toLowerCase()) || l.grade.toLowerCase().includes(sGrade);
                  });

                  const finalLectures = filtered.length > 0 ? filtered : lectureList;

                  if (finalLectures.length === 0) {
                    return (
                      <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <Film className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <div className="text-sm font-bold text-slate-700">No Recorded Lectures Available Yet</div>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          When faculty records and uploads classroom masterclasses for {student?.grade || 'your class'}, they will appear here.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {finalLectures.map((lec) => (
                        <div 
                          key={lec.id} 
                          className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/40 hover:bg-white"
                        >
                          <div>
                            {/* Video Cover Thumbnail with Play Overlay */}
                            <div 
                              className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer group"
                              onClick={() => {
                                setActiveStudentVideo(lec);
                                setStudentVideoSpeed(1);
                                api.incrementLectureView(lec.id);
                              }}
                            >
                              <img 
                                src={lec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'} 
                                alt={lec.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                              />

                              {/* Play Button Icon */}
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="w-11 h-11 rounded-full bg-[#1976d2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <PlayCircle className="w-6 h-6" />
                                </div>
                              </div>

                              {/* Duration Badge */}
                              {lec.duration && (
                                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold backdrop-blur-sm">
                                  {lec.duration}
                                </span>
                              )}

                              {/* Size Badge */}
                              {lec.fileSize && (
                                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 font-mono text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  <span>{lec.fileSize}</span>
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-3.5 space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#1976d2]">
                                  {lec.subject}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                  {lec.grade}
                                </span>
                              </div>

                              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                                {lec.title}
                              </h3>

                              {lec.chapter && (
                                <p className="text-[11px] text-[#1976d2] font-semibold truncate flex items-center gap-1">
                                  <BookOpen className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{lec.chapter}</span>
                                </p>
                              )}

                              {lec.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {lec.description}
                                </p>
                              )}

                              <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100">
                                <span>Mentor: {lec.faculty}</span>
                                <span>{lec.views || 0} views</span>
                              </div>
                            </div>
                          </div>

                          {/* Watch Button */}
                          <div className="p-3 pt-0">
                            <button
                              onClick={() => {
                                setActiveStudentVideo(lec);
                                setStudentVideoSpeed(1);
                                api.incrementLectureView(lec.id);
                              }}
                              className="w-full py-2 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>Watch Lecture Video</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ============================================================= */}
            {/* 7. MY TESTS (OLYMPIAD & BOARD ONLINE TESTS)                   */}
            {/* ============================================================= */}
            {activeTab === 'my-tests' && (() => {
              const currentStudent = session?.student || {};
              const studentGrade = currentStudent.grade || '';

              // Filter tests for this student's grade or all classes
              const eligibleTests = liveOnlineTests.filter(t => {
                if (!t.grade || t.grade === 'All Classes' || t.grade === 'All') return true;
                if (!studentGrade) return true;
                const gClean = String(studentGrade).toLowerCase().replace('class', '').trim();
                const tClean = String(t.grade).toLowerCase().replace('class', '').trim();
                return gClean === tClean || String(t.grade).toLowerCase().includes(gClean) || String(studentGrade).toLowerCase().includes(tClean);
              });

              // Helper: Find official student attempt
              const getStudentAttempt = (test) => {
                if (!Array.isArray(test.attempts)) return null;
                return test.attempts.find(a => 
                  !a.isPractice && (
                    (currentStudent.id && String(a.studentId) === String(currentStudent.id)) ||
                    (currentStudent.rollNo && String(a.rollNo) === String(currentStudent.rollNo)) ||
                    (currentStudent.name && String(a.studentName).trim().toLowerCase() === String(currentStudent.name).trim().toLowerCase())
                  )
                );
              };

              const now = new Date();
              const activeList = [];
              const upcomingList = [];
              const completedList = [];
              const missedList = [];

              eligibleTests.forEach(test => {
                const attempt = getStudentAttempt(test);
                const isPastEnd = test.endTime ? new Date(test.endTime) < now : false;
                const isFutureStart = test.startTime ? new Date(test.startTime) > now : false;

                if (attempt) {
                  // Attempted and submitted by student -> Completed
                  completedList.push({ ...test, userAttempt: attempt });
                } else if (test.status === 'closed' || isPastEnd) {
                  // Window expired without attempt -> Missed (available for practice)
                  missedList.push(test);
                } else if (test.status === 'active' || (!isPastEnd && !isFutureStart && test.status !== 'upcoming')) {
                  // Currently live -> Active
                  activeList.push(test);
                } else {
                  // Future schedule -> Upcoming
                  upcomingList.push(test);
                }
              });

              // Quick performance metrics
              const totalCompleted = completedList.length;
              const totalScore = completedList.reduce((acc, t) => acc + (t.userAttempt?.score || 0), 0);
              const totalMax = completedList.reduce((acc, t) => acc + (t.userAttempt?.maxScore || 0), 0);
              const overallPercent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

              return (
                <div className="space-y-6">
                  {/* Top Header Card */}
                  <div className="bg-gradient-to-r from-[#1976d2] via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
                          <Trophy className="w-3.5 h-3.5 text-amber-300" />
                          <span>Olympiad & CBSE Board MCQ Engine</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                          Online Tests & Mock Exam Arena
                        </h2>
                        <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
                          Timed MCQ tests with diagram questions, negative marking, instant score calculation, and Olympiad practice mode.
                        </p>
                      </div>

                      {/* Overall Mini Scorecard */}
                      <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-3 rounded-xl border border-white/20 shrink-0">
                        <div className="text-center px-2">
                          <div className="text-xl font-black text-amber-300">{totalCompleted}</div>
                          <div className="text-[10px] text-blue-100 font-semibold uppercase">Completed</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center px-2">
                          <div className="text-xl font-black text-emerald-300">{overallPercent}%</div>
                          <div className="text-[10px] text-blue-100 font-semibold uppercase">Avg Accuracy</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center px-2">
                          <div className="text-xl font-black text-white">{missedList.length}</div>
                          <div className="text-[10px] text-blue-100 font-semibold uppercase">Practice Qs</div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-tab Navigation */}
                    <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/20">
                      {[
                        { id: 'active', label: 'Active Tests', count: activeList.length, color: 'emerald' },
                        { id: 'upcoming', label: 'Upcoming Tests', count: upcomingList.length, color: 'blue' },
                        { id: 'completed', label: 'Completed Tests', count: completedList.length, color: 'amber' },
                        { id: 'missed', label: 'Missed Tests (Practice)', count: missedList.length, color: 'purple' },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setTestSubTab(tab.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            testSubTab === tab.id
                              ? 'bg-white text-[#1976d2] shadow-md scale-[1.02]'
                              : 'bg-white/15 text-white hover:bg-white/25'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            testSubTab === tab.id
                              ? 'bg-blue-100 text-[#1976d2]'
                              : 'bg-black/25 text-white'
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. ACTIVE TESTS */}
                  {testSubTab === 'active' && (
                    <div className="space-y-4">
                      {activeList.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
                          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="font-bold text-slate-700 text-sm">No Live Tests Active Right Now</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Check the <strong className="text-[#1976d2] cursor-pointer" onClick={() => setTestSubTab('upcoming')}>Upcoming Tests</strong> tab to view scheduled mock exams, or practice with <strong className="text-purple-600 cursor-pointer" onClick={() => setTestSubTab('missed')}>Missed Tests</strong>.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeList.map(test => {
                            const qCount = (test.questions || []).length;
                            const maxMarks = qCount * (test.positiveMarks || 4);
                            return (
                              <div
                                key={test.id}
                                className="bg-white rounded-2xl border-2 border-emerald-400/60 shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between relative overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                  <span>Live Test</span>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-[#1976d2]">
                                      {test.subject || 'All Subjects'}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                                      {test.grade || 'Class 10'}
                                    </span>
                                  </div>

                                  <h3 className="text-base font-bold text-slate-800 line-clamp-2">
                                    {test.title}
                                  </h3>
                                  {test.description && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                      {test.description}
                                    </p>
                                  )}

                                  {/* Test Meta Badges */}
                                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                    <div>
                                      <div className="text-[10px] text-slate-400 uppercase font-bold">Questions</div>
                                      <div className="text-xs font-black text-slate-800 mt-0.5">{qCount} MCQs</div>
                                    </div>
                                    <div className="border-x border-slate-200">
                                      <div className="text-[10px] text-slate-400 uppercase font-bold">Duration</div>
                                      <div className="text-xs font-black text-slate-800 mt-0.5">{test.durationMinutes || 30} Mins</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-slate-400 uppercase font-bold">Max Marks</div>
                                      <div className="text-xs font-black text-emerald-600 mt-0.5">{maxMarks} Pts</div>
                                    </div>
                                  </div>

                                  {/* Negative Marking & Timing */}
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3">
                                    <span>Marking: <strong className="text-emerald-600">+{test.positiveMarks || 4}</strong> / <strong className="text-rose-500">-{test.negativeMarks || 0}</strong></span>
                                    {test.endTime && (
                                      <span className="text-rose-600 font-semibold">Ends: {new Date(test.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleStartExam(test, false)}
                                  className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                                >
                                  <Zap className="w-4 h-4 fill-white" />
                                  <span>Start Olympiad MCQ Test</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. UPCOMING TESTS */}
                  {testSubTab === 'upcoming' && (
                    <div className="space-y-4">
                      {upcomingList.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
                          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="font-bold text-slate-700 text-sm">No Upcoming Tests Scheduled</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            The faculty will schedule upcoming Olympiad and Board mock tests here. Stay tuned!
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {upcomingList.map(test => {
                            const qCount = (test.questions || []).length;
                            const maxMarks = qCount * (test.positiveMarks || 4);
                            return (
                              <div
                                key={test.id}
                                className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-[#1976d2]">
                                        {test.subject || 'All Subjects'}
                                      </span>
                                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                                        {test.grade || 'Class 10'}
                                      </span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                                      Scheduled
                                    </span>
                                  </div>

                                  <h3 className="text-base font-bold text-slate-800 line-clamp-2">
                                    {test.title}
                                  </h3>
                                  {test.description && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                      {test.description}
                                    </p>
                                  )}

                                  {/* Schedule Notice Box */}
                                  <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                                    <Calendar className="w-4 h-4 text-[#1976d2] shrink-0 mt-0.5" />
                                    <div>
                                      <div className="font-bold">Scheduled Start Window:</div>
                                      <div className="text-[11px] text-blue-700 mt-0.5">
                                        {test.startTime ? new Date(test.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Will unlock soon by teacher'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-bold">Questions</span>
                                      <span className="font-bold text-slate-700">{qCount} MCQs</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-bold">Duration</span>
                                      <span className="font-bold text-slate-700">{test.durationMinutes || 30}m</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-bold">Total Marks</span>
                                      <span className="font-bold text-slate-700">{maxMarks} Pts</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 p-2.5 rounded-xl bg-slate-100 text-slate-500 text-center text-xs font-bold flex items-center justify-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Test will unlock automatically when live</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. COMPLETED TESTS */}
                  {testSubTab === 'completed' && (
                    <div className="space-y-4">
                      {completedList.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
                          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="font-bold text-slate-700 text-sm">No Completed Tests Yet</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Once you attempt an active test, your answers will be automatically evaluated, marks will be saved here, and you can review detailed step-by-step solutions.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {completedList.map(test => {
                            const attempt = test.userAttempt || {};
                            const isPassing = (attempt.accuracy || 0) >= 60;
                            return (
                              <div
                                key={test.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-[#1976d2]">
                                        {test.subject || 'All Subjects'}
                                      </span>
                                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                                        {test.grade || 'Class 10'}
                                      </span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Evaluated</span>
                                    </span>
                                  </div>

                                  <h3 className="text-base font-bold text-slate-800 line-clamp-1">
                                    {test.title}
                                  </h3>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Saved'}
                                  </div>

                                  {/* Score Banner */}
                                  <div className={`mt-3 p-3.5 rounded-xl border flex items-center justify-between ${
                                    isPassing ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-200'
                                  }`}>
                                    <div>
                                      <div className="text-[10px] uppercase font-bold text-slate-500">Marks Secured</div>
                                      <div className="text-xl font-black text-slate-900 mt-0.5">
                                        <span className={isPassing ? 'text-emerald-700' : 'text-amber-700'}>{attempt.score}</span>
                                        <span className="text-xs font-semibold text-slate-400"> / {attempt.maxScore}</span>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-[10px] uppercase font-bold text-slate-500">Accuracy Rate</div>
                                      <div className={`text-xl font-black ${isPassing ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {attempt.accuracy}%
                                      </div>
                                    </div>
                                  </div>

                                  {/* Breakdown Chips */}
                                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                                      <div className="text-[10px] text-emerald-700 font-bold">✓ Correct</div>
                                      <div className="font-black text-emerald-800">{attempt.correctCount || 0}</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                                      <div className="text-[10px] text-rose-700 font-bold">✗ Incorrect</div>
                                      <div className="font-black text-rose-800">{attempt.incorrectCount || 0}</div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                                      <div className="text-[10px] text-slate-600 font-bold">○ Skipped</div>
                                      <div className="font-black text-slate-800">{attempt.unattemptedCount || 0}</div>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    setReviewingTest(test);
                                    setReviewingAttempt(attempt);
                                  }}
                                  className="mt-4 w-full py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                                >
                                  <FileCheck className="w-4 h-4" />
                                  <span>Review Answers & Solutions</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. MISSED TESTS (PRACTICE OLYMPIAD MODE) */}
                  {testSubTab === 'missed' && (
                    <div className="space-y-4">
                      {missedList.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
                          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                          <h3 className="font-bold text-slate-700 text-sm">No Missed Tests! Outstanding!</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            You have not missed any scheduled live tests. All tests you took are safely archived in the Completed tab.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {missedList.map(test => {
                            const qCount = (test.questions || []).length;
                            const maxMarks = qCount * (test.positiveMarks || 4);
                            return (
                              <div
                                key={test.id}
                                className="bg-white rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700">
                                        {test.subject || 'All Subjects'}
                                      </span>
                                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                                        {test.grade || 'Class 10'}
                                      </span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                      Missed Live Window
                                    </span>
                                  </div>

                                  <h3 className="text-base font-bold text-slate-800 line-clamp-2">
                                    {test.title}
                                  </h3>
                                  <p className="text-xs text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-100 mt-2">
                                    💡 <strong>Olympiad Practice Available:</strong> You missed taking this test during the scheduled active timing, but you can still attempt all Olympiad questions here to master the concepts!
                                  </p>

                                  <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-bold">Questions</span>
                                      <span className="font-bold text-slate-700">{qCount} MCQs</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-bold">Duration</span>
                                      <span className="font-bold text-slate-700">{test.durationMinutes || 30}m</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-400 block font-bold">Total Marks</span>
                                      <span className="font-bold text-slate-700">{maxMarks} Pts</span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleStartExam(test, true)}
                                  className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                                >
                                  <BookOpen className="w-4 h-4" />
                                  <span>Practice Test (Olympiad Mode)</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* 8. OFFLINE TESTS (SUNDAY CLASSROOM TESTS & ANSWER SHEETS)      */}
            {/* ============================================================= */}
            {activeTab === 'offline-tests' && (() => {
              const currentStudent = session?.student || {};
              const sourceTests = liveOfflineTests.length > 0 ? liveOfflineTests : (session?.tests || []);

              const cleanG = (g) => {
                if (!g) return '';
                return String(g).toLowerCase().replace(/class/g, '').replace(/(th|st|nd|rd)/g, '').trim();
              };

              const isMatchGrade = (testGrade, studentGrade) => {
                if (!testGrade || testGrade === 'All' || testGrade === 'All Classes') return true;
                if (!studentGrade) return true;
                const tg = cleanG(testGrade);
                const sg = cleanG(studentGrade);
                return tg === sg || tg.includes(sg) || sg.includes(tg);
              };

              const isStudentResultMatch = (r) => {
                if (!r || !currentStudent) return false;
                const clean = (val) => String(val || '').trim().toLowerCase();
                const rSid = clean(r.studentId);
                const rRoll = clean(r.rollNo);
                const rName = clean(r.studentName || r.name);

                const sId = clean(currentStudent.id);
                const sRoll = clean(currentStudent.rollNo);
                const sName = clean(currentStudent.name);

                return (
                  (rSid && (rSid === sId || rSid === sRoll)) ||
                  (rRoll && (rRoll === sRoll || rRoll === sId)) ||
                  (rName && sName && (rName === sName || rName.includes(sName) || sName.includes(rName)))
                );
              };

              const studentOfflineRecords = [];

              sourceTests.forEach(t => {
                const isMyClass = isMatchGrade(t.grade || t.batch, currentStudent.grade);

                // Case A: Full test object with results array
                if (Array.isArray(t.results)) {
                  const r = t.results.find(isStudentResultMatch);
                  if (r) {
                    studentOfflineRecords.push({
                      testId: t.id,
                      title: t.title,
                      subject: t.subject || 'All Subjects',
                      grade: t.grade || t.batch,
                      date: t.date,
                      maxMarks: t.maxMarks || 50,
                      avgMarks: t.avgMarks,
                      highestMarks: t.highestMarks,
                      passingMarks: t.passingMarks || Math.round((t.maxMarks || 50) * 0.4),
                      questionPaperUrl: t.questionPaperUrl || null,
                      questionPaperName: t.questionPaperName || null,
                      questionPaperType: t.questionPaperType || null,
                      isEvaluated: true,
                      ...r
                    });
                  } else if (isMyClass) {
                    // Test was conducted/added for this student's grade, evaluation in progress
                    studentOfflineRecords.push({
                      testId: t.id,
                      title: t.title,
                      subject: t.subject || 'All Subjects',
                      grade: t.grade || t.batch,
                      date: t.date,
                      maxMarks: t.maxMarks || 50,
                      avgMarks: t.avgMarks,
                      highestMarks: t.highestMarks,
                      passingMarks: t.passingMarks || Math.round((t.maxMarks || 50) * 0.4),
                      questionPaperUrl: t.questionPaperUrl || null,
                      questionPaperName: t.questionPaperName || null,
                      questionPaperType: t.questionPaperType || null,
                      isEvaluated: false
                    });
                  }
                } else if (t.marksObtained !== undefined) {
                  // Case B: Flattened result object from session
                  studentOfflineRecords.push({
                    questionPaperUrl: t.questionPaperUrl || null,
                    questionPaperName: t.questionPaperName || null,
                    questionPaperType: t.questionPaperType || null,
                    isEvaluated: true,
                    ...t
                  });
                } else if (isMyClass) {
                  studentOfflineRecords.push({
                    testId: t.id,
                    title: t.title,
                    subject: t.subject || 'All Subjects',
                    grade: t.grade || t.batch,
                    date: t.date,
                    maxMarks: t.maxMarks || 50,
                    questionPaperUrl: t.questionPaperUrl || null,
                    questionPaperName: t.questionPaperName || null,
                    questionPaperType: t.questionPaperType || null,
                    isEvaluated: false
                  });
                }
              });

              // Sort by date descending
              studentOfflineRecords.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

              // Compute stats for evaluated tests
              const evaluatedList = studentOfflineRecords.filter(t => t.isEvaluated && t.marksObtained !== undefined && t.marksObtained !== '');
              const totalTests = evaluatedList.length;
              const totalScored = evaluatedList.reduce((acc, t) => acc + (Number(t.marksObtained) || 0), 0);
              const totalMax = evaluatedList.reduce((acc, t) => acc + (Number(t.maxMarks) || 0), 0);
              const overallPct = totalMax > 0 ? Number(((totalScored / totalMax) * 100).toFixed(1)) : 0;
              const validRanks = evaluatedList.map(t => Number(t.rank)).filter(n => !isNaN(n) && n > 0);
              const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : null;

              return (
                <div className="space-y-6">
                  {/* Quick Helper Switcher to Online Tests */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#1976d2] text-white flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold block text-blue-950">Looking to take a Live Olympiad Test with Timer?</span>
                        <span className="text-blue-700">Offline tests below are classroom pen-and-paper exams checked by faculty. For live timed quizzes, head over to My Tests.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('my-tests')}
                      className="px-4 py-2 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Open Online Mock Tests</span>
                    </button>
                  </div>

                  {/* Top Stats Hero */}
                  <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold mb-2 border border-white/15">
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Sunday Classroom Paper Examinations</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                          Offline Center Tests & Checked Answer Sheets
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                          Pen-and-paper mock examinations evaluated by Er. Alok Goyal. View your verified marks out of total score, teacher handwriting remarks, and inspect your original checked answer sheets.
                        </p>
                      </div>

                      {/* Mini Scorecard Banner */}
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0">
                        <div className="text-center px-2">
                          <div className="text-xl font-black text-amber-300">{totalTests}</div>
                          <div className="text-[10px] text-slate-300 uppercase font-semibold">Exams Graded</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center px-2">
                          <div className="text-xl font-black text-emerald-300">{overallPct}%</div>
                          <div className="text-[10px] text-slate-300 uppercase font-semibold">Avg Percentage</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center px-2">
                          <div className="text-xl font-black text-blue-300">{bestRank ? `#${bestRank}` : '-'}</div>
                          <div className="text-[10px] text-slate-300 uppercase font-semibold">Best Batch Rank</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List of Evaluated & Scheduled Tests */}
                  {studentOfflineRecords.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                      <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="font-bold text-slate-700 text-sm">No Offline Center Tests Registered Yet</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Once tests are conducted at Goyal Coaching Centre and recorded by teachers, your results and answer sheets will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentOfflineRecords.map((t, idx) => {
                        const marksNum = Number(t.marksObtained) || 0;
                        const maxNum = Number(t.maxMarks) || 50;
                        const pct = t.percentage !== undefined ? Number(t.percentage) : Number(((marksNum / maxNum) * 100).toFixed(1));
                        const isDistinction = pct >= 85;
                        const isFirstClass = pct >= 60;
                        const docsList = Array.isArray(t.documents) ? t.documents : (t.documentUrl ? [{ name: t.documentName || 'Checked Answer Sheet', url: t.documentUrl, type: t.documentType || 'image' }] : []);
                        const hasDocument = docsList.length > 0;

                        return (
                          <div
                            key={t.testId || idx}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                          >
                            <div>
                              {/* Header Badges */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-100 text-[#1976d2]">
                                    {t.subject || 'Mathematics'}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">
                                    {t.grade || 'Class 10'}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {t.date}
                                  </span>
                                </div>

                                {t.isEvaluated ? (
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    isDistinction
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : isFirstClass
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}>
                                    {isDistinction ? 'Distinction' : isFirstClass ? 'First Class' : 'Pass'}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Grading in Progress</span>
                                  </span>
                                )}
                              </div>

                              <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                                {t.title}
                              </h3>

                              {t.isEvaluated ? (
                                <>
                                  {/* Marks Banner */}
                                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100 flex items-center justify-between">
                                    <div>
                                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        Marks Secured
                                      </div>
                                      <div className="text-2xl font-black text-slate-900 mt-0.5 flex items-baseline gap-1">
                                        <span className="text-[#1976d2]">{marksNum}</span>
                                        <span className="text-xs font-semibold text-slate-400">/ {maxNum} Marks</span>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        Percentage
                                      </div>
                                      <div className={`text-2xl font-black ${isDistinction ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {pct}%
                                      </div>
                                    </div>
                                  </div>

                                  {/* Batch Comparisons Bar */}
                                  <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                                    <div>
                                      <div className="text-[10px] text-slate-400 font-bold uppercase">Batch Highest</div>
                                      <div className="font-black text-slate-800 mt-0.5">{t.highestMarks ? `${t.highestMarks}/${maxNum}` : '-'}</div>
                                    </div>
                                    <div className="border-x border-slate-200">
                                      <div className="text-[10px] text-slate-400 font-bold uppercase">Batch Average</div>
                                      <div className="font-black text-slate-800 mt-0.5">{t.avgMarks ? `${t.avgMarks}/${maxNum}` : '-'}</div>
                                    </div>
                                    <div>
                                      <div className="text-[10px] text-slate-400 font-bold uppercase">Batch Rank</div>
                                      <div className="font-black text-emerald-700 mt-0.5">#{t.rank || 1}</div>
                                    </div>
                                  </div>

                                  {/* Teacher Remarks / Handwriting Feedback */}
                                  {(t.remarks || t.feedback) && (
                                    <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                                      <BookOpen className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold text-amber-900">Teacher Remarks: </span>
                                        <span>{t.remarks || t.feedback}</span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                /* Pending Evaluation State */
                                <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Exam Conducted at Center • Paper Evaluation in Progress</span>
                                  </div>
                                  <div className="text-[11px] text-amber-900/80 flex items-center gap-3">
                                    <span>Total Marks: <strong>{maxNum}</strong></span>
                                    <span>•</span>
                                    <span>Passing Marks: <strong>{t.passingMarks || Math.round(maxNum * 0.4)}</strong></span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                                    Your paper sheet is being verified and evaluated by Er. Alok Goyal. Marks and checked document will be posted here as soon as checking finishes.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* View Checked Answer Sheet Button & Question Paper */}
                            <div className="pt-2 space-y-2">
                              {/* Question Paper Preview Button */}
                              {t.questionPaperUrl && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewStudentSheet({
                                    title: `${t.title} - Question Paper`,
                                    studentName: 'Full Batch Question Paper',
                                    marks: `Max Marks: ${maxNum}`,
                                    remarks: 'Official Question Paper administered during Sunday center exam.',
                                    url: t.questionPaperUrl,
                                    type: t.questionPaperType || 'pdf',
                                    documents: [{ name: t.questionPaperName || 'Question Paper', url: t.questionPaperUrl, type: t.questionPaperType || 'pdf' }]
                                  })}
                                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#1976d2]" />
                                  <span>View Question Paper (PDF / Photo)</span>
                                </button>
                              )}
                              {t.isEvaluated && hasDocument ? (
                                <button
                                  onClick={() => setPreviewStudentSheet({
                                    title: t.title,
                                    studentName: currentStudent.name || 'Student',
                                    marks: `${marksNum} / ${maxNum} (${pct}%)`,
                                    remarks: t.remarks || t.feedback,
                                    url: docsList[0]?.url || t.documentUrl,
                                    type: docsList[0]?.type || t.documentType || 'image',
                                    documents: docsList
                                  })}
                                  className="w-full py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span>View Checked Answer Sheet (PDF / Photo)</span>
                                </button>
                              ) : t.isEvaluated ? (
                                <div className="p-2 rounded-xl bg-slate-100 text-center text-xs text-slate-500 font-medium">
                                  Checked physical paper available with faculty at center desk
                                </div>
                              ) : (
                                <div className="p-2 rounded-xl bg-amber-100/60 text-center text-xs text-amber-800 font-bold flex items-center justify-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Checking Underway by Faculty</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Read-Only Notice */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#1976d2]" />
                    <span>Official Center Academic Records: Evaluated and signed by Er. Alok Goyal. Student editing is strictly disabled.</span>
                  </div>
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* 9. REPORTS VIEW                                               */}
            {/* ============================================================= */}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-[#1976d2]" />
                      <span>Official Academic Report Card</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student: <strong className="text-slate-800">{studentDisplayName}</strong> • Roll No: {student?.rollNo} • Batch: {student?.grade || 'Class 10'}
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-xs text-slate-500">Attendance Percentage</div>
                    <div className="text-2xl font-bold text-[#1976d2] mt-1">
                      {totalClasses > 0 ? `${attendanceRate}%` : 'New Admission'}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-xs text-slate-500">Total Tests Evaluated</div>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{tests?.length || 0}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-xs text-slate-500">Mentor Remarks</div>
                    <div className="text-xs font-bold text-emerald-700 mt-2">
                      Active Student • Good Focus & Regularity
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 10. BOOKMARKED QUESTIONS                                      */}
            {/* ============================================================= */}
            {activeTab === 'bookmarked' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#1976d2]" />
                  <span>Bookmarked Questions & Formula Sheets</span>
                </h2>
                <p className="text-xs text-slate-500 mb-5">
                  High-yield questions, theorem proofs, and formula quick-reference sheets for revision.
                </p>

                <div className="space-y-3">
                  {[
                    { title: 'Class 10 Trigonometry Standard Identity Proofs', subject: 'Maths' },
                    { title: 'Light Reflection & Refraction Sign Conventions', subject: 'Physics' },
                    { title: 'Periodic Table & Chemical Equation Balance Rules', subject: 'Chemistry' }
                  ].map((bk, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1976d2]">
                          {bk.subject}
                        </span>
                        <div className="text-xs font-bold text-slate-800 mt-1">{bk.title}</div>
                      </div>
                      <Bookmark className="w-4 h-4 text-[#1976d2] fill-[#1976d2]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 11. FEEDBACK VIEW                                             */}
            {/* ============================================================= */}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 max-w-2xl">
                <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#1976d2]" />
                  <span>Direct Feedback & Doubt Desk</span>
                </h2>
                <p className="text-xs text-slate-500 mb-5">
                  Submit queries, subject doubts, or feedback directly to Er. Alok Goyal / Faculty Desk.
                </p>

                {feedbackSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Your message has been delivered to Er. Alok Goyal. We will get back to you shortly.</span>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject / Topic of Doubt
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Question on Trigonometry Exercise 8.4"
                      value={feedbackSubject}
                      onChange={(e) => setFeedbackSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Message / Question
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Explain your doubt or feedback in detail..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1976d2] hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Faculty Desk</span>
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FULLSCREEN STUDENT LIGHTBOX FOR QUESTION PAPERS & ANSWER SHEETS   */}
      {/* ================================================================= */}
      {studentLightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setStudentLightboxImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full mb-2 text-white">
              <span className="text-xs font-medium truncate max-w-md">{studentLightboxTitle}</span>
              <button
                onClick={() => setStudentLightboxImage(null)}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={studentLightboxImage} 
              alt="High resolution view" 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-2 text-center text-[11px] text-white/60">
              High-resolution document viewer • Goyal Coaching Centre LMS
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* FULLSCREEN STUDENT VIDEO PLAYER (HTTP 206 BYTE-RANGE STREAMING)   */}
      {/* ================================================================= */}
      {activeStudentVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setActiveStudentVideo(null)}
        >
          <div 
            className="relative max-w-4xl w-full flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topbar */}
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white mr-2">
                  {activeStudentVideo.subject}
                </span>
                <span className="text-sm font-bold truncate">
                  {activeStudentVideo.title}
                </span>
              </div>
              <button
                onClick={() => setActiveStudentVideo(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="Close Video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                ref={studentVideoRef}
                src={activeStudentVideo.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video streaming.
              </video>
            </div>

            {/* Bottom Controls / Speed & Info */}
            <div className="p-4 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div className="space-y-0.5">
                <div className="text-xs text-slate-400">
                  Faculty: <span className="text-white font-semibold">{activeStudentVideo.faculty}</span> • Class: {activeStudentVideo.grade} {activeStudentVideo.fileSize ? `• Size: ${activeStudentVideo.fileSize}` : ''}
                </div>
                {activeStudentVideo.description && (
                  <p className="text-[11px] text-slate-500 max-w-md line-clamp-1">
                    {activeStudentVideo.description}
                  </p>
                )}
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <span className="text-[11px] text-slate-400 mr-1 font-semibold">Speed:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setStudentVideoSpeed(spd);
                      if (studentVideoRef.current) {
                        studentVideoRef.current.playbackRate = spd;
                      }
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                      studentVideoSpeed === spd
                        ? 'bg-[#1976d2] text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INTERACTIVE OLYMPIAD MCQ EXAM ENGINE (FULL SCREEN HALL)          */}
      {/* ========================================================================= */}
      {activeExam && (() => {
        const questions = Array.isArray(activeExam.questions) ? activeExam.questions : [];
        const currentQ = questions[examCurrentQIndex] || null;
        const totalQ = questions.length;
        const answeredCount = Object.keys(examAnswers).length;
        const markedCount = Object.keys(examMarkedMap).filter(k => examMarkedMap[k]).length;
        const isCurrentMarked = currentQ ? !!examMarkedMap[currentQ.id] : false;
        const currentAnswer = currentQ ? examAnswers[currentQ.id] : null;

        const mins = Math.floor(examTimeLeft / 60);
        const secs = examTimeLeft % 60;
        const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const isUrgentTime = examTimeLeft < 300; // less than 5 mins

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col overflow-hidden">
            {/* Exam Hall Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 text-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1976d2] to-blue-400 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                  G
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black truncate">{activeExam.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      examIsPractice
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {examIsPractice ? 'Practice Mode' : 'Live Examination'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{activeExam.subject}</span>
                    <span>•</span>
                    <span>{activeExam.grade}</span>
                    <span>•</span>
                    <span>Total {totalQ} Questions</span>
                  </div>
                </div>
              </div>

              {/* Timer Pill & Submit Action */}
              <div className="flex items-center gap-3 shrink-0">
                <div className={`px-3.5 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center gap-2 border shadow-sm ${
                  isUrgentTime
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-slate-800 text-amber-300 border-amber-400/30'
                }`}>
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{timeFormatted}</span>
                </div>

                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      `You have answered ${answeredCount} of ${totalQ} questions.\n\nAre you sure you want to finish and submit your test now?`
                    );
                    if (confirmed) handleSubmitExam();
                  }}
                  disabled={examSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{examSubmitting ? 'Submitting...' : 'Submit Test'}</span>
                </button>
              </div>
            </header>

            {/* Exam Hall Main Body */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
              {/* Left: Question Pane */}
              <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8">
                {currentQ ? (
                  <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between flex-1">
                    <div>
                      {/* Question Header & Points */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#1976d2] font-black text-xs sm:text-sm">
                            Question {examCurrentQIndex + 1} of {totalQ}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            (+{currentQ.marks || activeExam.positiveMarks || 4} / -{currentQ.negativeMarks || activeExam.negativeMarks || 0})
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleMarkForReview(currentQ.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCurrentMarked
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isCurrentMarked ? 'fill-purple-600' : ''}`} />
                          <span>{isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                        </button>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-relaxed">
                        {currentQ.text}
                      </h3>

                      {/* Optional Diagram / Picture */}
                      {(currentQ.image || currentQ.imageUrl) && (
                        <div className="my-5 p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative group">
                          <img
                            src={currentQ.image || currentQ.imageUrl}
                            alt="Question Diagram"
                            className="max-h-64 sm:max-h-80 w-auto object-contain rounded-lg shadow-sm"
                          />
                          <button
                            onClick={() => setZoomImage(currentQ.image || currentQ.imageUrl)}
                            className="absolute bottom-4 right-4 px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 shadow cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Zoom Diagram</span>
                          </button>
                        </div>
                      )}

                      {/* MCQ Options A, B, C, D */}
                      <div className="space-y-3 mt-6">
                        {(currentQ.options || []).map((opt) => {
                          const isSelected = currentAnswer === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleSelectExamOption(currentQ.id, opt.id)}
                              className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[#1976d2] bg-blue-50/80 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5 transition-colors ${
                                isSelected
                                  ? 'bg-[#1976d2] text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300'
                              }`}>
                                {opt.id}
                              </div>
                              <div className="flex-1">
                                <span className={`text-xs sm:text-sm leading-relaxed ${
                                  isSelected ? 'font-bold text-blue-950' : 'text-slate-800'
                                }`}>
                                  {opt.text}
                                </span>
                                {opt.image && (
                                  <img src={opt.image} alt={`Option ${opt.id}`} className="mt-2 max-h-24 object-contain rounded border border-slate-200" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="flex items-center justify-between gap-2 mt-8 pt-5 border-t border-slate-100 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExamCurrentQIndex(prev => Math.max(0, prev - 1))}
                          disabled={examCurrentQIndex === 0}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        {currentAnswer && (
                          <button
                            onClick={() => handleClearExamAnswer(currentQ.id)}
                            className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {examCurrentQIndex < totalQ - 1 ? (
                          <button
                            onClick={() => setExamCurrentQIndex(prev => Math.min(totalQ - 1, prev + 1))}
                            className="px-5 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <span>Save & Next</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const confirmed = window.confirm(
                                `You are on the last question.\nYou have answered ${answeredCount} of ${totalQ} questions.\n\nSubmit your final test now?`
                              );
                              if (confirmed) handleSubmitExam();
                            }}
                            disabled={examSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Check className="w-4 h-4" />
                            <span>{examSubmitting ? 'Submitting...' : 'Finish & Submit Test'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">No questions found in this test.</div>
                )}
              </div>

              {/* Right: Question Palette & Navigation */}
              <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-5 shrink-0 flex flex-col justify-between overflow-y-auto">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                    Question Palette ({totalQ})
                  </h4>

                  {/* Status Indicator Legend */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-600">Answered: <strong>{answeredCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                      <span className="text-slate-600">Marked: <strong>{markedCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                      <span className="text-slate-600">Unanswered: <strong>{totalQ - answeredCount}</strong></span>
                    </div>
                  </div>

                  {/* Question Grid Buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const isAns = !!examAnswers[q.id];
                      const isRev = !!examMarkedMap[q.id];
                      const isCurr = examCurrentQIndex === idx;

                      let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                      if (isAns && isRev) {
                        btnStyle = 'bg-purple-600 text-white font-bold border-2 border-emerald-400 shadow-sm';
                      } else if (isAns) {
                        btnStyle = 'bg-emerald-600 text-white font-bold shadow-sm';
                      } else if (isRev) {
                        btnStyle = 'bg-purple-600 text-white font-bold shadow-sm';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setExamCurrentQIndex(idx)}
                          className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer relative ${btnStyle} ${
                            isCurr ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Final Button */}
                <div className="pt-5 mt-5 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Ready to submit?\n\nAnswered: ${answeredCount}\nUnanswered: ${totalQ - answeredCount}\nMarked for Review: ${markedCount}\n\nProceed to view your marks?`
                      );
                      if (confirmed) handleSubmitExam();
                    }}
                    disabled={examSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{examSubmitting ? 'Evaluating Test...' : 'Final Submit Exam'}</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Olympiad engine auto-saves each answer instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 4: INSTANT SCORECARD & EVALUATION MODAL                             */}
      {/* ========================================================================= */}
      {examResultModal && (() => {
        const { test, attempt } = examResultModal;
        const isPass = (attempt.accuracy || 0) >= 60;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto mb-4 flex items-center justify-center shadow-inner">
                <Trophy className="w-9 h-9" />
              </div>

              <h3 className="text-xl font-black text-slate-900">
                {attempt.isPractice ? 'Practice Test Completed!' : 'Test Evaluated & Saved!'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {test.title}
              </p>

              {/* Scorecard Hero */}
              <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Score</div>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  <span className={isPass ? 'text-emerald-600' : 'text-blue-600'}>{attempt.score}</span>
                  <span className="text-sm font-semibold text-slate-400"> / {attempt.maxScore}</span>
                </div>
                <div className="text-xs font-bold text-slate-600 mt-1">
                  Accuracy: <strong className={isPass ? 'text-emerald-600' : 'text-amber-600'}>{attempt.accuracy}%</strong>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-emerald-600 font-bold">✓ Correct</div>
                    <div className="font-black text-slate-800">{attempt.correctCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-500 font-bold">✗ Incorrect</div>
                    <div className="font-black text-slate-800">{attempt.incorrectCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">○ Skipped</div>
                    <div className="font-black text-slate-800">{attempt.unattemptedCount}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setReviewingTest(test);
                    setReviewingAttempt(attempt);
                    setExamResultModal(null);
                  }}
                  className="w-full py-3 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Review Answers & Solutions</span>
                </button>

                <button
                  onClick={() => setExamResultModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Back to Tests Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 5: DETAILED STEP-BY-STEP QUESTION SOLUTIONS REVIEW MODAL             */}
      {/* ========================================================================= */}
      {reviewingTest && reviewingAttempt && (() => {
        const questions = Array.isArray(reviewingTest.questions) ? reviewingTest.questions : [];
        const answers = reviewingAttempt.answers || {};

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between gap-4 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#1976d2] text-white">
                      Solution Key
                    </span>
                    <h3 className="text-base sm:text-lg font-black truncate">{reviewingTest.title}</h3>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                    <span>Score: <strong>{reviewingAttempt.score}/{reviewingAttempt.maxScore}</strong></span>
                    <span>•</span>
                    <span>Accuracy: <strong>{reviewingAttempt.accuracy}%</strong></span>
                    <span>•</span>
                    <span>{reviewingAttempt.correctCount} Correct • {reviewingAttempt.incorrectCount} Wrong • {reviewingAttempt.unattemptedCount} Skipped</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReviewingTest(null);
                    setReviewingAttempt(null);
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Questions List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
                {questions.map((q, idx) => {
                  const chosen = answers[q.id];
                  const isCorrect = chosen === q.correctOption;
                  const isUnattempted = !chosen;

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6"
                    >
                      {/* Question Status Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-black text-xs text-[#1976d2] bg-blue-50 px-2.5 py-1 rounded-lg">
                          Question {idx + 1}
                        </span>

                        {isCorrect ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct (+{q.marks || reviewingTest.positiveMarks || 4})</span>
                          </span>
                        ) : isUnattempted ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                            <span>Skipped (0 pts)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Incorrect (-{q.negativeMarks || reviewingTest.negativeMarks || 0})</span>
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-bold text-slate-800 leading-relaxed">
                        {q.text}
                      </p>

                      {/* Optional Diagram */}
                      {(q.image || q.imageUrl) && (
                        <div className="my-4 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                          <img
                            src={q.image || q.imageUrl}
                            alt="Question Diagram"
                            className="max-h-60 object-contain rounded"
                          />
                        </div>
                      )}

                      {/* Options Review */}
                      <div className="space-y-2 mt-4">
                        {(q.options || []).map((opt) => {
                          const isOptionCorrect = opt.id === q.correctOption;
                          const isOptionChosen = opt.id === chosen;

                          let optClass = 'border-slate-200 bg-white text-slate-700';
                          if (isOptionCorrect) {
                            optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                          } else if (isOptionChosen && !isOptionCorrect) {
                            optClass = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                          }

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-xl border-2 flex items-start justify-between gap-3 text-xs ${optClass}`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                                  {opt.id}
                                </span>
                                <div>
                                  <span>{opt.text}</span>
                                  {opt.image && <img src={opt.image} alt="" className="mt-1 max-h-20 object-contain" />}
                                </div>
                              </div>

                              <div className="shrink-0 font-bold text-[11px]">
                                {isOptionCorrect && (
                                  <span className="text-emerald-700 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Correct Answer
                                  </span>
                                )}
                                {isOptionChosen && !isOptionCorrect && (
                                  <span className="text-rose-600 flex items-center gap-1">
                                    <X className="w-3.5 h-3.5" /> Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Solution / Explanation */}
                      {q.explanation && (
                        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                          <div className="font-extrabold flex items-center gap-1.5 text-amber-800 mb-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Step-by-Step Solution & Olympiad Concept:</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => {
                    setReviewingTest(null);
                    setReviewingAttempt(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 6: STUDENT CHECKED ANSWER SHEET PREVIEW MODAL (PDF / PHOTO)         */}
      {/* ========================================================================= */}
      {previewStudentSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#1976d2] text-white">
                    Official Checked Paper
                  </span>
                  <h4 className="text-sm sm:text-base font-black truncate">{previewStudentSheet.title}</h4>
                  <span className="text-xs text-amber-300 font-black">Score: {previewStudentSheet.marks}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Student: {previewStudentSheet.studentName} • Evaluated by Er. Alok Goyal
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewStudentSheet.url}
                  download={`answer_sheet_${previewStudentSheet.studentName}.jpg`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewStudentSheet(null)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewport for PDF or Image */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex items-center justify-center">
              {!previewStudentSheet.url ? (
                <div className="text-center p-8 text-slate-400 text-xs">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <div>No scanned answer sheet file attached yet for this examination.</div>
                </div>
              ) : previewStudentSheet.type === 'pdf' || (previewStudentSheet.url && previewStudentSheet.url.startsWith('data:application/pdf')) ? (
                <iframe
                  src={previewStudentSheet.url}
                  title="Answer Sheet PDF"
                  className="w-full h-full min-h-[60vh] rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <div className="space-y-4 max-w-3xl w-full text-center">
                  <img
                    src={previewStudentSheet.url}
                    alt="Checked Answer Sheet"
                    className="max-h-[70vh] w-auto mx-auto object-contain rounded-xl shadow-lg border border-slate-800"
                  />
                  {previewStudentSheet.documents && previewStudentSheet.documents.length > 1 && (
                    <div className="flex justify-center gap-2 pt-2">
                      {previewStudentSheet.documents.map((d, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() => setPreviewStudentSheet(prev => ({ ...prev, url: d.url, type: d.type }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            previewStudentSheet.url === d.url
                              ? 'bg-[#1976d2] text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Page {dIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Remarks & Read-Only Notice */}
            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-300">
              {previewStudentSheet.remarks ? (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Teacher Feedback: <strong>{previewStudentSheet.remarks}</strong></span>
                </div>
              ) : (
                <span className="text-slate-400">Official Exam Record • Signed by Faculty</span>
              )}
              <span className="text-[11px] text-slate-400 font-mono">
                Student Portal • Read-Only Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
