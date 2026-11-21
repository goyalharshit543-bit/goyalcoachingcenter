import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  Upload, 
  ImageIcon, 
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  GraduationCap,
  Users,
  User,
  BarChart3
} from 'lucide-react';
import { api } from '../../api/client';

export default function ShiningStarsManager({ onDataSaved = null }) {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Impact Stats State (15 Courses, 7286 Students, 25 Teachers)
  const [statsForm, setStatsForm] = useState({
    courses: 15,
    students: 7286,
    teachers: 25
  });
  const [statsSaving, setStatsSaving] = useState(false);
  const [statsSuccessMsg, setStatsSuccessMsg] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    score: '',
    exam: '',
    secondaryScore: '',
    secondaryExam: '',
    college: '',
    photo: '',
    year: '2026'
  });

  const fileInputRef = useRef(null);

  // Fetch data
  const loadStars = async () => {
    setLoading(true);
    try {
      const [starsData, statsData] = await Promise.all([
        api.getShiningStars(),
        api.getImpactStats()
      ]);
      setStars(Array.isArray(starsData) ? starsData : []);
      if (statsData) {
        setStatsForm({
          courses: statsData.courses ?? 15,
          students: statsData.students ?? 7286,
          teachers: statsData.teachers ?? 25
        });
      }
    } catch (err) {
      console.error('Error loading stars and stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStars();
  }, []);

  // Save Impact Stats (Courses, Students, Teachers)
  const handleSaveStats = async (e) => {
    e.preventDefault();
    setStatsSaving(true);
    try {
      const payload = {
        courses: Number(statsForm.courses) || 15,
        students: Number(statsForm.students) || 7286,
        teachers: Number(statsForm.teachers) || 25
      };
      await api.updateImpactStats(payload);
      setStatsSuccessMsg('Homepage impact statistics updated successfully!');
      if (onDataSaved) onDataSaved();
      setTimeout(() => setStatsSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving impact stats', err);
    } finally {
      setStatsSaving(false);
    }
  };

  // Handle local file upload with FileReader
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setForm((prev) => ({ ...prev, photo: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  // Preset student avatars
  const presetPhotos = [
    { label: 'Student 1', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
    { label: 'Student 2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { label: 'Student 3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { label: 'Student 4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    { label: 'Student 5', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
    { label: 'Student 6', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
  ];

  // Submit form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.score.trim()) {
      setErrorMsg('Please enter student name and score/rank.');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    try {
      const studentPayload = {
        name: form.name.trim().toUpperCase(),
        score: form.score.trim(),
        exam: (form.exam || 'CBSE Board').trim().toUpperCase(),
        secondaryScore: (form.secondaryScore || '').trim(),
        secondaryExam: (form.secondaryExam || '').trim().toUpperCase(),
        college: (form.college || 'TOP COLLEGE').trim().toUpperCase(),
        photo: form.photo || presetPhotos[0].url,
        year: form.year || '2026'
      };

      let updatedStars;
      if (editingId) {
        updatedStars = stars.map((s) => 
          s.id === editingId ? { ...s, ...studentPayload } : s
        );
      } else {
        const newStar = {
          ...studentPayload,
          id: 'star-' + Date.now()
        };
        updatedStars = [newStar, ...stars];
      }

      await api.updateShiningStars(updatedStars);
      setStars(updatedStars);
      setSuccessMsg(editingId ? 'Student star updated successfully!' : 'New Shining Star added successfully!');
      
      // Reset form
      setEditingId(null);
      setForm({
        name: '',
        score: '',
        exam: '',
        secondaryScore: '',
        secondaryExam: '',
        college: '',
        photo: '',
        year: '2026'
      });

      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save student star.');
    } finally {
      setSaving(false);
    }
  };

  // Start edit
  const handleStartEdit = (star) => {
    setEditingId(star.id);
    setForm({
      name: star.name || '',
      score: star.score || '',
      exam: star.exam || '',
      secondaryScore: star.secondaryScore || '',
      secondaryExam: star.secondaryExam || '',
      college: star.college || '',
      photo: star.photo || '',
      year: star.year || '2026'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      name: '',
      score: '',
      exam: '',
      secondaryScore: '',
      secondaryExam: '',
      college: '',
      photo: '',
      year: '2026'
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this Shining Star student?')) return;
    setSaving(true);
    try {
      const updated = stars.filter((s) => s.id !== id);
      await api.updateShiningStars(updated);
      setStars(updated);
      setSuccessMsg('Student star removed.');
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete student.');
    } finally {
      setSaving(false);
    }
  };

  // Move Up / Down (Reorder)
  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= stars.length) return;

    const updated = [...stars];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    setStars(updated);
    setSaving(true);
    try {
      await api.updateShiningStars(updated);
      if (onDataSaved) onDataSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Shining Stars Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Our Shining Stars Showcase Manager
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Add topper student photos, exam percentiles, All India Ranks (AIR), and college selection banners. Cards automatically slide one by one on the website homepage!
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
          <div className="text-2xl font-black text-white">{stars.length}</div>
          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Active Stars</div>
        </div>
      </div>

      {/* ================= IMPACT STATISTICS COUNTER EDITOR ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-2 border border-blue-200 dark:border-blue-800">
              <BarChart3 className="w-3.5 h-3.5" /> Homepage Metrics
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Institution Impact Statistics</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Edit the live numbers displayed in the 3-column stats bar directly below the Shining Stars section on the homepage.
            </p>
          </div>
        </div>

        {statsSuccessMsg && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{statsSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveStats} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Courses Input */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Total Courses</span>
              </label>
              <input
                type="number"
                min="1"
                value={statsForm.courses}
                onChange={(e) => setStatsForm({ ...statsForm, courses: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 font-black text-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Displays on home banner</span>
            </div>

            {/* Students Input */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Total Students Enrolled</span>
              </label>
              <input
                type="number"
                min="1"
                value={statsForm.students}
                onChange={(e) => setStatsForm({ ...statsForm, students: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 font-black text-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Displays on home banner</span>
            </div>

            {/* Teachers Input */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Faculty / Teachers Count</span>
              </label>
              <input
                type="number"
                min="1"
                value={statsForm.teachers}
                onChange={(e) => setStatsForm({ ...statsForm, teachers: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 font-black text-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Displays on home banner</span>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={statsSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{statsSaving ? 'Saving...' : 'Save & Update Homepage Stats'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold flex items-center gap-3">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form: Add or Edit Student Star */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {editingId ? <Edit className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-blue-600" />}
            <span>{editingId ? 'Edit Shining Star Record' : 'Add New Shining Star Student'}</span>
          </h3>

          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Student Name *
              </label>
              <input
                type="text"
                placeholder="e.g. PRACHI, BHARTI GARG"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Primary Score / Rank */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Primary Score / Rank *
              </label>
              <input
                type="text"
                placeholder="e.g. 670/720, AIR 958, 99.04%ile"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Primary Exam Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Primary Exam Tag *
              </label>
              <input
                type="text"
                placeholder="e.g. NEET 2024, JEE ADVANCED 2024"
                value={form.exam}
                onChange={(e) => setForm({ ...form, exam: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Secondary Score (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Secondary Score (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 99.98%ile"
                value={form.secondaryScore}
                onChange={(e) => setForm({ ...form, secondaryScore: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Secondary Exam Tag (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Secondary Exam Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. JEE MAIN 2024"
                value={form.secondaryExam}
                onChange={(e) => setForm({ ...form, secondaryExam: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* College / Arrow Banner Ribbon */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                College / Selection Arrow Ribbon *
              </label>
              <input
                type="text"
                placeholder="e.g. GMC PATIALA, IIT DELHI, SRCC DELHI"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

          </div>

          {/* Photo Upload Section */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Student Portrait Photo *
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Photo Preview Circle */}
              <div className="shrink-0 text-center">
                <div className="relative inline-block">
                  <img
                    src={form.photo || presetPhotos[0].url}
                    alt="Preview"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover object-top border-4 border-blue-600 shadow-xl bg-slate-100"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = presetPhotos[0].url;
                    }}
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950 text-[10px] text-white font-bold whitespace-nowrap">
                    Preview
                  </div>
                </div>
              </div>

              {/* Upload & URL Controls */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Student Photo (File)</span>
                  </button>

                  <span className="text-xs text-slate-400 font-semibold">OR Enter Direct URL:</span>
                </div>

                <input
                  type="url"
                  placeholder="https://example.com/student-photo.jpg"
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                />

                {/* Quick Avatar Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-slate-500">Quick Presets:</span>
                  {presetPhotos.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setForm({ ...form, photo: preset.url })}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : editingId ? 'Update Shining Star' : 'Add Shining Star Card'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Shining Stars Roster */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Configured Shining Stars ({stars.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reorder or delete student cards. They display in this order on the website carousel.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold">
            Loading shining stars...
          </div>
        ) : stars.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold">
            No shining stars added yet. Use the form above to add students!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stars.map((star, idx) => (
              <div
                key={star.id || idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-sm"
              >
                <div>
                  {/* Photo & Actions header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={star.photo || presetPhotos[0].url}
                      alt={star.name}
                      className="w-14 h-14 rounded-full object-cover object-top border-2 border-blue-500 shadow-md shrink-0 bg-slate-100"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = presetPhotos[0].url;
                      }}
                    />

                    {/* Order Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        title="Move Left/Earlier"
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-100 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-xs"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === stars.length - 1}
                        title="Move Right/Later"
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-100 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-xs"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase truncate">
                    {star.name}
                  </h4>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {star.score} • <span className="text-[11px] text-slate-500">{star.exam}</span>
                  </div>
                  {star.secondaryScore && (
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {star.secondaryScore} ({star.secondaryExam})
                    </div>
                  )}

                  {/* Ribbon target */}
                  <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300 text-[11px] font-black uppercase truncate border border-blue-500/20">
                    🎯 {star.college || 'TOP SELECTION'}
                  </div>
                </div>

                {/* Card footer buttons */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleStartEdit(star)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-amber-100 hover:text-amber-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(star.id)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
