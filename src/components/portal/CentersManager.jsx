import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Clock, 
  BookOpen, 
  Navigation, 
  ExternalLink, 
  Sparkles, 
  X,
  RefreshCw,
  Eye
} from 'lucide-react';
import { api } from '../../api/client';

export default function CentersManager({ onDataSaved = null }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    city: 'Bhikhi',
    district: 'Mansa',
    state: 'Punjab',
    pinCode: '151504',
    address: '',
    phone: '+91 98769 60163',
    email: 'bhikhi@goyalcoaching.edu.in',
    timings: 'Monday – Saturday: 3:00 PM – 8:30 PM | Sunday: 8:30 AM – 1:30 PM',
    courses: 'Class 8th–10th (Sci & Maths) • Class 11th–12th (Commerce) • GTSE Exam Center',
    googleMapsUrl: 'https://maps.app.goo.gl/g8yZ71a2HLVsZrV67',
    embedMapUrl: 'https://maps.google.com/maps?q=30.068777,75.5325527&hl=en&z=16&output=embed',
    isMain: false,
    status: 'Active',
    badge: 'Learning Center'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getCenters();
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading centers', err);
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
      name: '',
      city: 'Bhikhi',
      district: 'Mansa',
      state: 'Punjab',
      pinCode: '151504',
      address: '',
      phone: '+91 98769 60163',
      email: '',
      timings: 'Monday – Saturday: 3:00 PM – 8:30 PM',
      courses: 'Class 8th–10th (Sci & Maths) • Class 11th–12th (Commerce)',
      googleMapsUrl: '',
      embedMapUrl: '',
      isMain: false,
      status: 'Active',
      badge: 'Learning Center'
    });
    setErrorMsg('');
  };

  const handleStartEdit = (center) => {
    setEditingId(center.id);
    setForm({
      name: center.name || '',
      city: center.city || 'Bhikhi',
      district: center.district || '',
      state: center.state || 'Punjab',
      pinCode: center.pinCode || '',
      address: center.address || '',
      phone: center.phone || '',
      email: center.email || '',
      timings: center.timings || '',
      courses: center.courses || '',
      googleMapsUrl: center.googleMapsUrl || '',
      embedMapUrl: center.embedMapUrl || '',
      isMain: Boolean(center.isMain),
      status: center.status || 'Active',
      badge: center.badge || 'Learning Center'
    });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Helper to generate embed url from address/query or coordinates
  const generateEmbedUrl = () => {
    if (form.googleMapsUrl && form.googleMapsUrl.includes('embed')) {
      setForm(prev => ({ ...prev, embedMapUrl: prev.googleMapsUrl }));
      return;
    }
    // If address or city provided
    const query = encodeURIComponent(`${form.name ? form.name + ', ' : ''}${form.address || form.city || 'Bhikhi, Punjab'}`);
    const embedUrl = `https://maps.google.com/maps?q=${query}&hl=en&z=16&output=embed`;
    setForm(prev => ({ ...prev, embedMapUrl: embedUrl }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim() || !form.address.trim()) {
      setErrorMsg('Center Name and Full Address are required.');
      return;
    }

    setSaving(true);
    try {
      let finalEmbed = form.embedMapUrl;
      if (!finalEmbed) {
        const query = encodeURIComponent(`${form.name}, ${form.address || form.city}`);
        finalEmbed = `https://maps.google.com/maps?q=${query}&hl=en&z=16&output=embed`;
      }

      const centerPayload = {
        ...form,
        embedMapUrl: finalEmbed
      };

      if (editingId) {
        await api.updateCenter(editingId, centerPayload);
        setSuccessMsg(`Center "${form.name}" updated successfully!`);
      } else {
        await api.addCenter(centerPayload);
        setSuccessMsg(`New Center "${form.name}" added successfully!`);
      }

      await loadData();
      resetForm();
      if (onDataSaved) onDataSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Error saving center details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove the center "${name}"?`)) {
      setSaving(true);
      try {
        await api.deleteCenter(id);
        await loadData();
        setSuccessMsg(`Center "${name}" was removed.`);
        if (onDataSaved) onDataSaved();
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        setErrorMsg('Failed to delete center.');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Stats Header */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Centers & Branches Management Desk</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Add or update coaching centers, set live Google Maps locations, contact info, and manage branch details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{centers.length} Centers Active</span>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-all"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <X className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ================= ADD / EDIT CENTER FORM ================= */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-blue-500/30 bg-slate-900/60">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Coaching Center' : 'Add New Coaching Center'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure center details and attach its live Google Maps pin
              </p>
            </div>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Center Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Center Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Goyal Coaching Centre - Bhikhi Center"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                City / Town *
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Bhikhi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                District
              </label>
              <input
                type="text"
                value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
                placeholder="e.g. Mansa"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
                placeholder="Punjab"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Badge / Tag
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={e => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. Flagship Center, New Branch"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98769 60163"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="bhikhi@goyalcoaching.edu.in"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              >
                <option value="Active">Active & Open</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Under Renovation">Under Renovation</option>
              </select>
            </div>

            {/* Full Street Address */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Street Address *
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. Goyal Coaching Centre, Near Bus Stand / Main Market, Bhikhi, Mansa, Punjab 151504"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Timings */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Operating Timings
              </label>
              <input
                type="text"
                value={form.timings}
                onChange={e => setForm({ ...form, timings: e.target.value })}
                placeholder="Monday – Saturday: 3:00 PM – 8:30 PM | Sunday: 8:30 AM – 1:30 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Courses / Programs */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Courses Offered
              </label>
              <input
                type="text"
                value={form.courses}
                onChange={e => setForm({ ...form, courses: e.target.value })}
                placeholder="Class 8th–10th (Sci & Maths) • 11th–12th Commerce"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* LIVE GOOGLE MAPS LINK */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-amber-400 mb-1.5 flex items-center justify-between">
                <span>📍 Live Google Location URL (Share / Maps link)</span>
                {form.googleMapsUrl && (
                  <a
                    href={form.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    Test Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </label>
              <input
                type="url"
                value={form.googleMapsUrl}
                onChange={e => setForm({ ...form, googleMapsUrl: e.target.value })}
                placeholder="e.g. https://maps.app.goo.gl/g8yZ71a2HLVsZrV67"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-amber-500/50 text-white text-xs font-medium focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Paste any Google Maps link (e.g. from Google Maps "Share" button).
              </p>
            </div>

            {/* Generate Live Embed Button */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={generateEmbedUrl}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Generate Embed Map</span>
              </button>
            </div>

            {/* Live Embed Map URL */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Google Maps Embed Iframe URL (Optional)
              </label>
              <input
                type="text"
                value={form.embedMapUrl}
                onChange={e => setForm({ ...form, embedMapUrl: e.target.value })}
                placeholder="https://maps.google.com/maps?q=30.068777,75.5325527&hl=en&z=16&output=embed"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs font-medium focus:border-blue-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Live Map Preview if embed exists */}
          {form.embedMapUrl && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Map Preview:</span>
              </div>
              <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-800">
                <iframe
                  title="Live Map Preview"
                  src={form.embedMapUrl}
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Center...' : editingId ? 'Update Center Details' : 'Add Coaching Center'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ================= EXISTING CENTERS ROSTER ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Configured Coaching Centers ({centers.length})</span>
          </h3>
        </div>

        {centers.length === 0 ? (
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center text-slate-400 text-sm">
            No centers configured yet. Add your first center using the form above.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {centers.map(center => (
              <div 
                key={center.id}
                className="p-5 sm:p-6 rounded-3xl glass-panel border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 font-bold text-[10px] uppercase border border-blue-500/30">
                          {center.badge || 'Learning Center'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          {center.status || 'Active'}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white">
                        {center.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(center)}
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors cursor-pointer"
                        title="Edit Center"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(center.id, center.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                        title="Delete Center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 flex items-start gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{center.address}</span>
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    {center.phone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{center.phone}</span>
                      </div>
                    )}
                    {center.timings && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{center.timings}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Maps link preview */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <a
                    href={center.googleMapsUrl || 'https://maps.app.goo.gl/g8yZ71a2HLVsZrV67'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Live Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <span className="text-[10px] text-slate-500">
                    City: <strong className="text-slate-300">{center.city}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
