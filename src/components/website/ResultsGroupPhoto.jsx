import { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Maximize2, 
  X, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Edit3,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Plus
} from 'lucide-react';
import { api } from '../../api/client';

export default function ResultsGroupPhoto({ 
  resultsPhoto = null, 
  isDarkMode = false, 
  onOpenAdminPhotoManager = null, 
  currentRole = null,
  onOpenAdmissionModal = null
}) {
  const [livePhoto, setLivePhoto] = useState(resultsPhoto);

  useEffect(() => {
    if (resultsPhoto) {
      setLivePhoto(resultsPhoto);
    }
  }, [resultsPhoto]);

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getResultsPhoto();
        if (fresh && isMounted) {
          setLivePhoto(fresh);
        }
      } catch (err) {
        console.error('Error fetching results photo', err);
      }
    };
    fetchLatest();

    const handleEvent = (e) => {
      if (e.detail) {
        setLivePhoto(e.detail);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener('gcc_results_photo_updated', handleEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('gcc_results_photo_updated', handleEvent);
    };
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Extract photos list - strictly from user data, NO hardcoded Unsplash fallback
  const photos = (Array.isArray(livePhoto?.photos) ? livePhoto.photos : [])
    .filter(p => p && p.url && p.url.trim() !== '');

  const total = photos.length;

  // Safe activeIndex wrap
  const safeIndex = total > 0 ? (activeIndex >= total ? 0 : activeIndex) : 0;
  const currentPhoto = photos[safeIndex] || {};

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Smooth automatic slideshow transition every 5 seconds (paused on hover or zoom)
  useEffect(() => {
    if (total <= 1 || isHovered || isZoomOpen) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(timer);
  }, [total, isHovered, isZoomOpen]);

  // Keyboard navigation for zoom lightbox & slideshow
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const title = resultsPhoto?.title || 'Our Board Exam Champions & Result Achievers';
  const subtitle = resultsPhoto?.subtitle || 'Class 10th & 12th Board Toppers Celebrating 100/100 Perfect Scores & Top College Selections';
  const badge = resultsPhoto?.badge || '🏆 Results Felicitation & Hall of Fame';
  const yearBadge = resultsPhoto?.year || 'CBSE Board Celebration 2026';
  const description = resultsPhoto?.description || 'Proud moments at Goyal Coaching Centre: Our students celebrating exceptional results with faculty mentors, qualified CAs, and Goyal Sir.';

  return (
    <section className="w-full mx-auto mb-3 sm:mb-4">
      <div className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800 text-white shadow-2xl shadow-slate-950/60' 
          : 'bg-white border-slate-300 text-black shadow-xl shadow-slate-200/60'
      }`}>
        
        {/* Header Ribbon above the Banner */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
              <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{badge}</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-outfit text-black dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-black dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{currentPhoto.year || yearBadge}</span>
            </span>
          </div>
        </div>

        {/* Big Results Banner Showcase (Full Breadth Widescreen Format like 2nd Image) */}
        <div>
          {total === 0 ? (
            /* Clean Empty State when no photos have been uploaded yet */
            <div className="p-8 sm:p-14 m-4 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-black dark:text-white">
                Student Results Gallery
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mt-1">
                Student toppers and felicitation photographs will be displayed here.
              </p>
            </div>
          ) : (
            <>
              {/* Full Breadth Banner Frame (Aspect ratio 1.82:1 - wide breadth, controlled length) */}
              <div 
                className="group relative w-full overflow-hidden bg-slate-950 select-none cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsZoomOpen(true)}
              >
                <div className="w-full aspect-[16/9] sm:aspect-[1.79/1] relative overflow-hidden flex items-center justify-center">
                  {photos.map((p, idx) => {
                    const isActive = idx === safeIndex;
                    return (
                      <div
                        key={p.id || idx}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center ${
                          isActive 
                            ? 'opacity-100 scale-100 z-10 pointer-events-auto' 
                            : 'opacity-0 scale-105 z-0 pointer-events-none'
                        }`}
                      >
                        {/* Ambient glow matching the banner colors across the full breadth */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <img
                            src={p.url}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover blur-3xl opacity-35 scale-110"
                          />
                          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" />
                        </div>

                        {/* Foreground full banner - wide breadth, sharp, uncropped */}
                        <img
                          src={p.url}
                          alt={p.caption || title}
                          className="relative z-10 w-full h-full object-contain mx-auto drop-shadow-2xl"
                          loading={idx === 0 ? 'eager' : 'lazy'}
                        />
                      </div>
                    );
                  })}

                  {/* Top-Right Click to Expand Badge */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg transition-all group-hover:scale-105">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="hidden sm:inline">Click to Zoom</span>
                    </span>
                  </div>

                  {/* Left & Right Interactive Arrows (Shows smoothly on hover) */}
                  {total > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white backdrop-blur-md border border-white/25 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 shadow-xl active:scale-95 opacity-0 group-hover:opacity-100"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/70 hover:bg-black/95 text-white backdrop-blur-md border border-white/25 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 shadow-xl active:scale-95 opacity-0 group-hover:opacity-100"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Caption & Information underneath the banner */}
              <div className="p-4 sm:p-5 pt-3">
                {currentPhoto.caption && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {currentPhoto.caption}
                      </span>
                    </div>
                    {total > 1 && (
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Auto-transitions smoothly • Hover to pause
                      </span>
                    )}
                  </div>
                )}

                {/* Description & Highlight Bullets */}
                {description && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <p className="font-semibold text-black dark:text-slate-300 leading-relaxed max-w-4xl text-xs sm:text-sm">
                      {description}
                    </p>
                    <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-black dark:text-white">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Verified GCC Results
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                        <Award className="w-4 h-4 text-amber-500" /> Board Toppers
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Fullscreen Lightbox Modal on Click */}
      {isZoomOpen && currentPhoto.url && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-fadeIn select-none"
          onClick={() => setIsZoomOpen(false)}
        >
          <div 
            className="relative max-w-7xl w-full max-h-[94vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 sm:right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs px-3 shadow-lg"
            >
              <X className="w-4 h-4" />
              <span>Close [ESC]</span>
            </button>

            {/* Enlarged Photo Container */}
            <div className="relative w-full max-h-[85vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center bg-black">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.caption || title}
                className="w-full h-auto max-h-[84vh] object-contain mx-auto transition-opacity duration-300 drop-shadow-2xl"
              />

              {/* Lightbox Prev / Next */}
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/25 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-2xl"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/25 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-2xl"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </>
              )}
            </div>

            {/* Caption underneath lightbox */}
            <div className="mt-4 text-center text-white space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs text-blue-400 font-bold">
                <span>{currentPhoto.year || yearBadge}</span>
              </div>
              <h3 className="text-base sm:text-xl font-black font-outfit">
                {currentPhoto.caption || title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
