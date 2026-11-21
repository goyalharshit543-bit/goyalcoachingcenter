import { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  KeyRound,
  Eye, 
  EyeOff
} from 'lucide-react';
import { api } from '../../api/client';

export default function LoginModal({ 
  isOpen, 
  onClose, 
  initialRole = 'student', 
  onLoginSuccess 
}) {
  const [role, setRole] = useState(initialRole || 'student'); // 'student' | 'teacher' | 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset inputs when modal opens or initialRole changes
  useEffect(() => {
    if (isOpen) {
      setRole(initialRole || 'student');
      setError('');
      setIdentifier('');
      setPassword('');
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setIdentifier('');
    setPassword('');
  };

  const handleSubmit = async (e, customId, customPass, customRole) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetRole = customRole || role;
    const targetId = customId || identifier;
    const targetPass = customPass || password;

    try {
      const payload = {
        role: targetRole,
        username: targetId,
        rollNo: targetId,
        password: targetPass,
        phone: targetPass
      };

      const res = await api.login(payload);
      const finalRole = res.role || targetRole;
      onLoginSuccess(finalRole, res);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src="/goyal-logo.png"
              alt="Goyal Coaching Centre"
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-600 bg-white p-0.5 shadow-xl shadow-blue-500/25 mx-auto"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 border border-white flex items-center justify-center text-white text-xs shadow-md">
              {role === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
              {role === 'teacher' && <UserCheck className="w-3.5 h-3.5" />}
              {role === 'admin' && <Lock className="w-3.5 h-3.5" />}
            </div>
          </div>
          <h2 className="text-2xl font-black text-white font-outfit">
            GOYAL COACHING CENTRE
          </h2>
          <div className="text-xs font-serif italic text-blue-400 font-medium">
            "Build a Better Future"
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Secure IAM role-based portal for Students, Faculty & Administration.
          </p>
        </div>

        {/* Role Tabs - Student, Faculty & Main Admin */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'student'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('teacher')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'teacher'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'admin'
                ? 'bg-amber-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1.5">
              {role === 'student' ? 'Student Roll Number / ID' : role === 'teacher' ? 'Faculty Username / ID' : 'Administrator Username'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder={role === 'student' ? 'Enter Student Roll No (e.g. CGC505)' : role === 'teacher' ? 'Enter Faculty Username (e.g. prerna)' : 'Enter Admin Username (e.g. HARSHIT)'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 uppercase font-semibold mb-1.5">
              {role === 'student' ? 'Password or Registered Phone Number' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {role === 'student' && (
            <p className="text-[11px] text-slate-400 italic">
              🔒 <strong>Strict Privacy Guard:</strong> Log in using your registered Roll Number and personal password.
            </p>
          )}

          {role === 'teacher' && (
            <p className="text-[11px] text-slate-400">
              💡 <strong>Faculty Desk:</strong> Access for verified faculty members to mark daily class attendance and manage academic assignments.
            </p>
          )}

          {role === 'admin' && (
            <p className="text-[11px] text-slate-400">
              👑 <strong>Main Administration:</strong> Full administrative control, class-wise attendance register with 20-hr lock override, and master records vault.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60 ${
              role === 'student'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                : role === 'teacher'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign in to {role === 'student' ? 'Student Portal' : role === 'teacher' ? 'Faculty Desk' : 'Main Admin Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
