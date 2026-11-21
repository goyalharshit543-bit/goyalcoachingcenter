import { 
  Calendar, 
  Award, 
  Bell, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  FileCheck2, 
  MessageSquare,
  QrCode,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

export default function FeatureBentoGrid({ onOpenParentPortal }) {
  return (
    <section id="features" className="py-24 relative bg-slate-950/70 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>The Goyal Transparency Standard</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Specialized in High School & Commerce with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              Total Parent Peace of Mind
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            We focus exclusively on two critical turning points: building rock-solid foundations in <strong>Class 8th–10th (Science & Mathematics)</strong> and producing CBSE toppers in <strong>Class 11th–12th (Commerce)</strong> with live daily parental progress tracking.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Large Span - Real-Time Biometric Attendance Log */}
          <div className="md:col-span-2 lg:col-span-2">
            <TiltCard maxTilt={6} className="h-full glass-panel p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" /> Live Connected
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white">Daily Biometric & Session Attendance</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Every student’s arrival is verified at our center. Parents receive instant notification of whether their child checked in on time, arrived late, or is absent.
                </p>

                {/* Mock Attendance Feed Component */}
                <div className="mt-6 space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">
                        PG
                      </div>
                      <div>
                        <div className="font-bold text-white">Priya Goyal (Class 12 Commerce)</div>
                        <div className="text-[10px] text-slate-400">Accounts & Eco Batch • Check-in: 04:22 PM</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Present (On Time)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                        AG
                      </div>
                      <div>
                        <div className="font-bold text-white">Aarav Gupta (Class 10 Science & Math)</div>
                        <div className="text-[10px] text-slate-400">Board Champions Batch • Check-in: 03:22 PM</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Present (On Time)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Mandatory 85% Institute Threshold</span>
                <span className="font-bold text-emerald-400">Auto-Alert System Active</span>
              </div>
            </TiltCard>
          </div>

          {/* Card 2: Weekly Sunday Board Mock Tests */}
          <div className="md:col-span-1 lg:col-span-2">
            <TiltCard maxTilt={6} className="h-full glass-panel p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Sunday Board Mock Tests
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white">Sunday Test Series & Batch Rank</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Every Sunday test mimics official CBSE board formats: Class 10 (Maths & Science) and Class 12 (Accounts, Economics, Business Studies, Applied Maths) with step-marking feedback.
                </p>

                {/* Score breakdown widget */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">Latest Grand Test</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">99 <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                    <div className="text-[10px] text-emerald-400 font-bold">Rank #1 (Class 12 Commerce)</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold">Batch Average</div>
                    <div className="text-2xl font-black text-slate-300 mt-1">72.5%</div>
                    <div className="text-[10px] text-blue-400 font-semibold">+26.5% Above Average</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Official CBSE Marking Scheme</span>
                <span className="font-bold text-amber-300">Teacher Step-Notes</span>
              </div>
            </TiltCard>
          </div>

          {/* Card 3: Compulsory Parent Notices */}
          <div className="md:col-span-1 lg:col-span-1">
            <TiltCard maxTilt={8} className="h-full glass-panel p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Compulsory Notice Board</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Mandatory PTM schedules, winter revision marathons, and board date sheets are broadcast instantly to parent dashboards.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <span className="font-bold block">Next Mandatory PTM:</span>
                  <span>Sunday, 22nd Nov • Class 10 & 12</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                100% Attendance Enforced
              </div>
            </TiltCard>
          </div>

          {/* Card 4: Super 30 Batches & CA/M.Sc Faculty */}
          <div className="md:col-span-1 lg:col-span-2">
            <TiltCard maxTilt={6} className="h-full glass-panel p-6 sm:p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-white">Small Batches: Maximum 30–35 Students</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  No overcrowding. Our faculty personally reviews every student's math proofs, science diagrams, and accountancy balance sheets with daily 1-on-1 doubt counters.
                </p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Daily Doubt Desks</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>NCERT Line-by-Line</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>CA & M.Sc Faculty</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Led by Goyal Sir & CA Team</span>
                <span className="font-bold text-purple-300">15+ Yrs Board Excellence</span>
              </div>
            </TiltCard>
          </div>

          {/* Card 5: Verifiable Report Card Download */}
          <div className="md:col-span-1 lg:col-span-1">
            <TiltCard maxTilt={8} className="h-full glass-panel p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Printable Report Cards</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Download official progress reports with institute seal, test history, QR code verification, and teacher notes for parent records.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Official Document</span>
                  <span className="text-xs text-slate-300 font-mono">GCC-BOARD-2026</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={onOpenParentPortal}
                  className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs border border-blue-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Parent Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
