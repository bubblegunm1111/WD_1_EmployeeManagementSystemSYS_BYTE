import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api';

function ForcePasswordReset() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      setError('');
      // Update password in Firebase
      await updatePassword(auth.currentUser, newPassword);
      
      // Update backend to clear the reset flag
      const email = auth.currentUser.email;
      const res = await api.get(`/employees/by-email?email=${encodeURIComponent(email)}`);
      if (res.data && res.data.id) {
        await api.put(`/employees/${res.data.id}/reset-status`);
      }

      // Navigate to dashboard
      navigate('/employee');
    } catch (err) {
      console.error(err);
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-extrabold text-[#1e293b] mb-2">Update Password</h2>
        <p className="text-gray-500 mb-8 font-semibold text-sm">
          Welcome! Since this is your first time logging in, you must set a new secure password for your account.
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white font-bold transition"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b8cf8] focus:bg-white font-bold transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#8b8cf8] text-white font-extrabold py-4 rounded-xl hover:bg-[#7778f2] transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForcePasswordReset;
