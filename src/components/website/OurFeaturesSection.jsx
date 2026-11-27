import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../api/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Users, 
  Video, 
  Calendar, 
  Fingerprint, 
  BookOpen, 
  Laptop, 
  Sparkles, 
  BarChart3, 
  FileCheck2, 
  Wind,
  ShieldCheck,
  GraduationCap,
  Award,
  CheckCircle2
} from 'lucide-react';

// Icon resolver helper
export function resolveFeatureIcon(iconKey) {
  switch ((iconKey || '').toLowerCase()) {
    case 'users': return Users;
    case 'cctv': return Video;
    case 'calendar': return Calendar;
    case 'fingerprint': return Fingerprint;
    case 'library': return BookOpen;
    case 'laptop': return Laptop;
    case 'sparkles': return Sparkles;
    case 'chart': return BarChart3;
    case 'video': return Video;
    case 'filecheck': return FileCheck2;
    case 'airvent': return Wind;
    case 'shield': return ShieldCheck;
    case 'grad': return GraduationCap;
    default: return Sparkles;
  }
}

export default function OurFeaturesSection({ 
  features = [], 
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

  // Fallback initial features matching user's uploaded images if empty
  const defaultFeatures = [
    { id: "feat-1", title: "Extra Support to Weaker Students", subtitle: "Special Doubt Counters & Foundation Hand-holding", iconKey: "users", iconUrl: "/features/feat-1.png", badge: "Student Care" },
    { id: "feat-2", title: "CCTV Campus", subtitle: "24/7 High-Definition Surveillance & Student Safety", iconKey: "cctv", iconUrl: "/features/feat-2.png", badge: "Campus Safety" },
    { id: "feat-3", title: "Pre-Planned Coursework & Planner", subtitle: "Daily NCERT Syllabus Roadmap & Timely Completion", iconKey: "calendar", iconUrl: "/features/feat-3.png", badge: "Planned Study" },
    { id: "feat-4", title: "Biometric Attendance", subtitle: "Automated Daily SMS & Parent Dashboard Alerts", iconKey: "fingerprint", iconUrl: "/features/feat-4.png", badge: "Parent Tracking" },
    { id: "feat-5", title: "Revision Classes & Self Study Zone", subtitle: "Distraction-Free AC Library & Faculty Supervision", iconKey: "library", iconUrl: "/features/feat-5.png", badge: "Study Zone" },
    { id: "feat-6", title: "Online Testing Lab", subtitle: "Computer-Based Test Engine for JEE / NEET / CUET", iconKey: "laptop", iconUrl: "/features/feat-6.png", badge: "Digital Testing" },
    { id: "feat-7", title: "Motivational & Counselling Sessions", subtitle: "Stress Management, Exam Mindset & Career Guidance", iconKey: "sparkles", iconUrl: "/features/feat-7.png", badge: "Mental Wellness" },
    { id: "feat-8", title: "Performance Analysis & Report", subtitle: "In-Depth Topic Analytics & Real-Time Weak Area Maps", iconKey: "chart", iconUrl: "/features/feat-8.png", badge: "Detailed Reports" },
    { id: "feat-9", title: "Lecture Recording Lab", subtitle: "High-Quality Video Backups for Revision & Missed Classes", iconKey: "video", iconUrl: "/features/feat-9.png", badge: "HD Backups" },
    { id: "feat-10", title: "Objective + Subjective", subtitle: "Dual Pattern Tests with CBSE Step-Marking Review", iconKey: "filecheck", iconUrl: "/features/feat-10.png", badge: "Dual Pattern" },
    { id: "feat-11", title: "Smart AC Classrooms", subtitle: "Ergonomic Seating, Digital Projection & Comfort", iconKey: "airvent", iconUrl: "/features/feat-11.png", badge: "Modern Campus" }
  ];

  const [liveFeatures, setLiveFeatures] = useState(Array.isArray(features) ? features : defaultFeatures);

  // Sync with prop updates
  useEffect(() => {
    if (Array.isArray(features)) {
      setLiveFeatures(features);
    }
  }, [features]);

  // Real-time event listener and initial mount fetch
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getFeatures();
        if (Array.isArray(fresh) && isMounted) {
          setLiveFeatures(fresh);
        }
      } catch (err) {
        console.error('Error fetching features in section', err);
      }
    };

    fetchLatest();

    const handleEvent = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setLiveFeatures(e.detail);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener('gcc_features_updated', handleEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('gcc_features_updated', handleEvent);
    };
  }, []);

  const activeFeatures = Array.isArray(liveFeatures) ? liveFeatures : defaultFeatures;

  // Ensure all 5 screen boxes always have cards even if fewer were added
  const effectiveFeatures = (() => {
    if (activeFeatures.length >= 5) return activeFeatures;
    let list = [...activeFeatures];
    while (list.length < 5) {
      list = [...list, ...activeFeatures];
    }
    return list;
  })();

  const totalCount = effectiveFeatures.length;

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

  const shouldSlide = totalCount > visibleCount;

  // Clone array for seamless infinite looping if shouldSlide [set1, set2, set3]
  const displayFeatures = shouldSlide 
    ? [...effectiveFeatures, ...effectiveFeatures, ...effectiveFeatures] 
    : effectiveFeatures;

  useEffect(() => {
    if (shouldSlide) {
      setIsTransitioning(false);
      setOffsetIndex(totalCount);
    } else {
      setOffsetIndex(0);
    }
  }, [totalCount, shouldSlide]);

  const handleTransitionEnd = () => {
    if (!shouldSlide) return;
    if (offsetIndex >= totalCount * 2) {
      setIsTransitioning(false);
      setOffsetIndex(offsetIndex - totalCount);
    } else if (offsetIndex < totalCount) {
      setIsTransitioning(false);
      setOffsetIndex(offsetIndex + totalCount);
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

  // Auto-scroll ticker: one by one feature moves to left every 3.5s
  useEffect(() => {
    if (!shouldSlide || isPaused) return;

    const timer = setInterval(() => {
      slideNext();
    }, 3500);

    return () => clearInterval(timer);
  }, [shouldSlide, isPaused, slideNext]);

  // Touch handlers
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

  const translateX = shouldSlide ? -(offsetIndex * (cardWidth + cardGap)) : 0;

  return (
    <section id="features" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Section Header matching Reference Image in Website's Royal Blue Theme */}
      <div className="text-center mb-10 sm:mb-14">
        
        {/* Main Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
          Our Features
        </h2>

        {/* Double Underline Accent in Website's Royal Blue Theme */}
        <div className="flex flex-col items-center justify-center mt-3 space-y-1">
          <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        </div>

        {/* Subtitle with Goyal Coaching Center */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          Discover why Goyal Coaching Center is the best choice for your academic journey.
        </p>

      </div>

      {/* Main Carousel Viewport Container (like Shining Stars) */}
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
            aria-label="Previous Feature"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Chevron Button */}
        {shouldSlide && (
          <button
            onClick={slideNext}
            aria-label="Next Feature"
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
            {displayFeatures.map((item, idx) => {
              const IconComponent = resolveFeatureIcon(item.iconKey);

              return (
                <div
                  key={`${item.id}-${idx}`}
                  style={{ width: `${cardWidth}px` }}
                  className="shrink-0 h-[380px] rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between py-5 px-3.5 group/card"
                >
                  {/* Decorative Diagonal Royal Blue Wedge matching Shining Stars */}
                  <div 
                    className="absolute top-0 left-0 w-full h-[76%] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 pointer-events-none"
                    style={{
                      clipPath: 'polygon(0 0, 62% 0, 0 82%)'
                    }}
                  />

                  {/* Top Area: Circular Photo Box */}
                  <div className="relative z-10 mx-auto mt-2 text-center">
                    <div className="relative inline-block">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-slate-800 border-4 border-blue-600 dark:border-blue-500 ring-4 ring-white dark:ring-slate-900 shadow-xl flex items-center justify-center p-3.5 mx-auto transition-transform duration-300 group-hover/card:scale-105">
                        <img
                          src={item.iconUrl || `/features/${item.id}.png`}
                          alt={item.title}
                          className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover/card:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                            if (fallback) fallback.style.display = 'block';
                          }}
                        />
                        <IconComponent className="fallback-icon w-12 h-12 stroke-[2.2] text-blue-600 dark:text-blue-400 hidden" />
                      </div>
                    </div>
                  </div>

                  {/* Middle Area: Badge & Title box matching Shining Stars scorecard */}
                  <div className="relative z-20 my-auto mx-auto w-full px-1">
                    <div className="bg-white dark:bg-slate-800/95 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 py-2.5 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 shadow-xs mb-1">
                        {item.badge || 'Feature'}
                      </span>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Arrow Ribbon at bottom matching Shining Stars */}
                  <div className="relative z-10 w-[94%] mx-auto mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-600 text-white py-1.5 pl-3 pr-6 text-center text-[11px] font-black tracking-wider uppercase shadow-md truncate"
                      style={{
                        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)'
                      }}
                    >
                      GCC Standard
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Indicators / Dots */}
        {shouldSlide && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {effectiveFeatures.map((_, dotIdx) => {
              const activeDot = ((offsetIndex - totalCount) % totalCount + totalCount) % totalCount;
              const isActive = activeDot === dotIdx;

              return (
                <button
                  key={dotIdx}
                  onClick={() => {
                    setIsTransitioning(true);
                    setOffsetIndex(totalCount + dotIdx);
                  }}
                  aria-label={`Go to feature ${dotIdx + 1}`}
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

    </section>
  );
}
