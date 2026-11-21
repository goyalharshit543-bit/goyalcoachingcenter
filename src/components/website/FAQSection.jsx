import { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

export default function FAQSection({ onOpenParentPortal }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Which classes and subjects does Goyal Coaching Center specialize in?",
      a: "We specialize strictly in two high-stakes domains: (1) Class 8th, 9th, and 10th (Science & Mathematics) for building unbreakable conceptual foundations and achieving 100/100 in CBSE board exams, and (2) Class 11th and 12th Commerce (Accountancy, Economics, Business Studies, and Applied/Core Mathematics) for CBSE board distinction and top college admissions like SRCC, Hindu, and CUET 100 percentiles."
    },
    {
      q: "How do parents track student marks and daily attendance?",
      a: "Parents simply click 'Parent Portal (अभिभावक पोर्टल)' on the website, enter their ward's Roll Number (e.g., GCC-101) and registered mobile number. You can instantly inspect arrival timestamps, monthly attendance percentage, Sunday mock test scores, subject breakdown, and personalized teacher remarks."
    },
    {
      q: "Who teaches the Commerce subjects in Class 11 & 12?",
      a: "Our Commerce faculty is led by qualified Chartered Accountants (CAs) and senior professors with over 15 years of experience. We ensure step-by-step clarity in difficult topics like Partnership Deed adjustments, Share Capital forfeiture, Cash Flow Statements, and Macroeconomics National Income."
    },
    {
      q: "How are Class 8, 9, and 10 Science & Mathematics taught?",
      a: "Classes are led by Goyal Sir and our senior M.Sc faculty with a concept-first method. We eliminate the fear of Math geometry theorems, Physics electricity/motion formulas, and Chemistry chemical reactions through visual illustrations, daily practice sheets (DPPs), and NCERT Exemplar coverage."
    },
    {
      q: "What is the batch size at Goyal Coaching Center?",
      a: "We strictly cap each batch at a maximum of 30 to 35 students. This ensures that teachers know every student personally, verify their homework notebooks, and conduct daily 1-on-1 doubt clearing counters."
    },
    {
      q: "What is the Goyal Talent Search Examination (GTSE)?",
      a: "GTSE is our premier scholarship examination for Class 7th to 11th students moving to the next grade. Top performers in Science, Mathematics, or Commerce can receive up to 100% tuition fee waivers based on merit."
    }
  ];

  return (
    <section id="faqs" className="py-24 relative bg-slate-950/60 border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Clarity & Parent Support
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions by Parents
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Everything you need to know about our Class 8-10 (Science & Maths) and Class 11-12 (Commerce) programs.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                >
                  <span className="font-bold text-white text-sm sm:text-base">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Portal CTA */}
        <div className="mt-12 p-6 rounded-3xl glass-panel-glow border border-blue-500/30 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-base font-bold text-white">Registered Student Guardian?</h4>
            <p className="text-xs text-slate-400">Log in to view your child's weekly test scorecards, biometric attendance, and fee receipts.</p>
          </div>
          <button
            onClick={onOpenParentPortal}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch Parent Portal</span>
          </button>
        </div>
      </div>
    </section>
  );
}
