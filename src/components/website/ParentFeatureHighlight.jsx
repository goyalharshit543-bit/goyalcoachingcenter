import { ShieldCheck, Calendar, Award, Bell, CheckCircle2, ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import TiltCard from '../3d/TiltCard';

export default function ParentFeatureHighlight({ onOpenParentPortal }) {
  const features = [
    {
      icon: Calendar,
      title: 'Daily Attendance & Biometric Tracking',
      desc: 'Parents receive immediate verification of when their child enters the coaching premises. Absences trigger auto-notifications to prevent bunker habits.',
      badge: 'Compulsory'
    },
    {
      icon: Award,
      title: 'Every Sunday Test Marks & Batch Rank',
      desc: 'Transparent marks report after every weekly unit test and grand mock exam. Track whether your child is in the Top 10% of their batch.',
      badge: 'Real-time Marks'
    },
    {
      icon: Bell,
      title: 'Compulsory Notices & PTM Alerts',
      desc: 'Never miss an exam date sheet, syllabus deadline, or Parent-Teacher meeting. Crucial notices are pushed directly to the dashboard.',
      badge: 'Direct Updates'
    },
    {
      icon: PhoneCall,
      title: 'Direct Faculty Mentorship & Callback',
      desc: 'Assigned IITian mentor for each batch. Request callbacks and leave permissions directly through the parent portal.',
      badge: '1-on-1 Guidance'
    }
  ];

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Description */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Total Parental Transparency
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              A Coaching Center Where{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                Parents Are Always
              </span>{' '}
              in Control.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              At Goyal Coaching Center, we believe true student success requires complete alignment between teachers, students, and parents. That is why our proprietary portal maintains 100% of data securely accessible to parents 24/7.
            </p>

            <div className="mt-8 space-y-4">
              {features.map((f, idx) => {
                const Icon = f.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl glass-panel border border-slate-800/80 flex items-start gap-3.5 hover:border-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{f.title}</h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {f.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <button
                onClick={onOpenParentPortal}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Test Drive Parent Portal (Try 1-Click Demo)</span>
              </button>
            </div>
          </div>

          {/* Right: 3D Interactive Card Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/20 rounded-3xl blur-3xl pointer-events-none" />
            <TiltCard maxTilt={10} className="relative glass-panel-glow p-6 sm:p-8 border border-blue-500/30">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400 font-mono ml-2">portal.goyalcoaching.edu.in</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" /> Live Connected
                </span>
              </div>

              {/* Sample Parent Screen Mockup inside Card */}
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Child Performance</span>
                    <h3 className="font-bold text-white text-base">Priya Goyal • Class 12</h3>
                    <p className="text-xs text-amber-400 font-semibold">Batch Rank: #1 of 45 Students</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-400">97.5%</div>
                    <div className="text-[10px] text-slate-400">Attendance Rate</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                    <Bell className="w-3.5 h-3.5" /> Compulsory Notice Alert
                  </div>
                  <p className="text-xs text-slate-200">
                    Mandatory PTM for Class 12 on Sunday 22nd Nov. Mock test analysis will be provided.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Recent Test Score</div>
                    <div className="text-lg font-black text-white mt-0.5">98 / 100</div>
                    <div className="text-[10px] text-emerald-400 font-semibold">Physics & Math Mock</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Faculty Remark</div>
                    <div className="text-xs font-semibold text-slate-200 mt-1 italic">"Exceptional Calculus"</div>
                    <div className="text-[10px] text-amber-400">Er. Alok Goyal</div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-400">
                    Parents can log in with student roll number and mobile number anytime from phone or PC.
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
