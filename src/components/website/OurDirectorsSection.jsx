import { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  Briefcase, 
  BookOpen, 
  Sparkles, 
  Settings, 
  ShieldCheck,
  Plus,
  Users
} from 'lucide-react';
import { api } from '../../api/client';

export default function OurDirectorsSection({
  directors = null,
  currentRole = null,
  onOpenAdminManager = null
}) {
  const [liveDirectors, setLiveDirectors] = useState(Array.isArray(directors) ? directors : []);
  const sectionRef = useRef(null);
  const [hasFlownIn, setHasFlownIn] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (Array.isArray(directors)) {
      setLiveDirectors(directors);
    }
  }, [directors]);

  // Fetch from API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getDirectors();
        if (Array.isArray(fresh) && isMounted) {
          setLiveDirectors(fresh);
        }
      } catch (err) {
        console.error('Error fetching directors in OurDirectorsSection', err);
      }
    };

    fetchLatest();

    const handleEvent = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setLiveDirectors(e.detail);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener('gcc_directors_updated', handleEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('gcc_directors_updated', handleEvent);
    };
  }, []);

  // IntersectionObserver for Staggered Fly-In entrance
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setHasFlownIn(true);
            } else {
              setHasFlownIn(false);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setHasFlownIn(true);
    }
  }, []);

  return (
    <section 
      id="directors" 
      ref={sectionRef}
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 select-none"
    >
      
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-14">
        
        {/* Main Heading: Our Awesome Directors */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
          Our Awesome Directors
        </h2>

        {/* Double Underline Accent in Website's Royal Blue Theme */}
        <div className="flex flex-col items-center justify-center mt-3 space-y-1">
          <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        </div>

        {/* Subtitle with Goyal Coaching Center in Royal Blue Theme */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
          <span className="font-bold text-blue-600 dark:text-blue-400">Goyal Coaching Center</span> houses some of the finest educators with extraordinary pedagogy. With academic and industrial exposure, they have the power to transform education in India.
        </p>

      </div>

      {/* Directors Cards Grid or Empty State */}
      {liveDirectors.length === 0 ? (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center shadow-lg">
          <Award className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            Directors Profile
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
            Faculty and directors profiles will be displayed here.
          </p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${
          liveDirectors.length === 1 
            ? 'max-w-md mx-auto' 
            : liveDirectors.length === 2 
              ? 'md:grid-cols-2 max-w-4xl mx-auto' 
              : 'md:grid-cols-2 lg:grid-cols-3'
        } gap-6 sm:gap-8 items-stretch`}>
          {liveDirectors.map((director, idx) => (
            <div
              key={director.id || idx}
              style={{
                animationDelay: `${idx * 180}ms`
              }}
              className={`transition-all duration-700 ${
                hasFlownIn ? 'animate-director-fly' : 'opacity-0 translate-y-16 scale-95'
              }`}
            >
              {/* Floating levitation card container */}
              <div
                className={`h-full rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-blue-500/50 transition-all duration-500 flex flex-col justify-between p-6 sm:p-8 relative group hover:-translate-y-4 hover:scale-[1.025] hover:shadow-2xl hover:shadow-blue-500/25 overflow-hidden animate-director-float-${idx % 3}`}
              >
                {/* Top Accent Stripe in Royal Blue */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600" />

                <div>
                  {/* Photo & Badge Area */}
                  <div className="flex flex-col items-center text-center mb-5">
                    <div className="relative mb-3.5">
                      <img
                        src={director.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                        alt={director.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top border-4 border-blue-600/30 dark:border-blue-500/40 shadow-xl shadow-blue-600/10 group-hover:scale-108 group-hover:shadow-blue-500/30 transition-all duration-300"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/40 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Director Badge */}
                    {director.badge && (
                      <div className="inline-block px-3 py-1 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 mb-2 shadow-2xs group-hover:border-blue-400 transition-colors">
                        {director.badge}
                      </div>
                    )}

                    {/* Director Name */}
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {director.name}
                    </h3>

                    {/* Designation */}
                    <div className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                      {director.designation || 'Academic Director'}
                    </div>

                    {/* Qualification */}
                    {director.qualification && (
                      <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 justify-center">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{director.qualification}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {director.description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-center mb-5">
                      {director.description}
                    </p>
                  )}

                  {/* Specialities / Highlights */}
                  {Array.isArray(director.specialties) && director.specialties.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {director.specialties.map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Footer Tag */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified GCC Director</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {director.experience || '12+ Years Experience'}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
