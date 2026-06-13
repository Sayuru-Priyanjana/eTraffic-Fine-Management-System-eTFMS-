import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, ShieldAlert, CheckCircle, Clock, CreditCard, LayoutDashboard, ChevronRight, X, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Settle Modal/Section State
  const [selectedFine, setSelectedFine] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      // ignore
    }
  }

  const driverId = user?.id || '';
  const username = user?.username || '';

  useEffect(() => {
    if (!localStorage.getItem('token') || !driverId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [finesRes, catRes] = await Promise.all([
          api.get(`/fines/driver/${driverId}`),
          api.get('/categories')
        ]);
        setFines(finesRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try re-logging in.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [driverId, navigate]);

  const handleOpenPayment = (fine) => {
    setSelectedFine(fine);
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setPaymentError('');
    setIsFlipped(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsPaying(true);
    setPaymentError('');

    // Mock validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setPaymentError('Invalid Card Number (must be 16 digits)');
      setIsPaying(false);
      return;
    }
    if (!expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
      setPaymentError('Invalid Expiry Date (MM/YY)');
      setIsPaying(false);
      return;
    }
    if (cvv.length < 3) {
      setPaymentError('Invalid CVV');
      setIsPaying(false);
      return;
    }

    try {
      const response = await api.post(`/fines/${selectedFine.id}/settle`);
      
      // Update state local fines list
      setFines(prev => prev.map(f => f.id === selectedFine.id ? response.data : f));
      
      // Redirect to payment success page
      navigate('/payment-success', { state: { fine: response.data, cardHolder } });
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === Number(catId));
    return cat ? cat.identifier.replace(/_/g, ' ') : `Category #${catId}`;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Stats calculation
  const totalFines = fines.length;
  const pendingFines = fines.filter(f => f.status === 'PENDING');
  const pendingCount = pendingFines.length;
  const pendingSum = pendingFines.reduce((acc, f) => acc + f.amount, 0);
  const settledCount = fines.filter(f => f.status === 'PAID').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-slate-400">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Driver Portal</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white font-display">My Fines Dashboard</h2>
        </div>

        {/* Profile Card */}
        <div className="glass-panel py-3 px-5 rounded-xl border border-slate-800 flex items-center space-x-4 self-start md:self-auto bg-slate-900/30">
          <div className="p-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <IdCard className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">License ID (User ID)</div>
            <div className="font-bold text-white tracking-wide">{driverId}</div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading driving records...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-sm max-w-md mx-auto text-center space-y-4">
          <ShieldAlert className="h-10 w-10 mx-auto" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-950 flex flex-col justify-between h-32 relative overflow-hidden bg-slate-900/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Infractions</span>
              <span className="text-4xl font-extrabold text-white font-display">{totalFines}</span>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-950 flex flex-col justify-between h-32 relative overflow-hidden glow-primary bg-slate-900/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Fine Balance</span>
              <div className="space-y-1">
                <span className="text-3xl font-black text-blue-400 font-display">LKR {pendingSum.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-semibold block">{pendingCount} Pending tickets</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-950 flex flex-col justify-between h-32 relative overflow-hidden glow-emerald bg-slate-900/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Infractions</span>
              <span className="text-4xl font-extrabold text-emerald-400 font-display">{settledCount}</span>
            </div>
          </div>

          {/* Fines Table/List */}
          <div className="glass-panel rounded-2xl border border-slate-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-900/50 flex justify-between items-center bg-slate-900/10">
              <h3 className="font-bold text-slate-200">Violation Ledger</h3>
              <span className="text-xs text-slate-500 font-semibold">{fines.length} total entries</span>
            </div>

            {fines.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <p className="font-medium text-slate-400">Perfect Record! No fines found.</p>
                <p className="text-xs text-slate-600 mt-1">Great job driving safely on Sri Lankan roads.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 text-xs text-slate-400 font-bold uppercase bg-slate-900/30">
                      <th className="px-6 py-3.5">Ref Number</th>
                      <th className="px-6 py-3.5">Violation</th>
                      <th className="px-6 py-3.5">Issued Date</th>
                      <th className="px-6 py-3.5">Due Date</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {fines.map((fine) => (
                      <tr key={fine.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white tracking-wide">{fine.referenceNumber}</td>
                        <td className="px-6 py-4 text-slate-300 font-medium">{getCategoryName(fine.categoryId)}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(fine.issueDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(fine.dueDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-200">LKR {fine.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            fine.status === 'PAID' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {fine.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {fine.status === 'PENDING' ? (
                            <button
                              onClick={() => handleOpenPayment(fine)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 mx-auto transition-all active:scale-95 shadow-md shadow-blue-600/10"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Pay Fine</span>
                            </button>
                          ) : (
                            <span className="text-slate-600 text-xs font-semibold flex items-center justify-center space-x-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-500">Settled</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Slide-out Checkout Drawer/Modal overlay */}
      {selectedFine && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-in fade-in zoom-in duration-300 relative">
            <button
              onClick={() => setSelectedFine(null)}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 border-b border-slate-900">
              <h3 className="text-xl font-bold text-white font-display">Pay Traffic Fine Ticket</h3>
              <p className="text-xs text-slate-400 mt-1">Ref: {selectedFine.referenceNumber}</p>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Credit Card Graphics Wrapper */}
              <div className="w-full max-w-[280px] h-[170px] mx-auto perspective-1000">
                <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* FRONT side of Card */}
                  <div className="absolute w-full h-full rounded-2xl backface-hidden p-5 text-white bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 shadow-2xl flex flex-col justify-between select-none">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold font-display">eTFMS Pay</span>
                        <div className="text-[10px] text-slate-400">Official Portal</div>
                      </div>
                      <div className="w-9 h-6 bg-amber-400/20 border border-amber-400/30 rounded-md"></div>
                    </div>

                    <div className="text-base font-bold tracking-widest text-slate-100 font-mono py-1.5">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Card Holder</span>
                        <span className="text-xs font-semibold block uppercase max-w-[130px] truncate">{cardHolder || 'Your Name'}</span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Expires</span>
                        <span className="text-xs font-semibold block">{expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK side of Card */}
                  <div className="absolute w-full h-full rounded-2xl backface-hidden rotate-y-180 p-5 text-white bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 shadow-2xl flex flex-col justify-between select-none">
                    <div className="w-full h-9 bg-slate-950 -mx-5 mt-1"></div>
                    <div className="space-y-2">
                      <div className="flex justify-end pr-3 text-[8px] text-slate-400 uppercase tracking-wider">CVV</div>
                      <div className="flex items-center justify-between bg-white text-slate-900 px-2.5 py-1 rounded font-mono text-sm font-semibold">
                        <span className="text-[10px] text-slate-300">xxxx xxxx xxxx</span>
                        <span>{cvv || '•••'}</span>
                      </div>
                    </div>
                    <div className="text-[7px] text-slate-500 text-center leading-none mb-1">
                      This is a secure mock payment card simulation.
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {paymentError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
                    {paymentError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength="19"
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength="5"
                      placeholder="MM/YY"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength="3"
                      placeholder="123"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                    />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center mt-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Amount</span>
                  <span className="text-xl font-black text-blue-400">LKR {selectedFine.amount.toLocaleString()}.00</span>
                </div>

                <button
                  type="submit"
                  disabled={isPaying}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-6 shadow-lg shadow-emerald-600/20"
                >
                  {isPaying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Paying LKR {selectedFine.amount.toLocaleString()}...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Confirm & Settle Payment</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSS styling in react context for 3d flip card */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
