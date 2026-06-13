import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, LogOut, LayoutDashboard, ShieldCheck, Home } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let username = '';

  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      username = parsed.username || '';
    } catch (e) {
      // ignore
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white group">
            <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider block leading-none font-display">eTFMS</span>
              <span className="text-[10px] text-slate-400 tracking-tight font-medium">Sri Lanka Police</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link 
              to="/quick-pay" 
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>Quick Pay</span>
            </Link>

            {token ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-950/20 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <span className="hidden md:inline-block text-xs text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700/50">
                  Hi, {username}
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
              >
                Driver Portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
