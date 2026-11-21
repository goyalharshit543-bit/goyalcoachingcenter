import { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Upload, 
  ImageIcon, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Calendar
} from 'lucide-react';
import { api } from '../../api/client';

export default function ResultsPhotoManager({ onDataSaved = null }) {
  const [photoForm, setPhotoForm] = useState({
    title: 'Our Board Exam Champions & Result Achievers',
    subtitle: 'Class 10th & 12th Board Toppers Celebrating 100/100 Perfect Scores & Top College Selections',
    year: 'CBSE Board Results Celebration 2026',
    badge: '🏆 Results Felicitation & Hall of Fame',
    description: 'Proud moments at Goyal Coaching Centre: Our students celebrating exceptional results with faculty mentors, qualified CAs, and Goyal Sir.',
    photos: []
  });

  // State for newly added photo input
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoYear, setNewPhotoYear] = useState('CBSE Batch 2026');

  // Preview carousel state
  const [previewIndex, setPreviewIndex] = useState(0);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchPhotoData = async () => {
      try {
        const data = await api.getAllData();
        if (data.resultsPhoto) {
          const loadedPhotos = Array.isArray(data.resultsPhoto.photos)
            ? data.resultsPhoto.photos
            : (data.resultsPhoto.imageUrl ? [{ id: 'photo-1', url: data.resultsPhoto.imageUrl, caption: data.resultsPhoto.title, year: data.resultsPhoto.year }] : []);

          setPhotoForm({
            title: data.resultsPhoto.title || 'Our Board Exam Champions & Result Achievers',
            subtitle: data.resultsPhoto.subtitle || 'Class 10th & 12th Board Toppers Celebrating 100/100 Scores',
            year: data.resultsPhoto.year || 'CBSE Board Results Celebration 2026',
            badge: data.resultsPhoto.badge || '🏆 Results Felicitation & Hall of Fame',
            description: data.resultsPhoto.description || '',
            photos: loadedPhotos
          });
        }
      } catch (err) {
        console.error('Error fetching results photo in manager', err);
      }
    };
    fetchPhotoData();
  }, []);

  const totalPhotos = photoForm.photos.length;
  const safePreviewIndex = totalPhotos > 0 ? (previewIndex >= totalPhotos ? 0 : previewIndex) : 0;

  // Preview carousel auto-cycle
  const handlePreviewNext = useCallback(() => {
    if (totalPhotos <= 1) return;
    setPreviewIndex((prev) => (prev + 1) % totalPhotos);
  }, [totalPhotos]);

  const handlePreviewPrev = useCallback(() => {
    if (totalPhotos <= 1) return;
    setPreviewIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  }, [totalPhotos]);

  useEffect(() => {
    if (totalPhotos <= 1) return;
    const timer = setInterval(() => {
      handlePreviewNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [totalPhotos, handlePreviewNext]);

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPhotoUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Add photo to gallery list
  const handleAddPhotoToList = (e) => {
    if (e) e.preventDefault();
    if (!newPhotoUrl.trim()) {
      alert('Please upload an image file or enter an image URL.');
      return;
    }

    const newPhotoItem = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || `Photo #${totalPhotos + 1} - Student Results Felicitation`,
      year: newPhotoYear.trim() || 'Batch 2026'
    };

    setPhotoForm((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhotoItem]
    }));

    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setPreviewIndex(totalPhotos); // jump to newly added photo in preview
  };

  // Delete photo (can delete down to 0)
  const handleDeletePhoto = (id) => {
    setPhotoForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id)
    }));
    setPreviewIndex(0);
  };

  // Move photo up or down
  const handleMovePhoto = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photoForm.photos.length) return;

    const updated = [...photoForm.photos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPhotoForm((prev) => ({ ...prev, photos: updated }));
    setPreviewIndex(targetIndex);
  };

  // Save all photos to server & publish
  const handleSaveAndPublish = async () => {
    try {
      setSaving(true);
      const payload = {
        ...photoForm,
        imageUrl: photoForm.photos[0]?.url || ''
      };
      await api.updateResultsPhoto(payload);
      setSuccessMsg('🎉 Slideshow published successfully! All photos are now live on the homepage with smooth animations.');
      setTimeout(() => setSuccessMsg(''), 5000);
      if (onDataSaved) onDataSaved();
    } catch (err) {
      alert(err.message || 'Error updating results photo gallery.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
      
      {/* Top Banner & Publish Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Trophy className="w-3.5 h-3.5 text-blue-400" /> Multi-Photo Slideshow Manager
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-outfit">
            Homepage Student Results Gallery ({totalPhotos} Photos)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add multiple group photos of result achievers. On the homepage, they will transition one by one with smooth animations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAndPublish}
          disabled={saving}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/25 transition-all shrink-0 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : 'Save & Publish Slideshow'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Add Photo & Photos List */}
        <div className="lg:col-span-7 space-y-6 text-xs">
          
          {/* Card 1: Add New Photo */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add Photo to Slideshow</span>
              </span>
              <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
            </div>

            {/* File picker */}
            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-4 text-center transition-colors bg-slate-950/40">
              <input
                type="file"
                id="managerFileInput"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="managerFileInput"
                className="flex flex-col items-center justify-center cursor-pointer gap-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white hover:text-blue-400 transition-colors">
                  Choose Photo from Device
                </span>
                <span className="text-[10px] text-slate-400">
                  Select a student group picture from your phone or computer
                </span>
              </label>
            </div>

            {/* Preview of chosen image before adding */}
            {newPhotoUrl && (
              <div className="p-3 bg-slate-950 rounded-xl border border-blue-500/40 flex items-center gap-3">
                <img 
                  src={newPhotoUrl} 
                  alt="Chosen Preview" 
                  className="w-16 h-12 object-cover rounded-lg border border-slate-700 shrink-0" 
                />
                <div className="text-[11px] text-slate-300 truncate">
                  Image selected ready to add to queue.
                </div>
              </div>
            )}

            {/* Or Paste URL */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Or Paste Image Web URL:
              </label>
              <input
                type="url"
                placeholder="https://example.com/student-group-photo.jpg"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            {/* Caption & Year for this photo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Photo Caption / Description:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 10 Board Toppers Celebration"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Batch / Year Tag:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Batch 2026"
                  value={newPhotoYear}
                  onChange={(e) => setNewPhotoYear(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Add Photo Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddPhotoToList}
                disabled={!newPhotoUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Slideshow Queue</span>
              </button>

              <span className="text-[11px] text-slate-400">
                Current queue: <strong className="text-white">{totalPhotos} photos</strong>
              </span>
            </div>
          </div>

          {/* Card 2: Current Photos in Slideshow */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Photos Currently in Slideshow ({totalPhotos})</span>
              </span>
              <span className="text-[10px] text-slate-400">Reorder with arrows or delete</span>
            </div>

            {totalPhotos === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2 border border-dashed border-slate-800 rounded-xl">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p>No photos added yet. Choose a photo from your device above to add.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {photoForm.photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      idx === safePreviewIndex 
                        ? 'bg-blue-950/40 border-blue-500/60 shadow-md' 
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-16 h-10 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-900"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white text-xs truncate max-w-xs sm:max-w-md">
                          {photo.caption}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {photo.year}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePhoto(idx, -1)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === totalPhotos - 1}
                        onClick={() => handleMovePhoto(idx, 1)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer transition-colors ml-1"
                        title="Remove from Slideshow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Global Gallery Headers & Text */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <span className="text-sm font-black text-white uppercase tracking-wider block">
              Section Title & Description Text
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Main Section Heading:
                </label>
                <input
                  type="text"
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Top Ribbon Badge:
                </label>
                <input
                  type="text"
                  value={photoForm.badge}
                  onChange={(e) => setPhotoForm({ ...photoForm, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Subtitle Highlight:
              </label>
              <input
                type="text"
                value={photoForm.subtitle}
                onChange={(e) => setPhotoForm({ ...photoForm, subtitle: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Description / Remarks:
              </label>
              <textarea
                rows={2}
                value={photoForm.description}
                onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Live Interactive Slideshow Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Sparkles className="w-3.5 h-3.5" /> Live Animated Slideshow Preview
            </span>
            <span className="text-[10px] text-slate-400">Exact Homepage Look</span>
          </div>

          <div className="rounded-2xl border-2 border-slate-700 bg-slate-900 p-4 shadow-2xl space-y-3">
            
            {/* Header in preview */}
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                {photoForm.badge}
              </span>
              <h4 className="text-sm font-black text-white leading-tight font-outfit">
                {photoForm.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                {photoForm.subtitle}
              </p>
            </div>

            {/* Carousel Frame Preview */}
            <div className="w-full aspect-[16/9] sm:aspect-[1.82/1] max-h-[300px] rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950 select-none group flex items-center justify-center">
              
              {totalPhotos === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-500">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-bold text-slate-400">No photos in slideshow</span>
                  <span className="text-[10px] text-slate-500 mt-1">Upload photos to preview animations</span>
                </div>
              ) : (
                <>
                  {/* Photos cross-fade transition */}
                  {photoForm.photos.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center ${
                        idx === safePreviewIndex 
                          ? 'opacity-100 scale-100 z-10' 
                          : 'opacity-0 scale-105 z-0 pointer-events-none'
                      }`}
                    >
                      {/* Ambient background */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                          src={p.url}
                          alt=""
                          className="w-full h-full object-cover blur-2xl opacity-35 scale-110"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />
                      </div>

                      {/* Foreground image - uncropped, proper fit */}
                      <img
                        src={p.url}
                        alt={p.caption}
                        className="relative z-10 w-full h-full object-contain mx-auto drop-shadow-lg"
                      />
                    </div>
                  ))}

                  {/* Arrows in preview (shows on hover) */}
                  {totalPhotos > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePreviewPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handlePreviewNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Current photo caption in preview */}
            {totalPhotos > 0 && (
              <div className="text-[11px] font-bold text-white flex items-center justify-between">
                <span className="truncate">
                  {photoForm.photos[safePreviewIndex]?.caption || photoForm.title}
                </span>
                <span className="text-[10px] text-blue-400 font-mono shrink-0 ml-2">
                  {photoForm.photos[safePreviewIndex]?.year}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>✨ Slideshow Features:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
              <li>Auto-transitions one by one smoothly with cross-fade animation.</li>
              <li>Completely clean photo view: no progress bar line, no bottom control overlays.</li>
              <li>Hovering over the photo pauses the slideshow automatically.</li>
              <li>Clicking the photo opens high-resolution fullscreen zoom mode.</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
