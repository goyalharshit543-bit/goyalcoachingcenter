import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Sparkles, Clock, Phone } from 'lucide-react';

export default function TakeFirstStepSection({
  onOpenCounseling = null
}) {
  const sectionRef = useRef(null);
  const [hasFlownIn, setHasFlownIn] = useState(false);

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
      id="take-first-step"
      ref={sectionRef}
      aria-label="Take the First Step"
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-16 select-none"
    >
      {/* Banner Card in Royal Sapphire Blue & Indigo Website Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-2 border-blue-500/30 dark:border-blue-700/50 shadow-2xl shadow-blue-950/40 py-12 sm:py-16 md:py-20 px-6 sm:px-12 text-center">
        
        {/* Subtle Ambient Glow and High-Tech Dot Matrix Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(96,165,250,0.4) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Main Title: Take the First Step */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit text-white tracking-tight leading-tight drop-shadow-sm">
            Take the First Step
          </h2>

          {/* Golden / Amber Accent Underline (matching user's design reference) */}
          <div className="flex flex-col items-center justify-center mt-3 mb-4 space-y-1">
            <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
          </div>

          {/* Subtitle: Secure your seat today or get free guidance from experts */}
          <p className="mt-1 text-sm sm:text-base md:text-lg text-blue-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
            Secure your seat today or get free guidance from experts.
          </p>

          {/* Primary Action Button: 📞 Get Free Counseling with Fly Animation */}
          <div className="mt-8 flex items-center justify-center">
            <div className={`transition-all duration-700 ${hasFlownIn ? 'animate-btn-fly-in' : 'opacity-0 translate-y-16 scale-90'}`}>
              <button
                onClick={onOpenCounseling}
                className="relative overflow-hidden px-9 sm:px-14 py-4 sm:py-4.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base cursor-pointer active:scale-95 group animate-btn-levitate flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-3 hover:scale-105"
              >
                {/* Shimmer light sweep across the flying button */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none" />

                <Phone className="w-5 h-5 text-amber-950 fill-amber-950 animate-phone-ring shrink-0" />
                <span className="tracking-wide">Get Free Counseling</span>
              </button>
            </div>
          </div>

          {/* Trust Badges Bar */}
          <div className="mt-8 pt-6 border-t border-blue-400/20 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-blue-200/80 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free Guidance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Direct Mentorship from Goyal Sir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Quick Callback within 4 Hours</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
