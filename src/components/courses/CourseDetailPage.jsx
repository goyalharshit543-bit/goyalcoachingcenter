import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Video, 
  Users, 
  Headphones, 
  Library,
  Target,
  FileText,
  Tv,
  CheckSquare,
  MessageSquare,
  Clock,
  ClipboardCheck,
  UserCheck,
  Phone,
  ShieldCheck,
  Lightbulb,
  Brain,
  Globe,
  BarChart3,
  Trophy,
  Mic
} from 'lucide-react';

export const ALL_COURSES_CONFIG = {
  'course-class-7': {
    id: 'course-class-7',
    title: 'Class 7th Foundation',
    category: 'Foundation',
    heroTag: 'Master Class 7 with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 7',
    batchBadge: 'Class 7th Foundation Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 7 course. Designed to align with the latest CBSE/ICSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Mathematics & Science Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Class 7 syllabus',
    introText: "This course is designed for students in Class 7 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-8': {
    id: 'course-class-8',
    title: 'Class 8th Foundation',
    category: 'Foundation',
    heroTag: 'Master Class 8 with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 8',
    batchBadge: 'Class 8th Foundation Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 8 course. Designed to align with the latest CBSE/ICSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Mathematics & Science Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Class 8 syllabus',
    introText: "This course is designed for students in Class 8 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-9': {
    id: 'course-class-9',
    title: 'Class 9th Foundation',
    category: 'Foundation',
    heroTag: 'Master Class 9 with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 9',
    batchBadge: 'Class 9th Foundation Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 9 course. Designed to align with the latest CBSE/ICSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Mathematics & Science Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Class 9 syllabus',
    introText: "This course is designed for students in Class 9 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-10': {
    id: 'course-class-10',
    title: 'Class 10th Foundation',
    category: 'Foundation',
    heroTag: 'Master Class 10 with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 10',
    batchBadge: 'Class 10th Board Foundation Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 10 course. Designed to align with the latest CBSE/ICSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Mathematics & Science Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Class 10 syllabus',
    introText: "This course is designed for students in Class 10 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-11-commerce': {
    id: 'course-class-11-commerce',
    title: 'Class 11th Commerce',
    category: 'Commerce',
    heroTag: 'Master Class 11 Commerce with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 11 Commerce',
    batchBadge: 'Class 11th Commerce Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 11 Commerce course. Designed to align with the latest CBSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE Board Aligned',
    subjectBadge: 'Accounts, Economics & BST Focus',
    syllabusText: 'Complete coverage of CBSE Class 11 Commerce syllabus',
    introText: "This course is designed for students in Class 11 Commerce who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-12-commerce': {
    id: 'course-class-12-commerce',
    title: 'Class 12th Commerce',
    category: 'Commerce',
    heroTag: 'Master Class 12 Commerce with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 12 Commerce',
    batchBadge: 'Class 12th Commerce Board Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 12 Commerce course. Designed to align with the latest CBSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE Board Aligned',
    subjectBadge: 'Accounts, Economics & BST Focus',
    syllabusText: 'Complete coverage of CBSE Class 12 Commerce syllabus',
    introText: "This course is designed for students in Class 12 Commerce who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-accounts-eco': {
    id: 'course-accounts-eco',
    title: 'Accounts & Economics Special',
    category: 'Commerce',
    heroTag: 'Master Accounts & Economics with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Accounts & Economics',
    batchBadge: 'Accounts & Economics Special Batch',
    subtitle: 'Unlock your potential with our specialized Accounts & Economics course. Designed to align with the latest CBSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE Board Aligned',
    subjectBadge: 'Accounts & Economics Specialization',
    syllabusText: 'Complete coverage of CBSE Accounts & Economics syllabus',
    introText: "This course is designed for students in Class 11 & 12 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-8-sci-maths': {
    id: 'course-class-8-sci-maths',
    title: 'Class 8th Science & Maths',
    category: 'Science & Mathematics',
    heroTag: 'Master Class 8 Science & Maths with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 8 Science & Maths',
    batchBadge: 'Class 8th Science & Maths Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 8 Science & Maths course. Designed to align with the latest CBSE/ICSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Science & Mathematics Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Class 8 Science & Maths syllabus',
    introText: "This course is designed for students in Class 8 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-9-sci-maths': {
    id: 'course-class-9-sci-maths',
    title: 'Class 9th Science & Maths',
    category: 'Science & Mathematics',
    heroTag: 'Master Class 9 Science & Maths with',
    heroHighlight: 'Expert Guidance',
    classNumber: 'Class 9 Science & Maths',
    batchBadge: 'Class 9th Science & Maths Batch',
    subtitle: 'Unlock your potential with our comprehensive Class 9 Science & Maths course. Designed to align with the latest CBSE/ICSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and beyond.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Science & Mathematics Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Class 9 Science & Maths syllabus',
    introText: "This course is designed for students in Class 9 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-class-10-champions': {
    id: 'course-class-10-champions',
    title: 'Class 10th Board Champions (100/100)',
    category: 'Science & Mathematics',
    heroTag: 'Master Class 10 Board with',
    heroHighlight: 'Expert Guidance (100/100 Target)',
    classNumber: 'Class 10 Board',
    batchBadge: 'Class 10th Board Champions Batch',
    subtitle: 'Unlock your potential with our specialized Class 10 Board Champions course. Designed to align with the latest CBSE/ICSE curriculum, this course offers interactive lessons, expert mentorship, and a wealth of resources to help you excel academically and achieve 100/100 in board exams.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Board Exam Centum (100/100) Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Class 10 Board syllabus',
    introText: "This course is designed for students in Class 10 who want to strengthen their fundamentals and excel in academics. Whether you're preparing for school exams or aiming for competitive excellence, this course provides clear explanations, interactive lessons, and expert guidance to help you succeed with confidence."
  },
  'course-pre-board-simulators': {
    id: 'course-pre-board-simulators',
    title: 'Pre-Board Simulator Test Series',
    category: 'Science & Mathematics',
    heroTag: 'Master Board Exams with',
    heroHighlight: 'Simulated Test Series',
    classNumber: 'Board Classes',
    batchBadge: 'Board Simulator Batch',
    subtitle: 'Unlock your potential with our Pre-Board Simulator Test Series. Designed to align with the latest CBSE/ICSE curriculum, this course offers realistic timed mock exams, expert mentorship, and detailed step-marking evaluations.',
    curriculumBadge: 'CBSE & ICSE Board Aligned',
    subjectBadge: 'Timed Mocks & Step-Marking Focus',
    syllabusText: 'Complete coverage of CBSE/ICSE Board syllabus',
    introText: "This test series is designed for students preparing for board exams who want to test their preparation under real exam conditions, identify weak spots, and master step-marking techniques."
  }
};

export function resolveCourseData(courseId) {
  if (courseId && ALL_COURSES_CONFIG[courseId]) {
    return ALL_COURSES_CONFIG[courseId];
  }

  // Fallback pattern matching for aliases (e.g. 'Class 8', '7th', 'class-9')
  const str = String(courseId || '').toLowerCase();
  if (str.includes('7')) return ALL_COURSES_CONFIG['course-class-7'];
  if (str.includes('8') && (str.includes('sci') || str.includes('math'))) return ALL_COURSES_CONFIG['course-class-8-sci-maths'];
  if (str.includes('8')) return ALL_COURSES_CONFIG['course-class-8'];
  if (str.includes('9') && (str.includes('sci') || str.includes('math'))) return ALL_COURSES_CONFIG['course-class-9-sci-maths'];
  if (str.includes('9')) return ALL_COURSES_CONFIG['course-class-9'];
  if (str.includes('10') && (str.includes('champ') || str.includes('100'))) return ALL_COURSES_CONFIG['course-class-10-champions'];
  if (str.includes('10')) return ALL_COURSES_CONFIG['course-class-10'];
  if (str.includes('11')) return ALL_COURSES_CONFIG['course-class-11-commerce'];
  if (str.includes('12')) return ALL_COURSES_CONFIG['course-class-12-commerce'];
  if (str.includes('eco') || str.includes('account')) return ALL_COURSES_CONFIG['course-accounts-eco'];
  if (str.includes('simulat') || str.includes('test')) return ALL_COURSES_CONFIG['course-pre-board-simulators'];

  return ALL_COURSES_CONFIG['course-class-7'];
}

export default function CourseDetailPage({
  courseId = 'course-class-7',
  onBackToHome,
  onOpenCounseling
}) {
  const course = resolveCourseData(courseId);

  const [heroVisible, setHeroVisible] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [whyChooseVisible, setWhyChooseVisible] = useState(false);
  const [readyToStartVisible, setReadyToStartVisible] = useState(false);
  const [whoForVisible, setWhoForVisible] = useState(false);

  const heroRef = useRef(null);
  const whatYouGetRef = useRef(null);
  const whyChooseRef = useRef(null);
  const readyToStartRef = useRef(null);
  const whoForRef = useRef(null);

  // Observer for Hero Section (re-triggers when scrolling back to the top)
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setHeroVisible(entry.isIntersecting);
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  // Observer for "What You'll Get" (re-triggers whenever scrolled into view from either direction)
  useEffect(() => {
    const el = whatYouGetRef.current;
    if (!el) {
      setCardsVisible(true);
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setCardsVisible(entry.isIntersecting);
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setCardsVisible(true);
    }
  }, []);

  // Observer for "Why Choose This Course" (re-triggers whenever scrolled into view from either direction)
  useEffect(() => {
    const el = whyChooseRef.current;
    if (!el) {
      setWhyChooseVisible(true);
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setWhyChooseVisible(entry.isIntersecting);
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setWhyChooseVisible(true);
    }
  }, []);

  // Observer for "Ready to Start?" CTA banner (re-triggers whenever scrolled into view from either direction)
  useEffect(() => {
    const el = readyToStartRef.current;
    if (!el) {
      setReadyToStartVisible(true);
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setReadyToStartVisible(entry.isIntersecting);
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setReadyToStartVisible(true);
    }
  }, []);

  // Observer for "Who Is This For?" (re-triggers whenever scrolled into view from either direction)
  useEffect(() => {
    const el = whoForRef.current;
    if (!el) {
      setWhoForVisible(true);
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setWhoForVisible(entry.isIntersecting);
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      setWhoForVisible(true);
    }
  }, []);

  // Top 3 feature cards
  const topFeatures = [
    {
      icon: Video,
      title: "Engaging Video Lectures",
      description: "High-quality, interactive video lessons to make learning fun and effective."
    },
    {
      icon: Users,
      title: "Live Interactive Classes",
      description: "Join live sessions with expert mentors and peers for real-time learning."
    },
    {
      icon: BookOpen,
      title: "Comprehensive Resources",
      description: "Access detailed notes, practice questions, and reference materials."
    }
  ];

  // Bottom 2 feature cards (centered)
  const bottomFeatures = [
    {
      icon: Headphones,
      title: "Personalized Support",
      description: "Get one-on-one doubt-solving sessions with experienced mentors."
    },
    {
      icon: Library,
      title: "Extensive Library",
      description: "Explore a vast collection of books, notes, and study resources."
    }
  ];

  // 10 Reasons for "Why Choose This Course?"
  const whyChooseReasons = [
    {
      icon: FileText,
      text: "Expert-curated study materials and notes"
    },
    {
      icon: Tv,
      text: "Interactive lectures with engaging experiments and activities"
    },
    {
      icon: CheckSquare,
      text: "Regular assignments and practice tests"
    },
    {
      icon: MessageSquare,
      text: "Regular doubt-solving sessions with subject experts"
    },
    {
      icon: Clock,
      text: "Structured learning with organized modules"
    },
    {
      icon: ClipboardCheck,
      text: "Comprehensive revision schedule and mock tests"
    },
    {
      icon: Sparkles,
      text: "Success strategies from top educators"
    },
    {
      icon: Users,
      text: "Collaborative learning with peer discussions"
    },
    {
      icon: UserCheck,
      text: "Extraordinary personal attention on students"
    },
    {
      icon: GraduationCap,
      text: "Regular parent teacher interaction for betterment of student"
    }
  ];

  // 8 Target Points for "Who Is This For?"
  const whoIsThisForPoints = [
    {
      icon: BookOpen,
      text: course.syllabusText
    },
    {
      icon: Lightbulb,
      text: "Sharpen problem-solving skills for competitive exams"
    },
    {
      icon: Brain,
      text: "Develop analytical and critical thinking abilities"
    },
    {
      icon: ShieldCheck,
      text: "Boost confidence in tackling challenging subjects"
    },
    {
      icon: Globe,
      text: "Improve general knowledge and awareness"
    },
    {
      icon: BarChart3,
      text: "Understand concepts through visual aids and experiments"
    },
    {
      icon: Trophy,
      text: "Get ready for IMO, ISA, NSTSE, SOF, Olympiads, and other competitive exams"
    },
    {
      icon: Mic,
      text: "Enhance communication and presentation skills"
    }
  ];

  return (
    <div className="w-full min-h-[75vh] select-none">
      
      {/* Top Breadcrumb & Back Bar */}
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            <button
              onClick={onBackToHome}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300">{course.category}</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{course.title}</span>
          </nav>

          {/* Back to Home Button */}
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs shadow-sm hover:shadow-md transition-all hover:-translate-x-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Main Hero Container (With Smooth Bidirectional Zoom-In Entrance Animation) */}
      <section 
        ref={heroRef}
        className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center relative transition-all duration-700 ${
          heroVisible ? 'animate-zoom-in' : 'opacity-0 scale-95'
        }`}
      >
        
        {/* Subtle Ambient Sapphire Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Top Emoji & Title Line (Zoom-In Entrance) */}
          <div className="animate-zoom-in-content flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-3xl sm:text-4xl md:text-5xl select-none animate-bounce-slow" role="img" aria-label="Books">
              📚
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-slate-900 dark:text-white tracking-tight leading-tight">
              {course.heroTag}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-400">
                {course.heroHighlight}
              </span>
            </h1>
          </div>

          {/* Double Underline Accent in Royal Blue Theme */}
          <div className="animate-zoom-in-content flex flex-col items-center justify-center mt-3.5 mb-6 space-y-1">
            <div className="w-28 sm:w-36 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          </div>

          {/* Subtitle Paragraph */}
          <p className="animate-zoom-in-content max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed sm:leading-8">
            {course.subtitle}
          </p>

          {/* CTA Action Button: 🌟 Enroll Now (Zoom-In Entrance) */}
          <div className="animate-zoom-in-btn mt-8 sm:mt-10">
            <button
              type="button"
              onClick={onOpenCounseling}
              className="relative overflow-hidden px-10 sm:px-14 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base cursor-pointer shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 group inline-flex items-center gap-2.5"
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none" />

              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
              <span className="tracking-wide">Enroll Now</span>
            </button>
          </div>

          {/* Quick Curriculum Highlights Badges */}
          <div className="animate-zoom-in-cards mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{course.curriculumBadge}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{course.subjectBadge}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Mentorship by Goyal Sir</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= "WHAT YOU'LL GET" SECTION (Matching Reference in Royal Blue Theme with Zoom-In Effect) ================= */}
      <section 
        ref={whatYouGetRef}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
      >
        
        {/* Section Header: 🎯 What You'll Get (Zoom-In Entrance) */}
        <div className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${
          cardsVisible ? 'animate-zoom-in' : 'opacity-0 scale-90'
        }`}>
          <div className="inline-flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl select-none animate-bounce-slow" role="img" aria-label="Target">
              🎯
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
              What You'll{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-400">
                Get
              </span>
            </h2>
          </div>

          {/* Double Underline Accent in Royal Blue Theme */}
          <div className="flex flex-col items-center justify-center mt-3 space-y-1">
            <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          </div>
        </div>

        {/* 5 Feature Cards: 3 on Top, 2 Centered on Bottom (Staggered Zoom-In on Each Card) */}
        <div className="w-full">
          
          {/* Top Row: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">
            {topFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    animationDelay: `${idx * 160}ms`
                  }}
                  className={`bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-7 sm:p-8 text-center shadow-xl hover:shadow-2xl hover:border-blue-500/50 hover:shadow-blue-500/20 hover:-translate-y-2.5 hover:scale-105 active:scale-95 transition-all duration-300 group flex flex-col items-center justify-start relative overflow-hidden ${
                    cardsVisible ? 'animate-zoom-in' : 'opacity-0 scale-90'
                  }`}
                >
                  {/* Top Ambient Glow Line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon Container with Zoom-In Effect on Hover */}
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:scale-115 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 shadow-sm shrink-0">
                    <IconComp className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  {/* Card Title */}
                  <h3 className="text-base sm:text-lg font-black font-outfit text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Card Description */}
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Row: 2 Cards Centered */}
          <div className="flex flex-col md:flex-row justify-center gap-6 sm:gap-8 max-w-5xl mx-auto w-full mt-6 sm:mt-8">
            {bottomFeatures.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    animationDelay: `${(idx + 3) * 160}ms`
                  }}
                  className={`w-full md:w-[calc(33.333%-1rem)] bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-3xl p-7 sm:p-8 text-center shadow-xl hover:shadow-2xl hover:border-blue-500/50 hover:shadow-blue-500/20 hover:-translate-y-2.5 hover:scale-105 active:scale-95 transition-all duration-300 group flex flex-col items-center justify-start relative overflow-hidden ${
                    cardsVisible ? 'animate-zoom-in' : 'opacity-0 scale-90'
                  }`}
                >
                  {/* Top Ambient Glow Line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon Container with Zoom-In Effect on Hover */}
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white group-hover:scale-115 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 shadow-sm shrink-0">
                    <IconComp className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  {/* Card Title */}
                  <h3 className="text-base sm:text-lg font-black font-outfit text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>

                  {/* Card Description */}
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </section>

      {/* ================= "WHY CHOOSE THIS COURSE?" SECTION (Row 1 of Photos) ================= */}
      <section 
        ref={whyChooseRef}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-200/80 dark:border-slate-800"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Big Picture matching right dimensions with Slide-and-Rotate Entrance Animation */}
          <div className={`transition-all duration-700 h-full ${
            whyChooseVisible ? 'animate-slide-rotate-left' : 'opacity-0 -translate-x-24'
          }`}>
            <div className="w-full h-full min-h-[540px] lg:min-h-[660px] bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/50 hover:shadow-blue-500/15 transition-all duration-500 group flex items-center justify-center relative overflow-hidden">
              
              {/* Top Accent Stripe in Royal Blue Theme */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

              {/* Big Illustration Area with Continuous Floating Rotation Sway */}
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-blue-50/50 via-transparent to-blue-50/30 dark:from-blue-950/20 dark:to-transparent rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out animate-image-rotate-1 group-hover:scale-105">
                  <img
                    src="/images/why-choose-students.png"
                    alt="Curious students exploring Course at Goyal Coaching Center"
                    className="w-full h-full max-h-[480px] sm:max-h-[540px] object-contain drop-shadow-2xl transition-all duration-500"
                    loading="lazy"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Title + 10 Bullet Points with Slide-From-Right and One-By-One Point Cascades */}
          <div className={`transition-all duration-700 flex flex-col justify-between ${
            whyChooseVisible ? 'animate-slide-from-right' : 'opacity-0 translate-x-24'
          }`}>
            
            <div>
              {/* Header: 💎 Why Choose This Course? */}
              <div className="mb-6 sm:mb-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl select-none animate-bounce-slow" role="img" aria-label="Gem">
                    💎
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
                    Why Choose{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-400">
                      This Course?
                    </span>
                  </h2>
                </div>

                {/* Double Underline Accent in Royal Blue */}
                <div className="flex flex-col items-center lg:items-start mt-3 space-y-1">
                  <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                  <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                </div>
              </div>

              {/* 10 Benefit Points Coming In One by One */}
              <div className="space-y-2.5 sm:space-y-3">
                {whyChooseReasons.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        animationDelay: `${600 + idx * 110}ms`
                      }}
                      className={`flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 shadow-xs hover:shadow-md hover:translate-x-2 transition-all duration-300 group cursor-default ${
                        whyChooseVisible ? 'animate-point-cascade' : 'opacity-0 translate-x-10'
                      }`}
                    >
                      {/* Icon in Royal Blue theme */}
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-xs">
                        <IconComp className="w-4 h-4 stroke-[2.2]" />
                      </div>

                      {/* Text */}
                      <span className="text-xs sm:text-sm md:text-[15px] font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= "READY TO START?" CTA BANNER (Placed Exactly Between The Two Rows of Photos) ================= */}
      <section 
        ref={readyToStartRef}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
      >
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-2 border-blue-500/30 p-8 sm:p-14 text-center shadow-2xl shadow-blue-950/40 select-none transition-all duration-700 ${
          readyToStartVisible ? 'animate-zoom-in' : 'opacity-0 scale-90'
        }`}>
          
          {/* Subtle Ambient Sapphire Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Header: 🎯 Ready to Start? */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl select-none animate-bounce-slow" role="img" aria-label="Target">
                🎯
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit tracking-tight leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400">
                  Ready to
                </span>{' '}
                <span className="text-white">Start?</span>
              </h2>
            </div>

            {/* Double Accent Underline */}
            <div className="flex flex-col items-center justify-center mt-3 mb-4 space-y-1">
              <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.7)]" />
            </div>

            {/* Subtitle */}
            <p className="mt-2 text-sm sm:text-base md:text-lg text-blue-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
              Join thousands of students who have transformed their learning experience. Enroll now or get free guidance from our experts!
            </p>

            {/* Primary Action Button: 📞 Get Free Counseling (Fly & Floating Animation) */}
            <div className="mt-8 flex items-center justify-center">
              <button
                type="button"
                onClick={onOpenCounseling}
                className="relative overflow-hidden px-10 sm:px-14 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base cursor-pointer shadow-xl shadow-amber-500/30 active:scale-95 group animate-btn-levitate flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-3 hover:scale-105"
              >
                {/* Shimmer light sweep */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none" />

                <Phone className="w-5 h-5 text-amber-950 fill-amber-950 animate-phone-ring shrink-0" />
                <span className="tracking-wide">Get Free Counseling</span>
              </button>
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

      {/* ================= "WHO IS THIS FOR?" SECTION (Row 2 of Photos) ================= */}
      <section 
        ref={whoForRef}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-slate-200/80 dark:border-slate-800"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Title + Intro + 8 Bullet Points with Slide-From-Left and Cascade (Order 2 on mobile, Order 1 on Desktop) */}
          <div className={`transition-all duration-700 flex flex-col justify-between order-2 lg:order-1 ${
            whoForVisible ? 'animate-slide-from-left' : 'opacity-0 -translate-x-24'
          }`}>
            
            <div>
              {/* Header: 👤 Who Is This For? */}
              <div className="mb-4 sm:mb-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl select-none animate-bounce-slow" role="img" aria-label="Person">
                    👤
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
                    Who Is This{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-400">
                      For?
                    </span>
                  </h2>
                </div>

                {/* Double Underline Accent in Royal Blue */}
                <div className="flex flex-col items-center lg:items-start mt-2.5 space-y-1">
                  <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                  <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                </div>
              </div>

              {/* Intro Paragraph */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-5 text-center lg:text-left">
                {course.introText}
              </p>

              {/* 8 Target Points Coming In One by One */}
              <div className="space-y-2 sm:space-y-2.5">
                {whoIsThisForPoints.map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        animationDelay: `${600 + idx * 110}ms`
                      }}
                      className={`flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 shadow-xs hover:shadow-md hover:translate-x-2 transition-all duration-300 group cursor-default ${
                        whoForVisible ? 'animate-point-cascade' : 'opacity-0 translate-x-10'
                      }`}
                    >
                      {/* Icon in Royal Blue theme */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-xs">
                        <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                      </div>

                      {/* Text */}
                      <span className="text-xs sm:text-[13px] md:text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Big Mind-Map Picture matching dimensions with Slide-and-Rotate Entrance Animation (Order 1 on mobile, Order 2 on Desktop) */}
          <div className={`transition-all duration-700 h-full order-1 lg:order-2 ${
            whoForVisible ? 'animate-slide-rotate-right' : 'opacity-0 translate-x-24'
          }`}>
            <div className="w-full h-full min-h-[540px] lg:min-h-[660px] bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:border-blue-500/50 hover:shadow-blue-500/15 transition-all duration-500 group flex items-center justify-center relative overflow-hidden">
              
              {/* Top Accent Stripe in Royal Blue Theme */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

              {/* Big Mind-Map Picture with Continuous Floating Rotation Sway */}
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-blue-50/50 via-transparent to-blue-50/30 dark:from-blue-950/20 dark:to-transparent rounded-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out animate-image-rotate-2 group-hover:scale-105">
                  <img
                    src="/images/who-is-this-for-mindmap.png"
                    alt="Learning, Skills, Experience, and Growth Roadmap"
                    className="w-full h-full max-h-[480px] sm:max-h-[540px] object-contain drop-shadow-2xl transition-all duration-500"
                    loading="lazy"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
