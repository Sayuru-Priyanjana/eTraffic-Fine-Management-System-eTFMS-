import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User as UserIcon, ShieldAlert, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/dashboard');
      } else {
        setError('Login succeeded but response was invalid.');
      }
    } catch (err) {
      setError('Invalid driver username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto py-16 px-4">
      <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800/80 glow-primary">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/20 rounded-xl text-blue-400 border border-blue-500/20 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Driver Portal Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your fine details, payment records, and digital license release status.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center space-x-2">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label>
            <div className="relative">
              <input
                id="username"
                type="text"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-600 transition-colors"
                placeholder="driver_mike"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-900 pt-6">
          Need a profile?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
            Register Driver Account
          </Link>
        </div>
      </div>
    </div>
  );
}
