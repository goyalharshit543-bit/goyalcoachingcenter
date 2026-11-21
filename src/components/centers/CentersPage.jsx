import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  BookOpen, 
  ExternalLink, 
  Navigation, 
  Building2, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api/client';

export default function CentersPage({
  onBackToHome,
  onOpenCounseling,
  onOpenAdminManager,
  currentRole
}) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');

  const loadCenters = async () => {
    try {
      const data = await api.getCenters();
      if (Array.isArray(data) && data.length > 0) {
        setCenters(data);
      } else {
        // Fallback default center
        setCenters([
          {
            id: 'center-bhikhi',
            name: 'Goyal Coaching Centre - Bhikhi Center',
            city: 'Bhikhi',
            district: 'Mansa',
            state: 'Punjab',
            pinCode: '151504',
            address: 'Goyal Coaching Centre, Near Bus Stand / Main Market, Bhikhi, Mansa, Punjab 151504',
            phone: '+91 98769 60163',
            email: 'bhikhi@goyalcoaching.edu.in',
            timings: 'Monday – Saturday: 3:00 PM – 8:30 PM | Sunday: 8:30 AM – 1:30 PM',
            courses: 'Class 8th–10th (Sci & Maths) • Class 11th–12th (Commerce) • GTSE Exam Center',
            googleMapsUrl: 'https://maps.app.goo.gl/g8yZ71a2HLVsZrV67',
            embedMapUrl: 'https://maps.google.com/maps?q=30.068777,75.5325527&hl=en&z=16&output=embed',
            isMain: true,
            status: 'Active',
            badge: 'Flagship Center'
          }
        ]);
      }
    } catch (e) {
      console.error('Failed to load centers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenters();

    const handleUpdate = () => {
      loadCenters();
    };
    window.addEventListener('gcc_centers_updated', handleUpdate);
    window.addEventListener('gcc_site_data_changed', handleUpdate);
    return () => {
      window.removeEventListener('gcc_centers_updated', handleUpdate);
      window.removeEventListener('gcc_site_data_changed', handleUpdate);
    };
  }, []);

  // Compute available cities
  const cities = ['All', ...Array.from(new Set(centers.map(c => c.city || 'Bhikhi').filter(Boolean)))];

  const filteredCenters = selectedCity === 'All'
    ? centers
    : centers.filter(c => (c.city || '').toLowerCase() === selectedCity.toLowerCase());

  const getEmbedUrl = (center) => {
    if (center.embedMapUrl && center.embedMapUrl.includes('embed')) {
      return center.embedMapUrl;
    }
    if (center.googleMapsUrl && center.googleMapsUrl.includes('embed')) {
      return center.googleMapsUrl;
    }
    const q = encodeURIComponent(`${center.name || 'Goyal Coaching Centre'}, ${center.address || center.city || 'Bhikhi'}`);
    return `https://maps.google.com/maps?q=${q}&hl=en&z=16&output=embed`;
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-start bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* ================= TOP SUB-BAR ================= */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Official Learning Centers
            </span>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-14">
        
        {/* ================= HERO HEADER ================= */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Find a Center Near You</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Our Learning <span className="text-blue-600 dark:text-blue-400 relative inline-block">
              Centers
              <span className="absolute left-0 -bottom-1.5 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" />
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
            Visit our state-of-the-art coaching facilities, meet our expert faculty, and register for classroom batches or the <span className="font-bold text-blue-600 dark:text-blue-400">GTSE Scholarship Exam</span>.
          </p>

          {/* City Filter Pills (when multiple cities exist) */}
          {cities.length > 2 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedCity === city
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= CENTERS LIST & MAPS ================= */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-blue-600 dark:text-blue-400">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCenters.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Centers Found</h3>
            <p className="text-sm text-slate-500 mt-1">Please check back soon or contact our main desk.</p>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {filteredCenters.map((center, index) => {
              const embedUrl = getEmbedUrl(center);
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={center.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/60 overflow-hidden hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    
                    {/* CENTER DETAILS COLUMN */}
                    <div className="lg:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                      <div>
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3.5">
                          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs tracking-wider uppercase shadow-sm shadow-blue-600/30">
                            {center.badge || 'Learning Center'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{center.status || 'Active & Open'}</span>
                          </span>
                          {center.city && (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                              📍 {center.city}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {center.name}
                        </h2>

                        {/* Address */}
                        <div className="mt-4 flex items-start gap-3 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <p className="text-sm sm:text-base font-medium leading-relaxed">
                            {center.address}
                          </p>
                        </div>

                        {/* Info Grid */}
                        <div className="mt-6 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                          {center.phone && (
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                              <a 
                                href={`tel:${center.phone.replace(/\s+/g, '')}`} 
                                className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {center.phone}
                              </a>
                            </div>
                          )}

                          {center.email && (
                            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                              <a 
                                href={`mailto:${center.email}`} 
                                className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                              >
                                {center.email}
                              </a>
                            </div>
                          )}

                          {center.timings && (
                            <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                              <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <span className="font-medium text-xs sm:text-sm leading-relaxed">
                                {center.timings}
                              </span>
                            </div>
                          )}

                          {center.courses && (
                            <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                              <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                              <span className="font-medium text-xs sm:text-sm leading-relaxed text-blue-600 dark:text-blue-400">
                                {center.courses}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
                        {/* Live Google Maps Link */}
                        <a
                          href={center.googleMapsUrl || 'https://maps.app.goo.gl/g8yZ71a2HLVsZrV67'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Counseling / Contact Desk */}
                        {onOpenCounseling && (
                          <button
                            onClick={onOpenCounseling}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <span>Enquire for Admission</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* LIVE GOOGLE MAP EMBED COLUMN */}
                    <div className="lg:col-span-6 min-h-[320px] sm:min-h-[400px] lg:min-h-full relative bg-slate-100 dark:bg-slate-800/80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 overflow-hidden">
                      <iframe
                        title={`Live Map for ${center.name}`}
                        src={embedUrl}
                        className="w-full h-full min-h-[350px] sm:min-h-[420px] border-0"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />

                      {/* Map overlay badge */}
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Google Location</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
