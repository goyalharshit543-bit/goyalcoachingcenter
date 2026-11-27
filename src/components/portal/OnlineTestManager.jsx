import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Search, 
  Filter, 
  Award, 
  User, 
  BookOpen, 
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Calendar,
  Check,
  Zap,
  BarChart2,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { api } from '../../api/client';
import { isSameClass } from '../../utils/classMatcher';

export default function OnlineTestManager({ 
  currentRole = 'admin', 
  currentUserName = 'Faculty', 
  students = [], 
  onDataChanged 
}) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'upcoming' | 'closed'

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Attempts / Leaderboard modal state
  const [activeResultsTest, setActiveResultsTest] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Science',
    grade: 'Class 10',
    batch: 'Class 10 Board Champions',
    durationMinutes: 30,
    status: 'active',
    startTime: '',
    endTime: '',
    positiveMarks: 4,
    negativeMarks: 1,
    instructions: 'Each correct answer carries +4 marks, -1 for incorrect. Choose the single best option.',
    questions: []
  });

  // Current Question Editing within modal
  const [currentQ, setCurrentQ] = useState({
    text: '',
    image: '',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' }
    ],
    correctOption: 'A',
    explanation: ''
  });

  const questionImageInputRef = useRef(null);

  // Load tests
  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await api.getOnlineTests();
      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load online tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  // Filter tests
  const filteredTests = tests.filter(t => {
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.instructions || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = 
      gradeFilter === 'All' || 
      t.grade === 'All Classes' || 
      isSameClass(t.grade, gradeFilter);

    let matchesStatus = true;
    const now = new Date();
    const isPastEnd = t.endTime && new Date(t.endTime) < now;
    const isFutureStart = t.startTime && new Date(t.startTime) > now;

    if (statusFilter === 'active') {
      matchesStatus = t.status === 'active' || (!isPastEnd && !isFutureStart && t.status !== 'closed');
    } else if (statusFilter === 'upcoming') {
      matchesStatus = t.status === 'upcoming' || isFutureStart;
    } else if (statusFilter === 'closed') {
      matchesStatus = t.status === 'closed' || isPastEnd;
    }

    return matchesSearch && matchesGrade && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTest(null);
    const now = new Date();
    const startTime = now.toISOString().slice(0, 16);
    const endTime = new Date(now.getTime() + 4 * 86400000).toISOString().slice(0, 16);

    setFormData({
      title: '',
      subject: 'Science',
      grade: 'Class 10',
      batch: 'Class 10 Board Champions',
      durationMinutes: 30,
      status: 'active',
      startTime,
      endTime,
      positiveMarks: 4,
      negativeMarks: 1,
      instructions: 'Each correct answer carries +4 marks, -1 for incorrect. Timer will auto-submit when duration finishes.',
      questions: []
    });

    setCurrentQ({
      text: '',
      image: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ],
      correctOption: 'A',
      explanation: ''
    });

    setStatusMsg('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (t) => {
    setEditingTest(t);
    setFormData({
      title: t.title || '',
      subject: t.subject || 'Science',
      grade: t.grade || 'Class 10',
      batch: t.batch || '',
      durationMinutes: t.durationMinutes || 30,
      status: t.status || 'active',
      startTime: t.startTime ? new Date(t.startTime).toISOString().slice(0, 16) : '',
      endTime: t.endTime ? new Date(t.endTime).toISOString().slice(0, 16) : '',
      positiveMarks: t.positiveMarks !== undefined ? t.positiveMarks : 4,
      negativeMarks: t.negativeMarks !== undefined ? t.negativeMarks : 1,
      instructions: t.instructions || '',
      questions: Array.isArray(t.questions) ? [...t.questions] : []
    });

    setCurrentQ({
      text: '',
      image: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ],
      correctOption: 'A',
      explanation: ''
    });

    setStatusMsg('');
    setIsFormModalOpen(true);
  };

  // Handle Question Picture Upload
  const handleQuestionImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCurrentQ(prev => ({
          ...prev,
          image: event.target.result
        }));
      }
    };
    reader.readAsDataURL(file);
    if (questionImageInputRef.current) questionImageInputRef.current.value = '';
  };

  // Add Question to Form List
  const handleAddQuestionToList = () => {
    if (!currentQ.text.trim()) {
      alert('Please enter question text before adding.');
      return;
    }

    const hasEmptyOption = currentQ.options.some(opt => !opt.text.trim());
    if (hasEmptyOption) {
      alert('Please fill in all 4 options (A, B, C, and D).');
      return;
    }

    const newQuestion = {
      id: `Q${formData.questions.length + 1}`,
      text: currentQ.text.trim(),
      image: currentQ.image || '',
      options: currentQ.options.map(o => ({ id: o.id, text: o.text.trim() })),
      correctOption: currentQ.correctOption || 'A',
      explanation: (currentQ.explanation || '').trim()
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset current question input
    setCurrentQ({
      text: '',
      image: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ],
      correctOption: 'A',
      explanation: ''
    });
  };

  // Remove question from list
  const handleRemoveQuestion = (idx) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  // Save Test
  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter test title.');
      return;
    }

    // If there is an unsaved question in progress, add it automatically
    let finalQuestions = [...formData.questions];
    if (currentQ.text.trim() && !currentQ.options.some(o => !o.text.trim())) {
      finalQuestions.push({
        id: `Q${finalQuestions.length + 1}`,
        text: currentQ.text.trim(),
        image: currentQ.image || '',
        options: currentQ.options.map(o => ({ id: o.id, text: o.text.trim() })),
        correctOption: currentQ.correctOption || 'A',
        explanation: (currentQ.explanation || '').trim()
      });
    }

    if (finalQuestions.length === 0) {
      alert('Please add at least 1 question to the test.');
      return;
    }

    try {
      setIsSaving(true);
      setStatusMsg('');

      const payload = {
        ...formData,
        questions: finalQuestions,
        createdBy: editingTest?.createdBy || currentUserName || 'Faculty Desk'
      };

      if (editingTest) {
        await api.updateOnlineTest(editingTest.id, payload);
        setStatusMsg('Olympiad test updated successfully!');
      } else {
        await api.addOnlineTest(payload);
        setStatusMsg('Olympiad test published successfully for students!');
      }

      await loadTests();
      if (onDataChanged) onDataChanged();

      setTimeout(() => {
        setIsFormModalOpen(false);
        setStatusMsg('');
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to save test');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Test
  const handleDeleteTest = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete this test:\n\n"${title}"?\n\nAll student attempt scores for this test will also be deleted.`)) {
      return;
    }
    try {
      await api.deleteOnlineTest(id);
      await loadTests();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Failed to delete test');
    }
  };

  // Toggle Test Status quickly (Active / Upcoming / Closed)
  const handleQuickStatusToggle = async (t, newStatus) => {
    try {
      await api.updateOnlineTest(t.id, { status: newStatus });
      await loadTests();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* 1. TOP HEADER & METRIC SUMMARY                                     */}
      {/* ================================================================= */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1976d2] dark:text-blue-400 text-xs font-bold mb-2 border border-blue-200 dark:border-blue-800">
            <Zap className="w-3.5 h-3.5" />
            <span>Olympiad & Foundation MCQ Online Testing Engine</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-outfit">
            MCQ Test Control Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Schedule Upcoming tests, manage live Active tests with timers, view Completed student scorecards, and provide Missed tests for student practice.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadTests}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh tests"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Olympiad MCQ Test</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Active Live Tests</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {tests.filter(t => t.status === 'active').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Timer enabled for students</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400">Upcoming Tests</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {tests.filter(t => t.status === 'upcoming').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scheduled on calendar</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-amber-500">Closed / Missed Tests</div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {tests.filter(t => t.status === 'closed' || (t.endTime && new Date(t.endTime) < new Date())).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Available for student practice</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-purple-500">Student Attempts</div>
          <div className="text-2xl font-black text-purple-500 mt-1">
            {tests.reduce((acc, curr) => acc + (curr.attempts?.length || 0), 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scorecards evaluated</div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CONTROLS: SEARCH, STATUS TABS & CLASS FILTER                   */}
      {/* ================================================================= */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Tests' },
            { id: 'active', label: '🟢 Active Tests' },
            { id: 'upcoming', label: '⏳ Upcoming Tests' },
            { id: 'closed', label: '📋 Closed / Practice' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#1976d2] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Class Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1976d2]"
            />
          </div>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Classes</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. TESTS LIST                                                      */}
      {/* ================================================================= */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1976d2]" />
          <span>Loading Olympiad tests...</span>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Tests Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || gradeFilter !== 'All' || statusFilter !== 'all'
              ? 'No tests match your selected filter.'
              : 'Click "+ Create Olympiad MCQ Test" above to build online Olympiad tests with diagrams and explanations.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTests.map((test) => {
            const questions = Array.isArray(test.questions) ? test.questions : [];
            const attempts = Array.isArray(test.attempts) ? test.attempts : [];
            const isLive = test.status === 'active';
            const isUpcoming = test.status === 'upcoming';
            const isClosed = test.status === 'closed' || (test.endTime && new Date(test.endTime) < new Date());

            return (
              <div 
                key={test.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top Bar: Badges & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#1976d2] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {test.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {test.grade}
                      </span>

                      {/* Status Tag */}
                      {isLive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active / Live</span>
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                          Upcoming
                        </span>
                      )}
                      {isClosed && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          Closed (Practice Mode)
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(test)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1976d2] hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer transition-colors"
                        title="Edit Test & Questions"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.id, test.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer transition-colors"
                        title="Delete Test"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Details */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                    {test.title}
                  </h3>

                  {test.instructions && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {test.instructions}
                    </p>
                  )}

                  {/* Timing & Scoring details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <div className="text-[10px] text-slate-400">Duration</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{test.durationMinutes} Mins</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <div className="text-[10px] text-slate-400">Questions</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{questions.length} Qs</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <div className="text-[10px] text-slate-400">Marking</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+{test.positiveMarks} / -{test.negativeMarks}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <div className="text-[10px] text-slate-400">Max Score</div>
                      <div className="text-xs font-bold text-[#1976d2] dark:text-blue-400 mt-0.5">{test.totalMarks} Marks</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Attempts & Quick State Switcher */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveResultsTest(test)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1976d2] dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'} & Leaderboard</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Quick Status Buttons */}
                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <span className="text-[10px] text-slate-400 mr-1">Set Status:</span>
                    <button
                      onClick={() => handleQuickStatusToggle(test, 'active')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        test.status === 'active' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-600'
                      }`}
                      title="Make Active now"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleQuickStatusToggle(test, 'upcoming')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        test.status === 'upcoming' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600'
                      }`}
                      title="Mark as Upcoming"
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => handleQuickStatusToggle(test, 'closed')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        test.status === 'closed' 
                          ? 'bg-slate-700 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'
                      }`}
                      title="Close test & make it practice mode"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. MODAL: CREATE / EDIT MCQ TEST & QUESTION BUILDER               */}
      {/* ================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1976d2]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingTest ? 'Edit Olympiad MCQ Test' : 'Create New Olympiad MCQ Test'}
                </h3>
              </div>
              <button
                onClick={() => !isSaving && setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{statusMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveTest} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 National Science Olympiad (NSO) Mock Test 1"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                />
              </div>

              {/* Subject, Grade, Duration, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  >
                    <option value="Science">Science (General)</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Commerce (Accounts)">Commerce (Accounts)</option>
                    <option value="Commerce (Economics)">Commerce (Economics)</option>
                    <option value="Foundation">Foundation Olympiad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Target Class *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  >
                    <option value="active">🟢 Active (Live Now)</option>
                    <option value="upcoming">⏳ Upcoming (Scheduled)</option>
                    <option value="closed">📋 Closed (Practice Only)</option>
                  </select>
                </div>
              </div>

              {/* Start & End Deadlines, Positive & Negative Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Start Window
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    End Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Correct (+ Marks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.positiveMarks}
                    onChange={(e) => setFormData({ ...formData, positiveMarks: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Wrong (- Deduct)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* ========================================================= */}
              {/* QUESTION BUILDER BOX                                      */}
              {/* ========================================================= */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-950 border border-blue-200 dark:border-blue-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1976d2] flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Add New Question (Total in Test: {formData.questions.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Question #{formData.questions.length + 1}
                  </span>
                </div>

                {/* Question Statement */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Type the Olympiad question statement here..."
                    value={currentQ.text}
                    onChange={(e) => setCurrentQ({ ...currentQ, text: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Optional Question Diagram / Picture */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#1976d2]" />
                      <span>Optional Diagram / Picture for this Question</span>
                    </span>
                    {currentQ.image && (
                      <button
                        type="button"
                        onClick={() => setCurrentQ({ ...currentQ, image: '' })}
                        className="text-[10px] text-rose-500 hover:underline font-bold"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={questionImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQuestionImageUpload}
                      className="hidden"
                      id="q-image-upload"
                    />
                    <label
                      htmlFor="q-image-upload"
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1976d2] dark:text-blue-300 text-xs font-semibold cursor-pointer border border-blue-200 dark:border-blue-800 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Diagram from Device</span>
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={currentQ.image}
                      onChange={(e) => setCurrentQ({ ...currentQ, image: e.target.value })}
                      className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>

                  {currentQ.image && (
                    <div className="w-32 h-24 rounded-lg overflow-hidden border border-slate-300 mt-1">
                      <img src={currentQ.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* 4 Options (A, B, C, D) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQ.options.map((opt, oIdx) => (
                    <div key={opt.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input
                        type="radio"
                        name="correct-option-group"
                        checked={currentQ.correctOption === opt.id}
                        onChange={() => setCurrentQ({ ...currentQ, correctOption: opt.id })}
                        className="w-4 h-4 text-[#1976d2] cursor-pointer"
                        title={`Select option ${opt.id} as the correct answer`}
                      />
                      <span className="font-bold text-xs text-[#1976d2] w-5 text-center">
                        {opt.id}.
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${opt.id} statement...`}
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...currentQ.options];
                          updated[oIdx].text = e.target.value;
                          setCurrentQ({ ...currentQ, options: updated });
                        }}
                        className="flex-1 p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Marked Correct Answer: <strong className="text-emerald-700">Option {currentQ.correctOption}</strong> (Click radio button on correct option)</span>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Solution / Explanation (Shown to students after submission or in practice mode)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Using formula 1/f = 1/v + 1/u, v = -24cm, magnification m = -v/u = -2."
                    value={currentQ.explanation}
                    onChange={(e) => setCurrentQ({ ...currentQ, explanation: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                {/* Add Question Button */}
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddQuestionToList}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question to Test</span>
                  </button>
                </div>
              </div>

              {/* List of Questions Added so far */}
              {formData.questions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Questions In This Test ({formData.questions.length}):</span>
                    <span className="text-[#1976d2] font-semibold text-[11px]">
                      Total: {formData.questions.length * (formData.positiveMarks || 4)} Marks
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {formData.questions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">
                            Q{idx + 1}. {q.text}
                          </div>
                          {q.image && (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">
                              [Diagram Attached]
                            </span>
                          )}
                          <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                            Correct Option: {q.correctOption}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingTest ? 'Save Test Changes' : 'Publish Olympiad Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. MODAL: STUDENT ATTEMPTS & SCORECARD LEADERBOARD                */}
      {/* ================================================================= */}
      {activeResultsTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#1976d2]">
                    {activeResultsTest.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {activeResultsTest.grade}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Scorecard & Attempts: {activeResultsTest.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Total Questions: {(activeResultsTest.questions || []).length} • Max Marks: {activeResultsTest.totalMarks}
                </p>
              </div>

              <button
                onClick={() => setActiveResultsTest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attempts Table */}
            <div className="overflow-y-auto flex-1">
              {(activeResultsTest.attempts || []).length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No students have completed this test yet. When students finish the test, their score and accuracy will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1976d2] text-white font-bold text-[11px] uppercase">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Roll No</th>
                        <th className="p-3 text-center">Score</th>
                        <th className="p-3 text-center">Accuracy</th>
                        <th className="p-3 text-center">Correct / Wrong</th>
                        <th className="p-3">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {[...(activeResultsTest.attempts || [])]
                        .sort((a, b) => b.score - a.score)
                        .map((att, rIdx) => (
                          <tr key={att.id || rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-bold text-[#1976d2]">
                              #{rIdx + 1}
                            </td>
                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                              {att.studentName}
                            </td>
                            <td className="p-3 font-mono text-slate-500">
                              {att.rollNo || att.studentId}
                            </td>
                            <td className="p-3 text-center font-black text-emerald-600 dark:text-emerald-400">
                              {att.score} / {att.maxScore || activeResultsTest.totalMarks}
                            </td>
                            <td className="p-3 text-center font-bold">
                              {att.accuracy}%
                            </td>
                            <td className="p-3 text-center">
                              <span className="text-emerald-600 font-bold">{att.correctCount}✔</span>
                              <span className="text-slate-400 mx-1">/</span>
                              <span className="text-rose-500 font-bold">{att.incorrectCount}✖</span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">
                              {new Date(att.submittedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setActiveResultsTest(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
