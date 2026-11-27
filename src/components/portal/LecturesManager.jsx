import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayCircle, 
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
  Film, 
  Video, 
  User, 
  BookOpen, 
  ChevronRight,
  ExternalLink,
  RefreshCw,
  HardDrive,
  Maximize2
} from 'lucide-react';
import { api } from '../../api/client';
import { isSameClass } from '../../utils/classMatcher';

export default function LecturesManager({ 
  currentRole = 'admin', 
  currentUserName = 'Faculty', 
  onDataChanged 
}) {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { percent, loadedBytes, totalBytes }
  const [statusMsg, setStatusMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Science (Physics)',
    grade: 'Class 10',
    batch: 'Class 10 Board Champions',
    chapter: '',
    duration: '1 hr 30 min',
    faculty: '',
    description: '',
    videoType: 'file', // 'file' or 'url'
    videoUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  });

  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const videoInputRef = useRef(null);

  // Video Player Modal State
  const [activePlayingLecture, setActivePlayingLecture] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoElementRef = useRef(null);

  // Load lectures
  const loadLectures = async () => {
    try {
      setLoading(true);
      const data = await api.getLectures();
      setLectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load lectures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, []);

  // Filter lectures
  const filteredLectures = lectures.filter(lec => {
    const matchesSearch = 
      (lec.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lec.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lec.chapter || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lec.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = 
      gradeFilter === 'All' || 
      lec.grade === 'All Classes' || 
      isSameClass(lec.grade, gradeFilter);

    return matchesSearch && matchesGrade;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingLecture(null);
    setFormData({
      title: '',
      subject: 'Science (Physics)',
      grade: 'Class 10',
      batch: 'Class 10 Board Champions',
      chapter: '',
      duration: '1 hr 30 min',
      faculty: currentUserName || 'Er. Alok Goyal',
      description: '',
      videoType: 'file',
      videoUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
    });
    setSelectedVideoFile(null);
    setUploadProgress(null);
    setStatusMsg('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (lec) => {
    setEditingLecture(lec);
    setFormData({
      title: lec.title || '',
      subject: lec.subject || 'Science (Physics)',
      grade: lec.grade || 'Class 10',
      batch: lec.batch || '',
      chapter: lec.chapter || '',
      duration: lec.duration || '1 hr 30 min',
      faculty: lec.faculty || currentUserName || 'Er. Alok Goyal',
      description: lec.description || '',
      videoType: lec.videoType || 'file',
      videoUrl: lec.videoUrl || '',
      thumbnailUrl: lec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
    });
    setSelectedVideoFile(null);
    setUploadProgress(null);
    setStatusMsg('');
    setIsFormModalOpen(true);
  };

  // Handle Video File Selection
  const handleVideoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedVideoFile(file);
    // Auto-calculate human readable size
    let formatted = '';
    if (file.size >= 1024 * 1024 * 1024) {
      formatted = (file.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (file.size >= 1024 * 1024) {
      formatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
      formatted = Math.round(file.size / 1024) + ' KB';
    }

    setFormData(prev => ({
      ...prev,
      videoType: 'file',
      fileSize: formatted
    }));
  };

  // Format bytes helper
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Save Lecture & Stream High-Capacity Video File
  const handleSaveLecture = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a lecture title');
      return;
    }

    try {
      setIsSaving(true);
      setStatusMsg('');

      let lectureId = editingLecture?.id;

      if (editingLecture) {
        await api.updateLecture(editingLecture.id, {
          ...formData,
          uploadedBy: currentUserName || 'Faculty Desk'
        });
        setStatusMsg('Lecture details updated.');
      } else {
        const createRes = await api.addLecture({
          ...formData,
          uploadedBy: currentUserName || 'Faculty Desk'
        });
        lectureId = createRes.lecture?.id;
        setStatusMsg('Lecture record created.');
      }

      // If user selected a 5-10 GB video file to upload, stream it directly to disk
      if (selectedVideoFile && lectureId) {
        setStatusMsg('Streaming video file to server storage (5-10 GB supported)...');
        setUploadProgress({ percent: 0, loadedBytes: 0, totalBytes: selectedVideoFile.size });

        await api.uploadLectureVideo(lectureId, selectedVideoFile, (progress) => {
          setUploadProgress(progress);
        });

        setStatusMsg('✓ Video uploaded successfully and ready for streaming!');
      }

      await loadLectures();
      if (onDataChanged) onDataChanged();

      setTimeout(() => {
        setIsFormModalOpen(false);
        setStatusMsg('');
        setUploadProgress(null);
        setSelectedVideoFile(null);
      }, 1500);

    } catch (err) {
      alert(err.message || 'Failed to save lecture');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete lecture
  const handleDeleteLecture = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete this lecture:\n\n"${title}"?\n\nThe video file stored on disk will also be deleted to free up space.`)) {
      return;
    }
    try {
      await api.deleteLecture(id);
      await loadLectures();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert(err.message || 'Failed to delete lecture');
    }
  };

  // Play Lecture
  const handlePlayLecture = (lec) => {
    setActivePlayingLecture(lec);
    setPlaybackSpeed(1);
    api.incrementLectureView(lec.id);
  };

  // Change Speed
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoElementRef.current) {
      videoElementRef.current.playbackRate = speed;
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
            <Film className="w-3.5 h-3.5" />
            <span>High-Capacity Video Streaming (5-10 GB Files Supported)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-outfit">
            Recorded Video Lectures Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Upload original recorded classroom masterclasses (5 GB, 10 GB, or any size). Express HTTP 206 partial content streaming allows students and teachers to play and scrub instantly without waiting.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadLectures}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh lectures"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Recorded Lecture</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-slate-400">Total Lectures</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{lectures.length}</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Published for students</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Video Storage</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">High-Cap</div>
          <div className="text-[10px] text-slate-400 mt-0.5">5-10 GB+ streaming enabled</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-purple-500">Classes Covered</div>
          <div className="text-2xl font-black text-purple-500 mt-1">7th - 12th</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Science, Maths & Commerce</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-bold uppercase text-amber-500">Fast Playback</div>
          <div className="text-2xl font-black text-amber-500 mt-1">HTTP 206</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Instant seek without buffering</div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. CONTROLS: SEARCH & CLASS FILTER                                 */}
      {/* ================================================================= */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, subject, chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1976d2]"
          />
        </div>

        {/* Filter Chips */}
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
      {/* 3. LECTURES GRID LIST                                              */}
      {/* ================================================================= */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#1976d2]" />
          <span>Loading recorded lectures...</span>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
          <Film className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Recorded Lectures Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || gradeFilter !== 'All' 
              ? 'No lectures match your search or class filter.' 
              : 'Click "+ Upload Recorded Lecture" above to upload classroom videos for your students.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLectures.map((lec) => (
            <div 
              key={lec.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail with duration badge & play button */}
                <div 
                  className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer group"
                  onClick={() => handlePlayLecture(lec)}
                >
                  <img 
                    src={lec.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'} 
                    alt={lec.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#1976d2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  {lec.duration && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-sm">
                      {lec.duration}
                    </div>
                  )}

                  {/* File Size Badge */}
                  {lec.fileSize && (
                    <div className="absolute bottom-2.5 left-2.5 bg-blue-900/80 text-blue-200 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold backdrop-blur-sm flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      <span>{lec.fileSize}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#1976d2] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {lec.subject}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {lec.grade}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">
                    {lec.title}
                  </h3>

                  {lec.chapter && (
                    <div className="text-[11px] text-[#1976d2] font-semibold flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate">{lec.chapter}</span>
                    </div>
                  )}

                  {lec.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {lec.description}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span>By {lec.faculty}</span>
                    <span>{lec.views || 0} views</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePlayLecture(lec)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Play Video</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(lec)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#1976d2] hover:bg-blue-50 dark:hover:bg-blue-950/60 cursor-pointer transition-colors"
                    title="Edit Lecture Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteLecture(lec.id, lec.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer transition-colors"
                    title="Delete Lecture & Video File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. MODAL: UPLOAD RECORDED LECTURE & 5-10 GB VIDEO FILE            */}
      {/* ================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#1976d2]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingLecture ? 'Edit Recorded Lecture' : 'Upload Recorded Lecture (5-10 GB Supported)'}
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
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 text-xs font-semibold flex items-center gap-2 border border-blue-200 dark:border-blue-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Upload Progress Bar for 5-10 GB Videos */}
            {uploadProgress && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1976d2] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Streaming Original Video to Server Disk...</span>
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {uploadProgress.percent}% ({formatBytes(uploadProgress.loadedBytes)} / {formatBytes(uploadProgress.totalBytes)})
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Please keep this window open while the video streams. Node.js writes directly to disk to prevent RAM overload.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveLecture} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Physics: Light Reflection Complete 2-Hour Masterclass"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                />
              </div>

              {/* Subject, Grade, Duration */}
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
                    <option value="Science (Physics)">Science (Physics)</option>
                    <option value="Science (Chemistry)">Science (Chemistry)</option>
                    <option value="Science (Biology)">Science (Biology)</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Commerce (Accounts)">Commerce (Accounts)</option>
                    <option value="Commerce (Economics)">Commerce (Economics)</option>
                    <option value="Commerce (BST)">Commerce (BST)</option>
                    <option value="English Core">English Core</option>
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
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 hr 45 min"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  />
                </div>
              </div>

              {/* Chapter & Faculty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Chapter / Unit Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 10: Light Reflection & Refraction"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Faculty / Mentor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Er. Alok Goyal"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Topics Covered / Summary
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Complete derivation of mirror formula, ray diagrams, step-by-step board numericals."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                />
              </div>

              {/* ========================================================= */}
              {/* VIDEO SOURCE SELECTION (FILE OR LINK)                     */}
              {/* ========================================================= */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#1976d2]" />
                    <span>Video Source (Upload 5-10 GB Video or Link)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'file' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        formData.videoType === 'file' 
                          ? 'bg-[#1976d2] text-white' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      📁 Upload File (5-10 GB)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, videoType: 'url' })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        formData.videoType === 'url' 
                          ? 'bg-[#1976d2] text-white' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      🔗 Paste Video Link
                    </button>
                  </div>
                </div>

                {formData.videoType === 'file' ? (
                  <div className="space-y-2">
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileSelect}
                      className="hidden"
                      id="lecture-video-input"
                    />
                    <label
                      htmlFor="lecture-video-input"
                      className="w-full p-4 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-[#1976d2] bg-white dark:bg-slate-900 cursor-pointer flex flex-col items-center justify-center gap-1.5 text-center transition-colors"
                    >
                      <Upload className="w-6 h-6 text-[#1976d2]" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {selectedVideoFile ? selectedVideoFile.name : 'Select or Drop Recorded Video File (.mp4, .mkv, .webm, .mov)'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedVideoFile 
                          ? `Size: ${formatBytes(selectedVideoFile.size)} • Ready for upload` 
                          : '5 GB, 10 GB, or any size supported. Streamed directly to disk.'}
                      </span>
                    </label>

                    {editingLecture?.videoFileName && !selectedVideoFile && (
                      <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Current file on server: {editingLecture.videoFileName} ({editingLecture.fileSize || 'Stored on disk'})</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Direct Video URL / Google Drive / YouTube Link
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://drive.google.com/... or https://commondatastorage.googleapis.com/...mp4"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1976d2]"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isSaving}
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
                  <span>{editingLecture ? 'Save Changes' : 'Publish Lecture Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. VIDEO PLAYER MODAL (HTTP 206 BYTE-RANGE STREAMING PLAYER)       */}
      {/* ================================================================= */}
      {activePlayingLecture && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setActivePlayingLecture(null)}
        >
          <div 
            className="relative max-w-4xl w-full flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Player Topbar */}
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white mr-2">
                  {activePlayingLecture.subject}
                </span>
                <span className="text-sm font-bold truncate">
                  {activePlayingLecture.title}
                </span>
              </div>
              <button
                onClick={() => setActivePlayingLecture(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="Close Player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Element */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoElementRef}
                src={activePlayingLecture.videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Controls Bar & Lecture Info */}
            <div className="p-4 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div className="space-y-0.5">
                <div className="text-xs text-slate-400">
                  Faculty: <span className="text-white font-semibold">{activePlayingLecture.faculty}</span> • Class: {activePlayingLecture.grade} {activePlayingLecture.fileSize ? `• Size: ${activePlayingLecture.fileSize}` : ''}
                </div>
                {activePlayingLecture.description && (
                  <p className="text-[11px] text-slate-500 max-w-md line-clamp-1">
                    {activePlayingLecture.description}
                  </p>
                )}
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <span className="text-[11px] text-slate-400 mr-1 font-semibold">Speed:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                      playbackSpeed === spd
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
    </div>
  );
}
