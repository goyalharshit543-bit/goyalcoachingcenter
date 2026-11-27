import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Settings, Plus, Award } from 'lucide-react';
import { api } from '../../api/client';

export default function ShiningStarsSection({ 
  stars = [], 
  currentRole = null, 
  onOpenAdminManager = null 
}) {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [offsetIndex, setOffsetIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const cardWidth = 260; // px
  const cardGap = 20; // px

  const [liveStars, setLiveStars] = useState(Array.isArray(stars) && stars.length > 0 ? stars : []);

  useEffect(() => {
    if (Array.isArray(stars)) {
      setLiveStars(stars);
    }
  }, [stars]);

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getShiningStars();
        if (fresh && Array.isArray(fresh) && isMounted) {
          setLiveStars(fresh);
        }
      } catch (err) {
        console.error('Error fetching shining stars', err);
      }
    };
    fetchLatest();

    const handleEvent = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setLiveStars(e.detail);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener('gcc_shining_stars_updated', handleEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('gcc_shining_stars_updated', handleEvent);
    };
  }, []);

  // Fallback student photo if any photo fails to load
  const defaultFallbackPhoto = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';

  // Ensure all 5 screen boxes always have cards with photos even if fewer students were added (with safety counter)
  const effectiveStars = (() => {
    if (!liveStars || liveStars.length === 0) return [];
    if (liveStars.length >= 5) return liveStars;
    let list = [...liveStars];
    let safetyCounter = 0;
    while (list.length < 5 && safetyCounter < 10) {
      list = [...list, ...liveStars];
      safetyCounter++;
    }
    return list;
  })();

  const totalStarCount = effectiveStars.length;

  // Responsive visible count calculation
  useEffect(() => {
    const updateVisibleCount = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      if (width < 640) setVisibleCount(1);
      else if (width < 768) setVisibleCount(2);
      else if (width < 1024) setVisibleCount(3);
      else if (width < 1280) setVisibleCount(4);
      else setVisibleCount(5);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Whether items overflow and should slide
  const shouldSlide = totalStarCount > visibleCount;

  // Clone array for seamless infinite looping if shouldSlide
  // We use 3 copies [set1, set2, set3] and start at set2 (totalStarCount)
  const displayStars = shouldSlide 
    ? [...effectiveStars, ...effectiveStars, ...effectiveStars] 
    : effectiveStars;

  // Initialize offset at set2 start when stars or shouldSlide changes
  useEffect(() => {
    if (shouldSlide) {
      setIsTransitioning(false);
      setOffsetIndex(totalStarCount);
    } else {
      setOffsetIndex(0);
    }
  }, [totalStarCount, shouldSlide]);

  // Handle seamless infinite transition jump
  const handleTransitionEnd = () => {
    if (!shouldSlide) return;
    if (offsetIndex >= totalStarCount * 2) {
      setIsTransitioning(false);
      setOffsetIndex(offsetIndex - totalStarCount);
    } else if (offsetIndex < totalStarCount) {
      setIsTransitioning(false);
      setOffsetIndex(offsetIndex + totalStarCount);
    }
  };

  const slideNext = useCallback(() => {
    if (!shouldSlide) return;
    setIsTransitioning(true);
    setOffsetIndex((prev) => prev + 1);
  }, [shouldSlide]);

  const slidePrev = useCallback(() => {
    if (!shouldSlide) return;
    setIsTransitioning(true);
    setOffsetIndex((prev) => prev - 1);
  }, [shouldSlide]);

  // Auto-scroll ticker: one by one photo go to left every 3.5s
  useEffect(() => {
    if (!shouldSlide || isPaused) return;

    const timer = setInterval(() => {
      slideNext();
    }, 3500);

    return () => clearInterval(timer);
  }, [shouldSlide, isPaused, slideNext]);

  // Touch Handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) slideNext();
      else slidePrev();
    }
  };

  if (!stars || stars.length === 0) {
    return null;
  }

  // Calculate translateX in pixels
  const translateX = shouldSlide 
    ? -(offsetIndex * (cardWidth + cardGap)) 
    : 0;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-20">

      {/* Main Carousel Viewport Container */}
      <div 
        ref={containerRef}
        className="relative w-full group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left Chevron Button */}
        {shouldSlide && (
          <button
            onClick={slidePrev}
            aria-label="Previous Student"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Chevron Button */}
        {shouldSlide && (
          <button
            onClick={slideNext}
            aria-label="Next Student"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Overflow Container */}
        <div className="overflow-hidden py-4 px-1">
          {/* Track */}
          <div
            className={`flex items-center gap-5 ${
              isTransitioning 
                ? 'transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]' 
                : 'transition-none'
            } ${!shouldSlide ? 'justify-center' : ''}`}
            style={{
              transform: `translateX(${translateX}px)`
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {displayStars.map((star, idx) => {
              const hasDual = Boolean(star.secondaryScore && star.secondaryExam);

              return (
                <div
                  key={`${star.id}-${idx}`}
                  style={{ width: `${cardWidth}px` }}
                  className="shrink-0 h-[380px] rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between py-5 px-3.5 group/card"
                >
                  {/* Decorative Diagonal Royal Blue Wedge matching website theme */}
                  <div 
                    className="absolute top-0 left-0 w-full h-[76%] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 pointer-events-none"
                    style={{
                      clipPath: 'polygon(0 0, 62% 0, 0 82%)'
                    }}
                  />

                  {/* Top Area: Circular Student Photo */}
                  <div className="relative z-10 mx-auto mt-2 text-center">
                    <div className="relative inline-block">
                      <img
                        src={star.photo || defaultFallbackPhoto}
                        alt={star.name}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover object-top border-4 border-blue-600 dark:border-blue-500 ring-4 ring-white dark:ring-slate-900 shadow-xl mx-auto bg-slate-100 dark:bg-slate-800"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = defaultFallbackPhoto;
                        }}
                      />
                    </div>
                  </div>

                  {/* Middle Area: Score Badge & Exam Tags */}
                  <div className="relative z-20 -mt-2 mx-auto w-full px-1">
                    <div className="bg-white dark:bg-slate-800/95 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 py-2 px-3 text-center">
                      {hasDual ? (
                        <div className="flex items-center justify-center divide-x divide-slate-200 dark:divide-slate-700">
                          {/* Primary Score & Exam */}
                          <div className="flex-1 pr-2">
                            <div className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-tight leading-tight">
                              {star.score}
                            </div>
                            <div className="text-[9px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tighter mt-0.5">
                              {star.exam}
                            </div>
                          </div>
                          {/* Secondary Score & Exam */}
                          <div className="flex-1 pl-2">
                            <div className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-tight leading-tight">
                              {star.secondaryScore}
                            </div>
                            <div className="text-[9px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tighter mt-0.5">
                              {star.secondaryExam}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-tight">
                            {star.score}
                          </div>
                          <div className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide mt-0.5">
                            {star.exam}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow Ribbon: College / Target Selection (Pointed on Right) */}
                  <div className="relative z-10 w-[94%] mx-auto mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-600 text-white py-1.5 pl-3 pr-6 text-center text-xs font-black tracking-wider uppercase shadow-md truncate"
                      style={{
                        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)'
                      }}
                      title={star.college || 'TOP SELECTION'}
                    >
                      {star.college || 'TOP SELECTION'}
                    </div>
                  </div>

                  {/* Bottom: Student Name in Bold Uppercase */}
                  <div className="text-center pt-2 pb-1 relative z-10">
                    <h3 className="font-black text-sm sm:text-base tracking-wider text-slate-900 dark:text-white uppercase truncate px-2">
                      {star.name}
                    </h3>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-bar Carousel Dots & Status */}
        {shouldSlide && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {effectiveStars.map((_, dotIdx) => {
              const activeDot = ((offsetIndex - totalStarCount) % totalStarCount + totalStarCount) % totalStarCount;
              const isActive = activeDot === dotIdx;

              return (
                <button
                  key={dotIdx}
                  onClick={() => {
                    setIsTransitioning(true);
                    setOffsetIndex(totalStarCount + dotIdx);
                  }}
                  aria-label={`Go to student ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'w-8 bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-500/50' 
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
