import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Award, 
  Bell, 
  TrendingUp, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Plus, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  FileCheck2, 
  Phone, 
  BookOpen,
  Image as ImageIcon,
  Trophy,
  Upload,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
  FileText,
  Video,
  Film,
  HelpCircle
} from 'lucide-react';
import { api } from '../../api/client';
import TiltCard from '../3d/TiltCard';
import ResultsPhotoManager from './ResultsPhotoManager';
import ShiningStarsManager from './ShiningStarsManager';
import FeaturesManager from './FeaturesManager';
import ClassAttendanceManager, { matchesStudentClass } from './ClassAttendanceManager';
import { isSameClass } from '../../utils/classMatcher';
import CoursesManager from './CoursesManager';
import DirectorsManager from './DirectorsManager';
import NewsEventsManager from './NewsEventsManager';
import AssignmentsManager from './AssignmentsManager';
import LecturesManager from './LecturesManager';
import OnlineTestManager from './OnlineTestManager';
import OfflineExamsManager from './OfflineExamsManager';

export default function AdminPortal({ onBackToHome, teacherUser = null, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'attendance' | 'marks' | 'notices' | 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');

  const [showPassMap, setShowPassMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Add student modal state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    password: 'student123',
    grade: 'Class 10',
    stream: 'Science & Mathematics',
    batch: 'Class 10 Board Champions (3:30 PM - 6:30 PM)',
    parentName: '',
    parentPhone: '',
    targetExam: 'CBSE Class 10 Board 100/100',
    totalFees: 38000,
    paidFees: 38000
  });

  // Attendance recording state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceBatch, setAttendanceBatch] = useState('All');
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: { status: 'Present'|'Absent'|'Late', remarks: '' } }
  const [attendanceSaveMsg, setAttendanceSaveMsg] = useState('');

  // Test marks recording state
  const [isNewTestOpen, setIsNewTestOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Unit Test',
    batch: 'Class 10 Board Champions',
    maxMarks: 100
  });
  const [testMarksMap, setTestMarksMap] = useState({}); // { studentId: { marks: 85, feedback: '' } }
  const [testSaveMsg, setTestSaveMsg] = useState('');

  // Notice creation state
  const [isNewNoticeOpen, setIsNewNoticeOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'Compulsory Notice',
    priority: 'Urgent',
    badge: 'Compulsory',
    content: ''
  });

  // Results Group Photo state
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

  // Load fresh data
  const loadData = async () => {
    setLoading(true);
    try {
      const d = await api.getAllData();
      setData(d);
      if (d.resultsPhoto) {
        setPhotoForm(d.resultsPhoto);
      }

      // Pre-fill attendance map with today's or default status
      const initialAtt = {};
      (d.students || []).forEach(s => {
        initialAtt[s.id] = { status: 'Present', remarks: 'Present on time' };
      });
      setAttendanceMap(initialAtt);

      // Pre-fill test marks map
      const initialMarks = {};
      (d.students || []).forEach(s => {
        initialMarks[s.id] = { marks: 80, feedback: 'Good conceptual clarity' };
      });
      setTestMarksMap(initialMarks);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students
  const filteredStudents = (data?.students || []).filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.parentPhone || '').includes(searchTerm);
    const matchesBatch = batchFilter === 'All' || isSameClass(s.grade || s.batch, batchFilter);
    return matchesSearch && matchesBatch;
  });

  // Add Student Handler
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStudent,
        id: newStudent.rollNo,
        password: newStudent.password || 'student123',
        fees: {
          total: Number(newStudent.totalFees),
          paid: Number(newStudent.paidFees),
          due: Number(newStudent.totalFees) - Number(newStudent.paidFees),
          status: Number(newStudent.paidFees) >= Number(newStudent.totalFees) ? 'Fully Paid' : 'Installment Pending',
          lastReceipt: `REC-${Date.now().toString().slice(-4)}`
        },
        batchRank: null,
        totalBatchStudents: (data?.students?.length || 0) + 1,
        overallPercentage: 0,
        attendancePercentage: 0,
        totalClassesAttended: 0,
        totalClassesHeld: 0,
        teacherRemarks: 'Newly admitted student. No assessments or attendance marked yet.'
      };

      await api.addStudent(payload);
      setIsAddStudentOpen(false);
      setNewStudent({
        name: '',
        rollNo: '',
        password: 'student123',
        grade: 'Class 10',
        stream: 'Science & Mathematics',
        batch: 'Class 10 Board Champions (3:30 PM - 6:30 PM)',
        parentName: '',
        parentPhone: '',
        targetExam: 'CBSE Class 10 Board 100/100',
        totalFees: 38000,
        paidFees: 38000
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Error adding student');
    }
  };

  // Delete Student Handler
  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove student ${name} (${id}) from the database?`)) {
      await api.deleteStudent(id);
      await loadData();
    }
  };

  // Save Attendance Batch
  const handleSaveAttendance = async () => {
    const targetStudents = (data?.students || []).filter(s => 
      attendanceBatch === 'All' || s.batch.includes(attendanceBatch) || s.grade.includes(attendanceBatch)
    );

    const records = targetStudents.map(s => ({
      studentId: s.id,
      status: attendanceMap[s.id]?.status || 'Present',
      timeIn: attendanceMap[s.id]?.status === 'Present' ? '06:55 AM' : attendanceMap[s.id]?.status === 'Late' ? '07:20 AM' : '-',
      remarks: attendanceMap[s.id]?.remarks || 'Session record'
    }));

    await api.recordAttendanceBatch(attendanceDate, records);
    setAttendanceSaveMsg(`Attendance successfully saved for ${records.length} students on ${attendanceDate}!`);
    setTimeout(() => setAttendanceSaveMsg(''), 4000);
    await loadData();
  };

  // Mark all present shortcut
  const markAllStatus = (status) => {
    const updated = { ...attendanceMap };
    (data?.students || []).forEach(s => {
      updated[s.id] = { ...updated[s.id], status };
    });
    setAttendanceMap(updated);
  };

  // Save Test & Marks
  const handleSaveTest = async (e) => {
    e.preventDefault();
    const targetStudents = (data?.students || []).filter(s => 
      matchesStudentClass(s, newTest.batch)
    );

    const results = targetStudents.map((s, idx) => {
      const marks = Number(testMarksMap[s.id]?.marks || 75);
      const pct = Number(((marks / Number(newTest.maxMarks)) * 100).toFixed(1));
      return {
        studentId: s.id,
        marksObtained: marks,
        percentage: pct,
        rank: idx + 1,
        grade: pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : 'B',
        feedback: testMarksMap[s.id]?.feedback || 'Performance recorded'
      };
    });

    results.sort((a, b) => b.marksObtained - a.marksObtained);
    results.forEach((r, idx) => { r.rank = idx + 1; });

    const totalMarksSum = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const avgMarks = results.length > 0 ? Number((totalMarksSum / results.length).toFixed(1)) : 70;
    const highestMarks = results.length > 0 ? Math.max(...results.map(r => r.marksObtained)) : newTest.maxMarks;

    const payload = {
      ...newTest,
      maxMarks: Number(newTest.maxMarks),
      avgMarks,
      highestMarks,
      results
    };

    await api.addTest(payload);
    setIsNewTestOpen(false);
    setTestSaveMsg(`Test '${newTest.title}' with results saved and parent report cards updated!`);
    setTimeout(() => setTestSaveMsg(''), 4000);
    await loadData();
  };

  // Add / Edit Notice
  const handleOpenAddNotice = () => {
    setEditingNotice(null);
    setNewNotice({
      title: '',
      category: 'Compulsory Notice',
      priority: 'Urgent',
      badge: 'Compulsory',
      content: ''
    });
    setIsNewNoticeOpen(true);
  };

  const handleOpenEditNotice = (n) => {
    setEditingNotice(n);
    setNewNotice({
      title: n.title || '',
      category: n.category || 'Compulsory Notice',
      priority: n.priority || 'Urgent',
      badge: n.badge || n.category || 'Compulsory',
      content: n.content || ''
    });
    setIsNewNoticeOpen(true);
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (editingNotice) {
      await api.updateNotice(editingNotice.id, newNotice);
    } else {
      await api.addNotice(newNotice);
    }
    setIsNewNoticeOpen(false);
    setEditingNotice(null);
    setNewNotice({
      title: '',
      category: 'Compulsory Notice',
      priority: 'Urgent',
      badge: 'Compulsory',
      content: ''
    });
    await loadData();
  };

  // Delete Notice
  const handleDeleteNotice = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete this notice:\n\n"${title || id}"?`)) {
      await api.deleteNotice(id);
      await loadData();
    }
  };

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
      await loadData();
    } catch (err) {
      alert(err.message || 'Error updating results photo.');
    } finally {
      setPhotoSaving(false);
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GCC_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Reset demo data
  const handleResetData = async () => {
    if (window.confirm('Reset all student records, attendance and test data to default demo state?')) {
      await api.resetData();
      await loadData();
      alert('Database restored to default demo state!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading Goyal Coaching Center Admin Database...</p>
        </div>
      </div>
    );
  }

  // Calculated Stats
  const totalStudents = data?.students?.length || 0;
  const avgAttendance = totalStudents > 0 
    ? Math.round(data.students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / totalStudents)
    : 95;
  const atRiskStudents = (data?.students || []).filter(s => (s.attendancePercentage < 85) || (s.overallPercentage < 80));

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="mb-6 p-6 rounded-3xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-500/20">
        <div className="flex items-start gap-4">
          <img
            src="/goyal-logo.png"
            alt="Goyal Coaching Centre"
            className="w-13 h-13 rounded-full object-cover border-2 border-blue-500 bg-white p-0.5 shadow-xl shadow-blue-500/20 shrink-0 hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {teacherUser ? `Teacher / Faculty Desk: ${teacherUser.name}` : 'Faculty & Admin Management Console'}
              </span>
              <span className="text-xs text-slate-400">
                {teacherUser ? `${teacherUser.subject} • ${teacherUser.qualification}` : `Director: ${data?.instituteInfo?.director || 'Er. Alok Goyal'}`}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {teacherUser ? `Welcome back, ${teacherUser.name}` : 'GOYAL COACHING CENTRE — Faculty Console'}
            </h1>
            <p className="text-xs text-blue-300 font-serif italic">
              "Build a Better Future"
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              Maintain student profiles, record daily biometric attendance, publish test scores, and push compulsory notices to parents.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            title="Download full JSON backup of students and marks"
          >
            <Download className="w-3.5 h-3.5" /> Backup DB
          </button>
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            title="Restore sample demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </button>
          <button
            onClick={onBackToHome}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            Website Home
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400" /> Total Students
          </div>
          <div className="text-2xl font-black text-white mt-1">{totalStudents}</div>
          <div className="text-[11px] text-slate-500">Active Enrollments</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" /> Avg Attendance
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{avgAttendance}%</div>
          <div className="text-[11px] text-slate-500">Institute Benchmark</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-cyan-400" /> Tests Conducted
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{data?.tests?.length || 0}</div>
          <div className="text-[11px] text-slate-500">Mock & Unit Series</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" /> At-Risk Students
          </div>
          <div className="text-2xl font-black text-rose-400 mt-1">{atRiskStudents.length}</div>
          <div className="text-[11px] text-slate-500">&lt;85% Attendance/Marks</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Manage Students ({totalStudents})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Daily Attendance Tracker
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'assignments'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Assignments & Homework
        </button>

        <button
          onClick={() => setActiveTab('lectures')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'lectures'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Film className="w-4 h-4" /> Recorded Lectures (5-10 GB)
        </button>

        <button
          onClick={() => setActiveTab('onlineTests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'onlineTests'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Olympiad MCQ Tests
        </button>

        <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'marks'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> 📄 Offline Sunday Tests & Sheets
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" /> Notice Board ({data?.notices?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> At-Risk & Parent Alerts
        </button>

        <button
          onClick={() => setActiveTab('resultsPhoto')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'resultsPhoto'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-blue-400" /> Results Photo
        </button>

        <button
          onClick={() => setActiveTab('shiningStars')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'shiningStars'
              ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-400" /> Shining Stars
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'features'
              ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-blue-400" /> Features
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-400" /> Courses
        </button>

        <button
          onClick={() => setActiveTab('directors')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'directors'
              ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-blue-400" /> Directors ({data?.directors?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('newsEvents')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'newsEvents'
              ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 text-blue-400" /> News & Events ({data?.newsEvents?.length || 0})
        </button>
      </div>

      {/* ================= TAB 1: STUDENTS MANAGEMENT ================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="p-4 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or parent phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="All">All Batches & Grades</option>
                <option value="Class 7">Class 7 (Foundation Prodigy)</option>
                <option value="Class 8">Class 8 (Junior Science & Maths)</option>
                <option value="Class 9">Class 9 (Science & Maths)</option>
                <option value="Class 10">Class 10 (Board Champions)</option>
                <option value="Class 11 Commerce">Class 11 (Commerce Pioneers)</option>
                <option value="Class 12 Commerce">Class 12 (Commerce Super League)</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Add New Student
            </button>
          </div>

          {/* Student Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Roll No (Login ID)</th>
                    <th className="p-3.5">Login Password</th>
                    <th className="p-3.5">Class & Batch</th>
                    <th className="p-3.5">Parent & Phone</th>
                    <th className="p-3.5 text-center">Marks %</th>
                    <th className="p-3.5 text-center">Attendance</th>
                    <th className="p-3.5 text-center">Fee Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((s) => {
                    const isVisible = showPassMap[s.id];
                    return (
                      <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={s.photo || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`}
                              alt={s.name}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-blue-500/30"
                            />
                            <div>
                              <div className="font-bold text-white text-sm">{s.name}</div>
                              <div className="text-[11px] text-slate-400">{s.targetExam || s.stream}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-amber-300">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs">
                            {s.rollNo}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-blue-300 font-bold text-xs select-all">
                              {isVisible ? (s.password || 'student123') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowPassMap({ ...showPassMap, [s.id]: !isVisible })}
                              className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer transition-colors"
                              title={isVisible ? "Hide Password" : "Show Password"}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(s.password || 'student123');
                                setCopiedId(s.id);
                                setTimeout(() => setCopiedId(null), 1500);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
                              title="Copy Password"
                            >
                              {copiedId === s.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-200">{s.grade}</div>
                          <div className="text-[11px] text-slate-400">{s.batch}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-slate-200 font-medium">{s.parentName}</div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" /> {s.parentPhone}
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          {Number(s.overallPercentage) > 0 ? (
                            <>
                              <span className="font-black text-amber-400 text-sm">
                                {s.overallPercentage}%
                              </span>
                              <div className="text-[10px] text-slate-500">Rank #{s.batchRank || 1}</div>
                            </>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No Tests Yet</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          {Number(s.attendancePercentage) > 0 ? (
                            <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                              s.attendancePercentage >= 85
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : s.attendancePercentage >= 75
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {s.attendancePercentage}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">0% (New)</span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            s.fees?.status === 'Fully Paid'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {s.fees?.status || 'Paid'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ================= TAB 2: ATTENDANCE TRACKER ================= */}
      {activeTab === 'attendance' && (
        <ClassAttendanceManager
          students={data?.students || []}
          attendanceLogs={data?.attendanceLogs || []}
          onDataSaved={loadData}
          isAdmin={teacherUser?.role === 'admin'}
          currentUser={teacherUser}
        />
      )}

      {/* ================= TAB: ASSIGNMENTS & HOMEWORK ================= */}
      {activeTab === 'assignments' && (
        <AssignmentsManager
          currentRole="teacher"
          currentUserName={teacherUser?.name || 'Faculty Desk'}
          students={data?.students || []}
          onDataChanged={loadData}
        />
      )}

      {/* ================= TAB: RECORDED LECTURES (5-10 GB) ================= */}
      {activeTab === 'lectures' && (
        <LecturesManager
          currentRole="teacher"
          currentUserName={teacherUser?.name || 'Faculty Desk'}
          onDataChanged={loadData}
        />
      )}

      {/* ================= TAB: OLYMPIAD MCQ TESTS ================= */}
      {activeTab === 'onlineTests' && (
        <OnlineTestManager
          currentRole="teacher"
          currentUserName={teacherUser?.name || 'Faculty Desk'}
          students={data?.students || []}
          onDataChanged={loadData}
        />
      )}

      {/* ================= TAB 3: OFFLINE TESTS & CHECKED ANSWER SHEETS ================= */}
      {activeTab === 'marks' && (
        <OfflineExamsManager
          currentRole="teacher"
          currentUserName={teacherUser?.name || 'Er. Alok Goyal (Faculty)'}
          students={data?.students || []}
          onDataChanged={loadData}
        />
      )}

      {/* ================= TAB 4: NOTICE BOARD ================= */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Broadcast Compulsory Notices to Parents</h2>
              <p className="text-xs text-slate-400">
                Notices appear prominently on every parent's dashboard upon login.
              </p>
            </div>

            <button
              onClick={handleOpenAddNotice}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Publish Notice
            </button>
          </div>

          <div className="space-y-3">
            {(data?.notices || []).map((notice) => (
              <div key={notice.id} className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {notice.badge || notice.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{notice.date}</span>
                  </div>
                  <h3 className="font-bold text-white text-base">{notice.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">{notice.content}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditNotice(notice)}
                    className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 cursor-pointer"
                    title="Edit / Change notice"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(notice.id, notice.title)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: AT-RISK STUDENTS & ALERTS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-rose-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">At-Risk Students Monitor (Parent Intervention Needed)</h2>
                <p className="text-xs text-slate-400">
                  Students whose attendance has dropped below 85% or marks below 80%. Faculty should contact parents directly.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {atRiskStudents.length > 0 ? (
                atRiskStudents.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{s.name}</span>
                        <span className="font-mono text-xs text-amber-300">({s.rollNo})</span>
                        <span className="text-xs text-slate-400">• {s.batch}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span>Attendance: <strong className="text-rose-400">{s.attendancePercentage}%</strong></span>
                        <span>Score: <strong className="text-amber-400">{s.overallPercentage}%</strong></span>
                        <span>Parent: <strong className="text-slate-200">{s.parentName} ({s.parentPhone})</strong></span>
                      </div>
                      <p className="text-xs text-slate-400 italic mt-1">"{s.teacherRemarks}"</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${s.parentPhone}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Parent
                      </a>
                      <a
                        href={`https://wa.me/91${s.parentPhone.replace(/\D/g, '')}?text=Dear%20${encodeURIComponent(s.parentName)},%20this%20is%20Er.%20Alok%20Goyal%20from%20Goyal%20Coaching%20Center%20regarding%20${encodeURIComponent(s.name)}'s%20attendance.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-emerald-400 text-sm">
                  ✓ All students currently maintain excellent attendance and test standards!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: RESULTS GROUP PHOTO & SLIDESHOW MANAGEMENT ================= */}
      {activeTab === 'resultsPhoto' && (
        <ResultsPhotoManager onDataSaved={loadData} />
      )}

      {/* ================= TAB 7: SHINING STARS MANAGEMENT ================= */}
      {activeTab === 'shiningStars' && (
        <ShiningStarsManager onDataSaved={loadData} />
      )}

      {/* ================= TAB 8: CAMPUS FEATURES MANAGEMENT ================= */}
      {activeTab === 'features' && (
        <FeaturesManager onDataSaved={loadData} />
      )}

      {/* ================= TAB 9: COURSES & POINTS MANAGEMENT ================= */}
      {activeTab === 'courses' && (
        <CoursesManager onDataSaved={loadData} />
      )}

      {/* ================= TAB 10: DIRECTORS MANAGEMENT ================= */}
      {activeTab === 'directors' && (
        <DirectorsManager onDataSaved={loadData} />
      )}

      {/* ================= TAB 11: LATEST NEWS & EVENTS MANAGEMENT ================= */}
      {activeTab === 'newsEvents' && (
        <NewsEventsManager onDataSaved={loadData} />
      )}

      {/* ================= MODAL: ADD STUDENT ================= */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-8 border border-blue-500/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" /> Enroll New Student
              </h2>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Roll No / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GCC-106 or 1"
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Login Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. student123"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Class / Grade</label>
                  <select
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Class 12">Class 12</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Dropper / Repeater">Dropper / Repeater</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Stream / Course</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science & Mathematics or Commerce Stream"
                    value={newStudent.stream}
                    onChange={(e) => setNewStudent({ ...newStudent, stream: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 uppercase font-semibold mb-1">Batch Name & Timings</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Board Champions (3:30 PM - 6:30 PM)"
                  value={newStudent.batch}
                  onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Rajesh Sharma"
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Parent Contact Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876960163"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Total Course Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={newStudent.totalFees}
                    onChange={(e) => setNewStudent({ ...newStudent, totalFees: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newStudent.paidFees}
                    onChange={(e) => setNewStudent({ ...newStudent, paidFees: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Save & Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE NEW TEST ================= */}
      {isNewTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl glass-panel p-6 sm:p-8 border-2 border-blue-500/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" /> Conduct New Test & Record Marks
              </h2>
              <button
                onClick={() => setIsNewTestOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Test Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrostatics & Capacitance Minor Test"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Test Date</label>
                  <input
                    type="date"
                    required
                    value={newTest.date}
                    onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Test Type</label>
                  <select
                    value={newTest.type}
                    onChange={(e) => setNewTest({ ...newTest, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Monthly Grand Test">Monthly Grand Test</option>
                    <option value="Full Mock Test">Full Mock Test</option>
                    <option value="Pre-Board Exam">Pre-Board Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Target Batch</label>
                  <select
                    value={newTest.batch}
                    onChange={(e) => setNewTest({ ...newTest, batch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Class 7th">Class 7th (Junior Prodigy)</option>
                    <option value="Class 8th">Class 8th (Junior Prodigy)</option>
                    <option value="Class 9th">Class 9th (Foundation Stars)</option>
                    <option value="Class 10th">Class 10th (Board Champions)</option>
                    <option value="Class 11th (Science)">Class 11th (Science Pioneers)</option>
                    <option value="Class 11th (Commerce)">Class 11th (Commerce Pioneers)</option>
                    <option value="Class 12th (Science)">Class 12th (Science Super League)</option>
                    <option value="Class 12th (Commerce)">Class 12th (Commerce Super League)</option>
                    <option value="All">All Batches</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={newTest.maxMarks}
                    onChange={(e) => setNewTest({ ...newTest, maxMarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Student marks input list */}
              <div className="pt-3">
                <label className="block text-slate-300 uppercase font-semibold mb-2">
                  Enter Marks for Students in {newTest.batch} ({(data?.students || []).filter(s => matchesStudentClass(s, newTest.batch)).length} Students)
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(data?.students || [])
                    .filter(s => matchesStudentClass(s, newTest.batch))
                    .map((s) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="w-1/3">
                          <span className="font-bold text-white">{s.name}</span>
                          <span className="text-[10px] text-amber-300 block font-mono">{s.rollNo}</span>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="Marks"
                            value={testMarksMap[s.id]?.marks ?? 80}
                            onChange={(e) => setTestMarksMap({
                              ...testMarksMap,
                              [s.id]: { ...testMarksMap[s.id], marks: Number(e.target.value) }
                            })}
                            className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-center"
                          />
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Teacher remark / strong topic..."
                            value={testMarksMap[s.id]?.feedback || ''}
                            onChange={(e) => setTestMarksMap({
                              ...testMarksMap,
                              [s.id]: { ...testMarksMap[s.id], feedback: e.target.value }
                            })}
                            className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-[11px]"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTestOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold cursor-pointer shadow-lg shadow-blue-500/25"
                >
                  Publish Test Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT NOTICE ================= */}
      {isNewNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-blue-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" /> 
                <span>{editingNotice ? 'Edit / Change Notice' : 'Publish Compulsory Notice'}</span>
              </h2>
              <button
                onClick={() => setIsNewNoticeOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 uppercase font-semibold mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent: Mandatory PTM for Class 12 on Sunday"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Category</label>
                  <select
                    value={newNotice.category}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Compulsory Notice">Compulsory Notice</option>
                    <option value="Examination Alert">Examination Alert</option>
                    <option value="Holiday Notice">Holiday Notice</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Priority</label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Urgent">Urgent / Compulsory</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 uppercase font-semibold mb-1">Notice Body / Message for Parents</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain instructions, dates, timings, and attendance compulsion..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewNoticeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  {editingNotice ? 'Save Notice Changes' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
