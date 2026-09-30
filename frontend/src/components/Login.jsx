import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState('');
  
  const [error, setError] = useState('');
  
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'employee'; 

  // Force login view for employees
  if (role === 'employee' && !isLogin) {
    setIsLogin(true);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(username || email, password, role);
        
        // If employee, check if they need a password reset or onboarding
        if (role === 'employee') {
          try {
            const loginEmail = username || email;
            const res = await api.get(`/employees/by-email?email=${encodeURIComponent(loginEmail)}`);
            if (res.data) {
              if (res.data.requires_password_reset) {
                navigate('/force-reset');
                return;
              } else if (!res.data.onboarding_completed) {
                navigate('/onboarding');
                return;
              }
            }
          } catch (err) {
            console.error("Could not check status", err);
          }
        }
        
      } else {
        await signup(email, password, role, { fullName, orgName });
      }
      navigate(role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials or user already exists.');
    }
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    try {
      await loginWithGoogle(role);
      navigate(role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setError('Google sign in failed');
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-[#f8f9fc] overflow-hidden relative">
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[80px] opacity-40 ${role === 'admin' ? 'bg-[#ffdf85]' : 'bg-[#b5cdff]'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[60px] opacity-30 ${role === 'admin' ? 'bg-[#ffb5d4]' : 'bg-[#eaf4eb]'}`}></div>

      <div className="bg-white/80 backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full border border-white relative z-10 transition-all duration-300">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm font-semibold text-gray-400">
            {role === 'admin' ? 'Admin Portal' : 'Employee Portal'}
          </p>
        </div>

        {error && <div className="text-red-500 mb-6 text-center text-sm font-bold bg-red-50 py-3 rounded-xl border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {!isLogin && (
            <input
              type="text"
              required
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white placeholder-gray-400 font-semibold transition"
            />
          )}

          {!isLogin && role === 'admin' && (
            <input
              type="text"
              required
              placeholder="Organization / Company Name"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white placeholder-gray-400 font-semibold transition"
            />
          )}

          {!isLogin ? (
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white placeholder-gray-400 font-semibold transition"
            />
          ) : (
            <input
              type="text"
              required
              placeholder={role === 'employee' ? 'Work email' : 'Username or Email'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white placeholder-gray-400 font-semibold transition"
            />
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder={role === 'employee' ? 'Temporary password' : 'Password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white placeholder-gray-400 font-semibold transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-[#1a1a1a] text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-0.5 cursor-pointer text-base"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
          
          {role === 'employee' && (
            <div className="text-center mt-1">
              <button type="button" className="text-sm font-semibold text-gray-400 hover:text-[#8b8cf8] transition">
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        {role === 'admin' && (
          <>
            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            
            <div className="mt-8 text-center text-sm font-semibold text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#8b8cf8] hover:text-[#7778f2] transition font-bold cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </>
        )}

        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 text-sm text-gray-400 hover:text-black transition font-bold cursor-pointer flex items-center gap-2"
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
}

export default Login;
