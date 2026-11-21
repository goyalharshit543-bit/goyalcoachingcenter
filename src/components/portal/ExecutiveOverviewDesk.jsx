import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  HelpCircle, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  ArrowUpRight, 
  Sparkles, 
  BookOpen, 
  Tag, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';
import { api } from '../../api/client';

export default function ExecutiveOverviewDesk({ onSelectTab, isDarkMode = false }) {
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  
  // View mode: 'all' | 'queries' | 'doubts' | 'members'
  const [viewMode, setViewMode] = useState('all');

  // Filters
  const [queryFilter, setQueryFilter] = useState('all'); // 'all' | 'pending' | 'contacted'
  const [querySearch, setQuerySearch] = useState('');
  
  const [doubtSubjectFilter, setDoubtSubjectFilter] = useState('all'); // 'all' | 'math' | 'physics' | 'chemistry' | 'commerce'
  const [doubtStatusFilter, setDoubtStatusFilter] = useState('all'); // 'all' | 'pending' | 'resolved'
  const [doubtSearch, setDoubtSearch] = useState('');

  const [memberType, setMemberType] = useState('teachers'); // 'teachers' | 'students'
  const [memberSearch, setMemberSearch] = useState('');

  // Modals
  const [isAddDoubtOpen, setIsAddDoubtOpen] = useState(false);
  const [newDoubtForm, setNewDoubtForm] = useState({
    studentName: '',
    rollNo: '',
    grade: 'Class 10',
    subject: 'Mathematics',
    topic: '',
    question: '',
    priority: 'Normal',
    assignedTeacher: 'Goyal Sir'
  });

  const [activeDoubtModal, setActiveDoubtModal] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [activeQueryModal, setActiveQueryModal] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queriesData, doubtsData, siteData] = await Promise.all([
        api.getEnquiries(),
        api.getDoubts(),
        api.getData()
      ]);

      if (Array.isArray(queriesData)) setQueries(queriesData);
      if (Array.isArray(doubtsData)) setDoubts(doubtsData);
      if (siteData) {
        if (Array.isArray(siteData.teachers)) setTeachers(siteData.teachers);
        if (Array.isArray(siteData.students)) setStudents(siteData.students);
      }
    } catch (err) {
      console.error('Failed to load executive summary data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Queries
  const handleToggleQueryStatus = async (query) => {
    const nextStatus = query.status === 'Contacted' ? 'Pending' : 'Contacted';
    try {
      await api.updateEnquiry(query.id, { status: nextStatus });
      setQueries(prev => prev.map(q => q.id === query.id ? { ...q, status: nextStatus } : q));
      if (activeQueryModal && activeQueryModal.id === query.id) {
        setActiveQueryModal(prev => ({ ...prev, status: nextStatus }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
      await api.deleteEnquiry(id);
      setQueries(prev => prev.filter(q => q.id !== id));
      if (activeQueryModal && activeQueryModal.id === id) setActiveQueryModal(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Doubts
  const handleAddDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubtForm.studentName || !newDoubtForm.question) {
      alert('Please enter student name and question');
      return;
    }
    try {
      const res = await api.createDoubt(newDoubtForm);
      if (res?.doubt) {
        setDoubts(prev => [res.doubt, ...prev]);
        setIsAddDoubtOpen(false);
        setNewDoubtForm({
          studentName: '',
          rollNo: '',
          grade: 'Class 10',
          subject: 'Mathematics',
          topic: '',
          question: '',
          priority: 'Normal',
          assignedTeacher: 'Goyal Sir'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveDoubt = async (id, reply = '') => {
    try {
      await api.updateDoubt(id, { 
        status: 'Resolved', 
        reply: reply || 'Reviewed and resolved on Doubt Counter Desk.' 
      });
      setDoubts(prev => prev.map(d => d.id === id ? { 
        ...d, 
        status: 'Resolved', 
        reply: reply || 'Reviewed and resolved on Doubt Counter Desk.' 
      } : d));
      setActiveDoubtModal(null);
      setReplyText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDoubt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doubt ticket?')) return;
    try {
      await api.deleteDoubt(id);
      setDoubts(prev => prev.filter(d => d.id !== id));
      if (activeDoubtModal && activeDoubtModal.id === id) setActiveDoubtModal(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered queries
  const filteredQueries = queries.filter(q => {
    if (queryFilter === 'pending' && (q.status === 'Contacted' || q.status === 'Resolved')) return false;
    if (queryFilter === 'contacted' && q.status !== 'Contacted' && q.status !== 'Resolved') return false;
    if (querySearch) {
      const s = querySearch.toLowerCase();
      return (
        q.name?.toLowerCase().includes(s) ||
        q.phone?.includes(s) ||
        q.mobile?.includes(s) ||
        q.message?.toLowerCase().includes(s) ||
        q.course?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Filtered doubts
  const filteredDoubts = doubts.filter(d => {
    if (doubtStatusFilter === 'pending' && d.status === 'Resolved') return false;
    if (doubtStatusFilter === 'resolved' && d.status !== 'Resolved') return false;
    if (doubtSubjectFilter !== 'all') {
      const sub = d.subject?.toLowerCase() || '';
      if (doubtSubjectFilter === 'math' && !sub.includes('math')) return false;
      if (doubtSubjectFilter === 'physics' && !sub.includes('physic')) return false;
      if (doubtSubjectFilter === 'chemistry' && !sub.includes('chem')) return false;
      if (doubtSubjectFilter === 'commerce' && !sub.includes('account') && !sub.includes('econom') && !sub.includes('business')) return false;
    }
    if (doubtSearch) {
      const s = doubtSearch.toLowerCase();
      return (
        d.studentName?.toLowerCase().includes(s) ||
        d.question?.toLowerCase().includes(s) ||
        d.topic?.toLowerCase().includes(s) ||
        d.rollNo?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Filtered members
  const filteredTeachers = teachers.filter(t => {
    if (!memberSearch) return true;
    const s = memberSearch.toLowerCase();
    return t.name?.toLowerCase().includes(s) || t.subject?.toLowerCase().includes(s) || t.phone?.includes(s);
  });

  const filteredStudents = students.filter(s => {
    if (!memberSearch) return true;
    const q = memberSearch.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.rollNo?.toLowerCase().includes(q) || s.grade?.toLowerCase().includes(q) || s.parentPhone?.includes(q);
  });

  const pendingQueriesCount = queries.filter(q => q.status !== 'Contacted' && q.status !== 'Resolved').length;
  const pendingDoubtsCount = doubts.filter(d => d.status !== 'Resolved').length;
  const totalMembersCount = teachers.length + students.length + 1; // +1 for Main Admin

  const getSubjectColor = (subject = '') => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s.includes('physic')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (s.includes('chem')) return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    if (s.includes('account') || s.includes('econom') || s.includes('business') || s.includes('commerce')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Top Command Banner with Snapshot KPIs Styled in Home Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950 text-white border-2 border-blue-500/30 shadow-2xl shadow-blue-600/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Executive Summary & Quick Action Desk
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 font-outfit">
              <span>Admin Snapshot: Queries, Doubts & Members</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              Consolidated quick view of all student inquiries, academic doubt counters, and active institute members in short.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddDoubtOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Log Doubt Ticket
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 hover:border-blue-500 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* 3 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Queries */}
          <div 
            onClick={() => setViewMode(viewMode === 'queries' ? 'all' : 'queries')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              viewMode === 'queries' 
                ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' 
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                pendingQueriesCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {pendingQueriesCount} Follow-ups
              </span>
            </div>
            <div className="text-2xl font-black text-white">{queries.length}</div>
            <div className="text-xs text-blue-300 font-semibold">Total Queries & Inquiries</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {queries.length - pendingQueriesCount} Contacted • {pendingQueriesCount} Awaiting Response
            </div>
          </div>

          {/* Card 2: Doubts */}
          <div 
            onClick={() => setViewMode(viewMode === 'doubts' ? 'all' : 'doubts')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              viewMode === 'doubts' 
                ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                pendingDoubtsCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {pendingDoubtsCount} Unresolved
              </span>
            </div>
            <div className="text-2xl font-black text-white">{doubts.length}</div>
            <div className="text-xs text-indigo-300 font-semibold">Student Doubt Tickets</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Math, Physics, Chemistry & Commerce Doubt Desks
            </div>
          </div>

          {/* Card 3: Members */}
          <div 
            onClick={() => setViewMode(viewMode === 'members' ? 'all' : 'members')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              viewMode === 'members' 
                ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {teachers.length} Faculty Active
              </span>
            </div>
            <div className="text-2xl font-black text-white">{totalMembersCount}</div>
            <div className="text-xs text-cyan-300 font-semibold">Total Institute Members</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {teachers.length} Teachers • {students.length} Students • 1 Super Admin
            </div>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/30 border border-blue-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> All in Short (3-Column View)
          </button>

          <button
            onClick={() => setViewMode('queries')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'queries'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> All Queries ({queries.length})
          </button>

          <button
            onClick={() => setViewMode('doubts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'doubts'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> All Doubts ({doubts.length})
          </button>

          <button
            onClick={() => setViewMode('members')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'members'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-slate-800/70 text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> All Members ({totalMembersCount})
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: ALL QUERIES IN SHORT ================= */}
      {(viewMode === 'all' || viewMode === 'queries') && (
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>All Student & Admission Queries (In Short)</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                    {queries.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Direct student contact requests, class preferences, and callback submissions.
                </p>
              </div>
            </div>

            {/* Quick Status Filters & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/60 text-xs">
                <button
                  onClick={() => setQueryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    queryFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({queries.length})
                </button>
                <button
                  onClick={() => setQueryFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    queryFilter === 'pending' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({pendingQueriesCount})
                </button>
                <button
                  onClick={() => setQueryFilter('contacted')}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                    queryFilter === 'contacted' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Contacted ({queries.length - pendingQueriesCount})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search queries..."
                  value={querySearch}
                  onChange={(e) => setQuerySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 w-36 sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* Compact Queries List */}
          {filteredQueries.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No queries match your current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredQueries.map((query) => {
                const isContacted = query.status === 'Contacted' || query.status === 'Resolved';
                const phoneNum = query.phone || query.mobile || '';

                return (
                  <div
                    key={query.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isContacted 
                        ? 'bg-slate-900/40 border-slate-800/80' 
                        : 'bg-blue-950/20 border-blue-500/30 shadow-md shadow-blue-500/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            <span>{query.name || 'Anonymous Applicant'}</span>
                            {!isContacted && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {query.id} • {query.timestamp ? new Date(query.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isContacted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {isContacted ? 'Contacted' : 'Pending'}
                        </span>
                      </div>

                      {/* Course / Branch tag */}
                      {(query.course || query.source) && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium truncate max-w-full">
                            🎯 {query.course || query.source}
                          </span>
                        </div>
                      )}

                      {/* Message preview */}
                      <p className="text-xs text-slate-300 line-clamp-2 italic bg-black/20 p-2 rounded-xl border border-slate-800/50">
                        &quot;{query.message || 'No additional message provided.'}&quot;
                      </p>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {phoneNum && (
                          <>
                            <a
                              href={`tel:${phoneNum}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Direct Phone Call"
                            >
                              <Phone className="w-3 h-3" /> {phoneNum}
                            </a>
                            <a
                              href={`https://wa.me/91${phoneNum.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              WA
                            </a>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleQueryStatus(query)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isContacted 
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                          }`}
                        >
                          {isContacted ? 'Mark Pending' : 'Mark Done'}
                        </button>
                        <button
                          onClick={() => handleDeleteQuery(query.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete query"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: ALL DOUBTS IN SHORT ================= */}
      {(viewMode === 'all' || viewMode === 'doubts') && (
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>All Student Doubts Counter (In Short)</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold">
                    {doubts.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Class 8th–10th (Math & Science) and 11th–12th (Commerce: Accounts, Eco, BST).
                </p>
              </div>
            </div>

            {/* Subject Filters & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Subject Tabs */}
              <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/60 text-xs">
                {['all', 'math', 'physics', 'chemistry', 'commerce'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setDoubtSubjectFilter(sub)}
                    className={`px-2 py-1 rounded-lg font-semibold capitalize cursor-pointer ${
                      doubtSubjectFilter === sub ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <select
                value={doubtStatusFilter}
                onChange={(e) => setDoubtStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search doubts..."
                  value={doubtSearch}
                  onChange={(e) => setDoubtSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 w-32 sm:w-44"
                />
              </div>
            </div>
          </div>

          {/* Compact Doubts Grid */}
          {filteredDoubts.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No doubt tickets match your current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDoubts.map((doubt) => {
                const isResolved = doubt.status === 'Resolved';
                const subjectBadge = getSubjectColor(doubt.subject);

                return (
                  <div
                    key={doubt.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isResolved 
                        ? 'bg-slate-900/40 border-slate-800/80' 
                        : 'bg-purple-950/20 border-purple-500/30 shadow-md shadow-purple-500/5'
                    }`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <span>{doubt.studentName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {doubt.rollNo || doubt.grade}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {doubt.id} • {doubt.date}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isResolved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                        }`}>
                          {doubt.status}
                        </span>
                      </div>

                      {/* Subject Tag & Topic */}
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${subjectBadge}`}>
                          {doubt.subject}
                        </span>
                        {doubt.priority === 'Urgent' && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                            Urgent
                          </span>
                        )}
                        <span className="text-[11px] text-slate-300 font-medium truncate max-w-[180px]">
                          {doubt.topic}
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="text-xs text-slate-200 bg-black/25 p-2.5 rounded-xl border border-slate-800/60 line-clamp-3">
                        &quot;{doubt.question}&quot;
                      </p>

                      {/* Reply note if resolved */}
                      {doubt.reply && (
                        <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
                          <span className="font-semibold text-emerald-400">Mentor Note:</span> {doubt.reply}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Mentor: <strong className="text-slate-300">{doubt.assignedTeacher || 'Faculty'}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveDoubtModal(doubt);
                            setReplyText(doubt.reply || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          {isResolved ? 'Edit Note' : 'Resolve'}
                        </button>
                        <button
                          onClick={() => handleDeleteDoubt(doubt.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete doubt ticket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 3: ALL MEMBERS IN SHORT ================= */}
      {(viewMode === 'all' || viewMode === 'members') && (
        <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>All Institute Members (In Short)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    {totalMembersCount} Total
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Quick roster of faculty members and enrolled students across classes.
                </p>
              </div>
            </div>

            {/* Member Type Toggle & Search */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/60 text-xs">
                <button
                  onClick={() => setMemberType('teachers')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                    memberType === 'teachers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Faculty ({teachers.length})
                </button>
                <button
                  onClick={() => setMemberType('students')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                    memberType === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" /> Students ({students.length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search ${memberType}...`}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 w-36 sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* Members Content: Teachers vs Students */}
          {memberType === 'teachers' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{teacher.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{teacher.id}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {teacher.status || 'Active'}
                      </span>
                    </div>

                    <div className="space-y-1 my-2 text-xs">
                      <div className="text-blue-400 font-semibold text-[11px] truncate">
                        📖 {teacher.subject}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        🎓 {teacher.qualification || 'Senior Faculty'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <a
                      href={`tel:${teacher.phone}`}
                      className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" /> {teacher.phone}
                    </a>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(teacher.assignedBatches || []).length} Batches Assigned
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStudents.map((student) => (
                <div
                  key={student.id || student.rollNo}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-bold text-sm text-white">{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {student.rollNo} • {student.grade}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.fees?.status === 'Fully Paid' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {student.fees?.status || 'Active'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mb-2 truncate">
                      🎯 <span className="text-slate-400">Batch:</span> {student.batch || 'Board Champions'}
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-black/20 text-center text-xs border border-slate-800/40">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Score Avg</div>
                        <div className="font-bold text-white text-xs">{student.overallPercentage || 92}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Attendance</div>
                        <div className="font-bold text-emerald-400 text-xs">{student.attendancePercentage || 95}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Parent: <strong className="text-slate-300">{student.parentName || 'Parent'}</strong>
                    </span>
                    {student.parentPhone && (
                      <a
                        href={`tel:${student.parentPhone}`}
                        className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: ADD STUDENT DOUBT TICKET ================= */}
      {isAddDoubtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/40 bg-slate-950 relative shadow-2xl">
            <button
              onClick={() => setIsAddDoubtOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Log Academic Doubt Ticket</h3>
                <p className="text-xs text-slate-400">Assign doubt to subject faculty for resolution desk.</p>
              </div>
            </div>

            <form onSubmit={handleAddDoubt} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Gupta"
                    value={newDoubtForm.studentName}
                    onChange={(e) => setNewDoubtForm({ ...newDoubtForm, studentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll / Student ID</label>
                  <input
                    type="text"
                    placeholder="e.g. GCC-102"
                    value={newDoubtForm.rollNo}
                    onChange={(e) => setNewDoubtForm({ ...newDoubtForm, rollNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Class / Grade</label>
                  <select
                    value={newDoubtForm.grade}
                    onChange={(e) => setNewDoubtForm({ ...newDoubtForm, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11 Commerce">Class 11 Commerce</option>
                    <option value="Class 12 Commerce">Class 12 Commerce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject *</label>
                  <select
                    value={newDoubtForm.subject}
                    onChange={(e) => setNewDoubtForm({ ...newDoubtForm, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science (Physics)">Science (Physics)</option>
                    <option value="Science (Chemistry)">Science (Chemistry)</option>
                    <option value="Accountancy">Accountancy</option>
                    <option value="Economics">Economics</option>
                    <option value="Business Studies">Business Studies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chapter / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Quadratic Equations word problems"
                  value={newDoubtForm.topic}
                  onChange={(e) => setNewDoubtForm({ ...newDoubtForm, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Student Question / Doubt *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the exact question or problem where the student is facing difficulty..."
                  value={newDoubtForm.question}
                  onChange={(e) => setNewDoubtForm({ ...newDoubtForm, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assign Faculty</label>
                  <select
                    value={newDoubtForm.assignedTeacher}
                    onChange={(e) => setNewDoubtForm({ ...newDoubtForm, assignedTeacher: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Goyal Sir">Goyal Sir (Maths & Overall)</option>
                    <option value="CA Deepak Goyal">CA Deepak Goyal (Accounts & Eco)</option>
                    <option value="Dr. Anita Jain">Dr. Anita Jain (Physics & Chemistry)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newDoubtForm.priority}
                    onChange={(e) => setNewDoubtForm({ ...newDoubtForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Before Next Test)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDoubtOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-600/25 cursor-pointer"
                >
                  Submit Doubt Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESOLVE / REPLY TO DOUBT ================= */}
      {activeDoubtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-purple-500/40 bg-slate-950 relative shadow-2xl">
            <button
              onClick={() => setActiveDoubtModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Resolve Doubt Ticket</h3>
                <p className="text-xs text-slate-400">{activeDoubtModal.studentName} ({activeDoubtModal.subject})</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div className="p-3 rounded-xl bg-black/30 border border-slate-800 text-slate-200">
                <div className="font-semibold text-slate-400 mb-1">Student Question:</div>
                <p className="text-xs">{activeDoubtModal.question}</p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mentor Resolution Note / Explanation:</label>
                <textarea
                  rows={4}
                  placeholder="Enter solution explanation or confirm doubt desk discussion..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveDoubtModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveDoubt(activeDoubtModal.id, replyText)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 cursor-pointer"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
