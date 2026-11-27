import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck,
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  Download, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  LogOut,
  Image as ImageIcon,
  Trophy,
  Upload,
  Sparkles,
  RefreshCw,
  Award,
  Megaphone,
  FileSpreadsheet,
  Building2,
  MapPin,
  FolderOpen,
  Copy,
  Clock,
  Bell,
  FileText,
  Video,
  Film,
  HelpCircle,
  Filter
} from 'lucide-react';
import { api } from '../../api/client';
import { isSameClass, getCanonicalClassName } from '../../utils/classMatcher';
import TiltCard from '../3d/TiltCard';
import ResultsPhotoManager from './ResultsPhotoManager';
import ShiningStarsManager from './ShiningStarsManager';
import FeaturesManager from './FeaturesManager';
import CoursesManager from './CoursesManager';
import DirectorsManager from './DirectorsManager';
import NewsEventsManager from './NewsEventsManager';
import CentersManager from './CentersManager';
import RecordsVaultManager from './RecordsVaultManager';
import ExecutiveOverviewDesk from './ExecutiveOverviewDesk';
import ClassAttendanceManager from './ClassAttendanceManager';
import AssignmentsManager from './AssignmentsManager';
import LecturesManager from './LecturesManager';
import OnlineTestManager from './OnlineTestManager';
import OfflineExamsManager from './OfflineExamsManager';

export default function MainAdminPortal({ adminUser, onLogout, onBackToHome, isDarkMode = false }) {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [notices, setNotices] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  const [centers, setCenters] = useState([]);
  const [gtseRegistrations, setGtseRegistrations] = useState([]);
  const [gtseSearch, setGtseSearch] = useState('');
  const [gtseLoading, setGtseLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('executiveDesk'); // 'executiveDesk' | 'recordsVault' | 'teachers' | 'students' | 'notices' | 'resultsPhoto' | 'backup'

  // Results Group Photo management state
  const [photoForm, setPhotoForm] = useState({
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    title: 'Our Board Exam Champions & Result Achievers',
    subtitle: 'Class 10th & 12th Board Toppers Celebrating 100/100 Perfect Scores & Top College Selections',
    year: 'CBSE Board Results Celebration 2026',
    badge: '🏆 Results Felicitation & Hall of Fame',
    description: 'Proud moments at Goyal Coaching Centre: Our students celebrating exceptional results with faculty mentors, qualified CAs, and Goyal Sir.'
  });
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState('');

  // Teacher password reset modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Add teacher modal
  const [addTeacherModalOpen, setAddTeacherModalOpen] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    username: '',
    password: '',
    subject: 'Mathematics (Class 9-10)',
    qualification: 'M.Sc / B.Ed',
    phone: '',
    email: '',
    assignedBatches: 'Class 10 Board Champions'
  });

  // Add student modal
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    rollNo: '',
    password: 'student123',
    grade: 'Class 10',
    stream: 'Science & Mathematics',
    batch: 'Class 10 Board Champions',
    parentName: '',
    parentPhone: '',
    totalFees: 38000,
    paidFees: 38000
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [showTeacherPassMap, setShowTeacherPassMap] = useState({});
  const [showStudentPassMap, setShowStudentPassMap] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPasswordModalOpen, setStudentPasswordModalOpen] = useState(false);
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [studentPassSuccessMsg, setStudentPassSuccessMsg] = useState('');
  const [copiedStudentId, setCopiedStudentId] = useState(null);

  // Notice / Notification Management State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    category: 'Compulsory Notice',
    priority: 'Urgent',
    badge: 'Compulsory',
    date: new Date().toISOString().split('T')[0],
    content: ''
  });
  const [noticeActionMsg, setNoticeActionMsg] = useState('');
  const [noticeSaving, setNoticeSaving] = useState(false);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const data = await api.getAllData();
      if (data) {
        setTeachers(data.teachers || []);
        setStudents(data.students || []);
        setAttendanceLogs(data.attendanceLogs || []);
        setNotices(data.notices || []);
        setDirectors(data.directors || []);
        setNewsEvents(data.newsEvents || []);
        setCenters(data.centers || []);
        if (data.resultsPhoto) {
          setPhotoForm(data.resultsPhoto);
        }
      }
      try {
        const gtseData = await api.getGTSERegistrations();
        if (Array.isArray(gtseData)) {
          setGtseRegistrations(gtseData);
        }
      } catch (err) {
        console.warn('GTSE registration load note:', err);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshGTSE = async () => {
    setGtseLoading(true);
    try {
      const gtseData = await api.getGTSERegistrations();
      if (Array.isArray(gtseData)) {
        setGtseRegistrations(gtseData);
      }
    } catch (err) {
      console.warn('GTSE refresh note:', err);
    } finally {
      setGtseLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoForm(prev => ({
        ...prev,
        imageUrl: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle save results photo
  const handleSaveResultsPhoto = async (e) => {
    if (e) e.preventDefault();
    if (!photoForm.imageUrl) {
      alert('Please provide an image URL or upload an image file from your device.');
      return;
    }

    try {
      setPhotoSaving(true);
      await api.updateResultsPhoto(photoForm);
      setPhotoSuccessMsg('Results Group Photo successfully updated & live on homepage!');
      setTimeout(() => setPhotoSuccessMsg(''), 4000);
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Error updating results photo.');
    } finally {
      setPhotoSaving(false);
    }
  };

  // Handle Teacher Password Reset
  const handleResetTeacherPassword = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !newPassword.trim()) return;

    try {
      await api.resetTeacherPassword(selectedTeacher.id, newPassword.trim());
      setPasswordSuccessMsg(`Password for ${selectedTeacher.name} successfully updated to: ${newPassword.trim()}`);
      setTimeout(() => {
        setPasswordSuccessMsg('');
        setPasswordModalOpen(false);
        setNewPassword('');
        setSelectedTeacher(null);
      }, 3000);
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Error updating password');
    }
  };

  // Handle Add Teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTeacherForm,
        assignedBatches: newTeacherForm.assignedBatches.split(',').map(b => b.trim())
      };
      await api.addTeacher(payload);
      setAddTeacherModalOpen(false);
      setNewTeacherForm({
        name: '',
        username: '',
        password: '',
        subject: 'Mathematics (Class 9-10)',
        qualification: 'M.Sc / B.Ed',
        phone: '',
        email: '',
        assignedBatches: 'Class 10 Board Champions'
      });
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Error adding teacher');
    }
  };

  // Handle Delete Teacher
  const handleDeleteTeacher = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove teacher ${name}?`)) {
      await api.deleteTeacher(id);
      await loadAllAdminData();
    }
  };

  // Handle Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStudentForm,
        id: newStudentForm.rollNo,
        fees: {
          total: Number(newStudentForm.totalFees),
          paid: Number(newStudentForm.paidFees),
          due: Number(newStudentForm.totalFees) - Number(newStudentForm.paidFees),
          status: Number(newStudentForm.paidFees) >= Number(newStudentForm.totalFees) ? 'Fully Paid' : 'Installment Pending',
          lastReceipt: `REC-${Date.now().toString().slice(-4)}`
        },
        batchRank: null,
        totalBatchStudents: students.length + 1,
        overallPercentage: 0,
        attendancePercentage: 0,
        totalClassesAttended: 0,
        totalClassesHeld: 0,
        teacherRemarks: 'Newly admitted student. No assessments or attendance marked yet.'
      };
      await api.addStudent(payload);
      setAddStudentModalOpen(false);
      setNewStudentForm({
        name: '',
        rollNo: '',
        password: 'student123',
        grade: 'Class 10',
        stream: 'Science & Mathematics',
        batch: 'Class 10 Board Champions',
        parentName: '',
        parentPhone: '',
        totalFees: 38000,
        paidFees: 38000
      });
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Error adding student');
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove student ${name} (${id})?`)) {
      await api.deleteStudent(id);
      await loadAllAdminData();
    }
  };

  const handleResetStudentPassword = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !newStudentPassword) return;
    try {
      await api.updateStudent(selectedStudent.id, { password: newStudentPassword });
      setStudentPassSuccessMsg(`Password for ${selectedStudent.name} (Roll: ${selectedStudent.rollNo}) successfully updated to: ${newStudentPassword}`);
      setTimeout(() => {
        setStudentPasswordModalOpen(false);
        setStudentPassSuccessMsg('');
        setNewStudentPassword('');
      }, 1500);
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update student password');
    }
  };

  // Notification Management Handlers
  const handleOpenAddNotice = () => {
    setEditingNotice(null);
    setNoticeForm({
      title: '',
      category: 'Compulsory Notice',
      priority: 'Urgent',
      badge: 'Compulsory',
      date: new Date().toISOString().split('T')[0],
      content: ''
    });
    setNoticeActionMsg('');
    setIsNoticeModalOpen(true);
  };

  const handleOpenEditNotice = (n) => {
    setEditingNotice(n);
    setNoticeForm({
      title: n.title || '',
      category: n.category || 'Compulsory Notice',
      priority: n.priority || 'Urgent',
      badge: n.badge || n.category || 'Notice',
      date: n.date || new Date().toISOString().split('T')[0],
      content: n.content || ''
    });
    setNoticeActionMsg('');
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    setNoticeSaving(true);
    try {
      if (editingNotice) {
        await api.updateNotice(editingNotice.id, noticeForm);
        setNoticeActionMsg(`Notification updated successfully!`);
      } else {
        await api.addNotice(noticeForm);
        setNoticeActionMsg(`New notification published successfully!`);
      }
      await loadAllAdminData();
      setTimeout(() => {
        setIsNoticeModalOpen(false);
        setNoticeActionMsg('');
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to save notification');
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleDeleteNotice = async (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete this notification:\n\n"${title}"?`)) {
      try {
        await api.deleteNotice(id);
        await loadAllAdminData();
      } catch (err) {
        alert(err.message || 'Failed to delete notification');
      }
    }
  };

  const handleExportJSON = () => {
    const dataObj = { admin: adminUser, teachers, students, notices };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GCC_Master_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all records to default verified state?')) {
      await api.resetData();
      await loadAllAdminData();
      alert('Data reset successfully.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Loading Goyal Coaching Center Admin Portal...</p>
        </div>
      </div>
    );
  }

  const getTabClass = (tabId) => {
    const isActive = activeTab === tabId;
    if (isActive) {
      return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/30 border border-blue-400/30 scale-[1.02]';
    }
    return 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs';
  };

  return (
    <div className={`min-h-screen pb-20 pt-6 px-4 max-w-7xl mx-auto ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Top Banner Header in Website Royal Blue & Indigo Theme */}
      <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 border-blue-500/30 shadow-2xl shadow-blue-600/15">
        <div className="flex items-start gap-4">
          <img
            src="/goyal-logo.png"
            alt="Goyal Coaching Centre"
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-400 bg-white p-0.5 shadow-xl shadow-blue-500/25 shrink-0 hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/30 text-blue-300 border border-blue-400/40 uppercase tracking-wider">
                Super Admin IAM Console
              </span>
              <span className="text-xs text-slate-300">
                Logged in as: <strong className="text-white">{adminUser?.name || 'Goyal Sir'}</strong> (Director)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1.5 font-outfit">
              GOYAL COACHING CENTRE — Master Admin & IAM Security
            </h1>
            <p className="text-xs text-blue-300 font-serif italic">
              "Build a Better Future"
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              Add teachers, view and reset forgotten teacher passwords, manage student rosters, and oversee academic records.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Backup DB
          </button>
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </button>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            Website Home
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Overview Stat Cards in Home Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
            <UserCheck className="w-4 h-4 text-emerald-500" /> Active Faculty
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{teachers.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Authorized Teachers</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Enrolled Students
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{students.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Class 8–10 & 11–12 Commerce</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
            <FolderOpen className="w-4 h-4 text-indigo-500" /> Class Records Vault
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">Auto-Sorted</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Admissions, GTSE, Queries</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
            <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Active Batches
          </div>
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">5</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Board Champions & Commerce</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Security Status
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Protected</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">IAM Role Isolation Active</div>
        </div>
      </div>

      {/* Main Tabs Styled in Website Home Royal Blue Theme */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('executiveDesk')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('executiveDesk')}`}
        >
          <Sparkles className="w-4 h-4" /> ⚡ Quick Desk (Queries, Doubts & Members)
        </button>

        <button
          onClick={() => setActiveTab('recordsVault')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('recordsVault')}`}
        >
          <FolderOpen className="w-4 h-4" /> 📂 Student Records Vault (By Class & Type)
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('teachers')}`}
        >
          <UserCheck className="w-4 h-4" /> Manage Teachers & Passwords ({teachers.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('students')}`}
        >
          <GraduationCap className="w-4 h-4" /> 🎓 Students & Passwords ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('attendance')}`}
        >
          <Clock className="w-4 h-4" /> 📋 Class-Wise Attendance & 20-Hr Window
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('assignments')}`}
        >
          <FileText className="w-4 h-4" /> 📝 Assignments & Homework
        </button>

        <button
          onClick={() => setActiveTab('lectures')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('lectures')}`}
        >
          <Film className="w-4 h-4" /> 🎥 Recorded Lectures (5-10 GB)
        </button>

        <button
          onClick={() => setActiveTab('onlineTests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('onlineTests')}`}
        >
          <HelpCircle className="w-4 h-4" /> 🎯 Olympiad MCQ Tests
        </button>

        <button
          onClick={() => setActiveTab('offlineExams')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('offlineExams')}`}
        >
          <Award className="w-4 h-4" /> 📄 Offline Sunday Tests & Sheets
        </button>

        <button
          onClick={() => {
            setActiveTab('gtse');
            handleRefreshGTSE();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('gtse')}`}
        >
          <FileSpreadsheet className="w-4 h-4" /> GTSE Registrations & Excel ({gtseRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('notices')}`}
        >
          <ShieldCheck className="w-4 h-4" /> Broadcast Notices ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab('resultsPhoto')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('resultsPhoto')}`}
        >
          <ImageIcon className="w-4 h-4" /> Results Group Photo
        </button>

        <button
          onClick={() => setActiveTab('shiningStars')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('shiningStars')}`}
        >
          <Sparkles className="w-4 h-4" /> Shining Stars
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('features')}`}
        >
          <Award className="w-4 h-4" /> Features
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('courses')}`}
        >
          <BookOpen className="w-4 h-4" /> Courses
        </button>

        <button
          onClick={() => setActiveTab('directors')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('directors')}`}
        >
          <Award className="w-4 h-4" /> Directors ({directors.length})
        </button>

        <button
          onClick={() => setActiveTab('newsEvents')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('newsEvents')}`}
        >
          <Megaphone className="w-4 h-4" /> News & Events ({newsEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('centers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${getTabClass('centers')}`}
        >
          <Building2 className="w-4 h-4" /> Centers & Locations ({centers.length})
        </button>
      </div>

      {/* ================= TAB 0A: EXECUTIVE QUICK DESK (QUERIES, DOUBTS & MEMBERS IN SHORT) ================= */}
      {activeTab === 'executiveDesk' && (
        <ExecutiveOverviewDesk onSelectTab={setActiveTab} isDarkMode={isDarkMode} />
      )}

      {/* ================= TAB 0: STUDENT RECORDS VAULT (ORGANIZED BY CLASS & FORM TYPE) ================= */}
      {activeTab === 'recordsVault' && (
        <RecordsVaultManager />
      )}

      {/* ================= TAB 1: TEACHER IAM MANAGEMENT ================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Faculty Management & Password Reset Desk
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Here the Main Admin can add faculty, view active passwords, and change/reset a password if a teacher forgets it.
              </p>
            </div>

            <button
              onClick={() => setAddTeacherModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Teacher
            </button>
          </div>

          {/* Teacher Credentials Table */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Teacher Name & ID</th>
                    <th className="p-3.5">Subject & Qualification</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Current Password (Admin View)</th>
                    <th className="p-3.5">Assigned Batches</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {teachers.map((tch) => {
                    const isVisible = showTeacherPassMap[tch.id];
                    return (
                      <tr key={tch.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{tch.name}</div>
                          <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">{tch.id}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{tch.phone}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{tch.subject}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{tch.qualification}</div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {tch.username}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-blue-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-slate-800 text-blue-700 dark:text-blue-300 font-bold">
                              {isVisible ? tch.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowTeacherPassMap({ ...showTeacherPassMap, [tch.id]: !isVisible })}
                              className="text-slate-400 hover:text-blue-600 dark:hover:text-white cursor-pointer"
                              title={isVisible ? "Hide Password" : "View Password"}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(Array.isArray(tch.assignedBatches) 
                              ? tch.assignedBatches 
                              : (typeof tch.assignedBatches === 'string' ? tch.assignedBatches.split(',') : [])
                            ).map((b, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {typeof b === 'string' ? b.trim() : b}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTeacher(tch);
                              setNewPassword('');
                              setPasswordModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Change Password</span>
                          </button>

                          <button
                            onClick={() => handleDeleteTeacher(tch.id, tch.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer inline-flex items-center"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MASTER STUDENT ROSTER ================= */}
      {activeTab === 'students' && (() => {
        const CLASS_FILTER_TABS = [
          { id: 'All', label: 'All Classes' },
          { id: 'Class 7', label: 'Class 7th (Foundation)' },
          { id: 'Class 8', label: 'Class 8th (Junior)' },
          { id: 'Class 9', label: 'Class 9th (Science & Maths)' },
          { id: 'Class 10', label: 'Class 10th (Board Champions)' },
          { id: 'Class 11 Commerce', label: 'Class 11th (Commerce)' },
          { id: 'Class 12 Commerce', label: 'Class 12th (Commerce)' }
        ];

        const filteredStudents = (students || [])
          .filter(s => {
            if (selectedClassFilter !== 'All' && !isSameClass(s.grade || s.batch, selectedClassFilter)) {
              return false;
            }
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (s.name || '').toLowerCase().includes(q) ||
                   (s.rollNo || '').toLowerCase().includes(q) ||
                   (s.parentPhone || '').includes(q) ||
                   (s.studentPhone || '').includes(q);
          })
          .sort((a, b) => {
            // Sort by canonical class then rollNo/name
            const classA = a.grade || a.batch || '';
            const classB = b.grade || b.batch || '';
            if (classA !== classB) {
              return classA.localeCompare(classB, undefined, { numeric: true });
            }
            return (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true });
          });

        return (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name, roll no, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setAddStudentModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25 shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Enroll Student
            </button>
          </div>

          {/* Class Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
            {CLASS_FILTER_TABS.map(tab => {
              const isSelected = selectedClassFilter === tab.id;
              const count = tab.id === 'All'
                ? (students || []).length
                : (students || []).filter(s => isSameClass(s.grade || s.batch, tab.id)).length;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedClassFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Roll No (Login ID)</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Student Password</th>
                    <th className="p-3.5">Grade & Stream</th>
                    <th className="p-3.5">Parent Contact</th>
                    <th className="p-3.5 text-center">Marks %</th>
                    <th className="p-3.5 text-center">Attendance %</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 text-xs italic">
                        No students enrolled in {selectedClassFilter === 'All' ? 'any class' : selectedClassFilter} match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isVisible = showStudentPassMap[s.id];
                      return (
                        <tr key={s.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 text-xs shadow-sm">
                              {s.rollNo}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.batch || s.grade}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono bg-blue-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-slate-800 text-blue-700 dark:text-blue-300 font-bold text-xs select-all">
                                {isVisible ? (s.password || 'student123') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowStudentPassMap({ ...showStudentPassMap, [s.id]: !isVisible })}
                                className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-white cursor-pointer transition-colors"
                                title={isVisible ? "Hide Password" : "Show Password"}
                              >
                                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(s.password || 'student123');
                                  setCopiedStudentId(s.id);
                                  setTimeout(() => setCopiedStudentId(null), 1500);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors"
                                title="Copy Password"
                              >
                                {copiedStudentId === s.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">{s.grade}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{s.stream}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-800 dark:text-slate-200">{s.parentName}</div>
                            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{s.parentPhone}</div>
                          </td>
                          <td className="p-3.5 text-center font-bold">
                            {Number(s.overallPercentage) > 0 ? (
                              <span className="text-blue-600 dark:text-blue-400 font-black">{s.overallPercentage}%</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium italic">No Tests Yet</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center font-bold">
                            {Number(s.attendancePercentage) > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400">{s.attendancePercentage}%</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium italic">0% (New)</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedStudent(s);
                                setNewStudentPassword('');
                                setStudentPasswordModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors"
                              title="Change Student Password"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Change Pass</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s.id, s.name)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 cursor-pointer transition-colors inline-flex items-center"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ================= TAB: CLASS-WISE ATTENDANCE ================= */}
      {activeTab === 'attendance' && (
        <ClassAttendanceManager
          students={students}
          attendanceLogs={attendanceLogs}
          onDataSaved={loadAllAdminData}
          isAdmin={true}
          currentUser={adminUser}
        />
      )}

      {/* ================= TAB: ASSIGNMENTS & HOMEWORK MANAGEMENT ================= */}
      {activeTab === 'assignments' && (
        <AssignmentsManager
          currentRole="admin"
          currentUserName="Harshit Goyal (Director)"
          students={students}
          onDataChanged={loadAllAdminData}
        />
      )}

      {/* ================= TAB: RECORDED VIDEO LECTURES (5-10 GB) ================= */}
      {activeTab === 'lectures' && (
        <LecturesManager
          currentRole="admin"
          currentUserName="Harshit Goyal (Director)"
          onDataChanged={loadAllAdminData}
        />
      )}

      {/* ================= TAB: OLYMPIAD MCQ ONLINE TESTS (ACTIVE / UPCOMING / MISSED) ================= */}
      {activeTab === 'onlineTests' && (
        <OnlineTestManager
          currentRole="admin"
          currentUserName="Harshit Goyal (Director)"
          students={students}
          onDataChanged={loadAllAdminData}
        />
      )}

      {/* ================= TAB: OFFLINE CLASSROOM EXAMS & CHECKED ANSWER SHEETS ================= */}
      {activeTab === 'offlineExams' && (
        <OfflineExamsManager
          currentRole="admin"
          currentUserName="Harshit Goyal (Director)"
          students={students}
          onDataChanged={loadAllAdminData}
        />
      )}

      {/* ================= TAB 3: BROADCAST NOTIFICATIONS ================= */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Broadcast Notifications & Official Circulars</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Add, change, edit, or delete notices broadcasted across Student and Teacher Portals.
              </p>
            </div>

            <button
              onClick={handleOpenAddNotice}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Publish New Notification
            </button>
          </div>

          <div className="space-y-3">
            {notices.length > 0 ? (
              notices.map((n) => {
                const isUrgent = (n.priority || '').toLowerCase() === 'urgent' || (n.badge || '').toLowerCase().includes('urgent') || (n.category || '').toLowerCase().includes('compulsory');
                return (
                  <div 
                    key={n.id} 
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isUrgent 
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {n.badge || n.category || 'Notification'}
                        </span>
                        
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {n.date}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                          ID: {n.id}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {n.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">
                        {n.content}
                      </p>
                    </div>

                    {/* Action Buttons: Change/Edit & Delete */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                      <button
                        onClick={() => handleOpenEditNotice(n)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                        title="Edit / Change this notification"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteNotice(n.id, n.title)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 cursor-pointer transition-colors inline-flex items-center"
                        title="Delete this notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                No active notifications. Click "Publish New Notification" to broadcast an announcement.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: RESULTS GROUP PHOTO & SLIDESHOW MANAGEMENT ================= */}
      {activeTab === 'resultsPhoto' && (
        <ResultsPhotoManager onDataSaved={loadAllAdminData} />
      )}

      {/* ================= TAB 5: SHINING STARS MANAGEMENT ================= */}
      {activeTab === 'shiningStars' && (
        <ShiningStarsManager onDataSaved={loadAllAdminData} />
      )}

      {/* ================= TAB 6: CAMPUS FEATURES MANAGEMENT ================= */}
      {activeTab === 'features' && (
        <FeaturesManager onDataSaved={loadAllAdminData} />
      )}

      {/* ================= TAB 7: EXPLORE COURSES MANAGEMENT ================= */}
      {activeTab === 'courses' && (
        <CoursesManager onDataSaved={loadAllAdminData} />
      )}

      {/* ================= TAB 8: DIRECTORS MANAGEMENT ================= */}
      {activeTab === 'directors' && (
        <DirectorsManager onDataSaved={loadAllAdminData} />
      )}

      {/* ================= TAB 9: LATEST NEWS & EVENTS MANAGEMENT ================= */}
      {activeTab === 'newsEvents' && (
        <NewsEventsManager onDataSaved={loadAllAdminData} />
      )}

      {/* ================= TAB: CENTERS & BRANCHES MANAGEMENT (WITH LIVE GOOGLE MAPS) ================= */}
      {activeTab === 'centers' && (
        <CentersManager onDataSaved={loadAllAdminData} />
      )}

      {/* ================= TAB 10: GTSE REGISTRATIONS & EXCEL RECORDS (ADMIN RESTRICTED ACCESS) ================= */}
      {activeTab === 'gtse' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-1 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Confidential Admin Access Only
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> GTSE Scholarship Exam — Candidate Excel Register
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every candidate who registers for GTSE is automatically recorded into <code className="text-emerald-300 font-mono">server/excel-records/gtse_registrations.xlsx</code>. Download access is restricted strictly to the Main Administrator.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleRefreshGTSE}
                disabled={gtseLoading}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gtseLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>

              <a
                href="/api/gtse-registrations/download"
                download="gtse_registrations.xlsx"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> Download Official Excel Register (.xlsx)
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search candidate by name, roll no, mobile, school, or class..."
                value={gtseSearch}
                onChange={(e) => setGtseSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-400">
              Showing <strong>{gtseRegistrations.filter(r => {
                if (!gtseSearch) return true;
                const q = gtseSearch.toLowerCase();
                return (
                  r.name?.toLowerCase().includes(q) ||
                  r.id?.toLowerCase().includes(q) ||
                  r.studentNo?.includes(q) ||
                  r.school?.toLowerCase().includes(q) ||
                  r.presentClass?.toLowerCase().includes(q)
                );
              }).length}</strong> candidates
            </span>
          </div>

          {/* Registrations Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Reg / Roll ID</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Father / Guardian</th>
                    <th className="py-3 px-4">Student Phone</th>
                    <th className="py-3 px-4">School & City</th>
                    <th className="py-3 px-4">Date / Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {gtseRegistrations
                    .filter(r => {
                      if (!gtseSearch) return true;
                      const q = gtseSearch.toLowerCase();
                      return (
                        r.name?.toLowerCase().includes(q) ||
                        r.id?.toLowerCase().includes(q) ||
                        r.studentNo?.includes(q) ||
                        r.school?.toLowerCase().includes(q) ||
                        r.presentClass?.toLowerCase().includes(q)
                      );
                    })
                    .map((reg, idx) => (
                      <tr key={reg.id || idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {reg.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {reg.name}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {reg.gender || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold text-[11px]">
                            {reg.presentClass}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {reg.fatherName || '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200">
                          {reg.studentNo}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {reg.school}{reg.cityState ? `, ${reg.cityState}` : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {reg.timestamp ? new Date(reg.timestamp).toLocaleString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  {gtseRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                        <div>No candidates registered yet.</div>
                        <div className="text-[11px] text-slate-600 mt-1">Registrations submitted from the exam portal will automatically appear here and sync to the Excel file.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ================= MODAL: RESET TEACHER PASSWORD ================= */}
      {passwordModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border-2 border-blue-500/40 shadow-2xl text-slate-900 dark:text-slate-100">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Reset Teacher Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Change password for <strong className="text-slate-900 dark:text-white">{selectedTeacher.name}</strong> ({selectedTeacher.username}) in case they forgot it.
            </p>

            {passwordSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetTeacherPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Current Password on Record</label>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-mono font-bold">
                  {selectedTeacher.password}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Enter New Password</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. teach2027"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs cursor-pointer shadow-lg shadow-blue-500/25"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHANGE STUDENT PASSWORD ================= */}
      {studentPasswordModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border-2 border-blue-500/40 text-slate-900 dark:text-slate-100 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Reset Student Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Updating credentials for <strong className="text-blue-600 dark:text-blue-400">{selectedStudent.name}</strong> (Roll: <span className="font-mono">{selectedStudent.rollNo}</span>)
            </p>

            {studentPassSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{studentPassSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetStudentPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Current Password on Record</label>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-mono font-bold select-all">
                  {selectedStudent.password || 'student123'}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Enter New Student Password</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. harry2026 or newpass123"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs cursor-pointer shadow-lg shadow-blue-500/25"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TEACHER ================= */}
      {addTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border-2 border-blue-500/40 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Register New Faculty / Teacher
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add a new teacher to Goyal Coaching Center. You can set their initial login credentials.
            </p>

            <form onSubmit={handleAddTeacher} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Teacher Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. R. K. Singhal"
                    value={newTeacherForm.name}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accountancy / Mathematics"
                    value={newTeacherForm.subject}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Login Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rksinghal"
                    value={newTeacherForm.username}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, username: e.target.value.toLowerCase() })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass123"
                    value={newTeacherForm.password}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9811223344"
                    value={newTeacherForm.phone}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. CA, M.Com, B.Ed"
                    value={newTeacherForm.qualification}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, qualification: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase font-semibold mb-1">Assigned Batches (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Class 12 Commerce Super League, Class 10 Board Champions"
                  value={newTeacherForm.assignedBatches}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, assignedBatches: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold cursor-pointer shadow-lg shadow-blue-500/25"
                >
                  Register Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STUDENT ================= */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-blue-500/40">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <UserPlus className="w-5 h-5 text-blue-400" /> Enroll New Student
            </h3>
            <p className="text-xs text-slate-400 mb-4">Set up student profile and initial portal password.</p>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siddharth"
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Roll No / Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GCC-106"
                    value={newStudentForm.rollNo}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNo: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.password}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Grade / Class</label>
                  <select
                    value={newStudentForm.grade}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, grade: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Class 10">Class 10 (Science & Maths)</option>
                    <option value="Class 12">Class 12 (Commerce)</option>
                    <option value="Class 9">Class 9 (Science & Maths)</option>
                    <option value="Class 11">Class 11 (Commerce)</option>
                    <option value="Class 8">Class 8 (Science & Maths)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Parent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={newStudentForm.parentName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876960163"
                    value={newStudentForm.parentPhone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, parentPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT NOTIFICATION ================= */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border-2 border-blue-500/40 text-slate-900 dark:text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{editingNotice ? 'Edit / Change Notification' : 'Publish New Notification'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {noticeActionMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{noticeActionMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Pre-Board Guidance & Answer-Sheet Review"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] mb-1">
                    Category
                  </label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Compulsory Notice">Compulsory Notice</option>
                    <option value="PTM Alert">PTM Alert</option>
                    <option value="Examination Schedule">Examination Schedule</option>
                    <option value="Holiday Announcement">Holiday Announcement</option>
                    <option value="Batch Timetable">Batch Timetable</option>
                    <option value="Fee Reminder">Fee Reminder</option>
                    <option value="General Notice">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] mb-1">
                    Priority Tag
                  </label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Urgent">Urgent (Red Alert)</option>
                    <option value="Important">Important (Amber Alert)</option>
                    <option value="Standard">Standard (Blue Information)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] mb-1">
                    Display Badge Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mandatory PTM / Exam Schedule"
                    value={noticeForm.badge}
                    onChange={(e) => setNoticeForm({ ...noticeForm, badge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    required
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] mb-1">
                  Notification Message & Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain instructions, dates, timings, attendance requirements, or any guidelines for parents and students..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noticeSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-md disabled:opacity-50"
                >
                  {noticeSaving ? 'Saving...' : (editingNotice ? 'Save Changes' : 'Publish Notification')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
