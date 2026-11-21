import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Home, 
  GraduationCap, 
  BookOpen, 
  Snowflake, 
  FileText, 
  ClipboardCheck, 
  Award,
  Clock,
  Lightbulb,
  Wrench,
  Trophy,
  CheckCircle2,
  Compass,
  Calculator
} from 'lucide-react';

export default function AboutUsPage({ onBackToHome, isDarkMode = false }) {
  const features = [
    {
      title: 'Experienced Faculty',
      icon: GraduationCap,
      description: 'Our faculty members are from IITs and other prestigious institutes, with years of teaching experience.'
    },
    {
      title: 'All Subjects Under One Roof',
      icon: BookOpen,
      description: 'No need to run around for different subjects. We offer everything under one structured system.'
    },
    {
      title: 'Air-Conditioned Campus',
      icon: Snowflake,
      description: 'Comfortable classrooms with a peaceful environment to maximize learning potential.'
    },
    {
      title: 'Tailor-Made Study Material',
      icon: FileText,
      description: 'Our "Pathfinder" study material ensures concept clarity and problem-solving techniques.'
    },
    {
      title: 'Daily Practice & Tests',
      icon: ClipboardCheck,
      description: 'Regular assessment through DPPs and PPTs to track progress and improve performance.'
    },
    {
      title: 'Scholarship Program',
      icon: Award,
      description: 'Financial aid of up to 100% for deserving students to ensure education for all.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Top Navigation Bar with Back to Home */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <button onClick={onBackToHome} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">About Us</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        
        {/* Header Section with Zoom-In Animations (Triggers every time on scroll & visit) */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title: "Why Goyal Coaching Center?" with Zoom-In Animation */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-outfit tracking-tight text-slate-900 dark:text-white"
          >
            Why{' '}
            <span className="relative inline-block text-blue-600 dark:text-blue-400">
              Goyal Coaching Center?
              {/* Double underline accent in website's Royal Blue brand colors */}
              <span className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 flex flex-col items-center">
                <span className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                <span className="w-3/5 h-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full mt-0.5" />
              </span>
            </span>
          </motion.h1>

          {/* Subtitle text with Staggered Zoom-In Animation */}
          <motion.p
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="mt-8 sm:mt-10 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed"
          >
            Goyal Coaching Center has been established with the motive of imparting the finest quality of education. Here&apos;s why we stand out:
          </motion.p>
        </div>

        {/* ================= 2-COLUMN SECTION: LEFT CHALKBOARD + RIGHT 6 FEATURE CARDS ================= */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* LEFT COLUMN: Chalkboard Strategy & Plan Graphic (Slides from Left to Right: x: -75 -> 0) */}
          <motion.div
            initial={{ opacity: 0, x: -75 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 h-full flex flex-col"
          >
            <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-full rounded-3xl overflow-hidden border-2 border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/80 group bg-slate-900">
              <img
                src="/about-plan-board.jpg"
                alt="Strategic Planning & Conceptual Clarity"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Subtle ambient gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-400">
                  Concept First Mentorship
                </p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Structured strategy, daily practice, and individual doubt clearance desks.
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: 6 Feature Cards (Slides from Right to Left: x: 75 -> 0) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 75 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ 
                    duration: 0.65, 
                    ease: [0.16, 1, 0.3, 1], 
                    delay: 0.05 + (idx * 0.06) 
                  }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-400/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/60 transition-all duration-300 flex flex-col items-center text-center group cursor-default"
                >
                  {/* Icon in Royal Blue Website Theme */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-all duration-300">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 transition-colors" />
                  </div>

                  {/* Title in Royal Blue Theme */}
                  <h3 className="text-base sm:text-lg font-black font-outfit text-blue-600 dark:text-blue-400 mb-2 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>

        {/* ================= OUR VISION SECTION: LEFT CONTENT + RIGHT TROPHY GRAPHIC ================= */}
        <div className="mt-20 sm:mt-28 pt-12 sm:pt-16 border-t border-slate-200/80 dark:border-slate-800">
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-blue-950/40 rounded-3xl p-6 sm:p-10 lg:p-14 border-2 border-blue-500/20 dark:border-blue-500/30 shadow-2xl shadow-blue-500/10 dark:shadow-slate-950/80 overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* LEFT COLUMN: Vision Content, Values Box & Commitments List (Slides from Left to Right: x: -75 -> 0) */}
              <motion.div
                initial={{ opacity: 0, x: -75 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 flex flex-col space-y-6"
              >
                {/* Heading */}
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
                    Our{' '}
                    <span className="relative inline-block text-blue-600 dark:text-blue-400">
                      Vision
                      <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    </span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Goyal Coaching Center stands for academic excellence and conceptual mastery, guided by experienced educators and passionate subject experts. We mix fundamental teaching ideologies with scientific and structured methods to enhance student learning. Our approach goes beyond education—it creates experiences that translate into deeper learning.
                  </p>
                </div>

                {/* Values and Vision Card */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border-l-4 border-blue-600 dark:border-blue-500 border border-slate-200/80 dark:border-slate-700 shadow-md">
                  <h3 className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 font-outfit mb-2">
                    Values and Vision
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Established with a mission to enhance student learning, our goal is to nurture students for the competitive academic world and help them secure top ranks in board examinations and prestigious institutions.
                  </p>
                </div>

                {/* Commitment Header & 3 List Items */}
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Goyal Coaching Center is committed to education by:
                  </h4>

                  <div className="space-y-2.5">
                    {/* Item 1 */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Teaching students to develop respect for time and their surroundings.
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Helping students realize their true potential.
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Equipping them with tools to explore new dimensions of the world.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Concluding paragraph */}
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
                  Goyal Coaching Center takes the lead in mentoring and training students for top academic milestones, board examinations (Class 8th–10th), and senior commerce excellence (Class 11th–12th).
                </p>
              </motion.div>

              {/* RIGHT COLUMN: Trophy Celebration Illustration (Slides from Right to Left: x: 75 -> 0) */}
              <motion.div
                initial={{ opacity: 0, x: 75 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 flex flex-col items-center justify-center"
              >
                <div className="relative w-full max-w-md mx-auto group">
                  {/* Subtle backlight glow */}
                  <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-600/30 rounded-full blur-3xl transform scale-95 group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Image Card Container */}
                  <div className="relative rounded-3xl overflow-hidden border-2 border-blue-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6 shadow-xl flex items-center justify-center">
                    <img
                      src="/about-vision-trophy.png"
                      alt="Student Achievement and #1 Academic Excellence"
                      className="w-full h-auto max-h-[380px] object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Badge floating below trophy */}
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide shadow-sm">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Dedicated to 100/100 Academic Centum</span>
                    </span>
                  </div>
                </div>
              </motion.div>

            </div>

          </div>
        </div>

        {/* ================= AIMS AND RESPONSIBILITIES SECTION ================= */}
        <div className="mt-20 sm:mt-28 pt-12 sm:pt-16 border-t border-slate-200/80 dark:border-slate-800">
          <div className="bg-gradient-to-br from-white via-blue-50/40 to-slate-50 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-blue-950/30 rounded-3xl p-6 sm:p-10 lg:p-14 border-2 border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/80 overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* LEFT COLUMN: Isometric Screen Graphic (Slides from Left to Right: x: -75 -> 0) */}
              <motion.div
                initial={{ opacity: 0, x: -75 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 flex flex-col items-center justify-center order-2 lg:order-1"
              >
                <div className="relative w-full max-w-md mx-auto group">
                  {/* Subtle backlight glow */}
                  <div className="absolute inset-0 bg-blue-500/15 dark:bg-blue-600/25 rounded-full blur-3xl transform scale-95 group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Image Card Container */}
                  <div className="relative rounded-3xl overflow-hidden border-2 border-blue-200/70 dark:border-slate-700 bg-white dark:bg-slate-800/95 p-4 sm:p-6 shadow-xl flex items-center justify-center">
                    <img
                      src="/about-aims-screen.png"
                      alt="Aims and Responsibilities - Real-World Academic Excellence"
                      className="w-full h-auto max-h-[360px] object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Badge floating below image */}
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide shadow-sm">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Holistic Student Mentorship & Training</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT COLUMN: Aims & Responsibilities Content & 5 Points (Slides from Right to Left: x: 75 -> 0) */}
              <motion.div
                initial={{ opacity: 0, x: 75 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 flex flex-col space-y-6 order-1 lg:order-2"
              >
                {/* Heading */}
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
                    Aims and{' '}
                    <span className="relative inline-block text-blue-600 dark:text-blue-400">
                      Responsibilities
                      <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                    </span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    Goyal Coaching Center is different from the traditional cram-and-spit style of tutoring. We focus on real-world education, training young minds responsibly. At Goyal Coaching Center, we don&apos;t just produce results—we provide a holistic experience that transforms students into responsible professionals and individuals.
                  </p>
                </div>

                {/* Subheading & 5 Items */}
                <div className="space-y-3.5">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    We ensure that a student at Goyal Coaching Center:
                  </h4>

                  <div className="space-y-2.5">
                    {/* Item 1 */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Learns honesty towards himself.
                      </span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Discovers his true self.
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Learns to handle tough situations smartly.
                      </span>
                    </div>

                    {/* Item 4: Strictly Physics, Chemistry, Math, and Commerce subjects - NO Biology */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Develops strong aptitude for core subjects (Physics, Chemistry, Math, and Commerce subjects).
                      </span>
                    </div>

                    {/* Item 5 */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:border-blue-400 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Invents tools to apply his knowledge.
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
