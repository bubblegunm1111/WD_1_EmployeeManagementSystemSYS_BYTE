import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function ForcePasswordReset() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [reqs, setReqs] = useState({
    length: false,
    uppercase: false,
    number: false,
  });

  useEffect(() => {
    setReqs({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
    });
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (!reqs.length || !reqs.uppercase || !reqs.number) {
      return setError('Please meet all password requirements');
    }

    try {
      setLoading(true);
      setError('');
      // Update password in Firebase
      await updatePassword(auth.currentUser, newPassword);
      
      // Update backend to clear the reset flag
      const email = auth.currentUser.email;
      let employeeData = null;
      try {
        const res = await api.get(`/employees/by-email?email=${encodeURIComponent(email)}`);
        if (res.data && res.data.id) {
          employeeData = res.data;
          await api.put(`/employees/${res.data.id}/reset-status`);
        }
      } catch (err) {
        console.error("Failed backend update", err);
      }

      // Check if onboarding is needed
      if (employeeData && !employeeData.onboarding_completed) {
        navigate('/onboarding');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full mx-4 border border-gray-100">
        <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-2 tracking-tight">Create your password</h2>
        <p className="text-gray-500 mb-8 font-semibold text-sm">
          You're almost ready to access your SYS account.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white font-semibold transition placeholder-gray-400"
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
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white font-semibold transition placeholder-gray-400"
            />
          </div>

          <div className="my-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Password requirements:</h4>
            <ul className="space-y-2 text-sm font-semibold">
              <li className={`flex items-center gap-2 ${reqs.length ? 'text-[#34A853]' : 'text-gray-400'}`}>
                {reqs.length ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>}
                At least 8 characters
              </li>
              <li className={`flex items-center gap-2 ${reqs.uppercase ? 'text-[#34A853]' : 'text-gray-400'}`}>
                {reqs.uppercase ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>}
                One uppercase letter
              </li>
              <li className={`flex items-center gap-2 ${reqs.number ? 'text-[#34A853]' : 'text-gray-400'}`}>
                {reqs.number ? <CheckCircleIcon className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>}
                One number
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !reqs.length || !reqs.uppercase || !reqs.number}
            className="w-full mt-2 bg-[#1a1a1a] text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForcePasswordReset;
