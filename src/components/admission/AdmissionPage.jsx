import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  FileEdit, 
  Info,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Lightbulb,
  Settings,
  Users,
  Compass,
  GraduationCap,
  Phone
} from 'lucide-react';

export default function AdmissionPage({
  onBackToHome,
  onOpenCounseling,
  onOpenAdmissionModal
}) {
  const handleAction = () => {
    if (onOpenAdmissionModal) {
      onOpenAdmissionModal();
    } else if (onOpenCounseling) {
      onOpenCounseling();
    }
  };

  return (
    <div className="w-full min-h-[75vh] flex flex-col justify-start bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* ================= TOP SUB-BAR ================= */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Admission Portal
          </span>
        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        
        {/* ========================================================================= */}
        {/* HERO BANNER SECTION (ONLY THIS BANNER KEPT AS REQUESTED BY USER) */}
        {/* Header from Right to Left, Text from Left to Right */}
        {/* ========================================================================= */}
        <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative border-2 border-blue-500/40 bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800 text-white p-6 sm:p-10 md:p-14">
          {/* Subtle Ambient Background Lighting Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* ================= LEFT CONTENT ================= */}
            {/* Animation: Comes in from Left to Right (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-8 flex flex-col items-start space-y-4 sm:space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Session 2026–2027 Admissions Active</span>
              </div>

              {/* Title from User's Photo */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Admission Process
              </h1>

              {/* Subtitle with Goyal Coaching Center in place of Pinnacle Educare */}
              <p className="text-blue-100 text-sm sm:text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                Join <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">Goyal Coaching Center</span> through our merit-based admission process designed to identify and nurture academic excellence.
              </p>

              {/* Two CTA Buttons from User Photo */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                {/* Apply Now: Amber Button with Edit/Pencil Icon */}
                <button
                  onClick={handleAction}
                  className="px-6 sm:px-8 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <FileEdit className="w-5 h-5 text-slate-950" />
                  <span>Apply Now</span>
                </button>

                {/* Learn More: Translucent Outline Button with Info Icon */}
                <button
                  onClick={handleAction}
                  className="px-6 sm:px-8 py-3 rounded-xl border-2 border-white/70 hover:border-white text-white hover:bg-white/15 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-sm"
                >
                  <Info className="w-5 h-5 text-white" />
                  <span>Learn More</span>
                </button>
              </div>
            </motion.div>

            {/* ================= RIGHT HEADER / ILLUSTRATION ================= */}
            {/* Animation: Comes in from Right to Left (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="md:col-span-4 flex items-center justify-center md:justify-end"
            >
              <div className="relative group">
                {/* Soft Glowing Backlight behind the Mortarboard Cap */}
                <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-2xl transform scale-110 group-hover:scale-125 transition-transform duration-500" />
                
                {/* Large Stylized Graduation Cap matching photo with amber gold stroke */}
                <div className="relative p-6 sm:p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex items-center justify-center">
                  <svg 
                    className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    {/* Mortarboard Diamond Top */}
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    {/* Cap Underside */}
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    {/* Hanging Tassel */}
                    <path d="M22 10v6" />
                    <circle cx="22" cy="17" r="1.2" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION: OUR ADMISSION PROCESS (FROM USER REFERENCE IMAGE) */}
        {/* Styled according to website theme with Goyal Coaching Center replacing Pinnacle Educare */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mt-12 sm:mt-18 text-center max-w-4xl mx-auto px-4"
        >
          {/* Section Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
            <span className="text-slate-900 dark:text-white">Our </span>
            <span className="text-blue-600 dark:text-blue-400 relative inline-block">
              Admission Process
              {/* Theme decorative underline accent */}
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-20 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full" />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-7 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            At <span className="font-bold text-blue-600 dark:text-blue-400">Goyal Coaching Center</span>, we follow a structured and merit-based admission process to ensure students receive the best academic guidance through our Scholarship cum Admission Test.
          </p>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3-STEP ADMISSION PROCESS CARDS (WITH ZOOM-IN ANIMATION) */}
        {/* Styled according to website theme (Royal Blue, Indigo, Amber Gold) */}
        {/* ========================================================================= */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-2 sm:px-4">
          
          {/* STEP 1: REGISTRATION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-8 sm:p-9 text-center border-2 border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 transition-all duration-300 flex flex-col items-center"
          >
            {/* Number 1 Badge Circle in Website Royal Blue Theme */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/35 mb-6 group-hover:scale-110 transition-transform duration-300">
              1
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Registration
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Register for GTSE through our online portal or visit our center
            </p>
          </motion.div>

          {/* STEP 2: ADMISSION TEST */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-8 sm:p-9 text-center border-2 border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 transition-all duration-300 flex flex-col items-center"
          >
            {/* Number 2 Badge Circle in Website Indigo / Deep Blue Theme */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/35 mb-6 group-hover:scale-110 transition-transform duration-300">
              2
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Admission Test
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Take the scholarship cum admission test to evaluate aptitude and subject proficiency
            </p>
          </motion.div>

          {/* STEP 3: INTERVIEW & COUNSELLING */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
            whileHover={{ y: -6, scale: 1.03 }}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-8 sm:p-9 text-center border-2 border-slate-200/80 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-400 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 transition-all duration-300 flex flex-col items-center"
          >
            {/* Number 3 Badge Circle in Website Amber Gold Accent Theme */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-amber-500/35 mb-6 group-hover:scale-110 transition-transform duration-300">
              3
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Interview & Counselling
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Personalized interaction with faculty for career guidance and academic counselling
            </p>
          </motion.div>

        </div>

        {/* ========================================================================= */}
        {/* SECTION: EXAM DETAILS */}
        {/* Left card comes from Left to Right, Right card comes from Right to Left */}
        {/* Styled according to website theme */}
        {/* ========================================================================= */}
        <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-2 sm:px-4">
          
          {/* Header: EXAM DETAILS */}
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase">
              <span className="text-slate-900 dark:text-white">Exam </span>
              <span className="text-blue-600 dark:text-blue-400 relative inline-block">
                Details
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" />
              </span>
            </h2>
          </div>

          {/* Two-card layout: Left Syllabus, Right Exam Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* LEFT CARD: SYLLABUS */}
            {/* Animation: Left ones come right (x: -80 -> x: 0) (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-7 sm:p-9 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-all duration-300"
            >
              {/* Card Header with Icon */}
              <div className="flex items-center gap-3.5 mb-6 sm:mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Syllabus
                </h3>
              </div>

              {/* Syllabus Points with Checkmarks */}
              <div className="space-y-6">
                {/* Point 1: Mental Aptitude */}
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      Mental Aptitude
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Analytical and logical reasoning skills
                    </p>
                  </div>
                </div>

                {/* Point 2: Previous Class Mathematics & Science */}
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      Previous Class Mathematics & Science
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Conceptual understanding and application of key topics
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT CARD: EXAM PATTERN */}
            {/* Animation: Right ones moving to left (x: 80 -> x: 0) (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-7 sm:p-9 border-2 border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/60 hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-all duration-300"
            >
              {/* Card Header with Icon */}
              <div className="flex items-center gap-3.5 mb-6 sm:mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ClipboardCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Exam Pattern
                </h3>
              </div>

              {/* Exam Pattern Points with Checkmarks */}
              <div className="space-y-6">
                {/* Point 1: Format */}
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      Format:
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Multiple-choice questions (MCQs) with single correct answer
                    </p>
                  </div>
                </div>

                {/* Point 2: Objective */}
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      Objective:
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Assess conceptual clarity, problem-solving skills, and analytical abilities
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION: PARENTS' SEMINAR */}
        {/* Left column moves in from left to right, Right column moves in from right to left */}
        {/* Styled according to website theme */}
        {/* ========================================================================= */}
        <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: CONTENT & FEATURES */}
            {/* Animation: Left ones come right (x: -80 -> x: 0) (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col justify-center space-y-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                  <span className="text-slate-900 dark:text-white">Parents' </span>
                  <span className="text-blue-600 dark:text-blue-400 relative inline-block">
                    Seminar
                    <span className="absolute left-0 -bottom-2 w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" />
                  </span>
                </h2>
                <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  We believe in building a strong partnership between students, parents, and educators. During the admission test, we conduct an exclusive seminar for parents.
                </p>
              </div>

              {/* Feature Points List */}
              <div className="space-y-4 pt-1">
                
                {/* Feature 1: Latest Examination Insights */}
                <div className="flex items-start gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-900/60">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Lightbulb className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Latest Examination Insights
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Get updated on current examination patterns and trends
                    </p>
                  </div>
                </div>

                {/* Feature 2: Teaching Methodologies */}
                <div className="flex items-start gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-900/60">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Settings className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Teaching Methodologies
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Understand our academic approach and learning strategies
                    </p>
                  </div>
                </div>

                {/* Feature 3: Faculty Introduction */}
                <div className="flex items-start gap-4 p-3 rounded-2xl transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-900/60">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Users className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Faculty Introduction
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Meet our experienced faculty members and their expertise
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* RIGHT COLUMN: INTERACTIVE SESSION CARD */}
            {/* Animation: Right ones moving to left (x: 80 -> x: 0) (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              className="lg:col-span-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 rounded-3xl p-8 sm:p-12 border-2 border-blue-500/20 dark:border-blue-500/30 shadow-2xl shadow-blue-500/10 dark:shadow-slate-950/80 flex flex-col items-center justify-center text-center relative overflow-hidden group"
            >
              {/* Subtle ambient lighting */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Stylized Screen / Presenter Icon matching the reference image */}
              <div className="relative mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-blue-500/15 dark:shadow-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center">
                  <svg 
                    className="w-14 h-14 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400 drop-shadow-md" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    {/* Screen frame */}
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    {/* Screen base / stand */}
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                    {/* Presenter / User inside */}
                    <circle cx="12" cy="8.5" r="2.5" fill="currentColor" />
                    <path d="M7.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Interactive Session
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xs">
                Gain clear understanding of your child's educational journey
              </p>
            </motion.div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION: INTERVIEW & COUNSELLING */}
        {/* Left column moves in from left to right, Right column moves in from right to left */}
        {/* Styled according to website theme */}
        {/* ========================================================================= */}
        <div className="mt-16 sm:mt-24 max-w-6xl mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: CONTENT & CARDS */}
            {/* Animation: Left ones come right (x: -80 -> x: 0) (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col justify-center space-y-6"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                  <span className="text-slate-900 dark:text-white">Interview & </span>
                  <span className="text-blue-600 dark:text-blue-400 relative inline-block">
                    Counselling
                    <span className="absolute left-0 -bottom-2 w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" />
                  </span>
                </h2>
                <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Following the test, selected students are invited for a personalized interaction with our career counsellor for comprehensive guidance.
                </p>
              </div>

              {/* Two Horizontal Feature Cards */}
              <div className="space-y-4 pt-2">
                
                {/* Card 1: Career Guidance */}
                <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/30 dark:shadow-slate-950/50 hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-all duration-300">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Compass className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Career Guidance
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Explore best career paths based on strengths and aspirations
                    </p>
                  </div>
                </div>

                {/* Card 2: Academic Counselling */}
                <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border-2 border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/30 dark:shadow-slate-950/50 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 transition-all duration-300">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Academic Counselling
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Tailored advice for effective study approach and smooth learning
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* RIGHT COLUMN: PERSONALIZED GUIDANCE CARD */}
            {/* Animation: Right ones moving to left (x: 80 -> x: 0) (Triggers every time on scroll & visit) */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              className="lg:col-span-5 bg-white dark:bg-slate-900/90 rounded-3xl p-8 sm:p-12 border-2 border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/80 flex flex-col items-center justify-center text-center relative overflow-hidden group"
            >
              {/* Subtle ambient lighting */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Stylized Speech Bubble Icon with 3 dots matching the photo */}
              <div className="relative mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center">
                  <svg 
                    className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    {/* Speech bubble outline with tail */}
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    {/* 3 chat dots */}
                    <circle cx="8" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="16" cy="12" r="1" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Personalized Guidance
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xs">
                One-on-one interaction with expert faculty
              </p>
            </motion.div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION: READY TO BEGIN YOUR JOURNEY? (FINAL CTA) */}
        {/* Zoom-in effect one by one (Triggers every time on scroll & visit) */}
        {/* Styled according to website theme with Goyal Coaching Center replacing Pinnacle Educare */}
        {/* ========================================================================= */}
        <div className="mt-20 sm:mt-28 mb-12 sm:mb-16 max-w-4xl mx-auto px-4 text-center">
          
          {/* Item 1: Heading (Zooms in first) */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight"
          >
            <span className="text-slate-900 dark:text-white">Ready to Begin </span>
            <span className="text-blue-600 dark:text-blue-400 relative inline-block">
              Your Journey?
              {/* Double underline accent like the reference */}
              <span className="absolute left-0 -bottom-2 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 rounded-full" />
            </span>
          </motion.h2>

          {/* Item 2: Subtitle with Goyal Coaching Center (Zooms in second) */}
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Join thousands of successful students who have achieved their dreams through <span className="font-bold text-blue-600 dark:text-blue-400">Goyal Coaching Center</span>'s proven admission process.
          </motion.p>

          {/* Item 3: Two CTA Buttons (Zooms in third) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {/* Start Application Button */}
            <button
              onClick={handleAction}
              className="px-7 sm:px-9 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <FileEdit className="w-5 h-5 text-slate-950" />
              <span>Start Application</span>
            </button>

            {/* Contact Us Button */}
            <button
              onClick={() => {
                if (onOpenCounseling) {
                  onOpenCounseling();
                } else {
                  window.location.href = "tel:+919876960163";
                }
              }}
              className="px-7 sm:px-9 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Phone className="w-5 h-5 text-white" />
              <span>Contact Us</span>
            </button>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
