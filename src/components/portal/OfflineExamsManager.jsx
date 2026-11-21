import { useState, useEffect } from 'react';
import { 
  Award,
  Zap,
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Camera, 
  Upload, 
  X, 
  Eye, 
  Download, 
  ChevronRight,
  TrendingUp,
  BookOpen,
  Filter,
  Check,
  UserCheck
} from 'lucide-react';
import { api } from '../../api/client';

export default function OfflineExamsManager({
  currentRole = 'admin',
  currentUserName = 'Faculty',
  students = [],
  onDataChanged
}) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [allStudents, setAllStudents] = useState(students || []);

  // Sync / Fallback fetch students if prop is empty
  useEffect(() => {
    if (Array.isArray(students) && students.length > 0) {
      setAllStudents(students);
    } else {
      api.getStudents().then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setAllStudents(res);
        }
      }).catch(err => console.warn('Failed to fetch students:', err));
    }
  }, [students]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeGradingExam, setActiveGradingExam] = useState(null);
  const [studentMarksMap, setStudentMarksMap] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Form for new offline exam
  const [newExam, setNewExam] = useState({
    title: '',
    subject: 'Mathematics',
    grade: 'Class 10',
    batch: 'Class 10th',
    date: new Date().toISOString().split('T')[0],
    maxMarks: 50,
    passingMarks: 20,
    type: 'Offline Classroom Test'
  });

  const loadOfflineTests = async () => {
    try {
      setLoading(true);
      const data = await api.getTests();
      if (Array.isArray(data)) {
        setTests(data);
      }
    } catch (err) {
      console.warn('Failed to load offline tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfflineTests();
  }, []);

  // Standard subjects list
  const SUBJECTS = [
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Social Studies',
    'English',
    'Commerce & Accounts',
    'Economics'
  ];

  // Standard Classes
  const CLASSES = [
    'All',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12'
  ];

  // Helper: clean grade string
  const cleanGrade = (g) => {
    if (!g) return '';
    return String(g).toLowerCase().replace(/class/g, '').replace(/(th|st|nd|rd)/g, '').trim();
  };

  // Helper: check if a student belongs to target grade
  const matchesClass = (student, gradeStr) => {
    if (!student) return false;
    if (!gradeStr || gradeStr === 'All' || gradeStr === 'All Classes') return true;
    const tGrade = cleanGrade(gradeStr);
    if (!tGrade) return true;
    const sGrade = cleanGrade(student.grade || student.class);
    const sBatch = cleanGrade(student.batch);
    const sStream = (student.stream || '').toLowerCase();
    return sGrade === tGrade || sGrade.includes(tGrade) || sBatch.includes(tGrade) || sStream.includes(tGrade);
  };

  const safeTests = Array.isArray(tests) ? tests : [];
  const safeStudents = Array.isArray(allStudents) ? allStudents : [];

  // Filtered tests
  const filteredTests = safeTests.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (t.title && t.title.toLowerCase().includes(q)) || 
      (t.subject && t.subject.toLowerCase().includes(q));

    let matchesGrade = true;
    if (gradeFilter !== 'All') {
      const tg = cleanGrade(t.grade || t.batch);
      const fg = cleanGrade(gradeFilter);
      matchesGrade = tg === fg || tg.includes(fg) || fg.includes(tg);
    }
    return matchesSearch && matchesGrade;
  });

  // Calculate totals
  const totalExamsCount = safeTests.length;
  const totalSheetsUploaded = safeTests.reduce((acc, t) => {
    const evaluated = (t.results || []).filter(r => r.documentUrl || (r.documents && r.documents.length > 0));
    return acc + evaluated.length;
  }, 0);

  // Open Grading Drawer for a test
  const handleOpenGrading = (test) => {
    setActiveGradingExam(test);
    const initialMap = {};
    const relevantStudents = safeStudents.filter(s => matchesClass(s, test.grade || test.batch));

    relevantStudents.forEach(s => {
      const existing = (test.results || []).find(r => 
        (r.studentId && r.studentId.toString().toLowerCase() === (s.id || '').toString().toLowerCase()) ||
        (r.studentId && r.studentId.toString().toLowerCase() === (s.rollNo || '').toString().toLowerCase()) ||
        (r.studentName && r.studentName.toString().toLowerCase() === (s.name || '').toString().toLowerCase())
      );

      if (existing) {
        initialMap[s.id] = {
          marksObtained: existing.marksObtained !== undefined ? existing.marksObtained : '',
          remarks: existing.remarks || existing.feedback || '',
          documentUrl: existing.documentUrl || '',
          documentName: existing.documentName || '',
          documentType: existing.documentType || 'image',
          documents: existing.documents || []
        };
      } else {
        initialMap[s.id] = {
          marksObtained: '',
          remarks: '',
          documentUrl: '',
          documentName: '',
          documentType: 'image',
          documents: []
        };
      }
    });

    setStudentMarksMap(initialMap);
  };

  // Handle Photo Click or Image Upload
  const handleUploadPhoto = (studentId, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          setStudentMarksMap(prev => {
            const current = prev[studentId] || { documents: [] };
            const existingDocs = Array.isArray(current.documents) ? current.documents : [];
            const newDoc = {
              name: file.name || `Checked Sheet Page ${existingDocs.length + 1}`,
              url: dataUrl,
              type: 'image'
            };
            return {
              ...prev,
              [studentId]: {
                ...current,
                documentUrl: dataUrl,
                documentName: file.name,
                documentType: 'image',
                documents: [...existingDocs, newDoc]
              }
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Handle PDF Upload
  const handleUploadPdf = (studentId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setStudentMarksMap(prev => {
          const current = prev[studentId] || { documents: [] };
          const existingDocs = Array.isArray(current.documents) ? current.documents : [];
          const newDoc = {
            name: file.name,
            url: dataUrl,
            type: 'pdf'
          };
          return {
            ...prev,
            [studentId]: {
              ...current,
              documentUrl: dataUrl,
              documentName: file.name,
              documentType: 'pdf',
              documents: [...existingDocs, newDoc]
            }
          };
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove uploaded document
  const handleRemoveDoc = (studentId, docIndex = null) => {
    setStudentMarksMap(prev => {
      const current = prev[studentId];
      if (!current) return prev;

      if (docIndex !== null && Array.isArray(current.documents)) {
        const nextDocs = current.documents.filter((_, idx) => idx !== docIndex);
        return {
          ...prev,
          [studentId]: {
            ...current,
            documentUrl: nextDocs.length > 0 ? nextDocs[0].url : '',
            documentName: nextDocs.length > 0 ? nextDocs[0].name : '',
            documentType: nextDocs.length > 0 ? nextDocs[0].type : 'image',
            documents: nextDocs
          }
        };
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          documentUrl: '',
          documentName: '',
          documentType: 'image',
          documents: []
        }
      };
    });
  };

  // Save Graded Test & Uploaded Answer Sheets
  const handleSaveGrading = async () => {
    if (!activeGradingExam) return;
    try {
      setIsSaving(true);
      const relevantStudents = safeStudents.filter(s => matchesClass(s, activeGradingExam.grade || activeGradingExam.batch));
      const maxMarks = Number(activeGradingExam.maxMarks) || 50;

      const resultsList = [];
      relevantStudents.forEach(s => {
        const entry = studentMarksMap[s.id];
        if (entry && entry.marksObtained !== '' && entry.marksObtained !== null && entry.marksObtained !== undefined) {
          const marks = Number(entry.marksObtained);
          const percentage = Number(((marks / maxMarks) * 100).toFixed(1));
          resultsList.push({
            studentId: s.id,
            studentName: s.name,
            rollNo: s.rollNo || s.id,
            grade: s.grade || activeGradingExam.grade,
            marksObtained: marks,
            maxMarks,
            percentage,
            remarks: entry.remarks || entry.feedback || '',
            feedback: entry.remarks || entry.feedback || '',
            documentUrl: entry.documentUrl || '',
            documentName: entry.documentName || '',
            documentType: entry.documentType || 'image',
            documents: entry.documents || (entry.documentUrl ? [{ name: entry.documentName || 'Checked Answer Sheet', url: entry.documentUrl, type: entry.documentType }] : []),
            evaluatedAt: new Date().toISOString(),
            evaluatedBy: currentUserName
          });
        }
      });

      // Sort descending by marks for rank calculation
      resultsList.sort((a, b) => b.marksObtained - a.marksObtained);
      resultsList.forEach((r, idx) => {
        r.rank = idx + 1;
      });

      const highestScore = resultsList.length > 0 ? Math.max(...resultsList.map(r => r.marksObtained)) : 0;
      const totalScore = resultsList.reduce((acc, r) => acc + r.marksObtained, 0);
      const avgMarks = resultsList.length > 0 ? Number((totalScore / resultsList.length).toFixed(1)) : 0;

      const payload = {
        ...activeGradingExam,
        results: resultsList,
        highestMarks: highestScore,
        avgMarks
      };

      await api.updateTest(activeGradingExam.id, payload);
      setStatusMsg(`Marks and answer sheets saved for "${activeGradingExam.title}"! Student portals updated.`);
      setTimeout(() => setStatusMsg(''), 4000);
      setActiveGradingExam(null);
      await loadOfflineTests();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Error saving marks and answer sheets.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Question Paper File Upload for the whole batch
  const handleQuestionPaperUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setNewExam(prev => ({
          ...prev,
          questionPaperUrl: dataUrl,
          questionPaperName: file.name,
          questionPaperType: isPdf ? 'pdf' : 'image'
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Create New Offline Exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExam.title.trim()) {
      alert('Please enter a test title.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: newExam.title.trim(),
        subject: newExam.subject,
        grade: newExam.grade,
        batch: newExam.grade,
        date: newExam.date,
        maxMarks: Number(newExam.maxMarks) || 50,
        passingMarks: Number(newExam.passingMarks) || 20,
        type: newExam.type || 'Offline Classroom Test',
        questionPaperUrl: newExam.questionPaperUrl || null,
        questionPaperName: newExam.questionPaperName || null,
        questionPaperType: newExam.questionPaperType || null,
        createdBy: currentUserName,
        createdAt: new Date().toISOString(),
        results: []
      };

      const created = await api.addTest(payload);
      const testObj = created?.test || payload;
      setStatusMsg(`New exam "${newExam.title}" conducted! Enter marks and upload student answer sheets below.`);
      setTimeout(() => setStatusMsg(''), 4000);
      setIsCreateModalOpen(false);
      setNewExam({
        title: '',
        subject: 'Mathematics',
        grade: 'Class 10',
        batch: 'Class 10th',
        date: new Date().toISOString().split('T')[0],
        maxMarks: 50,
        passingMarks: 20,
        type: 'Offline Classroom Test',
        questionPaperUrl: null,
        questionPaperName: null,
        questionPaperType: null
      });
      await loadOfflineTests();
      if (onDataChanged) onDataChanged();
      handleOpenGrading(testObj);
    } catch (err) {
      alert(err.message || 'Error creating offline exam.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Exam
  const handleDeleteExam = async (id, title) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This will remove all student marks and uploaded documents for this test.`);
    if (!confirmed) return;

    try {
      await api.deleteTest(id);
      setStatusMsg(`Exam "${title}" deleted.`);
      setTimeout(() => setStatusMsg(''), 3000);
      await loadOfflineTests();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Failed to delete test.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1976d2] dark:text-blue-400 text-xs font-bold mb-2 border border-blue-200 dark:border-blue-900">
              <Zap className="w-3.5 h-3.5" />
              <span>Offline Center Sunday Exams & Marks Vault</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Classroom Exams & Checked Answer Sheets
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Conduct pen-and-paper Sunday tests, enter student marks (out of total marks), click photos or upload PDF answer sheets, and publish to student portals.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-center px-2">
                <div className="text-lg font-black text-[#1976d2] dark:text-blue-400">{totalExamsCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Exams</div>
              </div>
              <div className="w-px h-7 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center px-2">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{totalSheetsUploaded}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Sheets Uploaded</div>
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#1976d2] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Conduct New Offline Exam</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          {/* Class Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => setGradeFilter(cls)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  gradeFilter === cls
                    ? 'bg-[#1976d2] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cls === 'All' ? 'All Classes' : cls}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search test title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
            />
          </div>
        </div>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-spin text-[#1976d2]" />
          <div className="text-xs font-bold">Loading offline exam records...</div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Award className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Offline Exams Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || gradeFilter !== 'All' 
              ? 'No exams match your selected filter.' 
              : 'Click "+ Conduct New Offline Exam" to record a center mock test and upload evaluated student answer sheets.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTests.map((test) => {
            const results = Array.isArray(test.results) ? test.results : [];
            const evaluatedCount = results.length;
            const relevantStudentsCount = (allStudents || []).filter(s => matchesClass(s, test.grade || test.batch)).length;
            const sheetsCount = results.filter(r => r.documentUrl || (r.documents && r.documents.length > 0)).length;

            return (
              <div
                key={test.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-100 dark:bg-blue-900/50 text-[#1976d2] dark:text-blue-400">
                        {test.subject || 'Mathematics'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {test.grade || 'Class 10'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {test.date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteExam(test.id, test.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {test.title}
                  </h3>

                  {/* Exam Specs Box */}
                  <div className="grid grid-cols-4 gap-2 mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Max Marks</div>
                      <div className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{test.maxMarks} Pts</div>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Graded</div>
                      <div className="text-xs font-black text-[#1976d2] dark:text-blue-400 mt-0.5">{evaluatedCount} / {relevantStudentsCount || evaluatedCount}</div>
                    </div>
                    <div className="border-r border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Highest</div>
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{test.highestMarks || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Sheets</div>
                      <div className="text-xs font-black text-purple-600 dark:text-purple-400 mt-0.5">{sheetsCount} 📄</div>
                    </div>
                  </div>

                  {/* Quick Student Roster Preview */}
                  {results.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Top Student Scores in this Test:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {results.slice(0, 4).map((r, idx) => (
                          <span
                            key={idx}
                            onClick={() => {
                              const hasDocs = r.documentUrl || (Array.isArray(r.documents) && r.documents.length > 0);
                              if (hasDocs) {
                                const docs = Array.isArray(r.documents) && r.documents.length > 0 
                                  ? r.documents 
                                  : (r.documentUrl ? [{ name: r.documentName || 'Checked Answer Sheet', url: r.documentUrl, type: r.documentType || 'image' }] : []);
                                setPreviewDocument({
                                  title: test.title,
                                  studentName: r.studentName,
                                  marks: `${r.marksObtained} / ${test.maxMarks}`,
                                  remarks: r.remarks,
                                  url: docs[0]?.url || r.documentUrl || '',
                                  type: docs[0]?.type || r.documentType || 'image',
                                  documents: docs
                                });
                              }
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                              (r.documentUrl || (Array.isArray(r.documents) && r.documents.length > 0))
                                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span>#{r.rank} {r.studentName}</span>
                            <strong className="text-slate-900 dark:text-white">({r.marksObtained}/{test.maxMarks})</strong>
                            {r.documentUrl && <FileText className="w-3 h-3 text-purple-600" />}
                          </span>
                        ))}
                        {results.length > 4 && (
                          <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            +{results.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenGrading(test)}
                    className="w-full py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Enter Marks & Upload Answer Sheets</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CONDUCT NEW OFFLINE EXAM                                         */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#1976d2] dark:text-blue-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Conduct New Offline Classroom Exam
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                  Exam Title / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunday Classroom Test 4 - Quadratic Equations & Trigonometry"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#1976d2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                    Subject
                  </label>
                  <select
                    value={newExam.subject}
                    onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#1976d2]"
                  >
                    {SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                    Target Class / Batch
                  </label>
                  <select
                    value={newExam.grade}
                    onChange={(e) => setNewExam({ ...newExam, grade: e.target.value, batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#1976d2]"
                  >
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="All Classes">All Classes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                  Upload Question Paper (PDF / Photo, Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleQuestionPaperUpload}
                    className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#1976d2] hover:file:bg-blue-100 cursor-pointer"
                  />
                  {newExam.questionPaperName && (
                    <span className="text-[11px] text-emerald-600 font-bold truncate">
                      ✓ {newExam.questionPaperName}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                    Total Marks (Out Of)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newExam.maxMarks}
                    onChange={(e) => setNewExam({ ...newExam, maxMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newExam.passingMarks}
                    onChange={(e) => setNewExam({ ...newExam, passingMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Creating Exam...' : 'Create Exam & Open Grading'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ENTER MARKS & UPLOAD CHECKED SHEETS (PHOTO / PDF)               */}
      {/* ========================================================================= */}
      {activeGradingExam && (() => {
        const relevantStudents = safeStudents.filter(s => matchesClass(s, activeGradingExam.grade || activeGradingExam.batch));
        const maxMarks = Number(activeGradingExam.maxMarks) || 50;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between gap-4 shrink-0 border-b border-slate-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#1976d2] text-white">
                      {activeGradingExam.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {activeGradingExam.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Max Score: {maxMarks} Marks
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black truncate mt-1">{activeGradingExam.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter student marks, click photos or upload checked answer sheet PDFs. Saved marks immediately update student portals.
                  </p>
                </div>

                <button
                  onClick={() => setActiveGradingExam(null)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Student Evaluation Table */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
                {relevantStudents.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    No students currently registered in {activeGradingExam.grade}.
                  </div>
                ) : (
                  relevantStudents.map((s, idx) => {
                    const entry = studentMarksMap[s.id] || { marksObtained: '', remarks: '', documents: [] };
                    const hasMarks = entry.marksObtained !== '' && entry.marksObtained !== null && entry.marksObtained !== undefined;
                    const marksNum = Number(entry.marksObtained) || 0;
                    const pct = hasMarks ? Number(((marksNum / maxMarks) * 100).toFixed(1)) : null;
                    const isPassed = pct !== null && pct >= 40;
                    const docsList = Array.isArray(entry.documents) ? entry.documents : (entry.documentUrl ? [{ name: entry.documentName || 'Answer Sheet', url: entry.documentUrl, type: entry.documentType }] : []);

                    return (
                      <div
                        key={s.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-3"
                      >
                        {/* Student Info & Marks Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#1976d2] dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                              {s.rollNo || idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{s.name}</span>
                                <span className="text-[11px] font-mono text-slate-400">({s.rollNo})</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Class: {s.grade || activeGradingExam.grade}
                              </div>
                            </div>
                          </div>

                          {/* Marks Input & Percentage */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                              <span className="text-xs font-bold text-slate-500">Marks:</span>
                              <input
                                type="number"
                                min="0"
                                max={maxMarks}
                                placeholder="0"
                                value={entry.marksObtained}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Math.min(maxMarks, Math.max(0, Number(e.target.value)));
                                  setStudentMarksMap(prev => ({
                                    ...prev,
                                    [s.id]: {
                                      ...prev[s.id],
                                      marksObtained: val
                                    }
                                  }));
                                }}
                                className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm font-black text-slate-900 dark:text-white text-center focus:outline-none focus:border-[#1976d2]"
                              />
                              <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
                            </div>

                            {hasMarks && (
                              <div className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                                isPassed
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}>
                                {pct}%
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Document Upload Buttons & Thumbnails */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              Checked Answer Sheet:
                            </span>

                            {/* Camera / Photo Button */}
                            <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1976d2] dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/80 font-bold text-xs flex items-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800">
                              <Camera className="w-3.5 h-3.5" />
                              <span>Click Photo / Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                className="hidden"
                                onChange={(e) => handleUploadPhoto(s.id, e)}
                              />
                            </label>

                            {/* PDF Button */}
                            <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/80 font-bold text-xs flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Upload PDF</span>
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => handleUploadPdf(s.id, e)}
                              />
                            </label>
                          </div>

                          {/* Uploaded Documents Badges & Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {docsList.map((doc, dIdx) => (
                              <div
                                key={dIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs shadow-xs"
                              >
                                {doc.type === 'pdf' ? (
                                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                                ) : (
                                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                                )}
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                  {doc.name || `Sheet ${dIdx + 1}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDocument({
                                    title: activeGradingExam.title,
                                    studentName: s.name,
                                    marks: hasMarks ? `${marksNum} / ${maxMarks}` : 'Ungraded',
                                    remarks: entry.remarks,
                                    url: doc.url,
                                    type: doc.type,
                                    documents: docsList
                                  })}
                                  className="text-[#1976d2] dark:text-blue-400 hover:underline font-bold text-[11px] ml-1 cursor-pointer"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDoc(s.id, dIdx)}
                                  className="text-slate-400 hover:text-rose-500 font-bold text-xs cursor-pointer ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            {docsList.length === 0 && (
                              <span className="text-[11px] text-slate-400 italic">No document attached yet</span>
                            )}
                          </div>
                        </div>

                        {/* Teacher Remarks / Feedback */}
                        <div>
                          <input
                            type="text"
                            placeholder="Teacher feedback / remarks (e.g. 'Good presentation, revise step 3 in theorem')..."
                            value={entry.remarks || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setStudentMarksMap(prev => ({
                                ...prev,
                                [s.id]: {
                                  ...prev[s.id],
                                  remarks: val
                                }
                              }));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1976d2]"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer with Save Button */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Marks and answer sheets are automatically calculated with rank and published to student portals.
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveGradingExam(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveGrading}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSaving ? 'Publishing Results...' : 'Save & Publish Evaluated Marks'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 3: CHECKED ANSWER SHEET PREVIEW MODAL (PHOTO / PDF)                 */}
      {/* ========================================================================= */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-600 text-white">
                    Evaluated Answer Paper
                  </span>
                  <h4 className="text-sm sm:text-base font-black truncate">{previewDocument.studentName}</h4>
                  <span className="text-xs text-emerald-400 font-bold">({previewDocument.marks})</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{previewDocument.title}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDocument.url}
                  download={`answer_sheet_${previewDocument.studentName}.jpg`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex items-center justify-center">
              {!previewDocument.url ? (
                <div className="text-center p-8 text-slate-400 text-xs">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <div>No scanned document or answer sheet file attached yet for this record.</div>
                </div>
              ) : previewDocument.type === 'pdf' || (previewDocument.url && previewDocument.url.startsWith('data:application/pdf')) ? (
                <iframe
                  src={previewDocument.url}
                  title="Answer Sheet PDF"
                  className="w-full h-full min-h-[60vh] rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <div className="space-y-4 max-w-3xl w-full text-center">
                  <img
                    src={previewDocument.url}
                    alt="Checked Answer Sheet"
                    className="max-h-[70vh] w-auto mx-auto object-contain rounded-xl shadow-lg border border-slate-800"
                  />
                  {previewDocument.documents && previewDocument.documents.length > 1 && (
                    <div className="flex justify-center gap-2 pt-2">
                      {previewDocument.documents.map((d, dIdx) => (
                        <button
                          key={dIdx}
                          onClick={() => setPreviewDocument(prev => ({ ...prev, url: d.url, type: d.type }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            previewDocument.url === d.url
                              ? 'bg-[#1976d2] text-white'
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

            {/* Footer with Remarks */}
            {previewDocument.remarks && (
              <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-amber-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Teacher Remarks: <strong>{previewDocument.remarks}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
