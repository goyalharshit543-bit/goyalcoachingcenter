import { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Phone,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

export default function Footer({ 
  onOpenCounseling = null,
  onSelectCourse = null,
  onSelectGTSE = null,
  onSelectAdmission = null,
  onSelectCenters = null,
  onSelectAbout = null,
  onSelectContact = null
}) {
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'refund' | 'vision' | 'aims'

  // Policy Contents
  const policies = {
    privacy: {
      title: 'Privacy Policy',
      content: `At Goyal Coaching Center, we are committed to protecting the privacy and personal information of our students and parents.\n\n1. Information Collection: We only collect essential information (student name, roll number, academic records, and parent contact details) strictly required for academic tracking, attendance records, and direct educational communication.\n2. Data Security: All portal records, test marks, and fee payment details are protected with IAM role isolation and enterprise-grade encryption.\n3. Third-Party Sharing: We never sell, rent, or trade student or parent information with any external marketing agencies.\n4. Contact: For any privacy inquiries, reach us at admin@goyalcoaching.edu.in.`
    },
    terms: {
      title: 'Terms and Conditions',
      content: `Welcome to Goyal Coaching Center. By enrolling your ward or using our portals, you agree to the following terms:\n\n1. Code of Conduct: Students are expected to maintain strict academic discipline, regular attendance, and punctuality during all classroom sessions and weekly tests.\n2. Weekly Test Compulsion: Attendance in weekly Pre-Board simulators and unit tests is compulsory for all registered students of Class 8–10 and 11–12.\n3. Digital Portal Access: Student roll numbers and parent portal credentials are non-transferable and intended exclusively for the registered student and guardians.\n4. Institute Jurisdiction: All academic guidelines and scheduling decisions are administered under the direction of Goyal Sir and senior faculty.`
    },
    refund: {
      title: 'Refund and Cancellation Policy',
      content: `Goyal Coaching Center maintains a clear and transparent fee policy:\n\n1. Admission Registration: Registration and seat reservation fees confirm admission into batches limited to 30–35 students.\n2. Trial Period: Parents may request a review or batch adjustment within the first 7 days of enrollment.\n3. Pro-Rata Policy: In genuine relocations or medical emergencies, fee refund requests submitted in writing to the administrative desk will be reviewed on a fair pro-rata basis deducting attended sessions and study material charges.\n4. Scholarship Adjustments: GTSE scholarship concessions are applied directly to the tuition fee structure.`
    },
    vision: {
      title: 'Values and Vision',
      content: `Our Vision at Goyal Coaching Center:\n\nTo be North India's most trusted sanctuary of academic excellence in Class 8th–10th (Science & Mathematics) and Class 11th–12th (Commerce).\n\nCore Values:\n• Concept First Pedagogy: No rote learning. Every formula is derived with rigorous logic.\n• 1-on-1 Student Care: Individual doubt clearance desks with no student left behind.\n• Ethical Mentorship: Instilling integrity, exam calm, and disciplined study habits that last a lifetime.`
    },
    aims: {
      title: 'Aims and Responsibilities',
      content: `Our Academic Aims & Commitments:\n\n1. 100/100 Board Centum Goal: Providing targeted step-marking answer writing practice to help every committed student reach their highest potential.\n2. Transparent Parent Communication: Real-time attendance, test scorecards, and regular PTM reviews so parents stay fully informed.\n3. Premier College Admissions: Directing Class 11–12 Commerce students toward prestigious institutions like SRCC, Delhi University, and top CA / Commerce careers.`
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <footer className="w-full relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-t-2 border-blue-500/30 text-white select-none">
        
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(96,165,250,0.4) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 pb-8 relative z-10">
          
          {/* Upper 3-Column Grid (About Us | Our Courses | Admission) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 items-start pb-12 border-b border-blue-400/20">
            
            {/* ================= COLUMN 1: About Us ================= */}
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white tracking-tight mb-6">
                About Us
              </h3>

              <ul className="space-y-3.5 text-sm sm:text-base font-medium text-blue-100/90">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('vision')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Values and Vision
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('aims')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Aims and Responsibilities
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('directors')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Our Team
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectAbout) {
                        onSelectAbout();
                      } else {
                        scrollToSection('features');
                      }
                    }}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-left"
                  >
                    Why Goyal Coaching Center
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('shining-stars')}
                    className="hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Testimonials
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectCenters) {
                        onSelectCenters();
                      } else {
                        scrollToSection('centers');
                      }
                    }}
                    className="hover:text-amber-300 transition-colors cursor-pointer text-amber-300 font-bold flex items-center gap-1.5 mx-auto"
                  >
                    <span>📍 Our Centers (Bhikhi)</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* ================= COLUMN 2: Our Courses ================= */}
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white tracking-tight mb-6">
                Our Courses
              </h3>

              <div className="w-full max-w-sm space-y-5 text-sm sm:text-base">
                
                {/* Foundation Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-blue-900/40 border border-blue-400/20 backdrop-blur-sm">
                  <span className="font-extrabold text-base text-white font-outfit">
                    Foundation
                  </span>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {[
                      { label: '7th', id: 'course-class-7' },
                      { label: '8th', id: 'course-class-8' },
                      { label: '9th', id: 'course-class-9' },
                      { label: '10th', id: 'course-class-10' }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          if (onSelectCourse) {
                            onSelectCourse(item.id);
                          } else {
                            scrollToSection('courses');
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-blue-800/80 hover:bg-amber-400 hover:text-slate-950 text-blue-100 font-bold text-xs border border-blue-400/30 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commerce Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-blue-900/40 border border-blue-400/20 backdrop-blur-sm">
                  <span className="font-extrabold text-base text-white font-outfit">
                    Commerce
                  </span>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {[
                      { label: '11th', id: 'course-class-11-commerce' },
                      { label: '12th', id: 'course-class-12-commerce' },
                      { label: 'Accounts & Eco', id: 'course-accounts-eco' }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          if (onSelectCourse) {
                            onSelectCourse(item.id);
                          } else {
                            scrollToSection('courses');
                          }
                        }}
                        className="px-3 py-1 rounded-xl bg-blue-800/80 hover:bg-amber-400 hover:text-slate-950 text-blue-100 font-bold text-xs border border-blue-400/30 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ================= COLUMN 3: Admission & App Store Badges ================= */}
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white tracking-tight mb-4">
                Admission
              </h3>

              <div className="space-y-2 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectAdmission) onSelectAdmission();
                    else if (onOpenCounseling) onOpenCounseling();
                    else scrollToSection('take-first-step');
                  }}
                  className="block text-sm sm:text-base font-semibold text-blue-100 hover:text-amber-300 transition-colors cursor-pointer mx-auto"
                >
                  Admission Process
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectGTSE) onSelectGTSE();
                    else if (onOpenCounseling) onOpenCounseling('GTSE Scholarship Exam');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 text-xs sm:text-sm font-bold border border-amber-400/30 transition-all cursor-pointer shadow-sm"
                >
                  <span>GTSE Scholarship Exam</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">100%</span>
                </button>
              </div>

              {/* Mobile App Download Badges (Matching Uploaded Image) */}
              <div className="space-y-3 w-full max-w-[210px]">
                
                {/* Apple App Store Badge */}
                <a
                  href="#download-app"
                  onClick={(e) => { e.preventDefault(); alert('Goyal Coaching Center iOS App is launching soon on the Apple App Store!'); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black border border-slate-700 hover:border-blue-400 text-white shadow-lg shadow-black/40 transition-all hover:scale-105 active:scale-95"
                >
                  {/* Apple Logo SVG */}
                  <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14-5.88-9.04-10.42-19.12-13.62-30.23-3.21-11.11-4.81-21.72-4.81-31.83 0-14.35 3.69-26.11 11.08-35.28 7.39-9.17 16.63-13.88 27.72-14.13 4.46 0 9.5 1.13 15.11 3.4 5.61 2.26 9.3 3.51 11.06 3.73 2.11-.33 6.04-1.74 11.8-4.22 5.76-2.49 10.74-3.62 14.94-3.4 12.28.61 22.09 5.25 29.43 13.91-10.88 6.64-16.21 15.65-16 27.03.22 8.92 3.63 16.32 10.23 22.21 6.6 5.88 14.42 9.18 23.47 9.89-2.22 6.88-5.07 14.07-8.54 21.57zM119.22 31.84c0-7.39 2.65-14.35 7.95-20.88 5.3-6.53 11.95-10.49 19.95-11.88.22 1.11.33 2.11.33 3 0 7.39-2.77 14.47-8.31 21.25-5.54 6.78-12.25 10.77-20.13 11.96-.22-1.12-.34-2.12-.34-3.45z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] text-slate-300 uppercase tracking-wider">Download on the</div>
                    <div className="text-sm font-bold font-sans">App Store</div>
                  </div>
                </a>

                {/* Google Play Store Badge */}
                <a
                  href="#download-app"
                  onClick={(e) => { e.preventDefault(); alert('Goyal Coaching Center Android App is launching soon on Google Play!'); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black border border-slate-700 hover:border-blue-400 text-white shadow-lg shadow-black/40 transition-all hover:scale-105 active:scale-95"
                >
                  {/* Google Play Logo SVG */}
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512">
                    <path fill="#4285F4" d="M32.5 13.4C26.7 19.6 24 28.5 24 40v432c0 11.5 2.7 20.4 8.5 26.6l239.5-242.6L32.5 13.4z"/>
                    <path fill="#34A853" d="M375.4 340.6l-103.4-84.6-239.5 242.6c7.7 8.1 19.5 9.7 32.5 2.4l310.4-160.4z"/>
                    <path fill="#FBBC05" d="M482.3 227.1L417.8 193 355.2 256l62.6 63 64.5-34.1c16.3-8.6 16.3-22.9 0-37.8z"/>
                    <path fill="#EA4335" d="M32.5 13.4l239.5 242.6 103.4-84.6L65 11c-13-7.3-24.8-5.7-32.5 2.4z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[9px] text-slate-300 uppercase tracking-wider">GET IT ON</div>
                    <div className="text-sm font-bold font-sans">Google Play</div>
                  </div>
                </a>

              </div>
            </div>

          </div>

          {/* Lower Row: Copyright, Policies & Social Media Icons */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs sm:text-sm text-blue-200/80 font-medium text-center md:text-left">
            
            {/* Left: © 2026 Goyal Coaching Center. All rights reserved. */}
            <div>
              <p className="tracking-wide">
                © {new Date().getFullYear()} Goyal Coaching Center. All rights reserved.
              </p>
            </div>

            {/* Center: Privacy Policy | Terms and Conditions | Refund and Cancellation Policy */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="hover:text-white transition-colors cursor-pointer hover:underline"
              >
                Privacy Policy
              </button>
              <span className="text-blue-400/50">|</span>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="hover:text-white transition-colors cursor-pointer hover:underline"
              >
                Terms and Conditions
              </button>
              <span className="text-blue-400/50">|</span>
              <button
                type="button"
                onClick={() => setActiveModal('refund')}
                className="hover:text-white transition-colors cursor-pointer hover:underline"
              >
                Refund and Cancellation Policy
              </button>
            </div>

            {/* Right: Social Media Icons (Instagram @goyal_coachingcentre, Facebook, YouTube) */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              {/* Instagram: @goyal_coachingcentre */}
              <a
                href="https://www.instagram.com/goyal_coachingcentre/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 border border-pink-500/40 hover:border-pink-300 text-white transition-all hover:scale-105 active:scale-95 shadow-md group"
                title="Follow @goyal_coachingcentre on Instagram"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-xs font-bold tracking-tight text-pink-100 group-hover:text-white">
                  @goyal_coachingcentre
                </span>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

          </div>

        </div>

        {/* ================= POLICY & INFO POPUP MODAL ================= */}
        {activeModal && policies[activeModal] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border-2 border-blue-500/40 max-h-[85vh] overflow-y-auto relative shadow-2xl shadow-blue-900/50">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Title */}
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
                <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="text-lg font-black text-white font-outfit">
                  {policies[activeModal].title}
                </h3>
              </div>

              {/* Modal Content */}
              <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed space-y-3">
                {policies[activeModal].content}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Close Window
                </button>
              </div>

            </div>
          </div>
        )}

      </footer>

      {/* ================= FLOATING CONTACT WIDGETS (WHATSAPP & DIRECT CALL) ================= */}
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-center gap-3 select-none">
        
        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/919876960163?text=Hello%20Goyal%20Coaching%20Center,%20I%20would%20like%20to%20inquire%20about%20admissions%20and%20courses."
          target="_blank"
          rel="noreferrer"
          className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 hover:scale-110 active:scale-95 transition-all duration-300 group relative"
          title="Chat on WhatsApp"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
            Chat on WhatsApp
          </span>
        </a>

        {/* Direct Phone Call Floating Button */}
        <a
          href="tel:+919876960163"
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-amber-600/30 hover:scale-110 active:scale-95 transition-all duration-300 group relative"
          title="Call Goyal Coaching Center"
        >
          <Phone className="w-6 h-6 stroke-[2.2] animate-phone-ring" />
          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
            Call +91 98769 60163
          </span>
        </a>

      </div>
    </>
  );
}
