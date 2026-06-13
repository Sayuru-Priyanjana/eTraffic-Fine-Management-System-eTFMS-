import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Lock, CheckCircle, ShieldAlert, RefreshCw, IdCard } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        id: licenseNumber.trim().toUpperCase(),
        username: username.trim(),
        password,
        role: 'DRIVER'
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check if license number or username is already registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto py-16 px-4">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800/80 glow-primary">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/20 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Driver Registration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Register your Driving License Number to track violations and pay online.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center space-x-2">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Driver License Number (ID)</label>
            <div className="relative">
              <input
                id="licenseNumber"
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-650 transition-colors uppercase"
                placeholder="e.g. B-1234567"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
              <IdCard className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
            <div className="relative">
              <input
                id="username"
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-600 transition-colors"
                placeholder="e.g. driver_mike"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-600 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-600 transition-colors"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Creating profile...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
