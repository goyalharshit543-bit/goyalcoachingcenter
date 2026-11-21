import { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Calculator, 
  Percent, 
  ShieldCheck, 
  Award 
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

export default function CoursesSection({ courses = [], onEnrollCourse }) {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Scholarship Calculator State
  const [calcClass, setCalcClass] = useState('Class 10 (Science & Maths)');
  const [calcScore, setCalcScore] = useState(92);
  const [calcTarget, setCalcTarget] = useState('Science & Mathematics (8th-10th)');

  const categories = [
    'All Batches', 
    'Class 8th-10th (Science & Maths)', 
    'Class 11th-12th (Commerce Stream)'
  ];

  // Filter courses
  const filteredCourses = (courses || []).filter(c => {
    if (activeCategory === 'All Batches') return true;
    if (activeCategory === 'Class 8th-10th (Science & Maths)') {
      return c.title.includes('Class 8') || c.title.includes('Class 9') || c.title.includes('Class 10');
    }
    if (activeCategory === 'Class 11th-12th (Commerce Stream)') {
      return c.title.includes('Class 11') || c.title.includes('Class 12') || c.title.includes('Commerce');
    }
    return true;
  });

  // Calculate scholarship discount percentage
  let scholarshipPercent = 0;
  if (calcScore >= 98) scholarshipPercent = 100;
  else if (calcScore >= 95) scholarshipPercent = 75;
  else if (calcScore >= 90) scholarshipPercent = 50;
  else if (calcScore >= 85) scholarshipPercent = 35;
  else if (calcScore >= 75) scholarshipPercent = 20;
  else scholarshipPercent = 10;

  const baseFee = calcTarget === 'Commerce (11th-12th)' ? 48000 : 38000;
  const discountAmount = Math.round((baseFee * scholarshipPercent) / 100);
  const finalFee = baseFee - discountAmount;

  return (
    <section id="courses" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Specialized Curriculums
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Focused Academic Batches for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              High School & Commerce
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            Exclusively structured for Class 8th–10th (Science & Mathematics) and Class 11th–12th (Commerce). Features daily DPPs, Sunday simulated board mock tests, and 24/7 parent portal visibility.
          </p>

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {filteredCourses.map((course) => (
            <TiltCard
              key={course.id}
              maxTilt={7}
              className="glass-panel p-8 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Badge & Duration */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${course.color} shadow-md`}>
                    {course.tag || 'Board Batch'}
                  </span>
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Course Title & Target */}
                <h3 className="text-2xl font-black text-white">{course.title}</h3>
                <p className="text-xs font-semibold text-amber-400 mt-1 uppercase tracking-wide">
                  Target: {course.target}
                </p>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {course.description}
                </p>

                {/* Features Checklist */}
                <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-2.5">
                  {(course.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Fee & CTA */}
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Standard Annual Fee</div>
                  <div className="text-xl font-black text-white">{course.fee}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Installments & GTSE Scholarships Available</div>
                </div>

                <button
                  onClick={() => onEnrollCourse(course)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <span>Enroll in Batch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* ================= INTERACTIVE SCHOLARSHIP & FEE CALCULATOR ================= */}
        <div id="calculator" className="relative">
          <div className="absolute inset-0 bg-blue-600/10 rounded-3xl blur-3xl pointer-events-none" />
          
          <TiltCard maxTilt={5} className="relative glass-panel-glow p-8 sm:p-10 border border-blue-500/30">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left Info */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>GTSE Scholarship & Fee Calculator</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Calculate Your Meritorious Tuition Fee Waiver
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Available for students entering <strong>Class 8, 9, 10 (Science & Maths)</strong> or <strong>Class 11, 12 (Commerce Stream)</strong>. Enter your latest percentage to see your fee concession.
                </p>

                {/* Interactive Controls */}
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Select Class / Grade
                      </label>
                      <select
                        value={calcClass}
                        onChange={(e) => setCalcClass(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="Class 8 (Science & Maths)">Class 8 (Science & Maths)</option>
                        <option value="Class 9 (Science & Maths)">Class 9 (Science & Maths)</option>
                        <option value="Class 10 (Science & Maths)">Class 10 (Science & Maths Board)</option>
                        <option value="Class 11 (Commerce)">Class 11 (Commerce Stream)</option>
                        <option value="Class 12 (Commerce)">Class 12 (Commerce Board + CUET)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Domain Stream
                      </label>
                      <select
                        value={calcTarget}
                        onChange={(e) => setCalcTarget(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="Science & Mathematics (8th-10th)">Class 8th-10th (Science & Maths)</option>
                        <option value="Commerce (11th-12th)">Class 11th-12th (Commerce Stream)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300 uppercase">Previous Exam Percentage:</span>
                      <span className="font-black text-amber-400 text-sm">{calcScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="100"
                      step="1"
                      value={calcScore}
                      onChange={(e) => setCalcScore(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>60%</span>
                      <span>75% (20% Off)</span>
                      <span>90% (50% Off)</span>
                      <span>98%+ (100% Waiver)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Output Box */}
              <div className="w-full lg:w-80 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shrink-0 shadow-2xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400">GTSE Scholarship Tier</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {scholarshipPercent}% Waiver
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Standard Course Fee:</span>
                      <span className="text-white font-semibold">₹{baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Merit Scholarship Discount:</span>
                      <span className="font-bold">- ₹{discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-white uppercase">Net Payable Fee:</span>
                      <span className="text-2xl font-black text-amber-400">₹{finalFee.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                    *Applicable upon qualifying in Goyal Talent Search Examination (GTSE).
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => onEnrollCourse({ title: `${calcClass} (${scholarshipPercent}% GTSE Scholarship)` })}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Claim Scholarship & Book Seat</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
