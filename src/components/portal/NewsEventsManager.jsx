import { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  Megaphone,
  Newspaper,
  Tag,
  Link as LinkIcon,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../../api/client';

export default function NewsEventsManager({ onDataSaved = null }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all'); // 'all' | 'news' | 'announcement'

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'news', // 'news' | 'announcement'
    badge: 'new',
    isNew: true,
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    content: '',
    link: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getNewsEvents();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading news and events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      category: 'news',
      badge: 'new',
      isNew: true,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      content: '',
      link: ''
    });
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      category: item.category || 'news',
      badge: item.badge || 'new',
      isNew: item.isNew !== undefined ? item.isNew : true,
      date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      content: item.content || '',
      link: item.link || ''
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg('Please enter a title for this item.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        badge: form.badge.trim() || 'new',
        isNew: Boolean(form.isNew),
        date: form.date.trim() || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        content: form.content.trim(),
        link: form.link.trim()
      };

      if (editingId) {
        const updatedList = items.map(item => item.id === editingId ? { ...payload, id: editingId } : item);
        await api.updateNewsEvents(updatedList);
        setItems(updatedList);
        setSuccessMsg(`"${payload.title}" updated successfully!`);
      } else {
        const res = await api.addNewsEvent(payload);
        if (res && res.newsEvents) {
          setItems(res.newsEvents);
        } else {
          await loadData();
        }
        setSuccessMsg(`"${payload.title}" added to ${payload.category === 'news' ? 'News & Events' : 'Announcements'}!`);
      }

      resetForm();
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving item', err);
      setErrorMsg(err.message || 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this item'}"?`)) {
      return;
    }

    try {
      const res = await api.deleteNewsEvent(id);
      if (res && res.newsEvents) {
        setItems(res.newsEvents);
      } else {
        setItems(prev => prev.filter(item => item.id !== id));
      }
      setSuccessMsg(`"${title}" deleted successfully.`);
      if (editingId === id) resetForm();
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Error deleting item: ' + err.message);
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    setItems(copy);
    try {
      await api.updateNewsEvents(copy);
      if (onDataSaved) onDataSaved();
    } catch (err) {
      console.error('Error updating order', err);
    }
  };

  const filteredItems = items.filter(item => {
    if (activeCategoryFilter === 'all') return true;
    return item.category === activeCategoryFilter;
  });

  const newsCount = items.filter(i => i.category === 'news').length;
  const announcementsCount = items.filter(i => i.category === 'announcement').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Homepage Live Section
            </span>
            <span className="text-xs text-slate-400">Total: {items.length} Bulletins</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-400" /> Latest News & Events Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add or manage accordion announcements and event notices. Any updates appear immediately in the "Latest News & Events" section on the homepage!
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
                  <Edit className="w-4 h-4 text-amber-400" /> Edit Bulletin Item
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-blue-400" /> Add News or Announcement
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
            
            {/* Category Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Display Column <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, category: 'news' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    form.category === 'news'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Newspaper className="w-4 h-4" /> News & Events (Left)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, category: 'announcement' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    form.category === 'announcement'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Megaphone className="w-4 h-4" /> Announcements (Right)
                </button>
              </div>
            </div>

            {/* Headline / Title */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Headline / Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 🎉 Goyal Coaching Center is Coming to Patiala! 🎉"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Badge & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Badge Text</label>
                <input
                  type="text"
                  placeholder="e.g. new, Urgent, Results"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Display Date</label>
                <input
                  type="text"
                  placeholder="e.g. November 2026"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Is 'new' red flag toggle */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <input
                type="checkbox"
                id="isNewToggle"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="isNewToggle" className="text-slate-300 text-xs cursor-pointer select-none">
                Highlight with red/amber <span className="italic font-bold text-rose-400">new</span> badge
              </label>
            </div>

            {/* Full Content (Visible on accordion expansion) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Accordion Body / Expanded Details
              </label>
              <textarea
                rows={4}
                placeholder="Write detailed announcements, venue, guidelines, or instructions displayed when user clicks to expand the accordion item..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Optional URL / Link */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Optional Link / Action URL</label>
              <input
                type="text"
                placeholder="e.g. https://... or /portal"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit & Reset Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item to Website'}</span>
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

        {/* RIGHT: Live Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setActiveCategoryFilter('news')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === 'news'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                News ({newsCount})
              </button>
              <button
                onClick={() => setActiveCategoryFilter('announcement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === 'announcement'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Announcements ({announcementsCount})
              </button>
            </div>

            <span className="text-[11px] text-slate-400">
              Drag or use arrows to reorder
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading news & announcements...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel border border-dashed border-slate-700">
              <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">No Bulletins in this Category</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Use the form on the left to add items to this section. They will appear immediately on the website!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`p-4 rounded-2xl glass-panel border transition-all ${
                    editingId === item.id
                      ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.category === 'news'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {item.category === 'news' ? 'News & Events' : 'Announcement'}
                        </span>

                        {item.isNew && (
                          <span className="italic font-bold text-rose-400 text-[11px]">
                            {item.badge || 'new'}
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.date}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {item.title}
                      </h4>

                      {item.content && (
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                          {item.content}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveOrder(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveOrder(index, 1)}
                        disabled={index === filteredItems.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
