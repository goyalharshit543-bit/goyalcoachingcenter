import { useState, useEffect, useRef } from 'react';
import { GraduationCap, Users, User, Settings } from 'lucide-react';
import { api } from '../../api/client';

export default function StatsCounterBar({ 
  stats = null,
  currentRole = null,
  onOpenAdminManager = null
}) {
  const [liveStats, setLiveStats] = useState(stats || { courses: 15, students: 7286, teachers: 25 });

  // Keep liveStats updated if parent stats prop changes
  useEffect(() => {
    if (stats) {
      setLiveStats(stats);
    }
  }, [stats]);

  // Fetch directly on mount and listen to real-time update events
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const fresh = await api.getImpactStats();
        if (fresh && isMounted) {
          setLiveStats(fresh);
        }
      } catch (err) {
        console.error('Error fetching impact stats in counter bar', err);
      }
    };

    fetchLatest();

    const handleEvent = (e) => {
      if (e.detail) {
        setLiveStats(e.detail);
      } else {
        fetchLatest();
      }
    };

    window.addEventListener('gcc_impact_stats_updated', handleEvent);
    return () => {
      isMounted = false;
      window.removeEventListener('gcc_impact_stats_updated', handleEvent);
    };
  }, []);

  const targetCourses = liveStats?.courses !== undefined && !isNaN(Number(liveStats?.courses)) ? Number(liveStats?.courses) : 15;
  const targetStudents = liveStats?.students !== undefined && !isNaN(Number(liveStats?.students)) ? Number(liveStats?.students) : 7286;
  const targetTeachers = liveStats?.teachers !== undefined && !isNaN(Number(liveStats?.teachers)) ? Number(liveStats?.teachers) : 25;

  const [coursesCount, setCoursesCount] = useState(targetCourses);
  const [studentsCount, setStudentsCount] = useState(targetStudents);
  const [teachersCount, setTeachersCount] = useState(targetTeachers);

  // Smooth animation whenever targets change
  useEffect(() => {
    const duration = 1200; // ms
    const startTime = performance.now();
    const startC = coursesCount;
    const startS = studentsCount;
    const startT = teachersCount;

    let animId;
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCoursesCount(Math.round(startC + (targetCourses - startC) * easeOut));
      setStudentsCount(Math.round(startS + (targetStudents - startS) * easeOut));
      setTeachersCount(Math.round(startT + (targetTeachers - startT) * easeOut));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setCoursesCount(targetCourses);
        setStudentsCount(targetStudents);
        setTeachersCount(targetTeachers);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [targetCourses, targetStudents, targetTeachers]);

  return (
    <section 
      aria-label="Institution Impact Statistics"
      className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 my-10 sm:my-14"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/70 dark:from-slate-900/95 dark:via-blue-950/30 dark:to-slate-900/95 border-2 border-blue-500/30 dark:border-blue-700/50 shadow-xl shadow-blue-500/5 transition-all duration-300 py-8 sm:py-10 px-4 sm:px-8">
        
        {/* Soft Blue Dotted Matrix Pattern matching website theme */}
        <div 
          className="absolute inset-0 opacity-15 dark:opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#2563eb 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* 3 Metric Columns in Website's Royal Blue Theme */}
        <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-6 items-center text-center divide-x divide-blue-200/70 dark:divide-blue-900/50">
          
          {/* Column 1: Courses */}
          <div className="flex flex-col items-center justify-center px-1 sm:px-4 group cursor-default">
            {/* Royal Blue Graduation Cap Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>

            {/* Royal Blue Gradient Number */}
            <div className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-300 tracking-tight leading-none">
              {coursesCount}
            </div>

            {/* Label in Website Blue Palette */}
            <div className="mt-2 text-xs sm:text-sm md:text-base font-extrabold text-blue-950 dark:text-blue-200 tracking-wider uppercase">
              Courses
            </div>
          </div>

          {/* Column 2: Students */}
          <div className="flex flex-col items-center justify-center px-1 sm:px-4 group cursor-default">
            {/* Royal Blue Users Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>

            {/* Royal Blue Gradient Number */}
            <div className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-300 tracking-tight leading-none">
              {studentsCount.toLocaleString()}
            </div>

            {/* Label in Website Blue Palette */}
            <div className="mt-2 text-xs sm:text-sm md:text-base font-extrabold text-blue-950 dark:text-blue-200 tracking-wider uppercase">
              Students
            </div>
          </div>

          {/* Column 3: Teachers */}
          <div className="flex flex-col items-center justify-center px-1 sm:px-4 group cursor-default">
            {/* Royal Blue Teacher / User Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <User className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>

            {/* Royal Blue Gradient Number */}
            <div className="text-2xl sm:text-4xl md:text-5xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-300 tracking-tight leading-none">
              {teachersCount}
            </div>

            {/* Label in Website Blue Palette */}
            <div className="mt-2 text-xs sm:text-sm md:text-base font-extrabold text-blue-950 dark:text-blue-200 tracking-wider uppercase">
              Teachers
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
