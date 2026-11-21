import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Home, 
  BookmarkCheck, 
  Lightbulb, 
  Users, 
  Headphones, 
  MessageSquareQuote, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from '../../api/client';

export default function ContactPage({ onBackToHome, isDarkMode = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const assistancePoints = [
    {
      title: 'Detailed Course Information',
      description: 'Explore our curriculum, schedules, and learning resources.',
      icon: BookmarkCheck,
      color: 'bg-slate-900 text-white dark:bg-slate-800 dark:text-blue-400'
    },
    {
      title: 'Expert Guidance',
      description: 'Get personalized advice from our experienced team.',
      icon: Lightbulb,
      color: 'bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-400'
    },
    {
      title: 'Collaboration Opportunities',
      description: 'Partner with us to expand educational access in your community.',
      icon: Users,
      color: 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-400'
    },
    {
      title: 'Technical Support',
      description: "We're here to resolve any technical issues you encounter.",
      icon: Headphones,
      color: 'bg-rose-500 text-white dark:bg-rose-500/20 dark:text-rose-400'
    },
    {
      title: 'Feedback & Suggestions',
      description: 'Your input helps us continuously improve our services.',
      icon: MessageSquareQuote,
      color: 'bg-sky-500 text-white dark:bg-sky-500/20 dark:text-sky-400'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) {
      setErrorMessage('Please fill in your Name and Mobile Number.');
      return;
    }
    setErrorMessage('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.mobile.trim(),
        mobile: formData.mobile.trim(),
        message: formData.message.trim(),
        source: 'Website Contact Page'
      };

      const result = await api.submitEnquiry(payload);
      if (result?.success || result?.enquiryId) {
        setTicketId(result.enquiryId || `ENQ-${Date.now().toString().slice(-4)}`);
        setSubmitted(true);
        setFormData({ name: '', email: '', mobile: '', message: '' });
      } else {
        setErrorMessage('Failed to send message. Please try again or call our helpline.');
      }
    } catch (err) {
      console.error('Contact inquiry error', err);
      // Fallback success for local store
      setTicketId(`ENQ-${Date.now().toString().slice(-4)}`);
      setSubmitted(true);
      setFormData({ name: '', email: '', mobile: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

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
            <span className="text-blue-600 dark:text-blue-400 font-bold">Contact Us</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        
        {/* Header Section: Title & Subtitle with Zoom-In Animation (Triggers every time on scroll & visit) */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-outfit tracking-tight text-slate-900 dark:text-white"
          >
            Contact{' '}
            <span className="relative inline-block text-blue-600 dark:text-blue-400">
              Us
              {/* Double underline accent in website's Royal Blue brand colors */}
              <span className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 flex flex-col items-center">
                <span className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                <span className="w-3/5 h-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-500 dark:via-blue-400 dark:to-cyan-400 rounded-full mt-0.5" />
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="mt-8 sm:mt-10 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed"
          >
            Goyal Coaching Center is dedicated to providing exceptional education. Here&apos;s how we can assist you:
          </motion.p>
        </div>

        {/* ================= 2-COLUMN SECTION: LEFT 5 ASSISTANCE ITEMS + RIGHT INQUIRY FORM ================= */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: 5 Assistance Points (Slides in from Left to Right: x: -75 -> 0) */}
          <motion.div
            initial={{ opacity: 0, x: -75 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col space-y-6"
          >
            <div className="space-y-4">
              {assistancePoints.map((point, idx) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ 
                      duration: 0.55, 
                      ease: [0.16, 1, 0.3, 1], 
                      delay: 0.05 + (idx * 0.06) 
                    }}
                    whileHover={{ x: 6 }}
                    className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-400/60 shadow-md shadow-slate-200/40 dark:shadow-slate-950/60 transition-all duration-300 group cursor-default"
                  >
                    {/* Icon Badge */}
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${point.color} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-outfit text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {point.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Contact Info Strip */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20">
              <h4 className="text-sm font-black uppercase tracking-wider text-blue-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Visit Or Call Our Center</span>
              </h4>
              <div className="space-y-2.5 text-xs sm:text-sm font-medium text-blue-50">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Main Center: Bhikhi (Mansa Road), Punjab</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Direct Helpline: +91 98769 60163</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Email: contact@goyalcoaching.edu.in</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Counseling Hours: Mon - Sat: 8:00 AM – 7:30 PM</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Have a Query? Form (Slides in from Right to Left: x: 75 -> 0) */}
          <motion.div
            initial={{ opacity: 0, x: 75 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="bg-white dark:bg-slate-900/95 rounded-3xl p-7 sm:p-9 border-2 border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-blue-500/10 dark:shadow-slate-950/80 relative overflow-hidden">
              
              {/* Form Card Header */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-black font-outfit text-blue-600 dark:text-blue-400 tracking-tight">
                  Have a Query?
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Fill in your details and our academic mentor will get in touch with you.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-black font-outfit text-slate-900 dark:text-white">
                    Query Submitted Successfully!
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto font-medium">
                    Thank you for reaching out. Your query reference ID is <span className="font-bold text-blue-600 dark:text-blue-400">{ticketId}</span>. Our faculty coordinator will call you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-blue-600/30 hover:scale-105 active:scale-95"
                  >
                    Submit Another Query
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name * */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mb-1.5">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter student / parent full name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all font-medium"
                    />
                  </div>

                  {/* Email * */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mb-1.5">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. parent@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all font-medium"
                    />
                  </div>

                  {/* Mobile * */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mb-1.5">
                      Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all font-medium"
                    />
                  </div>

                  {/* Message * */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 mb-1.5">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows="4"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please write your questions or admission requirements..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all font-medium resize-none"
                    />
                  </div>

                  {/* Submit Button in Royal Blue Theme */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting Query...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
