import { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Calendar, 
  Sparkles, 
  Megaphone, 
  Newspaper, 
  Settings, 
  ExternalLink,
  Plus,
  Clock
} from 'lucide-react';
import { api } from '../../api/client';

export default function LatestNewsEventsSection({
  items = null,
  currentRole = null,
  onOpenAdminManager = null
}) {
  const [liveItems, setLiveItems] = useState(Array.isArray(items) ? items : []);
  const [openIds, setOpenIds] = useState({}); // { [id]: boolean }
  const sectionRef = useRef(null);
  const [hasFlownIn, setHasFlownIn] = useState(false);

  // Sync with prop
  useEffect(() => {
    if (Array.isArray(items)) {
      setLiveItems(items);
    }
  }, [items]);

  // Fetch from API
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getNewsEvents();
        if (Array.isArray(fresh) && isMounted) {
          setLiveItems(fresh);
        }
      } catch (err) {
        console.error('Error fetching news events in section', err);
      }
    };

    fetchLatest();

    const handleEvent = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setLiveItems(e.detail);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener('gcc_news_events_updated', handleEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('gcc_news_events_updated', handleEvent);
    };
  }, []);

  // Intersection observer for fly-in entrance
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setHasFlownIn(true);
            }
          });
        },
        { threshold: 0.12 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setHasFlownIn(true);
    }
  }, []);

  // Toggle accordion open/close
  const toggleItem = (id) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Split into News and Announcements
  const newsItems = liveItems.filter(item => item.category === 'news');
  const announcementItems = liveItems.filter(item => item.category === 'announcement');

  return (
    <section 
      id="news-events" 
      ref={sectionRef}
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 select-none"
    >
      
      {/* Main Section Header */}
      <div className="text-center mb-10 sm:mb-14">
        
        {/* Title: Latest News & Events */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
          Latest News & Events
        </h2>

        {/* Double Underline Accent in Website's Royal Blue Theme */}
        <div className="flex flex-col items-center justify-center mt-3 space-y-1">
          <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        </div>

        {/* Subtitle */}
        <p className="mt-3 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
          Stay updated with our latest happenings
        </p>

      </div>

      {/* Two-Column Grid: News & Events (Left) | Announcements (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* ================= COLUMN 1: News and Events ================= */}
        <div className={`space-y-4 transition-all duration-700 ${
          hasFlownIn ? 'animate-director-fly' : 'opacity-0 translate-y-12'
        }`}>
          
          {/* Column Header */}
          <div className="text-center sm:text-left mb-6">
            <h3 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white inline-flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" /> News and Events
            </h3>
            {/* Accent underline */}
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-cyan-400 rounded-full mt-2 mx-auto sm:mx-0 shadow-[0_0_6px_rgba(37,99,235,0.35)]" />
          </div>

          {/* News Items Accordion List */}
          {newsItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No recent news items. Add updates anytime from the Admin Portal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {newsItems.map((item, idx) => {
                const isOpen = Boolean(openIds[item.id]);

                return (
                  <div
                    key={item.id || idx}
                    className={`rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                      isOpen
                        ? 'border-blue-500 dark:border-blue-500/80 shadow-blue-500/10'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-600/60'
                    }`}
                  >
                    {/* Accordion Headline Button */}
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {item.title}
                        </span>

                        {item.isNew && (
                          <span className="italic font-bold text-rose-500 dark:text-rose-400 text-xs sm:text-sm tracking-tight shrink-0 animate-pulse">
                            {item.badge || 'new'}
                          </span>
                        )}
                      </div>

                      {/* Expand Chevron Icon */}
                      <div className={`p-1 rounded-full text-slate-500 dark:text-slate-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                      }`}>
                        <ChevronDown className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    </button>

                    {/* Expandable Accordion Body */}
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50/30 dark:bg-blue-950/20">
                        {item.date && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.date}</span>
                          </div>
                        )}

                        <p className="whitespace-pre-line">
                          {item.content || 'Details will be updated shortly.'}
                        </p>

                        {item.link && (
                          <div className="mt-3">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <span>Read Full Notice / Link</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ================= COLUMN 2: Announcements ================= */}
        <div 
          style={{ animationDelay: '140ms' }}
          className={`space-y-4 transition-all duration-700 ${
            hasFlownIn ? 'animate-director-fly' : 'opacity-0 translate-y-12'
          }`}
        >
          
          {/* Column Header */}
          <div className="text-center sm:text-left mb-6">
            <h3 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900 dark:text-white inline-flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Announcements
            </h3>
            {/* Accent underline */}
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-cyan-400 rounded-full mt-2 mx-auto sm:mx-0 shadow-[0_0_6px_rgba(37,99,235,0.35)]" />
          </div>

          {/* Announcements Items Accordion List */}
          {announcementItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No active announcements. Add updates anytime from the Admin Portal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcementItems.map((item, idx) => {
                const isOpen = Boolean(openIds[item.id]);

                return (
                  <div
                    key={item.id || idx}
                    className={`rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                      isOpen
                        ? 'border-blue-500 dark:border-blue-500/80 shadow-blue-500/10'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-600/60'
                    }`}
                  >
                    {/* Accordion Headline Button */}
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {item.title}
                        </span>

                        {item.isNew && (
                          <span className="italic font-bold text-rose-500 dark:text-rose-400 text-xs sm:text-sm tracking-tight shrink-0 animate-pulse">
                            {item.badge || 'new'}
                          </span>
                        )}
                      </div>

                      {/* Expand Chevron Icon */}
                      <div className={`p-1 rounded-full text-slate-500 dark:text-slate-400 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                      }`}>
                        <ChevronDown className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    </button>

                    {/* Expandable Accordion Body */}
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-blue-50/30 dark:bg-blue-950/20">
                        {item.date && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.date}</span>
                          </div>
                        )}

                        <p className="whitespace-pre-line">
                          {item.content || 'Details will be updated shortly.'}
                        </p>

                        {item.link && (
                          <div className="mt-3">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <span>View Notice / Link</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </section>
  );
}
