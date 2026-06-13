import { Link } from 'react-router-dom';
import { CreditCard, Shield, UserCheck, ArrowRight, Activity, BellRing } from 'lucide-react';

export default function Landing() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
      {/* Badge / Announcement */}
      <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-400 mb-8 animate-pulse">
        <Activity className="h-3.5 w-3.5" />
        <span>Sri Lankan Public Services Digitalization Policy</span>
      </div>

      {/* Hero Heading */}
      <div className="text-center max-w-3xl space-y-4 mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight font-display">
          Modernizing Traffic Fine Payments in <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Sri Lanka</span>
        </h1>
        <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
          Settle your traffic fines instantly using our secure digital payment portal. Get SMS verification to retrieve your driver's license on the spot.
        </p>
      </div>

      {/* Main Choice Grid */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mb-20">
        {/* Quick Pay Fine Card */}
        <Link 
          to="/quick-pay" 
          className="group relative glass-panel glass-panel-hover transition-all-300 p-8 rounded-2xl flex flex-col justify-between overflow-hidden glow-primary"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all"></div>
          <div>
            <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 inline-block mb-6 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-display">Quick Pay</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Pay your fine instantly without logging in. Just enter the reference number and category identifier from your fine sheet.
            </p>
          </div>
          <div className="flex items-center text-sm font-semibold text-blue-400 group-hover:text-blue-300">
            <span>Pay Fine Now</span>
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Driver Portal Card */}
        <Link 
          to="/login" 
          className="group relative glass-panel glass-panel-hover transition-all-300 p-8 rounded-2xl flex flex-col justify-between overflow-hidden glow-emerald"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all"></div>
          <div>
            <div className="p-3 bg-emerald-600/20 rounded-xl text-emerald-400 inline-block mb-6 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <UserCheck className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-display">Driver Portal</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Sign in to manage your driving profile, review your full traffic fine history, track pending collections, and print official receipts.
            </p>
          </div>
          <div className="flex items-center text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">
            <span>Access Portal</span>
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* How it Works Section */}
      <div className="w-full max-w-4xl border-t border-slate-900 pt-16">
        <h2 className="text-center text-2xl font-bold text-slate-200 mb-12 font-display">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mx-auto text-lg font-bold">1</div>
            <h4 className="font-semibold text-white">Fine Sheet Issued</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Officer stops you and issues a ticket containing a unique fine reference number and category identifier.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mx-auto text-lg font-bold">2</div>
            <h4 className="font-semibold text-white">Enter Ticket Details</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use this web portal or the mobile app to enter the ticket information and pay securely.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mx-auto text-lg font-bold">3</div>
            <h4 className="font-semibold text-white">SMS & Release License</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              An instant SMS notification confirms your payment to the traffic police officer, enabling license release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
