import { Award, Star, Sparkles, Quote } from 'lucide-react';
import confetti from 'canvas-confetti';
import TiltCard from '../3d/TiltCard';

export default function ToppersSection({ toppers = [] }) {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <section id="results" className="py-20 relative bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" /> Hall of Fame
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Our Pride: Goyal Coaching Center{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                Toppers
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Consistent Top 100 All India Ranks in JEE Advanced, AIIMS New Delhi selections, and 99%+ CBSE State Board toppers.
            </p>
          </div>

          <button
            onClick={triggerConfetti}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Results 🎉</span>
          </button>
        </div>

        {/* 3D Toppers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {toppers.map((topper, idx) => (
            <TiltCard
              key={idx}
              maxTilt={12}
              className="glass-card-gold p-6 flex flex-col justify-between border border-amber-500/30"
            >
              <div>
                {/* Photo and Rank Tag */}
                <div className="relative mb-6">
                  <img
                    src={topper.photo}
                    alt={topper.name}
                    className="w-full h-56 object-cover rounded-2xl ring-1 ring-amber-500/30 shadow-xl"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-slate-950/90 border border-amber-500/50 text-amber-300 font-black text-xs shadow-lg backdrop-blur-md">
                    {topper.rank}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <h3 className="text-xl font-black text-white">{topper.name}</h3>
                <div className="text-xs font-bold text-amber-400 mt-0.5">{topper.exam}</div>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  Admitted to: <span className="text-white">{topper.college}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-500/20">
                  <p className="text-xs italic text-slate-300 leading-relaxed">
                    "{topper.quote}"
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-500/20 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Verified GCC Student</span>
                <span className="text-amber-400 font-bold">Classroom Program</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
