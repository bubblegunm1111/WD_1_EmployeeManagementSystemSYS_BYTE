import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Google SVG Icon ─────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ─── SYS Logo ─────────────────────────────────────────────────────────────────
const SysLogo = () => (
  <div className="flex items-center justify-center gap-2 mb-6">
    <div className="flex -space-x-1.5 opacity-90">
      <div className="w-4 h-7 bg-[#8b8cf8] rounded-full"></div>
      <div className="w-4 h-7 bg-[#6366f1] rounded-full mix-blend-multiply"></div>
      <div className="w-4 h-7 bg-[#4f46e5] rounded-full mix-blend-multiply"></div>
    </div>
    <span className="text-2xl font-black text-[#111827] tracking-tight">SYS</span>
  </div>
);

// ─── Input Field Component ────────────────────────────────────────────────────
const InputField = ({ icon: Icon, type, placeholder, value, onChange, required, rightEl }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon size={16} />
    </div>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40 focus:border-[#6366f1] focus:bg-white placeholder-gray-400 text-sm font-medium text-gray-800 transition-all duration-200"
    />
    {rightEl && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {rightEl}
      </div>
    )}
  </div>
);

// ─── Org Name Modal (for first-time Google admin sign-in) ─────────────────────
const OrgNameModal = ({ onSubmit, onClose }) => {
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full mx-4 border border-gray-100"
      >
        <SysLogo />
        <h2 className="text-2xl font-black text-center text-[#111827] mb-2">One last step!</h2>
        <p className="text-sm text-center text-gray-500 font-medium mb-8">Tell us a bit about your organization to finish setting up your admin account.</p>

        <div className="flex flex-col gap-4">
          <InputField
            icon={User}
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <InputField
            icon={Building2}
            type="text"
            placeholder="Organization / Company name"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            required
          />
          <button
            onClick={() => onSubmit({ fullName, orgName })}
            disabled={!orgName.trim() || !fullName.trim()}
            className="w-full mt-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            Complete Setup <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Login Component ─────────────────────────────────────────────────────
function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const { user, role: authRole, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const uiRole = location.state?.role || 'employee';

  React.useEffect(() => {
    if (user && authRole) {
      navigate(authRole === 'admin' ? '/admin' : '/employee');
    }
  }, [user, authRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(username || email, password, uiRole);
        if (uiRole === 'employee') {
          try {
            const loginEmail = username || email;
            const res = await api.get(`/employees/by-email?email=${encodeURIComponent(loginEmail)}`);
            if (res.data) {
              if (res.data.requires_password_reset) { navigate('/force-reset'); return; }
              else if (!res.data.onboarding_completed) { navigate('/onboarding'); return; }
            }
          } catch (err) { console.error('Could not check status', err); }
        }
      } else {
        await signup(email, password, uiRole, { fullName, orgName });
      }
      navigate(uiRole === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      console.error(err);
      setError('Incorrect email or password. Please try again.');
    }
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await loginWithGoogle(uiRole);
      const isNewUser = result?._tokenResponse?.isNewUser;
      if (isNewUser && uiRole === 'admin') {
        setPendingGoogleUser(result.user);
        setShowOrgModal(true);
        return;
      }
      navigate(uiRole === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked! Allow popups in your browser address bar.');
      } else {
        setError('Google sign in failed: ' + err.message);
      }
    }
  };

  const handleOrgModalSubmit = async ({ fullName, orgName }) => {
    if (!pendingGoogleUser) return;
    try {
      const token = await pendingGoogleUser.getIdToken();
      localStorage.setItem('token', token);
      await api.post('/auth/register', {
        email: pendingGoogleUser.email,
        uid: pendingGoogleUser.uid,
        orgName,
        fullName,
      });
    } catch (err) {
      if (err.response?.status !== 409) console.error('Failed to register org', err);
    }
    setShowOrgModal(false);
    setPendingGoogleUser(null);
    navigate('/admin');
  };

  const isAdmin = uiRole === 'admin';

  return (
    <div className="h-full w-full flex items-start justify-center relative overflow-y-auto overflow-x-hidden bg-gradient-to-br from-[#eef0ff] via-[#f8f9ff] to-[#f0e6ff] no-scrollbar py-10">
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-50 bg-[#c7caff]"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[450px] h-[450px] rounded-full blur-[100px] opacity-40 bg-[#e0d4ff]"></div>

      {/* Org Name Modal */}
      <AnimatePresence>
        {showOrgModal && (
          <OrgNameModal onSubmit={handleOrgModalSubmit} onClose={() => setShowOrgModal(false)} />
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-white/80 rounded-[2rem] px-10 py-10 max-w-md w-full relative z-10 mx-4"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-7 left-8 text-sm text-gray-400 hover:text-[#6366f1] transition font-semibold flex items-center gap-1 cursor-pointer"
        >
          ← Back
        </button>

        <SysLogo />

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#111827] tracking-tight mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm font-semibold text-gray-400">
            {isAdmin ? 'Admin Portal' : 'Employee Portal'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 mb-5 text-center text-sm font-semibold bg-red-50 py-3 px-4 rounded-2xl border border-red-100"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

          {/* Signup-only: Full Name */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <InputField icon={User} type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Signup + Admin: Org Name */}
          <AnimatePresence>
            {!isLogin && isAdmin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <InputField icon={Building2} type="text" placeholder="Organization / Company Name" value={orgName} onChange={e => setOrgName(e.target.value)} required />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">
              {isAdmin ? 'Work email' : 'Work email'}
            </label>
            <InputField
              icon={Mail}
              type={!isLogin ? 'email' : 'text'}
              placeholder={isAdmin ? 'admin@company.com' : 'employee@company.com'}
              value={!isLogin ? email : username}
              onChange={e => !isLogin ? setEmail(e.target.value) : setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Password</label>
            <InputField
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder={!isAdmin && isFirstTime ? 'Temporary password' : 'Enter your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              }
            />
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-between">
            {!isAdmin && (
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFirstTime}
                  onChange={e => setIsFirstTime(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#6366f1] focus:ring-[#6366f1] border-gray-300"
                />
                First time logging in?
              </label>
            )}
            <button type="button" className="text-xs font-bold text-[#6366f1] hover:text-[#4f46e5] transition ml-auto cursor-pointer">
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transform hover:-translate-y-0.5 cursor-pointer"
          >
            {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={16} />
          </button>

        </form>

        {/* Google + Divider (Admin only) */}
        {isAdmin && (
          <>
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-gray-400 font-semibold">or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer text-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="mt-7 text-center text-sm font-semibold text-gray-500">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-[#6366f1] hover:text-[#4f46e5] transition font-bold cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </>
        )}

        {/* Footer lock badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400 font-semibold">
          {isAdmin
            ? <><ShieldCheck size={13} /> Authorized personnel only</>
            : <><ShieldCheck size={13} /> Employee access only</>
          }
        </div>

      </motion.div>
    </div>
  );
}

export default Login;
