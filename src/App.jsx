import { useState, useEffect } from 'react';
import Navbar from './components/navbar/Navbar';
import LoginModal from './components/auth/LoginModal';
import AdmissionModal from './components/website/AdmissionModal';
import ParentPortal from './components/portal/ParentPortal';
import AdminPortal from './components/portal/AdminPortal';
import MainAdminPortal from './components/portal/MainAdminPortal';
import ResultsGroupPhoto from './components/website/ResultsGroupPhoto';
import ShiningStarsSection from './components/website/ShiningStarsSection';
import StatsCounterBar from './components/website/StatsCounterBar';
import OurFeaturesSection from './components/website/OurFeaturesSection';
import ExploreCoursesSection from './components/website/ExploreCoursesSection';
import TakeFirstStepSection from './components/website/TakeFirstStepSection';
import OurDirectorsSection from './components/website/OurDirectorsSection';
import LatestNewsEventsSection from './components/website/LatestNewsEventsSection';
import CourseDetailPage from './components/courses/CourseDetailPage';
import GTSEScholarshipPage from './components/gtse/GTSEScholarshipPage';
import GTSERegistrationPage from './components/gtse/GTSERegistrationPage';
import AdmissionPage from './components/admission/AdmissionPage';
import CentersPage from './components/centers/CentersPage';
import AboutUsPage from './components/about/AboutUsPage';
import ContactPage from './components/contact/ContactPage';
import Footer from './components/footer/Footer';
import { api } from './api/client';
import { ArrowRight } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'parent' | 'teacher' | 'admin'
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState('student');
  const [siteData, setSiteData] = useState(null);

  // IAM Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null); // 'student' | 'teacher' | 'admin'
  const [studentSession, setStudentSession] = useState(null);

  // Theme State: Default to Light Mode (Clean White Navbar with Dark text)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const refreshSiteData = async () => {
    try {
      const data = await api.getAllData();
      if (data) setSiteData(data);
    } catch (e) {
      console.error('Error refreshing site data', e);
    }
  };

  // Re-fetch fresh data whenever view switches (e.g. returning to 'home' from admin)
  useEffect(() => {
    refreshSiteData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Real-time synchronization across the whole website
  useEffect(() => {
    const handleGlobalUpdate = (e) => {
      if (e.detail?.type === 'gcc_impact_stats_updated') {
        setSiteData(prev => prev ? { ...prev, impactStats: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_explore_courses_updated') {
        setSiteData(prev => prev ? { ...prev, exploreCourses: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_features_updated') {
        setSiteData(prev => prev ? { ...prev, features: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_shining_stars_updated') {
        setSiteData(prev => prev ? { ...prev, shiningStars: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_results_photo_updated') {
        setSiteData(prev => prev ? { ...prev, resultsPhoto: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_directors_updated') {
        setSiteData(prev => prev ? { ...prev, directors: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_news_events_updated') {
        setSiteData(prev => prev ? { ...prev, newsEvents: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_centers_updated') {
        setSiteData(prev => prev ? { ...prev, centers: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_students_updated') {
        setSiteData(prev => prev ? { ...prev, students: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_teachers_updated') {
        setSiteData(prev => prev ? { ...prev, teachers: e.detail.data } : prev);
      } else if (e.detail?.type === 'gcc_notices_updated') {
        setSiteData(prev => prev ? { ...prev, notices: e.detail.data } : prev);
      } else {
        refreshSiteData();
      }
    };

    window.addEventListener('gcc_site_data_changed', handleGlobalUpdate);
    window.addEventListener('gcc_impact_stats_updated', refreshSiteData);
    window.addEventListener('gcc_explore_courses_updated', refreshSiteData);
    window.addEventListener('gcc_features_updated', refreshSiteData);
    window.addEventListener('gcc_shining_stars_updated', refreshSiteData);
    window.addEventListener('gcc_results_photo_updated', refreshSiteData);
    window.addEventListener('gcc_directors_updated', refreshSiteData);
    window.addEventListener('gcc_news_events_updated', refreshSiteData);
    window.addEventListener('gcc_centers_updated', refreshSiteData);

    return () => {
      window.removeEventListener('gcc_site_data_changed', handleGlobalUpdate);
      window.removeEventListener('gcc_impact_stats_updated', refreshSiteData);
      window.removeEventListener('gcc_explore_courses_updated', refreshSiteData);
      window.removeEventListener('gcc_features_updated', refreshSiteData);
      window.removeEventListener('gcc_shining_stars_updated', refreshSiteData);
      window.removeEventListener('gcc_results_photo_updated', refreshSiteData);
      window.removeEventListener('gcc_directors_updated', refreshSiteData);
      window.removeEventListener('gcc_news_events_updated', refreshSiteData);
      window.removeEventListener('gcc_centers_updated', refreshSiteData);
    };
  }, []);

  const handleOpenLoginModal = (role = 'student') => {
    setLoginInitialRole(role);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (role, authResponse) => {
    setCurrentRole(role);

    if (role === 'student' || role === 'parent') {
      setCurrentUser(authResponse.student);
      setStudentSession(authResponse);
      setCurrentView('parent');
    } else if (role === 'teacher') {
      setCurrentUser(authResponse.teacher);
      setCurrentView('teacher');
    } else if (role === 'admin') {
      setCurrentUser(authResponse.user);
      setCurrentView('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    setStudentSession(null);
    setCurrentView('home');
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white' 
        : 'bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Top Navigation Bar in BLUE theme (White in light mode, dark in dark mode, blue highlights on click) */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLoginModal={handleOpenLoginModal}
        onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="pt-28 sm:pt-32 pb-16">
        {/* ================= HOME TAB (CLEAN, FOCUSED IN BLUE THEME WITH 3 DEDICATED LOGINS) ================= */}
        {currentView === 'home' && (
          <div className="w-full">
            
            {/* Big Results Banner Showcase (Full Screen Breadth) */}
            <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 pt-1 sm:pt-2">
              <ResultsGroupPhoto
                resultsPhoto={siteData?.resultsPhoto}
                isDarkMode={isDarkMode}
                currentRole={currentRole}
              />

              {/* Admission Strip - Directly after Photo Portal, Styled in Website's Royal Blue Theme */}
              <div className="w-full mt-3 sm:mt-4 mb-10 sm:mb-14 rounded-2xl overflow-hidden shadow-xl border-2 border-blue-500/30 dark:border-blue-700/50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950 text-white select-none">
                <div className="px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  
                  {/* Left: Admission Open */}
                  <div className="font-extrabold text-white text-xs sm:text-sm md:text-base tracking-wide flex items-center gap-2.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span>Admission Open</span>
                  </div>

                  {/* Center: Register Now Button */}
                  <div className="shrink-0 order-last sm:order-none w-full sm:w-auto text-center sm:text-left mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        setCurrentView('admission');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-5 sm:px-7 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <span>Register Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right: Admissions Closed */}
                  <div className="font-extrabold text-white/90 text-xs sm:text-sm md:text-base tracking-wide shrink-0">
                    <span>Admissions Closed</span>
                  </div>

                </div>
              </div>
            </div>

            {/* "Our Shining Stars" Heading from User Request */}
            <div className="text-center my-8 sm:my-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-outfit text-slate-900 dark:text-white tracking-tight">
                Our Shining Stars
              </h2>
              {/* Double Underline Accent in Website's Royal Blue Theme */}
              <div className="flex flex-col items-center justify-center mt-3 space-y-1">
                <div className="w-24 sm:w-28 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                <div className="w-14 sm:w-16 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
              </div>
            </div>

            {/* Shining Stars Animated Sliding Carousel (One by One) */}
            <ShiningStarsSection
              stars={siteData?.shiningStars || []}
              currentRole={currentRole}
            />

            {/* Institution Stats Counter Strip (15 Courses | 7286 Students | 25 Teachers) */}
            <StatsCounterBar
              stats={siteData?.impactStats || { courses: 15, students: 7286, teachers: 25 }}
              currentRole={currentRole}
            />

            {/* Our Features Section */}
            <OurFeaturesSection
              features={siteData?.features || []}
              currentRole={currentRole}
            />

            {/* Explore Our Courses Section */}
            <ExploreCoursesSection
              courses={siteData?.exploreCourses || []}
              currentRole={currentRole}
              onSelectClass={(cls) => {
                const lower = (cls || '').toLowerCase();
                let targetCourseId = 'course-class-7';
                if (lower.includes('7')) targetCourseId = 'course-class-7';
                else if (lower.includes('8')) targetCourseId = 'course-class-8';
                else if (lower.includes('9')) targetCourseId = 'course-class-9';
                else if (lower.includes('10')) targetCourseId = 'course-class-10';
                else if (lower.includes('11')) targetCourseId = 'course-class-11-commerce';
                else if (lower.includes('12')) targetCourseId = 'course-class-12-commerce';
                else if (lower.includes('eco') || lower.includes('account')) targetCourseId = 'course-accounts-eco';

                setCurrentView(targetCourseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Take the First Step CTA Section */}
            <TakeFirstStepSection
              onOpenCounseling={() => setIsAdmissionModalOpen(true)}
            />

            {/* Our Awesome Directors Section */}
            <OurDirectorsSection
              directors={siteData?.directors || []}
              currentRole={currentRole}
            />

            {/* Latest News & Events Section */}
            <LatestNewsEventsSection
              items={siteData?.newsEvents || []}
              currentRole={currentRole}
            />

            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

          </div>
        )}

        {/* ================= DYNAMIC COURSE PAGES FOR ALL CLASSES ================= */}
        {currentView.startsWith('course-') && (
          <div className="w-full">
            <CourseDetailPage
              key={currentView}
              courseId={currentView}
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCounseling={() => setIsAdmissionModalOpen(true)}
            />
            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAbout={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectContact={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ================= GTSE SCHOLARSHIP EXAM PAGE ================= */}
        {currentView === 'gtse' && (
          <div className="w-full">
            <GTSEScholarshipPage
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCounseling={() => {
                setCurrentView('gtse-registration');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAbout={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectContact={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ================= GTSE OFFICIAL REGISTRATION FORM PAGE (EXCEL BACKED) ================= */}
        {currentView === 'gtse-registration' && (
          <div className="w-full">
            <GTSERegistrationPage
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAbout={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectContact={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ================= DEDICATED ADMISSION PAGE ================= */}
        {currentView === 'admission' && (
          <div className="w-full" key="view-admission">
            <AdmissionPage
              key="page-admission"
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCounseling={() => setIsAdmissionModalOpen(true)}
              onNavigateGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAdmissionModal={() => setIsAdmissionModalOpen(true)}
              isDarkMode={isDarkMode}
            />
            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAbout={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectContact={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ================= OFFICIAL LEARNING CENTERS & BRANCHES PAGE ================= */}
        {currentView === 'centers' && (
          <div className="w-full" key="view-centers">
            <CentersPage
              key="page-centers"
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCounseling={() => setIsAdmissionModalOpen(true)}
              currentRole={currentRole}
            />
            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAbout={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectContact={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ================= ABOUT US PAGE ================= */}
        {currentView === 'about' && (
          <div className="w-full" key="view-about">
            <AboutUsPage
              key="page-about"
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isDarkMode={isDarkMode}
            />
            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAbout={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectContact={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ================= DEDICATED CONTACT US PAGE ================= */}
        {currentView === 'contact' && (
          <div className="w-full" key="view-contact">
            <ContactPage
              key="page-contact"
              onBackToHome={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              isDarkMode={isDarkMode}
            />
            {/* Website Footer */}
            <Footer 
              onOpenCounseling={() => setIsAdmissionModalOpen(true)} 
              onSelectCourse={(courseId) => {
                setCurrentView(courseId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectGTSE={() => {
                setCurrentView('gtse');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAdmission={() => {
                setCurrentView('admission');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectCenters={() => {
                setCurrentView('centers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectAbout={() => {
                setCurrentView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectContact={() => {
                setCurrentView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* ================= STUDENT & PARENT PORTAL (STRICTLY ISOLATED DATA) ================= */}
        {currentView === 'parent' && (
          <div className="transition-opacity duration-300">
            <ParentPortal
              onBackToHome={() => setCurrentView('home')}
              initialSession={studentSession}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* ================= TEACHER / FACULTY CONSOLE ================= */}
        {currentView === 'teacher' && (
          <div className="transition-opacity duration-300">
            <AdminPortal
              onBackToHome={() => setCurrentView('home')}
              teacherUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
        )}

        {/* ================= MAIN SUPER-ADMIN PORTAL (TEACHER PASSWORD RESETS) ================= */}
        {currentView === 'admin' && (
          <div className="transition-opacity duration-300">
            <MainAdminPortal
              adminUser={currentUser || { username: 'admin', name: 'Goyal Sir (Main Administrator)', role: 'admin', designation: 'Founder & Director' }}
              onLogout={handleLogout}
              onBackToHome={() => setCurrentView('home')}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      {/* IAM Role-based Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialRole={loginInitialRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Student Admission / Registration Modal */}
      <AdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
      />
    </div>
  );
}
