import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, Printer, ArrowRight, Home, LayoutDashboard, MessageSquare } from 'lucide-react';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract fine state passed from payment screen
  const { fine, cardHolder } = location.state || {};

  if (!fine) {
    // If someone accesses the page directly without checking out, redirect home
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldCheck className="h-12 w-12 text-slate-700 mx-auto" />
        <h3 className="text-xl font-bold text-white">No active transaction</h3>
        <Link to="/" className="text-blue-400 hover:underline text-sm font-semibold">
          Return to Home
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 space-y-8 print:py-0 print:max-w-full">
      {/* Visual Success Header */}
      <div className="text-center space-y-4 print:hidden">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 glow-emerald animate-bounce">
          <Check className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-white font-display">Payment Successful!</h2>
          <p className="text-sm text-slate-400">Your fine ticket has been settled in full.</p>
        </div>
      </div>

      {/* Official Receipt Card */}
      <div className="glass-panel rounded-2xl border border-slate-900 overflow-hidden shadow-2xl bg-slate-900/10 print:border-slate-300 print:bg-white print:text-black">
        {/* Receipt Header */}
        <div className="px-6 py-5 border-b border-slate-900 bg-slate-950 flex justify-between items-center print:border-slate-350 print:bg-slate-100">
          <div className="space-y-0.5">
            <span className="font-extrabold text-white print:text-slate-900 tracking-wider text-base font-display">OFFICIAL RECEIPT</span>
            <div className="text-[10px] text-slate-500 font-semibold print:text-slate-600">Sri Lanka Police Department</div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600">
            <div>Date: {new Date(fine.issueDate).toLocaleDateString()}</div>
            <div className="font-mono text-[10px] text-slate-500 print:text-slate-600">Txn: #{Math.floor(10000000 + Math.random() * 90000000)}</div>
          </div>
        </div>

        {/* Receipt Details Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-y-4 text-sm print:text-xs">
            <div>
              <span className="text-xs text-slate-500 print:text-slate-600 block mb-0.5">Fine Reference</span>
              <span className="font-mono font-bold text-white print:text-slate-900 text-sm">{fine.referenceNumber}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 print:text-slate-600 block mb-0.5">License plate / Driver ID</span>
              <span className="font-semibold text-slate-300 print:text-slate-800">{fine.driverId}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 print:text-slate-600 block mb-0.5">Payment Method</span>
              <span className="text-slate-300 print:text-slate-850">Mock Card (Name: {cardHolder || 'N/A'})</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 print:text-slate-600 block mb-0.5">Settlement Status</span>
              <span className="text-emerald-400 font-bold uppercase print:text-emerald-600">FULLY SETTLED</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-850 pt-4 flex justify-between items-center print:border-slate-300">
            <span className="text-sm font-bold text-slate-400 print:text-slate-700 uppercase tracking-wide">Amount Settled</span>
            <span className="text-2xl font-black text-blue-400 font-display print:text-slate-900">LKR {fine.amount.toLocaleString()}.00</span>
          </div>

          {/* SMS Notification Banner */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start space-x-3 text-slate-300 print:border-slate-300 print:bg-slate-50 print:text-slate-800">
            <MessageSquare className="h-5 w-5 text-blue-400 shrink-0 mt-0.5 print:text-slate-600" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-blue-400 print:text-slate-950">Officer Cleared via SMS</p>
              <p className="text-slate-400 print:text-slate-700 leading-relaxed">
                An automated SMS confirmation has been dispatched to traffic officer <span className="font-mono text-white print:text-slate-950">{fine.officerId}</span>. You are authorized to present this receipt to retrieve your driver's license.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
        <button
          onClick={handlePrint}
          className="px-5 py-3 border border-slate-800 hover:bg-slate-900/50 text-slate-300 font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all hover:border-slate-700"
        >
          <Printer className="h-4 w-4" />
          <span>Print Receipt</span>
        </button>

        {localStorage.getItem('token') ? (
          <Link
            to="/dashboard"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>
        ) : (
          <Link
            to="/"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        )}
      </div>
    </div>
  );
}
