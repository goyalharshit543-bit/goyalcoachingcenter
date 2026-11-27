import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/client';
import { 
  Award, 
  Search, 
  Plus, 
  Edit, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Zap, 
  BarChart2, 
  X,
  ExternalLink,
  BookOpen,
  Trash2
} from 'lucide-react';

// Helper to normalize and match class names
export function isSameClass(a, b) {
  if (!a || !b) return false;
  const clean = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const ca = clean(a);
  const cb = clean(b);
  if (ca === cb) return true;
  if ((ca.includes('10') && cb.includes('10')) ||
      (ca.includes('9') && cb.includes('9')) ||
      (ca.includes('8') && cb.includes('8')) ||
      (ca.includes('7') && cb.includes('7')) ||
      (ca.includes('11') && cb.includes('11')) ||
      (ca.includes('12') && cb.includes('12'))) {
    return true;
  }
  return false;
}

export default function AllStudentMarksManager({
  students = [],
  currentUser = null,
  onDataSaved = () => {},
  isDarkMode = false
}) {
  const [allStudents, setAllStudents] = useState(students || []);
  const [offlineTests, setOfflineTests] = useState([]);
  const [onlineTests, setOnlineTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & View State
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('roster'); // 'roster' | 'testWise' | 'master'
  const [selectedTestId, setSelectedTestId] = useState('');
  const [expandedStudentIds, setExpandedStudentIds] = useState({});
  const [scorecardModalStudent, setScorecardModalStudent] = useState(null);

  // Quick Enter / Edit Marks Modal State
  const [marksModal, setMarksModal] = useState({
    isOpen: false,
    studentId: '',
    testId: '',
    marksObtained: '',
    remarks: '',
    status: 'Distinction'
  });
  const [saveStatusMsg, setSaveStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Online breakdown modal
  const [onlineBreakdownModal, setOnlineBreakdownModal] = useState(null);

  // Load all tests & student data
  const loadData = async () => {
    setLoading(true);
    try {
      const [testsRes, onlineTestsRes] = await Promise.all([
        api.getTests(),
        api.getOnlineTests()
      ]);
      if (Array.isArray(testsRes)) setOfflineTests(testsRes);
      if (Array.isArray(onlineTestsRes)) setOnlineTests(onlineTestsRes);

      if (!students || students.length === 0) {
        const freshStudents = await api.getStudents();
        if (Array.isArray(freshStudents)) setAllStudents(freshStudents);
      } else {
        setAllStudents(students);
      }

      if (testsRes && testsRes.length > 0 && !selectedTestId) {
        setSelectedTestId(testsRes[0].id);
      }
    } catch (err) {
      console.warn('Failed to load marks manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [students]);

  const CLASS_FILTER_TABS = [
    { id: 'All', label: 'All Classes' },
    { id: 'Class 7', label: 'Class 7th (Foundation)' },
    { id: 'Class 8', label: 'Class 8th (Junior)' },
    { id: 'Class 9', label: 'Class 9th (Science & Maths)' },
    { id: 'Class 10', label: 'Class 10th (Board Champions)' },
    { id: 'Class 11 Commerce', label: 'Class 11th (Commerce)' },
    { id: 'Class 12 Commerce', label: 'Class 12th (Commerce)' }
  ];

  // Filter students based on class & search
  const filteredStudents = useMemo(() => {
    return (allStudents || []).filter(s => {
      if (selectedClassFilter !== 'All' && !isSameClass(s.grade || s.batch, selectedClassFilter)) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.rollNo || '').toLowerCase().includes(q) ||
        (s.parentPhone || '').includes(q) ||
        (s.grade || '').toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      const classA = a.grade || a.batch || '';
      const classB = b.grade || b.batch || '';
      if (classA !== classB) {
        return classA.localeCompare(classB, undefined, { numeric: true });
      }
      return (a.rollNo || '').localeCompare(b.rollNo || '', undefined, { numeric: true });
    });
  }, [allStudents, selectedClassFilter, searchQuery]);

  // Helper: Get all offline test records for a student
  const getStudentOfflineMarks = (student) => {
    if (!student) return [];
    const sClean = (val) => String(val || '').trim().toLowerCase();
    const sId = sClean(student.id);
    const sRoll = sClean(student.rollNo);
    const sName = sClean(student.name);

    const records = [];
    offlineTests.forEach(test => {
      const match = (test.results || []).find(r => {
        const rId = sClean(r.studentId);
        const rRoll = sClean(r.rollNo);
        const rName = sClean(r.studentName || r.name);
        return (
          (rId && (rId === sId || rId === sRoll)) ||
          (rRoll && (rRoll === sRoll || rRoll === sId)) ||
          (rName && sName && (rName === sName || rName.includes(sName) || sName.includes(rName)))
        );
      });

      if (match) {
        records.push({
          testId: test.id,
          title: test.title,
          subject: test.subject || 'All Subjects',
          date: test.date,
          type: test.type || 'Offline Classroom Test',
          maxMarks: test.maxMarks || 50,
          marksObtained: match.marksObtained !== undefined ? match.marksObtained : '',
          percentage: match.percentage !== undefined ? match.percentage : Number(((Number(match.marksObtained || 0) / (test.maxMarks || 50)) * 100).toFixed(1)),
          rank: match.rank || '-',
          status: match.status || (Number(match.percentage || 0) >= 85 ? 'Distinction' : 'Passed'),
          remarks: match.remarks || 'Evaluated successfully.',
          highestMarks: test.highestMarks,
          avgMarks: test.avgMarks,
          questionPaperUrl: test.questionPaperUrl
        });
      }
    });

    return records.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  };

  // Helper: Get all online Olympiad attempts for a student
  const getStudentOnlineAttempts = (student) => {
    if (!student) return [];
    const sClean = (val) => String(val || '').trim().toLowerCase();
    const sId = sClean(student.id);
    const sRoll = sClean(student.rollNo);
    const sName = sClean(student.name);

    const attempts = [];
    onlineTests.forEach(test => {
      (test.attempts || []).forEach(att => {
        const aId = sClean(att.studentId);
        const aRoll = sClean(att.rollNo);
        const aName = sClean(att.studentName);
        if (
          (aId && (aId === sId || aId === sRoll)) ||
          (aRoll && (aRoll === sRoll || aRoll === sId)) ||
          (aName && sName && (aName === sName || aName.includes(sName) || sName.includes(aName)))
        ) {
          attempts.push({
            testId: test.id,
            testTitle: test.title,
            subject: test.subject || 'Olympiad',
            grade: test.grade,
            durationMinutes: test.durationMinutes || 60,
            submittedAt: att.submittedAt,
            score: att.score,
            maxScore: att.maxScore || test.totalMarks || 40,
            accuracy: att.accuracy,
            correctCount: att.correctCount,
            incorrectCount: att.incorrectCount,
            unattemptedCount: att.unattemptedCount,
            totalQuestions: att.totalQuestions || test.questions?.length || 10,
            timeTakenSeconds: att.timeTakenSeconds || 0,
            detailedBreakdown: att.detailedBreakdown || [],
            rawAttempt: att,
            rawTest: test
          });
        }
      });
    });

    return attempts.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  };

  // Quick stats calculation
  const stats = useMemo(() => {
    const totalStudentsCount = allStudents.length;
    let totalMarksPctSum = 0;
    let evaluatedStudentsCount = 0;
    let distinctionStudentsCount = 0;

    allStudents.forEach(s => {
      const pct = Number(s.overallPercentage || 0);
      if (pct > 0) {
        totalMarksPctSum += pct;
        evaluatedStudentsCount++;
        if (pct >= 85) distinctionStudentsCount++;
      }
    });

    const totalOfflineResults = offlineTests.reduce((acc, t) => acc + (t.results?.length || 0), 0);
    const totalOnlineAttempts = onlineTests.reduce((acc, t) => acc + (t.attempts?.length || 0), 0);

    return {
      totalStudentsCount,
      totalOfflineTests: offlineTests.length,
      totalOfflineResults,
      totalOnlineTests: onlineTests.length,
      totalOnlineAttempts,
      avgPct: evaluatedStudentsCount > 0 ? (totalMarksPctSum / evaluatedStudentsCount).toFixed(1) : 0,
      distinctionStudentsCount
    };
  }, [allStudents, offlineTests, onlineTests]);

  // Toggle student expansion
  const toggleStudentExpand = (id) => {
    setExpandedStudentIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Open Enter Marks Modal
  const handleOpenMarksModal = (student = null, test = null) => {
    const defaultStudent = student || (filteredStudents.length > 0 ? filteredStudents[0] : null);
    const defaultTest = test || (offlineTests.length > 0 ? offlineTests[0] : null);

    let initialMarks = '';
    let initialRemarks = '';

    if (defaultStudent && defaultTest) {
      const sClean = (val) => String(val || '').trim().toLowerCase();
      const existing = (defaultTest.results || []).find(r => 
        (r.studentId && sClean(r.studentId) === sClean(defaultStudent.id || defaultStudent.rollNo)) ||
        (r.rollNo && sClean(r.rollNo) === sClean(defaultStudent.rollNo))
      );
      if (existing) {
        initialMarks = existing.marksObtained !== undefined ? existing.marksObtained : '';
        initialRemarks = existing.remarks || '';
      }
    }

    setMarksModal({
      isOpen: true,
      studentId: defaultStudent ? defaultStudent.id : '',
      testId: defaultTest ? defaultTest.id : '',
      marksObtained: initialMarks,
      remarks: initialRemarks,
      status: 'Distinction'
    });
  };

  // Handle Save Marks
  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!marksModal.testId || !marksModal.studentId) {
      alert('Please select both a student and a test.');
      return;
    }

    const test = offlineTests.find(t => t.id === marksModal.testId);
    if (!test) {
      alert('Selected test not found.');
      return;
    }

    const student = allStudents.find(s => s.id === marksModal.studentId);
    if (!student) {
      alert('Selected student not found.');
      return;
    }

    const maxMarks = Number(test.maxMarks) || 50;
    const scoredMarks = Number(marksModal.marksObtained);

    if (isNaN(scoredMarks) || scoredMarks < 0) {
      alert('Please enter a valid positive score.');
      return;
    }
    if (scoredMarks > maxMarks) {
      alert(`Marks scored (${scoredMarks}) cannot exceed test maximum marks (${maxMarks}).`);
      return;
    }

    setIsSaving(true);
    try {
      const results = Array.isArray(test.results) ? [...test.results] : [];
      const sClean = (val) => String(val || '').trim().toLowerCase();
      const sId = sClean(student.id);
      const sRoll = sClean(student.rollNo);

      const existingIdx = results.findIndex(r => 
        (r.studentId && (sClean(r.studentId) === sId || sClean(r.studentId) === sRoll)) ||
        (r.rollNo && (sClean(r.rollNo) === sRoll || sClean(r.rollNo) === sId))
      );

      const pct = Number(((scoredMarks / maxMarks) * 100).toFixed(1));
      const resultEntry = {
        studentId: student.id || student.rollNo,
        rollNo: student.rollNo,
        studentName: student.name,
        marksObtained: scoredMarks,
        maxMarks: maxMarks,
        percentage: pct,
        status: pct >= 85 ? 'Distinction' : (pct >= 40 ? 'Passed' : 'Needs Practice'),
        remarks: marksModal.remarks.trim() || (pct >= 85 ? 'Outstanding analytical work.' : 'Good performance, keep practicing.'),
        evaluatedAt: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        results[existingIdx] = { ...results[existingIdx], ...resultEntry };
      } else {
        results.push(resultEntry);
      }

      await api.updateTest(test.id, { results });
      setSaveStatusMsg(`Marks successfully saved for ${student.name} in "${test.title}"!`);
      setTimeout(() => setSaveStatusMsg(''), 4000);
      setMarksModal(prev => ({ ...prev, isOpen: false }));
      
      // Reload fresh data
      await loadData();
      onDataSaved();
    } catch (err) {
      console.error('Failed to save marks:', err);
      alert('Failed to save marks: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Export CSV of all student marks
  const handleExportCSV = () => {
    const headers = ['Roll No', 'Student Name', 'Class/Grade', 'Stream', 'Parent Phone', 'Overall Marks %', 'Total Offline Tests', 'Test Title', 'Subject', 'Date', 'Marks Obtained', 'Max Marks', 'Percentage %', 'Rank', 'Status', 'Teacher Remarks'];
    const rows = [];

    filteredStudents.forEach(s => {
      const offline = getStudentOfflineMarks(s);
      if (offline.length === 0) {
        rows.push([
          `"${s.rollNo || ''}"`,
          `"${s.name || ''}"`,
          `"${s.grade || s.batch || ''}"`,
          `"${s.stream || ''}"`,
          `"${s.parentPhone || ''}"`,
          `"${s.overallPercentage || 0}%"`,
          0,
          '"No Tests Evaluated Yet"',
          '""', '""', '""', '""', '""', '""', '""', '""'
        ]);
      } else {
        offline.forEach(t => {
          rows.push([
            `"${s.rollNo || ''}"`,
            `"${s.name || ''}"`,
            `"${s.grade || s.batch || ''}"`,
            `"${s.stream || ''}"`,
            `"${s.parentPhone || ''}"`,
            `"${s.overallPercentage || 0}%"`,
            offline.length,
            `"${t.title.replace(/"/g, '""')}"`,
            `"${t.subject}"`,
            `"${t.date}"`,
            t.marksObtained,
            t.maxMarks,
            `"${t.percentage}%"`,
            `"${t.rank}"`,
            `"${t.status}"`,
            `"${(t.remarks || '').replace(/"/g, '""')}"`
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Goyal_Coaching_Centre_All_Students_Marks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all tests and examination reports
  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ ARE YOU SURE?\n\nThis will permanently delete all offline tests, Sunday mock scores, Olympiad test attempts, and student examination report cards in the Admin Panel.\n\nDo you want to proceed?')) {
      return;
    }
    setIsSaving(true);
    try {
      await api.clearAllTestsAndReports();
      setOfflineTests([]);
      setOnlineTests([]);
      setSelectedTestId('');
      setAllStudents(prev => prev.map(s => ({
        ...s,
        totalTestsEvaluated: 0,
        overallPercentage: 0,
        teacherRemarks: 'Enrolled student. Awaiting upcoming tests and assessments.'
      })));
      setSaveStatusMsg('All tests and examination report data have been deleted successfully.');
      onDataSaved();
    } catch (err) {
      console.error('Error clearing tests and reports:', err);
      alert('Failed to clear test data: ' + err.message);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatusMsg(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= 1. EXECUTIVE TITLE & OVERVIEW BANNER ================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl border border-blue-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-2 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Institute-Wide Marks Register & Gradebook
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Award className="w-8 h-8 text-amber-400 shrink-0" />
              <span>All Student Marks & Academic Examination Reports</span>
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
              Consolidated evaluation matrix across all classes. View, audit, and enter marks for Sunday Mock Exams, Subject Unit Tests, and Olympiad MCQ Competitions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenMarksModal()}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/25 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Enter / Update Marks
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 cursor-pointer backdrop-blur-sm border border-white/20 transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 cursor-pointer backdrop-blur-sm border border-white/20 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Ledger
            </button>
            <button
              onClick={handleClearAllData}
              disabled={isSaving}
              title="Delete all tests, marks, and examination reports"
              className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/25 transition-all hover:scale-105 active:scale-95 border border-rose-400/30"
            >
              <Trash2 className="w-4 h-4" /> Clear All Test Records
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-white/15">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-[11px] text-blue-200 font-semibold flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-200" /> Enrolled Students
            </div>
            <div className="text-2xl font-black text-white mt-1">{stats.totalStudentsCount}</div>
            <div className="text-[10px] text-blue-200 mt-0.5">Across All Batches</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-[11px] text-blue-200 font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300" /> Offline Tests
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{stats.totalOfflineTests}</div>
            <div className="text-[10px] text-blue-200 mt-0.5">{stats.totalOfflineResults} Recorded Scores</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-[11px] text-blue-200 font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-300" /> Olympiad Tests
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{stats.totalOnlineTests}</div>
            <div className="text-[10px] text-blue-200 mt-0.5">{stats.totalOnlineAttempts} Student Attempts</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="text-[11px] text-blue-200 font-semibold flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-300" /> Institute Average
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{stats.avgPct}%</div>
            <div className="text-[10px] text-blue-200 mt-0.5">Overall Performance</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-blue-200 font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" /> Distinction Achievers
            </div>
            <div className="text-2xl font-black text-white mt-1">{stats.distinctionStudentsCount}</div>
            <div className="text-[10px] text-blue-200 mt-0.5">Scored ≥ 85% Marks</div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveStatusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveStatusMsg}</span>
        </div>
      )}

      {/* ================= 2. CONTROLS BAR: SEARCH, CLASS TABS & VIEW TOGGLE ================= */}
      <div className="space-y-4">
        {/* Class Filter Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900/90 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {CLASS_FILTER_TABS.map(tab => {
            const isSelected = selectedClassFilter === tab.id;
            const count = tab.id === 'All'
              ? allStudents.length
              : allStudents.filter(s => isSameClass(s.grade || s.batch, tab.id)).length;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedClassFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & View Switcher */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll no, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">View:</span>
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('roster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  viewMode === 'roster'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🧑‍🎓 Student Roster
              </button>
              <button
                type="button"
                onClick={() => setViewMode('testWise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  viewMode === 'testWise'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📑 Test-Wise Marksheet
              </button>
              <button
                type="button"
                onClick={() => setViewMode('master')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  viewMode === 'master'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📊 Master Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. VIEW MODE A: STUDENT-WISE MASTER ROSTER ================= */}
      {viewMode === 'roster' && (
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
              No students found matching your criteria.
            </div>
          ) : (
            filteredStudents.map(student => {
              const offlineMarks = getStudentOfflineMarks(student);
              const onlineAttempts = getStudentOnlineAttempts(student);
              const isExpanded = !!expandedStudentIds[student.id];
              const overallPct = Number(student.overallPercentage || 0);

              return (
                <div 
                  key={student.id}
                  className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-blue-300 dark:hover:border-blue-700"
                >
                  {/* Student Summary Row */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-blue-500/20">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-slate-900 dark:text-white text-base">
                            {student.name}
                          </span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Roll: {student.rollNo}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {student.grade || student.batch}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                          <span>Stream: <strong className="text-slate-700 dark:text-slate-300">{student.stream || 'Foundation'}</strong></span>
                          <span>•</span>
                          <span>Parent: <strong className="text-slate-700 dark:text-slate-300">{student.parentName} ({student.parentPhone})</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* Overall Percentage Badge */}
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Overall Score</div>
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className={`text-xl font-black ${
                            overallPct >= 85 ? 'text-emerald-600 dark:text-emerald-400' :
                            overallPct >= 70 ? 'text-blue-600 dark:text-blue-400' :
                            overallPct >= 40 ? 'text-amber-600 dark:text-amber-400' :
                            'text-slate-400'
                          }`}>
                            {overallPct > 0 ? `${overallPct}%` : 'New Admitted'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {offlineMarks.length} Offline • {onlineAttempts.length} Olympiad
                        </div>
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => handleOpenMarksModal(student)}
                        className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Enter / Add Marks for this Student"
                      >
                        <Plus className="w-3.5 h-3.5" /> Enter Marks
                      </button>

                      <button
                        onClick={() => setScorecardModalStudent(student)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Full Printable Scorecard"
                      >
                        <FileText className="w-3.5 h-3.5" /> Scorecard
                      </button>

                      <button
                        onClick={() => toggleStudentExpand(student.id)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                        title={isExpanded ? 'Collapse Marks' : 'Expand Marks'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detailed Breakdown */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 space-y-5 animate-fadeIn">
                      {/* Section A: Offline Classroom & Sunday Tests */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-amber-500" /> Offline Classroom & Sunday Mock Tests ({offlineMarks.length})
                          </h4>
                          <span className="text-[11px] text-slate-400">Checked Answer Sheets & Board Mock Series</span>
                        </div>

                        {offlineMarks.length === 0 ? (
                          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center italic">
                            No offline tests evaluated for this student yet. Click "Enter Marks" above to record marks.
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                                <tr>
                                  <th className="p-3">Test Title</th>
                                  <th className="p-3">Subject</th>
                                  <th className="p-3">Date</th>
                                  <th className="p-3 text-center">Score / Max</th>
                                  <th className="p-3 text-center">Percentage</th>
                                  <th className="p-3 text-center">Batch Rank</th>
                                  <th className="p-3 text-center">Class High / Avg</th>
                                  <th className="p-3">Faculty Feedback</th>
                                  <th className="p-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {offlineMarks.map((m, idx) => (
                                  <tr key={idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                                      {m.title}
                                    </td>
                                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
                                      {m.subject}
                                    </td>
                                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                                      {m.date}
                                    </td>
                                    <td className="p-3 text-center font-bold">
                                      <span className="text-blue-600 dark:text-blue-400 text-sm">
                                        {m.marksObtained}
                                      </span>
                                      <span className="text-slate-400 font-normal"> / {m.maxMarks}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        m.percentage >= 85
                                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                                      }`}>
                                        {m.percentage}%
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                      #{m.rank}
                                    </td>
                                    <td className="p-3 text-center text-[11px] text-slate-500">
                                      <span className="text-emerald-600 font-semibold">{m.highestMarks || '-'}</span> / <span className="text-slate-600">{m.avgMarks || '-'}</span>
                                    </td>
                                    <td className="p-3 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate">
                                      {m.remarks}
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => handleOpenMarksModal(student, offlineTests.find(t => t.id === m.testId))}
                                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 cursor-pointer transition-colors"
                                        title="Edit Marks"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Section B: Olympiad & Board Online Tests */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-cyan-500" /> Olympiad & Timed MCQ Challenges ({onlineAttempts.length})
                          </h4>
                          <span className="text-[11px] text-slate-400">National Olympiads, NTSE & Board Rapid Fire Arena</span>
                        </div>

                        {onlineAttempts.length === 0 ? (
                          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center italic">
                            No Olympiad test attempts recorded yet. Student can attempt available tests from their student login.
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                                <tr>
                                  <th className="p-3">Olympiad Test Title</th>
                                  <th className="p-3">Subject</th>
                                  <th className="p-3">Attempted At</th>
                                  <th className="p-3 text-center">Score / Total</th>
                                  <th className="p-3 text-center">Accuracy %</th>
                                  <th className="p-3 text-center">Breakdown</th>
                                  <th className="p-3 text-center">Time Taken</th>
                                  <th className="p-3 text-right">Detailed Review</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {onlineAttempts.map((att, idx) => (
                                  <tr key={idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                                      {att.testTitle}
                                    </td>
                                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">
                                      {att.subject}
                                    </td>
                                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                                      {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'Recent'}
                                    </td>
                                    <td className="p-3 text-center font-bold">
                                      <span className="text-cyan-600 dark:text-cyan-400 text-sm">
                                        {att.score}
                                      </span>
                                      <span className="text-slate-400 font-normal"> / {att.maxScore}</span>
                                    </td>
                                    <td className="p-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400">
                                        {att.accuracy}%
                                      </span>
                                    </td>
                                    <td className="p-3 text-center text-[11px]">
                                      <span className="text-emerald-600 font-bold">{att.correctCount}✔</span>{' '}
                                      <span className="text-rose-500 font-bold">{att.incorrectCount}✖</span>{' '}
                                      <span className="text-slate-400">{att.unattemptedCount}⚪</span>
                                    </td>
                                    <td className="p-3 text-center font-mono text-[11px] text-slate-500">
                                      {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => setOnlineBreakdownModal({ attempt: att, test: att.rawTest, student })}
                                        className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                                      >
                                        <BookOpen className="w-3 h-3" /> Questions
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= 4. VIEW MODE B: TEST-WISE MARKS MATRIX ================= */}
      {viewMode === 'testWise' && (
        <div className="space-y-4">
          {offlineTests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Offline Tests Available</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                All test records are currently cleared. Click "Enter / Update Marks" or conduct a new offline test to record scores.
              </p>
              <button
                onClick={() => handleOpenMarksModal()}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> Enter New Test Marks
              </button>
            </div>
          ) : (
            <>
              {/* Test Selector */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Select Offline or Olympiad Test:
                  </label>
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full sm:max-w-xl px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {offlineTests.map(t => (
                      <option key={t.id} value={t.id}>
                        📄 [Offline Test] {t.title} ({t.grade || t.batch} • Max: {t.maxMarks})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleOpenMarksModal(null, offlineTests.find(t => t.id === selectedTestId))}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Enter Marks for this Test
                </button>
              </div>

              {/* Test Overview Card */}
              {(() => {
                const currentTest = offlineTests.find(t => t.id === selectedTestId);
                if (!currentTest) return null;
            const results = Array.isArray(currentTest.results) ? currentTest.results : [];
            const matchingStudents = allStudents.filter(s => isSameClass(s.grade || s.batch, currentTest.grade || currentTest.batch));

            return (
              <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {currentTest.type || 'Offline Classroom Test'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {currentTest.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentTest.title}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-3">
                      <span>Subject: <strong>{currentTest.subject}</strong></span>
                      <span>•</span>
                      <span>Target Class: <strong>{currentTest.grade || currentTest.batch}</strong></span>
                      <span>•</span>
                      <span>Exam Date: <strong>{currentTest.date}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Max Marks</div>
                      <div className="text-lg font-black text-blue-600 dark:text-blue-400">{currentTest.maxMarks}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Class High</div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{currentTest.highestMarks || '-'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Class Avg</div>
                      <div className="text-lg font-black text-slate-700 dark:text-slate-300">{currentTest.avgMarks || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* Marksheet Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Rank</th>
                        <th className="p-3.5">Roll No</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Contact</th>
                        <th className="p-3.5 text-center">Marks Scored</th>
                        <th className="p-3.5 text-center">Percentage</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5">Teacher Feedback</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {matchingStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400 text-xs italic">
                            No students enrolled in this test's batch ({currentTest.grade || currentTest.batch}).
                          </td>
                        </tr>
                      ) : (
                        matchingStudents.map((s) => {
                          const sClean = (val) => String(val || '').trim().toLowerCase();
                          const r = results.find(res => 
                            (res.studentId && (sClean(res.studentId) === sClean(s.id) || sClean(res.studentId) === sClean(s.rollNo))) ||
                            (res.rollNo && (sClean(res.rollNo) === sClean(s.rollNo) || sClean(res.rollNo) === sClean(s.id)))
                          );

                          return (
                            <tr key={s.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5 font-bold text-slate-500">
                                {r?.rank ? `#${r.rank}` : '-'}
                              </td>
                              <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                                {s.rollNo}
                              </td>
                              <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                                {s.name}
                              </td>
                              <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                                {s.parentPhone}
                              </td>
                              <td className="p-3.5 text-center font-bold text-sm">
                                {r ? (
                                  <span className="text-blue-600 dark:text-blue-400">{r.marksObtained} <span className="text-xs text-slate-400 font-normal">/ {currentTest.maxMarks}</span></span>
                                ) : (
                                  <span className="text-slate-400 text-xs italic font-normal">Not Marked</span>
                                )}
                              </td>
                              <td className="p-3.5 text-center font-bold">
                                {r?.percentage !== undefined ? (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    r.percentage >= 85
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                                  }`}>
                                    {r.percentage}%
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="p-3.5 text-center">
                                {r?.status ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {r.status}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate text-[11px]">
                                {r?.remarks || 'No remarks recorded.'}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => handleOpenMarksModal(s, currentTest)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" /> {r ? 'Edit Marks' : 'Enter'}
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
            );
          })()}
            </>
          )}
        </div>
      )}

      {/* ================= 5. VIEW MODE C: MASTER TABULAR GRADEBOOK ================= */}
      {viewMode === 'master' && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Institute Master Marks Table — All Students & All Tests</span>
            </h3>
            <span className="text-xs text-slate-400">Total Records: {filteredStudents.length} Students</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3 text-center">Overall %</th>
                  <th className="p-3 text-center">Offline Tests</th>
                  <th className="p-3 text-center">Olympiad Tests</th>
                  <th className="p-3 text-center">Attendance %</th>
                  <th className="p-3">Latest Feedback</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map(student => {
                  const offlineMarks = getStudentOfflineMarks(student);
                  const onlineAttempts = getStudentOnlineAttempts(student);
                  const overallPct = Number(student.overallPercentage || 0);

                  return (
                    <tr key={student.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {student.rollNo}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {student.grade}
                      </td>
                      <td className="p-3 text-center font-black">
                        <span className={`text-sm ${
                          overallPct >= 85 ? 'text-emerald-600 dark:text-emerald-400' :
                          overallPct >= 70 ? 'text-blue-600 dark:text-blue-400' :
                          overallPct >= 40 ? 'text-amber-600 dark:text-amber-400' :
                          'text-slate-400'
                        }`}>
                          {overallPct > 0 ? `${overallPct}%` : 'New'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {offlineMarks.length}
                      </td>
                      <td className="p-3 text-center font-bold text-cyan-600 dark:text-cyan-400">
                        {onlineAttempts.length}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-600">
                        {student.attendancePercentage || 0}%
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate text-[11px]">
                        {student.teacherRemarks || 'Consistent performance.'}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenMarksModal(student)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-xs font-bold cursor-pointer"
                        >
                          Enter Marks
                        </button>
                        <button
                          onClick={() => setScorecardModalStudent(student)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                        >
                          Scorecard
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 6. MODAL: QUICK ENTER / EDIT MARKS ================= */}
      {marksModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Enter / Update Student Test Marks</h3>
              </div>
              <button
                type="button"
                onClick={() => setMarksModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="p-6 space-y-4">
              {/* Select Student */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  1. Select Student:
                </label>
                <select
                  value={marksModal.studentId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    const st = allStudents.find(s => s.id === sid);
                    setMarksModal(prev => ({ ...prev, studentId: sid }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.rollNo}) — {s.grade || s.batch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Test */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  2. Select Offline Classroom / Sunday Exam:
                </label>
                <select
                  value={marksModal.testId}
                  onChange={(e) => setMarksModal(prev => ({ ...prev, testId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose Exam / Test --</option>
                  {offlineTests.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.subject} • Max: {t.maxMarks})
                    </option>
                  ))}
                </select>
              </div>

              {/* Marks Input & Max Marks Indicator */}
              {(() => {
                const currentTest = offlineTests.find(t => t.id === marksModal.testId);
                const max = currentTest ? currentTest.maxMarks : 50;
                const scored = Number(marksModal.marksObtained);
                const calcPct = !isNaN(scored) && scored > 0 ? ((scored / max) * 100).toFixed(1) : 0;

                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Marks Obtained:
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={max}
                        value={marksModal.marksObtained}
                        onChange={(e) => setMarksModal(prev => ({ ...prev, marksObtained: e.target.value }))}
                        placeholder={`0 to ${max}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                        Calculated Percentage:
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-black text-blue-600 dark:text-blue-400">
                        {calcPct}% <span className="text-xs font-normal text-slate-400">({scored || 0}/{max})</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Teacher Feedback / Remarks */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Teacher Remarks / Faculty Feedback:
                </label>
                <textarea
                  rows={2}
                  value={marksModal.remarks}
                  onChange={(e) => setMarksModal(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="e.g. Excellent step-by-step proofs. Great conceptual clarity in trigonometry."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMarksModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/25 disabled:opacity-50"
                >
                  {isSaving ? 'Saving Marks...' : 'Save & Publish Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 7. MODAL: FULL STUDENT SCORECARD & TRANSCRIPT ================= */}
      {scorecardModalStudent && (() => {
        const student = scorecardModalStudent;
        const offlineMarks = getStudentOfflineMarks(student);
        const onlineAttempts = getStudentOnlineAttempts(student);
        const overallPct = Number(student.overallPercentage || 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 block">
                    Official Academic Transcript
                  </span>
                  <h3 className="font-black text-lg">
                    {student.name} — Student Academic Record Card
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/20"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={() => setScorecardModalStudent(null)}
                    className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Student Details Grid */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Roll No (Login ID)</span>
                    <strong className="font-mono text-blue-600 dark:text-blue-400 text-sm">{student.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Enrolled Batch</span>
                    <strong className="text-slate-800 dark:text-slate-200">{student.grade || student.batch}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Parent Contact</span>
                    <strong className="text-slate-800 dark:text-slate-200">{student.parentPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Overall Standing</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{overallPct}% (Rank #{student.batchRank || 1})</strong>
                  </div>
                </div>

                {/* Offline Tests Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Offline Classroom & Sunday Tests
                  </h4>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Test Title</th>
                          <th className="p-2.5 text-center">Score / Max</th>
                          <th className="p-2.5 text-center">Percentage</th>
                          <th className="p-2.5 text-center">Rank</th>
                          <th className="p-2.5">Teacher Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {offlineMarks.map((m, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-mono text-[11px] text-slate-500">{m.date}</td>
                            <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{m.title}</td>
                            <td className="p-2.5 text-center font-bold text-blue-600 dark:text-blue-400">{m.marksObtained}/{m.maxMarks}</td>
                            <td className="p-2.5 text-center font-bold text-emerald-600">{m.percentage}%</td>
                            <td className="p-2.5 text-center font-bold">#{m.rank}</td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">{m.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Online Olympiad Tests Table */}
                {onlineAttempts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-cyan-500" /> Olympiad & Timed MCQ Challenges
                    </h4>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Olympiad Title</th>
                            <th className="p-2.5 text-center">Score / Max</th>
                            <th className="p-2.5 text-center">Accuracy %</th>
                            <th className="p-2.5 text-center">Correct / Wrong</th>
                            <th className="p-2.5 text-center">Time Taken</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {onlineAttempts.map((att, idx) => (
                            <tr key={idx}>
                              <td className="p-2.5 font-mono text-[11px] text-slate-500">
                                {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'Recent'}
                              </td>
                              <td className="p-2.5 font-semibold text-slate-900 dark:text-white">{att.testTitle}</td>
                              <td className="p-2.5 text-center font-bold text-cyan-600 dark:text-cyan-400">{att.score}/{att.maxScore}</td>
                              <td className="p-2.5 text-center font-bold text-cyan-700">{att.accuracy}%</td>
                              <td className="p-2.5 text-center font-bold text-[11px]">
                                <span className="text-emerald-600">{att.correctCount}✔</span>{' '}
                                <span className="text-rose-500">{att.incorrectCount}✖</span>
                              </td>
                              <td className="p-2.5 text-center font-mono text-[11px] text-slate-500">
                                {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= 8. MODAL: OLYMPIAD QUESTION-BY-QUESTION REVIEW ================= */}
      {onlineBreakdownModal && (() => {
        const { attempt, test, student } = onlineBreakdownModal;
        const questions = Array.isArray(test?.questions) ? test.questions : [];
        const answers = attempt?.rawAttempt?.answers || {};

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-700 to-blue-700 text-white">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-200 block">
                    Olympiad Detailed Scorecard Review
                  </span>
                  <h3 className="font-bold text-base">
                    {test?.title} — {student?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setOnlineBreakdownModal(null)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {questions.map((q, qIdx) => {
                  const chosen = answers[q.id];
                  const isCorrect = chosen === q.correctOption;
                  const isUnattempted = !chosen;

                  return (
                    <div 
                      key={q.id || qIdx}
                      className={`p-4 rounded-2xl border ${
                        isCorrect ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' :
                        isUnattempted ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700' :
                        'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          Q{qIdx + 1}. {q.text}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCorrect ? 'bg-emerald-500 text-white' :
                          isUnattempted ? 'bg-slate-400 text-white' :
                          'bg-rose-500 text-white'
                        }`}>
                          {isCorrect ? 'Correct (+4)' : isUnattempted ? 'Unattempted (0)' : 'Incorrect (-1)'}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {(q.options || []).map((opt) => {
                          const isThisChosen = chosen === opt.id;
                          const isThisCorrect = q.correctOption === opt.id;

                          return (
                            <div 
                              key={opt.id}
                              className={`p-2.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
                                isThisCorrect 
                                  ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : isThisChosen
                                  ? 'bg-rose-100/70 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 font-bold'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span>{opt.id}. {opt.text}</span>
                              {isThisCorrect && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">✔ Correct Answer</span>}
                              {isThisChosen && !isThisCorrect && <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">✖ Student Choice</span>}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong className="text-slate-800 dark:text-slate-200 font-bold">Faculty Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
