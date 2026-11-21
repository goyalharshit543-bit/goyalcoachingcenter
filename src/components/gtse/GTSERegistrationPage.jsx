import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  School, 
  Award, 
  Send, 
  Printer, 
  RotateCcw,
  Check,
  Building,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../api/client';

export default function GTSERegistrationPage({
  onBackToHome,
  onBackToGTSE
}) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male', // 'Female' | 'Male' | 'Other'
    fatherName: '',
    presentClass: '10th',
    school: '',
    address: '',
    cityState: '',
    studentNo: '',
    fatherNo: '',
    email: '',
    declaration: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const classOptions = [
    { id: '6th', label: '6th' },
    { id: '7th', label: '7th' },
    { id: '8th', label: '8th' },
    { id: '9th', label: '9th' },
    { id: '10th', label: '10th' },
    { id: '11th M', label: '11th M' },
    { id: '11th NM', label: '11th NM' },
    { id: '11th Commerce', label: '11th Comm' },
    { id: '12th M', label: '12th M' },
    { id: '12th NM', label: '12th NM' },
    { id: '12th Commerce', label: '12th Comm' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter student full name.');
      return;
    }
    if (!formData.studentNo.trim() || formData.studentNo.length < 10) {
      setErrorMsg('Please enter a valid 10-digit student mobile number.');
      return;
    }
    if (!formData.declaration) {
      setErrorMsg('Please check the declaration checkbox to confirm your details are accurate.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.submitGTSERegistration(formData);
      
      setRegisteredData({
        ...formData,
        id: response.registrationId || `GTSE-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleString('en-IN')
      });
      setSubmitted(true);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error('Registration submission error:', err);
      setErrorMsg('An error occurred while saving the registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      dob: '',
      gender: 'Male',
      fatherName: '',
      presentClass: '10th',
      school: '',
      address: '',
      cityState: '',
      studentNo: '',
      fatherNo: '',
      email: '',
      declaration: false
    });
    setSubmitted(false);
    setRegisteredData(null);
    setErrorMsg('');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-10 transition-colors duration-300">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGTSE || onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Back to GTSE Overview</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* ================= SUCCESS CONFIRMATION STATE ================= */}
        {submitted && registeredData ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-slate-900 border-2 border-blue-500/30 dark:border-blue-600/40 shadow-2xl text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-2">
              Registration Confirmed
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white">
              Application Successfully Saved!
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
              Congratulations <strong className="text-slate-900 dark:text-white">{registeredData.name}</strong>! Your application for the <strong className="text-blue-600 dark:text-blue-400">Goyal Talent Search Examination (GTSE)</strong> has been recorded in the institute's database.
            </p>

            {/* Registration Details Summary Card */}
            <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs sm:text-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-medium">Assigned Roll / Reg No:</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-base">{registeredData.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Candidate Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{registeredData.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Present Class:</span>
                <span className="font-bold text-slate-900 dark:text-white">{registeredData.presentClass}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Student Mobile:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{registeredData.studentNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Registration Status:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Check className="w-4 h-4" /> Verified & Saved Securely
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Register Another Student</span>
              </button>

              <button
                onClick={onBackToHome}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Back to Website
              </button>
            </div>
          </motion.div>
        ) : (

          /* ================= MAIN REGISTRATION FORM ================= */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-white dark:bg-slate-900 border-4 border-blue-600 dark:border-blue-700 shadow-2xl p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Top Amber Ribbon Accent (Matching Brand Layout) */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-amber-400 to-indigo-600" />

            {/* FORM HEADER BANNER: Left Institute Brand with Official Emblem Logo + Center Title */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
              
              {/* LEFT SIDE: GOYAL COACHING CENTER + OFFICIAL EMBLEM LOGO (FROM USER PHOTO 4) */}
              <div className="flex items-center gap-3.5 text-left">
                <img 
                  src="/goyal_official_logo.jpg" 
                  alt="Goyal Coaching Centre Official Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full shadow-lg border-2 border-amber-400/80 bg-white p-0.5 shrink-0" 
                />
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black font-outfit text-slate-950 dark:text-white tracking-tight leading-tight">
                    GOYAL
                  </div>
                  <div className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                    Coaching Centre
                  </div>
                  <div className="text-xs text-amber-500 font-serif italic font-medium">
                    "Build a Better Future"
                  </div>
                </div>
              </div>

              {/* CENTER / RIGHT: GTSE REGISTRATION FORM PILL */}
              <div className="text-center md:text-right">
                <div className="inline-block px-7 sm:px-9 py-2.5 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white font-black text-base sm:text-xl md:text-2xl font-outfit uppercase tracking-wider shadow-lg shadow-blue-600/30">
                  GTSE Registration Form
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Goyal Talent Search Examination • Up to 100% Scholarship
                </div>
              </div>

            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span>⚠️ {errorMsg}</span>
              </div>
            )}

            {/* FORM INPUTS (EXACTLY MATCHING USER'S IMAGE 2) */}
            <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
              
              {/* Row 1: Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  Name<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Row 2: DOB & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                    DOB
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="sm:w-24 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                    Gender<span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === 'Female'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span>Female</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === 'Male'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span>Male</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={formData.gender === 'Other'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-4 h-4 text-blue-600 accent-blue-600"
                      />
                      <span>Other</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 3: Father's / Guardian's Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  Father's/Guardian's Name<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter father's/guardian's name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Row 4: Present Class (Checkboxes matching user Image 2) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 pt-1">
                <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0 pt-1.5">
                  Present Class<span className="text-rose-500">*</span>
                </label>
                <div className="flex-1 flex flex-wrap gap-2.5">
                  {classOptions.map((cls) => {
                    const isSelected = formData.presentClass === cls.id;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, presentClass: cls.id })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/30 scale-105'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                          isSelected ? 'bg-white text-blue-600 border-white' : 'border-slate-400'
                        }`}>
                          {isSelected && '✓'}
                        </span>
                        <span>{cls.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: School */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  School<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter school name"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Row 6: Permanent Address */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  Permanent Address<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Row 7: City/State */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  City/State<span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter city/state (e.g. Patiala, Punjab)"
                  value={formData.cityState}
                  onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Row 8: Student No & Father No */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                    Student No.<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formData.studentNo}
                    onChange={(e) => setFormData({ ...formData, studentNo: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="sm:w-28 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                    Father No.
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={formData.fatherNo}
                    onChange={(e) => setFormData({ ...formData, fatherNo: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Row 9: Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-44 font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  Email<span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Row 10: DECLARATION Checkbox */}
              <div className="pt-3">
                <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={formData.declaration}
                    onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 accent-blue-600 shrink-0 mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                    <strong>DECLARATION:</strong> I hereby declare that all information given in this registration form is true, correct, and complete to the best of my knowledge.<span className="text-rose-500">*</span>
                  </span>
                </label>
              </div>

              {/* Submit Button (Matching User's Image 2, styled in website's golden/amber accent) */}
              <div className="pt-6 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting}
                  className="px-12 sm:px-16 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-400/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Saving to Excel Register...
                    </span>
                  ) : (
                    <span>Submit</span>
                  )}
                </motion.button>

                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Free Registration (₹0) • Automatically saved to the backend Excel database.
                </div>
              </div>

            </form>

          </motion.div>
        )}

      </div>

    </div>
  );
}
