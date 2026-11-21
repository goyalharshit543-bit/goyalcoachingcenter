import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Briefcase, 
  Calculator, 
  Award, 
  GraduationCap, 
  Laptop, 
  Sparkles, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  X, 
  HelpCircle 
} from 'lucide-react';
import { api } from '../../api/client';
import { resolveCourseIcon } from '../website/ExploreCoursesSection';

export default function CoursesManager({ onDataSaved = null }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing Course State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    iconKey: 'book',
    points: ['Mathematics', 'Science'],
    classes: ['Class 9', 'Class 10']
  });

  // Inputs for adding point and class tag to the active form
  const [newPointInput, setNewPointInput] = useState('');
  const [newClassInput, setNewClassInput] = useState('');

  const availableIcons = [
    { key: 'book', label: 'Foundation / Academics', icon: BookOpen },
    { key: 'briefcase', label: 'Commerce / Professional', icon: Briefcase },
    { key: 'calculator', label: 'Accounts & Economics', icon: Calculator },
    { key: 'grad', label: 'Senior Secondary / Mentorship', icon: GraduationCap },
    { key: 'award', label: 'Competitive / Olympiad', icon: Award },
    { key: 'laptop', label: 'Digital / Online Test Lab', icon: Laptop },
    { key: 'sparkles', label: 'Specialized Courses', icon: Sparkles },
    { key: 'users', label: 'Small Batch Care', icon: Users }
  ];

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await api.getExploreCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Point management inside form
  const handleAddPointToForm = () => {
    const trimmed = (newPointInput || '').trim();
    if (!trimmed) return;
    if (form.points.includes(trimmed)) {
      setErrorMsg('Point already exists in this course.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setForm(prev => ({
      ...prev,
      points: [...prev.points, trimmed]
    }));
    setNewPointInput('');
  };

  const handleRemovePointFromForm = (pointToRemove) => {
    setForm(prev => ({
      ...prev,
      points: prev.points.filter(p => p !== pointToRemove)
    }));
  };

  // Class badge management inside form
  const handleAddClassToForm = () => {
    const trimmed = (newClassInput || '').trim();
    if (!trimmed) return;
    if (form.classes.includes(trimmed)) {
      setErrorMsg('Class badge already exists.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setForm(prev => ({
      ...prev,
      classes: [...prev.classes, trimmed]
    }));
    setNewClassInput('');
  };

  const handleRemoveClassFromForm = (classToRemove) => {
    setForm(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c !== classToRemove)
    }));
  };

  // Submit Course Form (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!form.title.trim()) {
      setErrorMsg('Course title is required.');
      return;
    }

    if (form.points.length === 0) {
      setErrorMsg('Please add at least one subject/point to the course.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        iconKey: (form.iconKey || 'book').toLowerCase().trim(),
        points: form.points,
        classes: form.classes
      };

      let updatedList;
      if (editingId) {
        updatedList = courses.map(c => 
          c.id === editingId ? { ...c, ...payload } : c
        );
      } else {
        const newCourse = {
          ...payload,
          id: 'course-' + Date.now()
        };
        updatedList = [...courses, newCourse];
      }

      await api.updateExploreCourses(updatedList);
      setCourses(updatedList);
      setSuccessMsg(editingId ? 'Course updated successfully!' : 'New course added successfully!');
      
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        iconKey: 'book',
        points: [],
        classes: []
      });

      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save course changes.');
    } finally {
      setSaving(false);
    }
  };

  // Start edit
  const handleStartEdit = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title || '',
      description: course.description || '',
      iconKey: course.iconKey || 'book',
      points: Array.isArray(course.points) ? [...course.points] : [],
      classes: Array.isArray(course.classes) ? [...course.classes] : []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      iconKey: 'book',
      points: [],
      classes: []
    });
  };

  // Delete course
  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await api.deleteExploreCourse(id);
      if (res && res.exploreCourses) {
        setCourses(res.exploreCourses);
      } else {
        setCourses(prev => prev.filter(c => c.id !== id));
      }
      setSuccessMsg(`"${title}" deleted successfully!`);
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete course.');
    }
  };

  // Reorder courses
  const handleMove = async (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= courses.length) return;

    const copy = [...courses];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);

    setCourses(copy);
    try {
      await api.updateExploreCourses(copy);
      if (onDataSaved) onDataSaved();
    } catch (err) {
      console.error(err);
      loadCourses();
    }
  };

  // Direct quick delete point on any course in the roster
  const handleQuickDeletePoint = async (courseId, pointToDelete) => {
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          points: (c.points || []).filter(p => p !== pointToDelete)
        };
      }
      return c;
    });

    setCourses(updated);
    try {
      await api.updateExploreCourses(updated);
      setSuccessMsg(`Point "${pointToDelete}" deleted.`);
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      loadCourses();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5 text-blue-200" />
            <span>Academic Curriculum & Course Administration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Explore Our Courses Manager
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Manage the academic courses shown on the website. You can add new courses, edit titles, modify target classes, and freely add or delete individual subject points with 1-click.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-bold text-sm flex items-center gap-2.5 shadow-sm">
          <X className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form: Add or Edit Course */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingId ? 'Edit Course & Points' : 'Add New Course to Catalog'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingId ? 'Update course details, delete or add points' : 'Fill details below to publish a new course card'}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Foundation (Class 7-10) or Commerce (Class 11-12)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Icon Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Select Course Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {availableIcons.map(ic => {
                  const Icon = ic.icon;
                  const isSelected = form.iconKey === ic.key;
                  return (
                    <button
                      key={ic.key}
                      type="button"
                      onClick={() => setForm({ ...form, iconKey: ic.key })}
                      title={ic.label}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 scale-105' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold truncate max-w-full">{ic.key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Course Summary / Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Build a strong academic base with our structured curriculum for students in classes 7 to 10."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* POINTS / SUBJECTS MANAGER */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Course Points / Covered Subjects ({form.points.length})</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click '✕' on any point to delete it
                </span>
              </div>

              {/* Input to add a new point */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newPointInput}
                  onChange={e => setNewPointInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPointToForm();
                    }
                  }}
                  placeholder="Type subject / point name (e.g. Accountancy, Physics, Mathematics) and press Enter"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddPointToForm}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Point</span>
                </button>
              </div>

              {/* Points Chips */}
              <div className="flex flex-wrap gap-2">
                {form.points.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-2">
                    No points added yet. Type a subject name above and click "Add Point".
                  </div>
                ) : (
                  form.points.map((pt, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center gap-2 py-1.5 pl-3 pr-2 rounded-full bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/80 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs group"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{pt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePointFromForm(pt)}
                        title={`Delete "${pt}"`}
                        className="w-5 h-5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/80 text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors ml-1"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CLASS BADGES MANAGER */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Target Class Badges ({form.classes.length})
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Buttons shown at the bottom of the course card
                </span>
              </div>

              {/* Input to add class */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={newClassInput}
                  onChange={e => setNewClassInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddClassToForm();
                    }
                  }}
                  placeholder="e.g. Class 7, Class 8, Class 11..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddClassToForm}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Class Badge</span>
                </button>
              </div>

              {/* Class Badges Chips */}
              <div className="flex flex-wrap gap-2">
                {form.classes.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-2">
                    No classes added.
                  </div>
                ) : (
                  form.classes.map((cls, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-center gap-1.5 py-1 pl-3 pr-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-xs select-none"
                    >
                      <span>{cls}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClassFromForm(cls)}
                        title={`Delete "${cls}"`}
                        className="w-4 h-4 rounded-full hover:bg-white/20 text-white flex items-center justify-center cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer hover:bg-slate-300"
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
              <span>{saving ? 'Saving...' : editingId ? 'Update Course & Points' : 'Publish Course'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Roster of Courses */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Configured Academic Courses ({courses.length})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Below are the live courses active on the homepage. You can reorder, edit, delete courses or delete points directly.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold">
            No courses configured yet. Fill the form above to add a course!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => {
              const Icon = resolveCourseIcon(course.iconKey);
              const pointsList = Array.isArray(course.points) ? course.points : [];
              const classesList = Array.isArray(course.classes) ? course.classes : [];

              return (
                <div
                  key={course.id || idx}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between shadow-sm hover:border-blue-500/50 transition-all"
                >
                  <div>
                    {/* Header: Icon, Title & Order Controls */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                          <Icon className="w-6 h-6 stroke-[2]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Course #{idx + 1}
                          </span>
                          <h4 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                            {course.title}
                          </h4>
                        </div>
                      </div>

                      {/* Move Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          title="Move Earlier"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-100 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-xs"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === courses.length - 1}
                          title="Move Later"
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-100 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer shadow-xs"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {course.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        {course.description}
                      </p>
                    )}

                    {/* Points with 1-Click Delete */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Covered Points / Subjects ({pointsList.length}):
                      </div>
                      {pointsList.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 group"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{pt}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuickDeletePoint(course.id, pt)}
                            title={`Delete point "${pt}"`}
                            className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Class Badges */}
                    {classesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {classesList.map((cls, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-2xs select-none"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit & Delete Course */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(course)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Course / Points</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
