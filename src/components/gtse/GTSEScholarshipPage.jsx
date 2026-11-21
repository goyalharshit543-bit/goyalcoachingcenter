import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Sparkles, 
  Award, 
  Calendar, 
  CalendarCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Target, 
  BookOpen, 
  GraduationCap, 
  HelpCircle, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Building,
  Building2,
  Laptop,
  Globe,
  UserCheck,
  CheckCheck,
  Mountain,
  Lock,
  Compass
} from 'lucide-react';

// Animation Variants
const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }
};

const cardFloatVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function GTSEScholarshipPage({
  onBackToHome,
  onOpenCounseling
}) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedClassTab, setSelectedClassTab] = useState('foundation'); // 'foundation' | 'commerce'

  const toggleFaq = (index) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  const handleRegisterClick = (courseTitle = 'GTSE Scholarship Exam') => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onOpenCounseling) {
      onOpenCounseling(courseTitle);
    }
  };

  const faqs = [
    {
      q: 'What is GTSE (Goyal Talent Search Examination)?',
      a: 'GTSE is the premier scholarship and talent assessment examination conducted by Goyal Coaching Center for students moving to Classes 8th, 9th, 10th (Science & Mathematics) and 11th & 12th (Commerce). It provides up to 100% scholarship on tuition fees and detailed diagnostic performance analysis.'
    },
    {
      q: 'Is there any registration fee for GTSE?',
      a: 'No! Registration for the GTSE Scholarship Exam is 100% FREE as an educational initiative by Goyal Coaching Center to identify and empower deserving students.'
    },
    {
      q: 'What is the mode of examination?',
      a: 'GTSE is conducted in 100% Offline mode only at Goyal Coaching Center campuses. It follows a pen-and-paper OMR sheet format to give students real examination hall exposure.'
    },
    {
      q: 'When will the GTSE results be announced?',
      a: 'GTSE results are declared the very next day of the examination! Results are sent via WhatsApp/SMS to parents and also displayed on the institute notice board with an AI-analyzed strength & weakness report card.'
    },
    {
      q: 'What syllabus is covered in the exam?',
      a: 'The syllabus strictly aligns with the NCERT/CBSE curriculum of the student\'s current/preceding academic class. Science and Maths students are tested on core conceptual understanding and mental reasoning, while Commerce students are tested on Accountancy, Economics, Business basics, and Quantitative aptitude.'
    },
    {
      q: 'Can ICSE and State Board students appear for GTSE?',
      a: 'Yes, students from CBSE, ICSE, and all State Boards are warmly welcome. The questions are conceptual and designed to test foundational reasoning, not rote learning.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-blue-600 selection:text-white">
      
      {/* ================= TOP BREADCRUMB & BACK ACTION ================= */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md sticky top-16 sm:top-20 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Back to Home</span>
          </motion.button>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GTSE Scholarship Exam Active • Up to 100% Fee Waiver</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ================= HERO HEADER SECTION ================= */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-12 sm:pb-16 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-500/15 to-cyan-400/10 blur-3xl pointer-events-none rounded-full" />
        
        <motion.div 
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
        >
          
          {/* Top Pill with Glow */}
          <motion.div 
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-extrabold tracking-wide uppercase mb-6 shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </motion.div>
            <span>Goyal Talent Search Examination</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={fadeUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-outfit text-slate-950 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto"
          >
            GTSE Scholarship Exam
          </motion.h1>

          <motion.div 
            variants={fadeUp}
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold mt-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300"
          >
            Empowering Merit with Up to 100% Scholarship
          </motion.div>

          <motion.p 
            variants={fadeUp}
            className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            The landmark benchmark assessment test by <strong className="text-slate-900 dark:text-white">Goyal Coaching Center</strong>. Designed to evaluate conceptual depth, test real exam temperament, and reward brilliant minds across <strong className="text-blue-600 dark:text-blue-400">Class 8th–10th (Science & Maths)</strong> and <strong className="text-blue-600 dark:text-blue-400">Class 11th–12th (Commerce)</strong>.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleRegisterClick('GTSE Scholarship Exam')}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Register for GTSE (100% Free)</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const el = document.getElementById('registration-process-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 sm:px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>How to Register</span>
            </motion.button>
          </motion.div>

          {/* Highlights Row */}
          <motion.div 
            variants={fadeUp}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left"
          >
            {[
              { label: 'Scholarship', val: 'Up to 100%', icon: Award, bg: 'bg-amber-500/10 text-amber-500' },
              { label: 'Test Mode', val: 'Offline Only', icon: Building, bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
              { label: 'Results', val: 'Next Day', icon: CalendarCheck, bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
              { label: 'Registration', val: 'Zero (₹0) Fee', icon: CheckCircle2, bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' }
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">{item.label}</div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">{item.val}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </motion.div>
      </section>

      {/* =========================================================================
          ABOUT GTSE SECTION (WITH 3 CARDS)
         ========================================================================= */}
      <section id="about-gtse-section" className="py-14 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with Animated Expanding Royal Blue Underline */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-black font-outfit text-slate-950 dark:text-white tracking-tight"
          >
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300">GTSE</span>
          </motion.h2>
          
          <div className="flex flex-col items-center justify-center mt-3 space-y-1">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '5.5rem' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
            />
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '3rem' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
            />
          </div>
        </div>

        {/* Narrative Paragraph */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto text-center mb-12 sm:mb-14"
        >
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            <strong className="font-bold text-slate-900 dark:text-white">Goyal Talent Search Examination (GTSE)</strong> is the Scholarship & encouragement exam with the purpose of helping the students to initiate them towards their goal of becoming a top achiever in Science, Mathematics or Commerce by providing them with an opportunity to get up to 100% scholarship and career guidance of experts. GTSE helps students to know their strengths and weaknesses to work on, for achieving the desired results as per the current educational standard. Analysis report of GTSE helps the student in identifying the academic strength using modern assessment and performance analytics tools.
          </p>
        </motion.div>

        {/* 3 Interactive Cards */}
        <motion.div 
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
        >
          
          {/* CARD 1: Get Up to 100%* Scholarship */}
          <motion.div 
            variants={cardFloatVariant}
            whileHover={{ 
              y: -8, 
              scale: 1.025,
              boxShadow: "0 20px 30px -10px rgba(245, 158, 11, 0.18)" 
            }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-300 flex items-start gap-4 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

            <motion.div 
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-700/50 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"
            >
              <div className="relative">
                <Calendar className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                <motion.span 
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[9px] font-black text-slate-950 flex items-center justify-center shadow"
                >
                  ★
                </motion.span>
              </div>
            </motion.div>

            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Get Up to 100%* Scholarship
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-snug">
                On our Classroom courses
              </p>
              
              <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold group-hover:bg-amber-500/20 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Class 8th to 12th Batches</span>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: Exam Conduction Process */}
          <motion.div 
            variants={cardFloatVariant}
            whileHover={{ 
              y: -8, 
              scale: 1.025,
              boxShadow: "0 20px 30px -10px rgba(249, 115, 22, 0.18)" 
            }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-300 flex items-start gap-4 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/10 transition-colors" />

            <motion.div 
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-700/50 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/60 flex items-center justify-center text-orange-600 dark:text-orange-300">
                <FileText className="w-5 h-5" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Exam Conduction Process
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-snug">
                GTSE will be conducted in Offline mode only.
              </p>

              <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-bold group-hover:bg-orange-500/20 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>OMR Offline at Goyal Campus</span>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: Exam Result */}
          <motion.div 
            variants={cardFloatVariant}
            whileHover={{ 
              y: -8, 
              scale: 1.025,
              boxShadow: "0 20px 30px -10px rgba(225, 29, 72, 0.2)" 
            }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-300 flex items-start gap-4 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />

            <motion.div 
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-700/50 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0 relative z-10">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Exam Result
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium leading-snug">
                Result will be declared next day of the exam. It can be used to get scholarship for admission in <strong className="text-slate-900 dark:text-white font-semibold">Goyal Coaching Center</strong>.
              </p>

              <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold group-hover:bg-rose-500/20 transition-colors">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>24-Hour Express Score Card</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

      </section>

      {/* =========================================================================
          WHY GTSE IS DIFFERENT? SECTION (EXACTLY MATCHING USER'S UPLOADED IMAGE)
          - Adapted with Goyal Coaching Center Royal Blue & Amber Theme
          - 3 Cards: Pinnacle of Excellence, SWOT Analysis, Career Guidance
          - Layout: 2 cards on top row, 1 card centered on bottom row
         ========================================================================= */}
      <section className="py-14 sm:py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Title: WHY GTSE IS DIFFERENT? ✨ */}
          <div className="text-center mb-10 sm:mb-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/25 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>GTSE (Goyal Talent Search Exam)</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black font-outfit uppercase tracking-wider text-slate-950 dark:text-white"
            >
              WHY GTSE IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300">DIFFERENT?</span> ✨
            </motion.h2>

            <div className="flex flex-col items-center justify-center mt-3 space-y-1">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '5.5rem' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
              />
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '2.5rem' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
              />
            </div>
          </div>

          {/* Cards Grid: 2 on top row, 1 centered on bottom row matching user image layout */}
          <div className="space-y-6">
            
            {/* Top Row: 2 Cards */}
            <motion.div 
              variants={containerStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              
              {/* CARD 1: Pinnacle of Excellence */}
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl shadow-blue-600/20 border border-blue-400/30 overflow-hidden flex flex-col items-center text-center"
              >
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Circular Icon Container */}
                <motion.div 
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 mb-5 shadow-inner group-hover:scale-110 group-hover:border-amber-300 transition-all duration-300"
                >
                  <Mountain className="w-8 h-8" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black font-outfit text-amber-300 tracking-tight mb-3">
                  Pinnacle of Excellence
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-blue-50/95 leading-relaxed font-normal">
                  GTSE is the initial step for career aspirants to reach the pinnacle of their set goals. In essence, it pioneers them on the path of achieving their targeted goals and towards an illustrious & bright career. Goyal Coaching Center has the proven ability to raise students' potential manifold.
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-[11px] font-bold border border-white/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Targeted Goal Achievement</span>
                </div>
              </motion.div>

              {/* CARD 2: SWOT Analysis */}
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl shadow-blue-600/20 border border-blue-400/30 overflow-hidden flex flex-col items-center text-center"
              >
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-400/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Circular Icon Container */}
                <motion.div 
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 mb-5 shadow-inner group-hover:scale-110 group-hover:border-amber-300 transition-all duration-300"
                >
                  <Lock className="w-8 h-8" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black font-outfit text-amber-300 tracking-tight mb-3">
                  SWOT Analysis
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-blue-50/95 leading-relaxed font-normal">
                  GTSE question papers are designed meticulously taking into consideration scientifically & analytically driven parameters for the real assessment of young minds. The in-depth analysis of performance enables the student to know the scope for improvement & evaluate the analytical skills required for success in various other careers & life.
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-[11px] font-bold border border-white/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Strengths & Weaknesses Diagnostic</span>
                </div>
              </motion.div>

            </motion.div>

            {/* Bottom Row: 1 Centered Card */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl shadow-blue-600/20 border border-blue-400/30 overflow-hidden flex flex-col items-center text-center"
              >
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* Circular Icon Container */}
                <motion.div 
                  animate={{ rotate: [-4, 4, -4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 mb-5 shadow-inner group-hover:scale-110 group-hover:border-amber-300 transition-all duration-300"
                >
                  <Compass className="w-8 h-8" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black font-outfit text-amber-300 tracking-tight mb-3">
                  Career Guidance
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-blue-50/95 leading-relaxed font-normal">
                  Performance in GTSE determines the academic potential for success in respective forthcoming higher competitive and board exams. Thus, students can confidently choose the career path looking at their forte & improve themselves in the weak areas essential for success in future.
                </p>

                <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-[11px] font-bold border border-white/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Personalized 1-on-1 Stream Mentorship</span>
                </div>
              </motion.div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          REGISTRATION PROCESS SECTION (REPLACES IMAGE 1 WITH IMAGE 2)
          - Exactly matching Image 2 layout with Goyal Coaching Center colors & branding
         ========================================================================= */}
      <section id="registration-process-section" className="py-14 sm:py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Title: REGISTRATION PROCESS */}
          <div className="text-center mb-10 sm:mb-14">
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black font-outfit uppercase tracking-wider text-slate-950 dark:text-white"
            >
              REGISTRATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300">PROCESS</span>
            </motion.h2>

            <div className="flex flex-col items-center justify-center mt-3 space-y-1">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '5rem' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
              />
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: '2.5rem' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: How to Register & The Two Option Cards */}
            <motion.div 
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6"
            >
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-950 dark:text-white tracking-tight">
                  How to Register
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  Take the first step for your better future by registering for <strong className="text-slate-900 dark:text-white font-semibold">GTSE (Goyal Talent Search Examination)</strong>.
                </p>
              </div>

              {/* CARD 1: Online Registration */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl p-6 bg-slate-50 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  {/* Icon in themed circular badge */}
                  <div className="w-11 h-11 rounded-2xl bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      Online Registration
                    </h4>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Instant 1-Minute Process
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      1
                    </span>
                    <p className="leading-snug">
                      Choose the <strong>Register</strong> button from the navigation menu or click below to launch the registration modal.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      2
                    </span>
                    <p className="leading-snug">
                      Fill in the student & parent contact details in the registration form and submit the form.
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleRegisterClick('GTSE Scholarship Exam')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Register Online Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                  <span className="text-[11px] text-slate-400 font-medium">100% Free (₹0 Fee)</span>
                </div>
              </motion.div>

              {/* CARD 2: Offline Registration */}
              <motion.div 
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl p-6 bg-slate-50 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3.5 mb-3">
                  {/* Icon in themed circular badge */}
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      Offline Registration
                    </h4>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      Direct Campus Visit & Helpdesk
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  You can visit <strong className="text-slate-900 dark:text-white font-semibold">Goyal Coaching Center</strong> Main Campus for offline registration, collect printed sample test papers, and receive direct academic counseling from faculty.
                </p>

                <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Main Campus (Sec 14 & Model Town)
                  </span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                    Open 9:00 AM – 7:30 PM
                  </span>
                </div>
              </motion.div>

            </motion.div>

            {/* RIGHT COLUMN: Illustrated Registration Portal Graphic (Styled in Royal Blue Theme) */}
            <motion.div 
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-6 flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg">
                
                {/* Ambient Soft Glow Behind Graphic */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-amber-500/10 rounded-3xl blur-3xl pointer-events-none" />

                {/* Main Stylized Browser Mockup Window */}
                <div className="relative rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-2 border-blue-500/30 dark:border-blue-600/30 shadow-2xl p-5 sm:p-7 overflow-hidden">
                  
                  {/* Browser Window Header with 3 Control Dots */}
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="ml-2 text-[11px] font-mono text-slate-400">goyalcoaching.edu.in/gtse</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                      LIVE PORTAL
                    </span>
                  </div>

                  {/* Window Content: Registration Form Visual Preview */}
                  <div className="space-y-4">
                    
                    {/* Center Header with Avatar & Badge */}
                    <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white shrink-0">
                          <UserCheck className="w-6 h-6 text-amber-300" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-blue-100 uppercase tracking-wider">GTSE 2027–28</div>
                          <div className="text-sm sm:text-base font-black font-outfit">Student Registration</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[11px] shadow">
                        FREE ₹0
                      </span>
                    </div>

                    {/* Simulated Input Fields */}
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Candidate Name</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          Siddharth Sharma <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Class & Stream</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          Class 10th (Science & Maths) <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Scholarship Eligibility</span>
                        <span className="font-black text-amber-500 dark:text-amber-400 flex items-center gap-1">
                          Up to 100% Tuition Waiver
                        </span>
                      </div>
                    </div>

                    {/* Interactive Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRegisterClick('GTSE Scholarship Exam')}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Submit Instant GTSE Application</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </motion.button>

                    {/* Floating Info Badges */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCheck className="w-3.5 h-3.5" /> Instant Admit Roll Slip
                      </span>
                      <span>Next-Day Result Verified</span>
                    </div>

                  </div>

                </div>

              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ================= EXAM PATTERN & SYLLABUS TABS WITH ANIMATED TRANSITIONS ================= */}
      <section className="py-14 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Comprehensive Curriculum
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white">
            Exam Pattern & Subject Blueprint
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
            60 Multiple Choice Questions (MCQ) designed to test analytical insight without confusing negative marking.
          </p>

          {/* Segmented Switcher with Animated Pill */}
          <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setSelectedClassTab('foundation')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                selectedClassTab === 'foundation'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Junior Foundation (Class 8th, 9th & 10th)
            </button>
            <button
              onClick={() => setSelectedClassTab('commerce')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                selectedClassTab === 'commerce'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Commerce Stream (Class 11th & 12th)
            </button>
          </div>
        </div>

        {/* Tab Content with Framer Motion AnimatePresence */}
        <AnimatePresence mode="wait">
          {selectedClassTab === 'foundation' ? (
            <motion.div 
              key="foundation-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg mb-4">
                  25Q
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Science (Physics, Chem, Bio)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Foundational concepts & NCERT practical applications.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Force, Motion, Light & Electricity basics</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Matter, Atoms, Acids & Chemical Reactions</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Cellular Biology & Life Processes</li>
                </ul>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-lg mb-4">
                  25Q
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mathematics & Geometry</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Core calculation speed, algebra & coordinate intuition.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Real Numbers, Polynomials & Linear Equations</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Triangles, Circles, Mensuration & Geometry</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Trigonometry & Statistics Fundamentals</li>
                </ul>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg mb-4">
                  10Q
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mental Ability & Reasoning</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pattern recognition, coding-decoding and problem solving.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Series Completion & Logical Puzzles</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Direction Sense & Blood Relations</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Verbal & Non-Verbal Analytical Insight</li>
                </ul>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="commerce-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg mb-4">
                  25Q
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Accountancy & Business</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fundamental ledger, journal principles & commerce structure.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Double-Entry System & Accounting Concepts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Balance Sheet & Financial Statements Basics</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Business Organisation & Trade Foundations</li>
                </ul>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
                  25Q
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Economics & Applied Maths</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Micro & Macro economic logic, demand-supply & numerical reasoning.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Consumer Equilibrium & Elasticity of Demand</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Statistics for Economics & Data Interpretation</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Quantitative Math & Financial Calculations</li>
                </ul>
              </motion.div>

              <motion.div 
                whileHover={{ y: -6 }}
                className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg mb-4">
                  10Q
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aptitude & General Awareness</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current economic affairs, commercial aptitude & logical deduction.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Commercial Terminology & Banking Basics</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Analytical Case Studies</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Logical Brainteasers & Pattern Reasoning</li>
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* ================= FREQUENTLY ASKED QUESTIONS WITH ANIMATED ACCORDION ================= */}
      <section className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> Clarity & FAQs
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Everything you need to know about the Goyal Talent Search Examination.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <motion.div 
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* ================= FINAL CTA STRIP WITH CONFETTI BURST ================= */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-4 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" /> Limited Scholarship Seats Available
          </motion.div>

          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl font-black font-outfit tracking-tight"
          >
            Ready to Take the GTSE Scholarship Challenge?
          </motion.h2>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-xs sm:text-base text-blue-100 max-w-2xl mx-auto"
          >
            Give your child the opportunity to earn up to 100% scholarship and gain early mastery in CBSE Science, Maths & Commerce.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRegisterClick('GTSE Scholarship Exam')}
              className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Register for GTSE Today</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBackToHome}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all cursor-pointer"
            >
              Explore Other Courses
            </motion.button>
          </motion.div>

          <div className="mt-8 text-xs text-blue-200/90 font-medium flex items-center justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> ₹0 Registration Fee</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Next-Day Result Declaration</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct Tuition Fee Concession</span>
          </div>

        </div>
      </section>

    </div>
  );
}
