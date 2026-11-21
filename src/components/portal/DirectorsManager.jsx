import { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  Upload, 
  ImageIcon, 
  Sparkles,
  GraduationCap,
  Briefcase,
  User,
  X,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../../api/client';

export default function DirectorsManager({ onDataSaved = null }) {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    designation: 'Academic Director',
    qualification: '',
    subject: '',
    experience: '12+ Years Experience',
    badge: 'Executive Director',
    photo: '',
    description: '',
    specialties: []
  });

  // Current new specialty tag input
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const fileInputRef = useRef(null);

  // Load directors list
  const loadDirectors = async () => {
    setLoading(true);
    try {
      const data = await api.getDirectors();
      setDirectors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading directors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectors();
  }, []);

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, photo: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Add specialty tag
  const handleAddSpecialty = (e) => {
    e.preventDefault();
    const tag = newSpecialtyInput.trim();
    if (!tag) return;
    if (form.specialties.includes(tag)) {
      setNewSpecialtyInput('');
      return;
    }
    setForm(prev => ({
      ...prev,
      specialties: [...prev.specialties, tag]
    }));
    setNewSpecialtyInput('');
  };

  // Remove specialty tag
  const handleRemoveSpecialty = (idx) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== idx)
    }));
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      designation: 'Academic Director',
      qualification: '',
      subject: '',
      experience: '12+ Years Experience',
      badge: 'Executive Director',
      photo: '',
      description: '',
      specialties: []
    });
    setNewSpecialtyInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Start editing a director
  const startEdit = (dir) => {
    setEditingId(dir.id);
    setForm({
      name: dir.name || '',
      designation: dir.designation || 'Academic Director',
      qualification: dir.qualification || '',
      subject: dir.subject || '',
      experience: dir.experience || '12+ Years Experience',
      badge: dir.badge || 'Executive Director',
      photo: dir.photo || '',
      description: dir.description || '',
      specialties: Array.isArray(dir.specialties) ? [...dir.specialties] : []
    });
    setNewSpecialtyInput('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg('Please enter the director name.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        name: form.name.trim(),
        designation: form.designation.trim() || 'Academic Director',
        qualification: form.qualification.trim(),
        subject: form.subject.trim(),
        experience: form.experience.trim() || '12+ Years Experience',
        badge: form.badge.trim() || 'Executive Director',
        photo: form.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        description: form.description.trim(),
        specialties: form.specialties
      };

      if (editingId) {
        // Update existing director in array
        const updatedList = directors.map(d => d.id === editingId ? { ...payload, id: editingId } : d);
        await api.updateDirectors(updatedList);
        setDirectors(updatedList);
        setSuccessMsg(`Director "${payload.name}" updated successfully!`);
      } else {
        // Add new director
        const res = await api.addDirector(payload);
        if (res && res.directors) {
          setDirectors(res.directors);
        } else {
          await loadDirectors();
        }
        setSuccessMsg(`Director "${payload.name}" added successfully to website!`);
      }

      resetForm();
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving director', err);
      setErrorMsg(err.message || 'Failed to save director.');
    } finally {
      setSaving(false);
    }
  };

  // Delete director
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this director'}" from the website?`)) {
      return;
    }

    try {
      const res = await api.deleteDirector(id);
      if (res && res.directors) {
        setDirectors(res.directors);
      } else {
        setDirectors(prev => prev.filter(d => d.id !== id));
      }
      setSuccessMsg(`Director "${name}" removed successfully.`);
      if (editingId === id) resetForm();
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error deleting director: ' + err.message);
    }
  };

  // Move up/down order
  const moveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= directors.length) return;

    const copy = [...directors];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    setDirectors(copy);
    try {
      await api.updateDirectors(copy);
      if (onDataSaved) onDataSaved();
    } catch (err) {
      console.error('Error updating director order', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Live Homepage Section
            </span>
            <span className="text-xs text-slate-400">Total: {directors.length} Directors</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-400" /> Our Awesome Directors Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add, update, or remove Director cards here. Everything you add or delete appears immediately in the "Our Awesome Directors" section on the homepage!
          </p>
        </div>

        {editingId && (
          <button
            onClick={resetForm}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start sm:self-auto cursor-pointer"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <X className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form + Live List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Add / Edit Form (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit className="w-4 h-4 text-amber-400" /> Edit Director Profile
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-blue-400" /> Add New Director
                </>
              )}
            </h3>
            {editingId && (
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                Editing
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Director Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Goyal Sir or CA Deepak Goyal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Designation & Badge */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Academic Director"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Badge Pill</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Director"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Qualification & Subject */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc Mathematics (Gold Medalist)"
                  value={form.qualification}
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Experience Info</label>
                <input
                  type="text"
                  placeholder="e.g. 15+ Years Board Mastery"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Photo Selection / Upload */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Director Photo</label>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {form.photo ? (
                    <img src={form.photo} alt="Director Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="director-photo-upload"
                  />
                  <label
                    htmlFor="director-photo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload from Computer
                  </label>
                  <p className="text-[10px] text-slate-400">PNG, JPG, WEBP. Square photos look best.</p>
                </div>
              </div>

              {/* Or paste photo URL */}
              <input
                type="url"
                placeholder="Or paste image URL (https://...)"
                value={form.photo}
                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bio / Description</label>
              <textarea
                rows={3}
                placeholder="e.g. Visionary educator who has personally trained 6,800+ students and guided 420+ students to perfect 100/100 scores in CBSE Board examinations."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Key Specialties / Focus Points */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Specialties & Key Highlights ({form.specialties.length})
              </label>
              
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Class 9–10 Board Mastery"
                  value={newSpecialtyInput}
                  onChange={(e) => setNewSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty(e);
                    }
                  }}
                  className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialty}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                {form.specialties.length === 0 ? (
                  <span className="text-[11px] text-slate-500 italic">No specialties added yet. Add points above.</span>
                ) : (
                  form.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px]"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(i)}
                        className="hover:text-rose-400 p-0.5 ml-0.5 cursor-pointer"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Submit & Reset Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : editingId ? 'Update Director' : 'Add Director to Website'}</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </div>

        {/* RIGHT: Live Directors List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Active Directors on Website</h3>
              <p className="text-[11px] text-slate-400">Order here matches the homepage display from left to right</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {directors.length} Live
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading directors...</div>
          ) : directors.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel border border-dashed border-slate-700">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No Directors Configured Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Use the form on the left to add your first director. They will immediately appear in the "Our Awesome Directors" section of the website!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {directors.map((dir, index) => (
                <div
                  key={dir.id || index}
                  className={`p-5 rounded-2xl glass-panel border transition-all ${
                    editingId === dir.id
                      ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    
                    {/* Director Photo & Name Header */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={dir.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                          alt={dir.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {dir.badge || 'Executive Director'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{dir.experience}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">{dir.name}</h4>
                        <p className="text-xs text-blue-400 font-semibold">{dir.designation}</p>
                        {dir.qualification && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3 text-slate-500" /> {dir.qualification}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Reorder, Edit, Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => moveOrder(index, -1)}
                        disabled={index === 0}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Left / Earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveOrder(index, 1)}
                        disabled={index === directors.length - 1}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Right / Later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEdit(dir)}
                        className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 cursor-pointer ml-1"
                        title="Edit Director Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dir.id, dir.name)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 cursor-pointer"
                        title="Delete Director"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Description */}
                  {dir.description && (
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                      {dir.description}
                    </p>
                  )}

                  {/* Specialties Pills */}
                  {Array.isArray(dir.specialties) && dir.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                      {dir.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{spec}</span>
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
