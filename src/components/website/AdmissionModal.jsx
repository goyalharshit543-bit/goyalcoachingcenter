import { useState } from 'react';
import { Sparkles, CheckCircle2, User, Phone, Mail, BookOpen, MapPin, Send } from 'lucide-react';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';

export default function AdmissionModal({ isOpen, onClose, defaultCourse = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    parentName: '',
    phone: '',
    email: '',
    course: defaultCourse || 'Class 10th Board Champions (Science & Maths)',
    branch: 'Main Campus (Sec 14)',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitEnquiry(formData);
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 4000);
    } catch (err) {
      alert('Error submitting enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-blue-500/30 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Application Received!</h2>
            <p className="text-sm text-slate-300 mt-2 max-w-sm mx-auto">
              Thank you, <strong>{formData.name}</strong>. The Goyal Coaching Center academic admissions team will contact <strong>{formData.phone}</strong> within 4 hours.
            </p>
            <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300">
              Registration for <strong>GTSE Scholarship Exam</strong> has been initiated. Free sample papers sent to your WhatsApp.
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Session 2027-28 Admissions
              </div>
              <h2 className="text-2xl font-extrabold text-white">Apply for Admission</h2>
              <p className="text-xs text-slate-400 mt-1">
                Book a free 1-on-1 counseling session and scholarship evaluation with Er. Alok Goyal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Student's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siddharth"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Parent's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. Anil Sharma"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876960163"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Email ID</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Target Course</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="GTSE Scholarship Exam (Free Registration)">GTSE Scholarship Exam (Free Registration)</option>
                    <option value="Class 10th Board Champions (Science & Maths)">Class 10th Board Champions (Science & Maths)</option>
                    <option value="Class 12th Commerce Super League (Full Package)">Class 12th Commerce Super League (Accounts, Eco, BST, Maths)</option>
                    <option value="Class 9th Foundation Stars (Science & Maths)">Class 9th Foundation Stars (Science & Maths)</option>
                    <option value="Class 11th Commerce Pioneers">Class 11th Commerce Pioneers (Accounts, Eco, BST, Maths)</option>
                    <option value="Class 8th Junior Prodigy (Science & Maths)">Class 8th Junior Prodigy (Science & Maths)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-semibold mb-1">Preferred Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Main Campus (Sec 14)">Main Campus (Sector 14)</option>
                    <option value="North Campus (Model Town)">North Campus (Model Town)</option>
                    <option value="South Hub (Kalu Sarai)">South Hub (Kalu Sarai)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 uppercase font-semibold mb-1">Special Queries or Notes</label>
                <textarea
                  rows={2}
                  placeholder="Tell us current class, school, or subjects requiring special focus..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Application...' : 'Submit Admission Application'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
