import { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Users, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  Calendar, 
  Bell, 
  GraduationCap,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

export default function HeroSection({ onOpenParentPortal, onOpenAdmission }) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Royal Navy & Polished Gold Ambient Lighting Background from 2nd Logo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b3f7918_1px,transparent_1px),linear-gradient(to_bottom,#1b3f7918_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[540px] bg-gradient-to-tr from-[#163a75]/35 via-[#1b3f79]/20 to-[#d49a36]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[420px] h-[420px] bg-[#d49a36]/12 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-[380px] h-[380px] bg-[#163a75]/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Official Institute Seal & Tagline Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-xl shadow-amber-500/10 backdrop-blur-md">
            <img 
              src="/goyal-logo.png" 
              alt="Goyal Coaching Centre" 
              className="w-7 h-7 rounded-full object-cover border border-amber-400 bg-white p-0.5" 
            />
            <span className="font-bold tracking-wide">GOYAL COACHING CENTRE</span>
            <span className="text-amber-500">•</span>
            <span className="font-serif italic text-amber-200">"Build a Better Future"</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 text-xs font-bold">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>GTSE SCHOLARSHIP ADMISSIONS OPEN</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
          Where Concept Mastery Meets{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600">
            100/100 Board Scores
          </span>
          <br className="hidden sm:inline" /> & Total Parental Transparency.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Welcome to <strong className="text-slate-900 dark:text-white font-bold">Goyal Coaching Centre</strong>. Delhi's premier institute specialized exclusively for{' '}
          <span className="text-blue-600 dark:text-blue-400 font-semibold">Class 8th to 10th (Science & Mathematics)</span> and{' '}
          <span className="text-amber-600 dark:text-amber-400 font-semibold">Class 11th & 12th (Commerce: Accounts, Economics, BST, Maths)</span>. Equipped with a real-time{' '}
          <strong className="text-slate-900 dark:text-white">Parent Portal</strong> so parents can track marks, attendance & rank progress daily.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <button
            onClick={onOpenParentPortal}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-slate-950" />
            <span>Open Parent Portal (अभिभावक पोर्टल)</span>
          </button>

          <button
            onClick={onOpenAdmission}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-panel-glow text-slate-900 dark:text-white font-bold text-sm border border-blue-500/30 hover:border-blue-500/60 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>Apply for Admission 2027</span>
            <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </button>
        </div>

        {/* Quick Demo Credentials Pill for Reviewers & Parents */}
        <div className="mt-5 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-full">
            <span className="text-amber-400 font-semibold">Parent Test Drive:</span> Log in with Roll No <code className="text-amber-300 font-mono font-bold">GCC-101</code> (Class 12 Commerce) or <code className="text-amber-300 font-mono font-bold">GCC-102</code> (Class 10 Sci & Math)
          </span>
        </div>

        {/* Key Achievement Metric Cards */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <TiltCard maxTilt={8} className="p-5 glass-panel border border-slate-800 text-center hover:border-amber-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              6,800+
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">
              Students Mentored
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">15+ Years Board Excellence</div>
          </TiltCard>

          <TiltCard maxTilt={8} className="p-5 glass-panel border border-slate-800 text-center hover:border-blue-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              420+
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">
              100/100 Perfect Centums
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Class 10 & 12 Board Exams</div>
          </TiltCard>

          <TiltCard maxTilt={8} className="p-5 glass-panel border border-slate-800 text-center hover:border-emerald-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              99.2%
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">
              CBSE Board Merit Rate
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Top Aggregate Scorers</div>
          </TiltCard>

          <TiltCard maxTilt={8} className="p-5 glass-panel border border-slate-800 text-center hover:border-purple-500/40 transition-colors">
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
              185+
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">
              SRCC & DU Selections
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Top Commerce Colleges</div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
