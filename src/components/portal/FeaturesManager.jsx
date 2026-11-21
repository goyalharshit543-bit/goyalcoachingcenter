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
  Users, 
  Video, 
  Calendar, 
  Fingerprint, 
  BookOpen, 
  Laptop, 
  BarChart3, 
  FileCheck2, 
  Wind,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { api } from '../../api/client';
import { resolveFeatureIcon } from '../website/OurFeaturesSection';

export default function FeaturesManager({ onDataSaved = null }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    iconKey: 'users',
    iconUrl: '',
    badge: 'Feature'
  });

  const fileInputRef = useRef(null);

  const availableIcons = [
    { key: 'users', label: 'Students / Extra Support', icon: Users },
    { key: 'cctv', label: 'CCTV / Security Camera', icon: Video },
    { key: 'calendar', label: 'Planner & Coursework', icon: Calendar },
    { key: 'fingerprint', label: 'Biometric Attendance', icon: Fingerprint },
    { key: 'library', label: 'Library & Study Zone', icon: BookOpen },
    { key: 'laptop', label: 'Online Testing Lab', icon: Laptop },
    { key: 'sparkles', label: 'Motivational & Guidance', icon: Sparkles },
    { key: 'chart', label: 'Performance Analysis', icon: BarChart3 },
    { key: 'video', label: 'Lecture Recording Lab', icon: Video },
    { key: 'filecheck', label: 'Objective + Subjective', icon: FileCheck2 },
    { key: 'airvent', label: 'Smart AC Classrooms', icon: Wind },
    { key: 'shield', label: 'Safety & Trust', icon: ShieldCheck },
    { key: 'grad', label: 'Faculty & Mentors', icon: GraduationCap }
  ];

  const loadFeatures = async () => {
    setLoading(true);
    try {
      const data = await api.getFeatures();
      setFeatures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading features', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  // Handle local icon file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, SVG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, iconUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg('Please enter a feature title.');
      return;
    }

    setErrorMsg('');
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        subtitle: (form.subtitle || '').trim(),
        iconKey: (form.iconKey || 'users').toLowerCase(),
        iconUrl: (form.iconUrl || '').trim(),
        badge: (form.badge || 'Feature').trim()
      };

      let updatedList;
      if (editingId) {
        updatedList = features.map(f => 
          f.id === editingId ? { ...f, ...payload } : f
        );
      } else {
        const newFeat = {
          ...payload,
          id: 'feat-' + Date.now()
        };
        updatedList = [...features, newFeat];
      }

      await api.updateFeatures(updatedList);
      setFeatures(updatedList);
      setSuccessMsg(editingId ? 'Feature updated successfully!' : 'New feature added successfully!');
      
      setEditingId(null);
      setForm({
        title: '',
        subtitle: '',
        iconKey: 'users',
        iconUrl: '',
        badge: 'Feature'
      });

      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save feature.');
    } finally {
      setSaving(false);
    }
  };

  // Start edit
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      iconKey: item.iconKey || 'users',
      iconUrl: item.iconUrl || '',
      badge: item.badge || 'Feature'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      title: '',
      subtitle: '',
      iconKey: 'users',
      iconUrl: '',
      badge: 'Feature'
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this feature?')) return;
    setSaving(true);
    try {
      const updated = features.filter(f => f.id !== id);
      await api.updateFeatures(updated);
      setFeatures(updated);
      setSuccessMsg('Feature removed.');
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete feature.');
    } finally {
      setSaving(false);
    }
  };

  // Move Up / Down
  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= features.length) return;

    const updated = [...features];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    setFeatures(updated);
    setSaving(true);
    try {
      await api.updateFeatures(updated);
      if (onDataSaved) onDataSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const SelectedIcon = resolveFeatureIcon(form.iconKey);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Features Carousel Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Our Features Showcase Manager
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
            Add and manage campus features (CCTV, Biometric Attendance, AC Classrooms, etc.). They display in an automated 1-by-1 sliding carousel on the homepage!
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
          <div className="text-2xl font-black text-white">{features.length}</div>
          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Active Features</div>
        </div>
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

      {/* Form: Add or Edit Feature */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {editingId ? <Edit className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-blue-600" />}
            <span>{editingId ? 'Edit Feature Card' : 'Add New Feature to Carousel'}</span>
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
            
            {/* Feature Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Feature Title *
              </label>
              <input
                type="text"
                placeholder="e.g. CCTV Campus, Smart AC Classrooms"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Subtitle / Short Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Subtitle / Description
              </label>
              <input
                type="text"
                placeholder="e.g. 24/7 High-Definition Surveillance & Student Safety"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Category Badge
              </label>
              <input
                type="text"
                placeholder="e.g. Campus Safety, Student Care"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

          </div>

          {/* Icon Selector & Preview */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Feature Icon / Illustration
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Live Icon Preview */}
              <div className="shrink-0 text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-blue-600 shadow-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {form.iconUrl ? (
                      <img src={form.iconUrl} alt="Preview" className="w-12 h-12 object-contain" />
                    ) : (
                      <SelectedIcon className="w-10 h-10 stroke-[2.2]" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950 text-[10px] text-white font-bold whitespace-nowrap">
                    Preview
                  </div>
                </div>
              </div>

              {/* Icon Presets & Upload */}
              <div className="flex-1 w-full space-y-3">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Choose an Icon Preset:
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {availableIcons.map((item) => {
                    const Icon = item.icon;
                    const isSelected = form.iconKey === item.key && !form.iconUrl;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setForm({ ...form, iconKey: item.key, iconUrl: '' })}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom File Upload Option */}
                <div className="flex items-center gap-3 pt-2 flex-wrap">
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
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Custom Icon / Illustration</span>
                  </button>

                  {form.iconUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, iconUrl: '' })}
                      className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Reset to vector icon
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              <span>{saving ? 'Saving...' : editingId ? 'Update Feature' : 'Add Feature to Carousel'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Roster of Configured Features */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Configured Campus Features ({features.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reorder or delete feature cards. They display in this order on the website carousel.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold">
            Loading features...
          </div>
        ) : features.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold">
            No features configured. Use the form above to add features!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((item, idx) => {
              const Icon = resolveFeatureIcon(item.iconKey);

              return (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-sm"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt="icon" className="w-7 h-7 object-contain" />
                        ) : (
                          <Icon className="w-6 h-6 stroke-[2]" />
                        )}
                      </div>

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
                          disabled={idx === features.length - 1}
                          title="Move Right/Later"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-100 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-xs"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {item.badge || 'Feature'}
                    </span>
                    
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase truncate mt-2">
                      {item.title}
                    </h4>
                    
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-amber-100 hover:text-amber-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-rose-100 hover:text-rose-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
