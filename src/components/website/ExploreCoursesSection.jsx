import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Briefcase, 
  Calculator, 
  Award, 
  GraduationCap, 
  Laptop, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Settings 
} from 'lucide-react';
import { api } from '../../api/client';

export function resolveCourseIcon(iconKey) {
  switch ((iconKey || '').toLowerCase()) {
    case 'book': return BookOpen;
    case 'briefcase': return Briefcase;
    case 'calculator': return Calculator;
    case 'award': return Award;
    case 'grad': return GraduationCap;
    case 'laptop': return Laptop;
    case 'sparkles': return Sparkles;
    case 'users': return Users;
    default: return BookOpen;
  }
}

export default function ExploreCoursesSection({
  courses = [],
  currentRole = null,
  onOpenAdminManager = null,
  onSelectClass = null
}) {
  const defaultCourses = [
    {
      id: "course-foundation",
      title: "Foundation (Class 7-10)",
      description: "Build a strong academic base with our structured curriculum for students in classes 7 to 10.",
      iconKey: "book",
      points: [
        "Mathematics",
        "Science"
      ],
      classes: [
        "Class 7",
        "Class 8",
        "Class 9",
        "Class 10"
      ]
    },
    {
      id: "course-commerce",
      title: "Commerce (Class 11-12)",
      description: "Comprehensive board exam preparation covering all core Commerce subjects for Class 11 and 12.",
      iconKey: "briefcase",
      points: [
        "Accountancy",
        "Economics",
        "Business Studies",
        "Mathematics / Applied Maths"
      ],
      classes: [
        "Class 11",
        "Class 12"
      ]
    },
    {
      id: "course-accounts-eco",
      title: "Accounts & Economics Special",
      description: "Focused conceptual clarity, numerical practice, and board exam mastery in core subjects:",
      iconKey: "calculator",
      points: [
        "Financial & Corporate Accounts",
        "Micro & Macro Economics",
        "Indian Economic Development"
      ],
      classes: [
        "Class 11",
        "Class 12"
      ]
    }
  ];

  const [liveCourses, setLiveCourses] = useState(Array.isArray(courses) ? courses : defaultCourses);

  // Sync with prop changes
  useEffect(() => {
    if (Array.isArray(courses)) {
      setLiveCourses(courses);
    }
  }, [courses]);

  // Real-time event listener and initial mount fetch
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getExploreCourses();
        if (Array.isArray(fresh) && isMounted) {
          setLiveCourses(fresh);
        }
      } catch (err) {
        console.error('Error fetching explore courses in section', err);
      }
    };

    fetchLatest();

    const handleEvent = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setLiveCourses(e.detail);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener('gcc_explore_courses_updated', handleEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('gcc_explore_courses_updated', handleEvent);
    };
  }, []);

  // IntersectionObserver for Staggered Fly-In Animation of the 3 course boxes
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

  const activeList = liveCourses && liveCourses.length > 0 ? liveCourses : defaultCourses;

  return (
    <section 
      id="courses" 
      ref={sectionRef}
      className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
    >
      
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-14">
        
        {/* Main Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
          Explore Our Courses
        </h2>

        {/* Double Underline Accent in Website's Royal Blue Theme */}
        <div className="flex flex-col items-center justify-center mt-3 space-y-1">
          <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        </div>

        {/* Subtitle with Royal Blue Highlights */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
          We offer <span className="font-bold text-blue-600 dark:text-blue-400">specialized courses</span> tailored to different academic streams. Whether you're building a strong foundation in <span className="font-bold text-blue-700 dark:text-blue-300">Class 7 to 10</span> or aiming for excellence in <span className="font-bold text-blue-600 dark:text-blue-400">Class 11–12 Commerce</span>, we have the right course for you.
        </p>

      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {activeList.map((course, idx) => {
          const IconComponent = resolveCourseIcon(course.iconKey);
          const pointsList = Array.isArray(course.points) ? course.points : [];
          const classesList = Array.isArray(course.classes) ? course.classes : [];

          return (
            <div
              key={course.id || idx}
              style={{
                animationDelay: `${idx * 160}ms`
              }}
              className={`rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-blue-500/50 flex flex-col justify-between p-6 sm:p-8 relative group transition-all duration-500 will-change-transform ${
                hasFlownIn ? 'animate-course-fly' : 'opacity-0 translate-y-16'
              } hover:-translate-y-4 hover:scale-[1.025] hover:shadow-2xl hover:shadow-blue-500/25 cursor-pointer`}
            >
              {/* Top Accent Stripe on Card */}
              <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Circular Icon Badge */}
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/80 border-2 border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <IconComponent className="w-7 h-7 stroke-[2.2]" />
                </div>

                {/* Course Title */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center tracking-tight leading-tight">
                  {course.title}
                </h3>

                {/* Course Description */}
                {course.description && (
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed">
                    {course.description}
                  </p>
                )}

                {/* Subject Points / Highlights */}
                {pointsList.length > 0 && (
                  <div className="mt-6 space-y-2.5">
                    {pointsList.map((pt, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center gap-2.5 py-2.5 px-4 rounded-full bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-2xs hover:bg-blue-100/70 dark:hover:bg-blue-900/60 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Target Class Badges in Website's Royal Blue Theme */}
              {classesList.length > 0 && (
                <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 flex-wrap">
                  {classesList.map((cls, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => onSelectClass && onSelectClass(cls)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white shadow-md shadow-blue-500/20 tracking-wide transition-all hover:scale-105 cursor-pointer"
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </section>
  );
}
