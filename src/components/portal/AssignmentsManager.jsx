import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Upload, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Calendar, 
  Award, 
  User, 
  BookOpen, 
  ChevronRight,
  ExternalLink,
  ZoomIn,
  RefreshCw,
  Send
} from 'lucide-react';
import { api } from '../../api/client';
import { isSameClass } from '../../utils/classMatcher';

export default function AssignmentsManager({ 
  currentRole = 'admin', 
  currentUserName = 'Faculty', 
  students = [], 
  onDataChanged 
}) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Mathematics',
    grade: 'Class 10',
    batch: '',
    dueDate: '',
    totalMarks: 25,
    description: '',
    photos: []
  });
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  // Submissions Modal State
  const [activeSubmissionsAssignment, setActiveSubmissionsAssignment] = useState(null);
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradingForm, setGradingForm] = useState({ marksObtained: '', teacherRemarks: '' });
  const [gradingSaving, setGradingSaving] = useState(false);

  // Fullscreen Image Lightbox State
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const fileInputRef = useRef(null);

  // Load assignments
  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // Filter assignments
  const filteredAssignments = assignments.filter(asg => {
    const matchesSearch = 
      (asg.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asg.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asg.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade = 
      gradeFilter === 'All' || 
      asg.grade === 'All Classes' || 
      isSameClass(asg.grade, gradeFilter);

    return matchesSearch && matchesGrade;
  });

  // Calculate statistics
  const totalSubmissions = assignments.reduce((acc, curr) => acc + (curr.submissions?.length || 0), 0);
  const pendingReviews = assignments.reduce((acc, curr) => {
    const unreviewed = (curr.submissions || []).filter(s => s.status === 'Submitted').length;
    return acc + unreviewed;
  }, 0);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingAssignment(null);
    const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setFormData({
      title: '',
      subject: 'Mathematics',
      grade: 'Class 10',
      batch: 'Class 10 Board Champions',
      dueDate: in7Days,
      totalMarks: 25,
      description: '',
      photos: []
    });
    setPhotoUrlInput('');
    setStatusMsg('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (asg) => {
    setEditingAssignment(asg);
    setFormData({
      title: asg.title || '',
      subject: asg.subject || 'Mathematics',
      grade: asg.grade || 'Class 10',
      batch: asg.batch || '',
      dueDate: asg.dueDate || '',
      totalMarks: asg.totalMarks || 25,
      description: asg.description || '',
      photos: Array.isArray(asg.photos) ? [...asg.photos] : []
    });
    setPhotoUrlInput('');
    setStatusMsg('');
    setIsFormModalOpen(true);
  };

  // Handle Multi-file Upload for Assignment Question Sheet Photos
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image. Please select JPG, PNG, or WEBP photos.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, event.target.result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add photo via URL
  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, photoUrlInput.trim()]
    }));
    setPhotoUrlInput('');
  };

  // Delete a specific photo inside form
  const handleRemovePhotoFromForm = (idx) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  // Delete a specific photo from an existing assignment card
  const handleDeletePhotoFromCard = async (asgId, photoIdx) => {
    if (!window.confirm('Are you sure you want to delete this question sheet photo from the assignment?')) return;
    try {
      await api.deleteAssignmentPhoto(asgId, photoIdx);
      await loadAssignments();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Failed to remove photo');
    }
  };

  // Save Assignment (Create or Edit)
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter an assignment title');
      return;
    }

    try {
      setIsSaving(true);
      setStatusMsg('');

      const payload = {
        ...formData,
        createdBy: editingAssignment?.createdBy || currentUserName || 'Faculty Desk'
      };

      if (editingAssignment) {
        await api.updateAssignment(editingAssignment.id, payload);
        setStatusMsg('Assignment updated successfully!');
      } else {
        await api.addAssignment(payload);
        setStatusMsg('Assignment published successfully for students!');
      }

      await loadAssignments();
      if (onDataChanged) onDataChanged();

      setTimeout(() => {
        setIsFormModalOpen(false);
        setStatusMsg('');
      }, 1000);
    } catch (err) {
      alert(err.message || 'Failed to save assignment');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entire assignment
  const handleDeleteAssignment = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete this assignment:\n\n"${title}"?\n\nAll student answer sheet submissions for this assignment will also be removed.`)) {
      return;
    }
    try {
      await api.deleteAssignment(id);
      await loadAssignments();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Failed to delete assignment');
    }
  };

  // Handle open submissions drawer
  const handleOpenSubmissions = (asg) => {
    setActiveSubmissionsAssignment(asg);
    setGradingSubId(null);
  };

  // Start grading a submission
  const handleStartGrading = (sub) => {
    setGradingSubId(sub.id);
    setGradingForm({
      marksObtained: sub.marksObtained !== null && sub.marksObtained !== undefined ? sub.marksObtained : '',
      teacherRemarks: sub.teacherRemarks || ''
    });
  };

  // Save grading
  const handleSaveGrading = async (e, asgId, subId) => {
    e.preventDefault();
    try {
      setGradingSaving(true);
      await api.gradeAssignmentSubmission(asgId, subId, {
        marksObtained: gradingForm.marksObtained,
        teacherRemarks: gradingForm.teacherRemarks,
        status: 'Reviewed'
      });
      await loadAssignments();
      // Update local active submissions view
      const fresh = await api.getAssignments();
      const freshAsg = fresh.find(a => a.id === asgId);
      if (freshAsg) setActiveSubmissionsAssignment(freshAsg);
      setGradingSubId(null);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Failed to save review');
    } finally {
      setGradingSaving(false);
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
            <FileText className="w-3.5 h-3.5" />
            <span>Assignments & Student Homework Management</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-outfit">
            Assignments Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Upload question sheets and practice papers. Students view question photos in their portal and submit handwritten answer sheets for review.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadAssignments}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh assignments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Assignment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-slate-400">Total Assignments</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{assignments.length}</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Active question sheets</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Submissions Received</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalSubmissions}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Uploaded answer sheets</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-amber-500">Pending Review</div>
          <div className="text-2xl font-black text-amber-500 mt-1">{pendingReviews}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting evaluation</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-purple-500">Target Classes</div>
          <div className="text-2xl font-black text-purple-500 mt-1">7th - 12th</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Board & Foundation</div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CONTROLS: SEARCH & CLASS FILTER                                 */}
      {/* ================================================================= */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, subject, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1976d2]"
          />
        </div>

        {/* Class Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls) => (
            <button
              key={cls}
              onClick={() => setGradeFilter(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                gradeFilter === cls
                  ? 'bg-[#1976d2] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cls === 'All' ? 'All Classes' : cls}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. ASSIGNMENT CARDS LIST                                           */}
      {/* ================================================================= */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1976d2]" />
          <span>Loading assignments...</span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Assignments Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || gradeFilter !== 'All' 
              ? 'No assignments match the selected class or search query.'
              : 'Click "+ Upload New Assignment" above to upload question photos for your students.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAssignments.map((asg) => {
            const photos = Array.isArray(asg.photos) ? asg.photos : [];
            const submissions = Array.isArray(asg.submissions) ? asg.submissions : [];
            const isOverdue = asg.dueDate && new Date(asg.dueDate) < new Date();

            return (
              <div 
                key={asg.id} 
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Card Header: Badges & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#1976d2] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {asg.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {asg.grade}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                        {asg.id}
                      </span>
                    </div>

                    {/* Edit & Delete actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(asg)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#1976d2] hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                        title="Edit Assignment & Photos"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                    {asg.title}
                  </h3>
                  {asg.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                      {asg.description}
                    </p>
                  )}

                  {/* Due Date & Total Marks Info */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className={`inline-flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-500 font-semibold' : ''}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due: {asg.dueDate || 'No deadline'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <Award className="w-3.5 h-3.5" />
                      <span>Max Marks: {asg.totalMarks || 20}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      By {asg.createdBy}
                    </span>
                  </div>

                  {/* ========================================================= */}
                  {/* PHOTO GALLERY OF THE ASSIGNMENT QUESTION PAPER            */}
                  {/* ========================================================= */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#1976d2]" />
                        <span>Question Photos ({photos.length})</span>
                      </div>
                      <button
                        onClick={() => handleOpenEdit(asg)}
                        className="text-[10px] text-[#1976d2] hover:underline font-semibold cursor-pointer"
                      >
                        + Manage Photos
                      </button>
                    </div>

                    {photos.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {photos.map((photo, pIdx) => (
                          <div 
                            key={pIdx} 
                            className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
                          >
                            <img 
                              src={photo} 
                              alt={`Question Sheet page ${pIdx + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            
                            {/* Hover overlay with zoom & delete button */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setLightboxImage(photo);
                                  setLightboxTitle(`${asg.title} - Question Sheet Page ${pIdx + 1}`);
                                }}
                                className="p-1.5 rounded-lg bg-white/90 text-slate-900 hover:bg-white text-xs cursor-pointer shadow"
                                title="View full size photo"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePhotoFromCard(asg.id, pIdx)}
                                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs cursor-pointer shadow"
                                title="Delete this question photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                        No question photos uploaded yet. Click "Manage Photos" or "Edit" to attach assignment photos.
                      </div>
                    )}
                  </div>
                </div>

                {/* ========================================================= */}
                {/* SUBMISSIONS BUTTON & DRAWER TOGGLE                        */}
                {/* ========================================================= */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white">{submissions.length}</span> {submissions.length === 1 ? 'Student' : 'Students'} submitted answer sheet
                  </div>

                  <button
                    onClick={() => handleOpenSubmissions(asg)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1976d2] dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                  >
                    <span>View Answer Sheets</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. MODAL: CREATE / EDIT ASSIGNMENT & UPLOAD QUESTION PHOTOS       */}
      {/* ================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1976d2]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingAssignment ? 'Edit Assignment & Photos' : 'Upload New Assignment'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
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

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Maths: Trigonometry Exercise 8.4 Daily Practice"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                />
              </div>

              {/* Subject, Grade, Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science (Physics / Chem / Bio)</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Accountancy">Accountancy</option>
                    <option value="Economics">Economics</option>
                    <option value="Business Studies">Business Studies</option>
                    <option value="English">English</option>
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
                    <option value="Class 11">Class 11 (Commerce)</option>
                    <option value="Class 12">Class 12 (Commerce)</option>
                    <option value="All Classes">All Classes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Submission Deadline Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                />
              </div>

              {/* Instructions / Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Instructions & Homework Details
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Solve all 10 problems on clean paper. Show step-by-step working. Take clear photos and upload your answer sheet."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                />
              </div>

              {/* ========================================================= */}
              {/* PHOTO UPLOAD & MANAGEMENT SECTION                         */}
              {/* ========================================================= */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#1976d2]" />
                    <span>Upload Assignment Photos ({formData.photos.length})</span>
                  </label>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
                </div>

                <p className="text-xs text-slate-500">
                  Select photo(s) of the question paper, textbook page, or handwritten question sheet. You can add or delete photos anytime.
                </p>

                {/* File picker button */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="assignment-file-input"
                  />
                  <label
                    htmlFor="assignment-file-input"
                    className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1976d2] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold cursor-pointer inline-flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Browse & Upload Photos from Device</span>
                  </label>
                </div>

                {/* URL fallback */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Previews of attached photos with delete buttons */}
                {formData.photos.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Attached Photos Preview (Click ✕ to delete):
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {formData.photos.map((photo, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-900">
                          <img 
                            src={photo} 
                            alt={`Upload ${idx + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromForm(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer transition-colors"
                            title="Delete this photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Pg {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                  <span>{editingAssignment ? 'Save Changes' : 'Publish Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. MODAL: VIEW STUDENT SUBMISSIONS & GRADE ANSWER SHEETS          */}
      {/* ================================================================= */}
      {activeSubmissionsAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#1976d2]">
                    {activeSubmissionsAssignment.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {activeSubmissionsAssignment.grade}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Submitted Answer Sheets: {activeSubmissionsAssignment.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Max Marks: {activeSubmissionsAssignment.totalMarks} | Total Submissions: {(activeSubmissionsAssignment.submissions || []).length}
                </p>
              </div>

              <button
                onClick={() => setActiveSubmissionsAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submissions List Container */}
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {(activeSubmissionsAssignment.submissions || []).length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No students have uploaded their answer sheet for this assignment yet.
                </div>
              ) : (
                (activeSubmissionsAssignment.submissions || []).map((sub, sIdx) => {
                  const answerPhotos = Array.isArray(sub.answerPhotos) ? sub.answerPhotos : [];
                  const isGradingThis = gradingSubId === sub.id;

                  return (
                    <div 
                      key={sub.id || sIdx} 
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {sub.studentName}
                            </h4>
                            <span className="font-mono text-xs text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                              Roll: {sub.rollNo || sub.studentId}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {sub.grade}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                          </div>
                          {sub.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              "{sub.notes}"
                            </p>
                          )}
                        </div>

                        {/* Marks & Status Badge */}
                        <div className="flex items-center gap-2">
                          {sub.marksObtained !== null && sub.marksObtained !== undefined ? (
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                              Marks: {sub.marksObtained} / {activeSubmissionsAssignment.totalMarks}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold text-xs">
                              Awaiting Marks
                            </span>
                          )}

                          <button
                            onClick={() => isGradingThis ? setGradingSubId(null) : handleStartGrading(sub)}
                            className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1976d2] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold cursor-pointer transition-colors"
                          >
                            {isGradingThis ? 'Close Grading' : 'Grade / Remarks'}
                          </button>
                        </div>
                      </div>

                      {/* Student's Uploaded Answer Sheet Photos */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Student's Answer Sheet Photos ({answerPhotos.length} {answerPhotos.length === 1 ? 'Page' : 'Pages'}) — Click to inspect:</span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {answerPhotos.map((photo, pIdx) => (
                            <div 
                              key={pIdx} 
                              onClick={() => {
                                setLightboxImage(photo);
                                setLightboxTitle(`${sub.studentName} (Roll: ${sub.rollNo}) - Answer Sheet Page ${pIdx + 1}`);
                              }}
                              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-200 dark:bg-slate-800 cursor-pointer shadow-sm hover:shadow"
                            >
                              <img 
                                src={photo} 
                                alt={`Answer Sheet page ${pIdx + 1}`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                                <ZoomIn className="w-4 h-4 mr-1" /> View
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                                Page {pIdx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Display Existing Teacher Remarks */}
                      {sub.teacherRemarks && !isGradingThis && (
                        <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                          <span className="font-bold">Faculty Feedback:</span> {sub.teacherRemarks}
                        </div>
                      )}

                      {/* Inline Grading Form */}
                      {isGradingThis && (
                        <form 
                          onSubmit={(e) => handleSaveGrading(e, activeSubmissionsAssignment.id, sub.id)}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 space-y-3"
                        >
                          <div className="text-xs font-bold text-[#1976d2] uppercase tracking-wider">
                            Evaluate Student Submission:
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Marks Obtained (out of {activeSubmissionsAssignment.totalMarks})
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={activeSubmissionsAssignment.totalMarks}
                                required
                                placeholder="e.g. 23"
                                value={gradingForm.marksObtained}
                                onChange={(e) => setGradingForm({ ...gradingForm, marksObtained: e.target.value })}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Teacher Remarks / Feedback for Student
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Outstanding step-marking! Revise question 4 formula."
                                value={gradingForm.teacherRemarks}
                                onChange={(e) => setGradingForm({ ...gradingForm, teacherRemarks: e.target.value })}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setGradingSubId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={gradingSaving}
                              className="px-4 py-1.5 rounded-lg bg-[#1976d2] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                            >
                              {gradingSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              <span>Save Evaluation</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setActiveSubmissionsAssignment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 6. LIGHTBOX: FULLSCREEN IMAGE INSPECTION                          */}
      {/* ================================================================= */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full mb-2 text-white">
              <span className="text-xs font-medium truncate max-w-md">{lightboxTitle}</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={lightboxImage} 
              alt="High resolution inspection" 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-2 text-center text-[11px] text-white/60">
              High-resolution photo viewer • Goyal Coaching Centre LMS
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
