import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, Calendar, User, UserCheck, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export default function QuickPay() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [fineDetails, setFineDetails] = useState(null);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Fetch fine categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load fine categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchError('');
    setFineDetails(null);

    try {
      const response = await api.get('/fines/public/lookup', {
        params: { referenceNumber: referenceNumber.trim(), categoryId }
      });
      setFineDetails(response.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Fine not found. Please verify the Reference Number and Category.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e) => {
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
      const response = await api.post('/fines/public/settle', null, {
        params: { referenceNumber: fineDetails.referenceNumber, categoryId: fineDetails.categoryId }
      });
      
      // Navigate to payment success page, passing the fine details
      navigate('/payment-success', { state: { fine: response.data, cardHolder } });
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
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

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === Number(id));
    return cat ? cat.identifier.replace(/_/g, ' ') : `Category #${id}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-display text-white mb-2">On-The-Spot Fine Payment</h2>
        <p className="text-sm text-slate-400">
          Search and pay traffic fines instantly. All payments are encrypted and processed securely.
        </p>
      </div>

      {!fineDetails ? (
        /* Fine Search Form */
        <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl glow-primary">
          <form onSubmit={handleSearch} className="space-y-6">
            {searchError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-start space-x-2">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fine Reference Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. FIN-A1B2C3D4"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-600 transition-colors uppercase"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
                <Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fine Category</label>
              <select
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-colors"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select fine category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.identifier.replace(/_/g, ' ')} - LKR {cat.amount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Searching ticket...</span>
                </>
              ) : (
                <span>Search Fine Ticket</span>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Fine Details & Payment Section */
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Fine Ticket Details */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fine Ticket Details</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                fineDetails.status === 'PAID' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {fineDetails.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Reference Number</span>
                <span className="font-bold text-white tracking-wide">{fineDetails.referenceNumber}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Driver ID (License)</span>
                <span className="font-semibold text-slate-300">{fineDetails.driverId}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-500 block mb-1">Category & Violation</span>
                <span className="font-medium text-slate-300">{getCategoryName(fineDetails.categoryId)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Issued Date</span>
                <span className="text-slate-300">{new Date(fineDetails.issueDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Due Date</span>
                <span className="text-slate-300">{new Date(fineDetails.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">Total Settlement Due</span>
              <span className="text-2xl font-black text-blue-400 font-display">LKR {fineDetails.amount.toLocaleString()}.00</span>
            </div>

            {fineDetails.status === 'PAID' ? (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center space-x-3 text-emerald-400 text-xs">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p>This fine is fully settled. The officer has been notified via SMS and you may retrieve your physical license.</p>
              </div>
            ) : null}

            <button
              onClick={() => setFineDetails(null)}
              className="w-full border border-slate-800 hover:bg-slate-900/50 text-slate-400 text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              Search Another Fine
            </button>
          </div>

          {fineDetails.status === 'PENDING' && (
            /* Card Payment Gateway with Card Flip Animation */
            <div className="space-y-6">
              {/* Credit Card Graphics Wrapper */}
              <div className="w-full max-w-[320px] h-[190px] mx-auto perspective-1000">
                <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* FRONT side of Card */}
                  <div className="absolute w-full h-full rounded-2xl backface-hidden p-6 text-white bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 shadow-2xl flex flex-col justify-between select-none">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold font-display">eTFMS Pay</span>
                        <div className="text-xs text-slate-400">Official Portal</div>
                      </div>
                      <div className="w-10 h-7 bg-amber-400/20 border border-amber-400/30 rounded-md"></div>
                    </div>

                    <div className="text-lg font-bold tracking-widest text-slate-100 font-mono py-2">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Card Holder</span>
                        <span className="text-xs font-semibold block uppercase max-w-[150px] truncate">{cardHolder || 'Your Full Name'}</span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Expires</span>
                        <span className="text-xs font-semibold block">{expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK side of Card */}
                  <div className="absolute w-full h-full rounded-2xl backface-hidden rotate-y-180 p-6 text-white bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 shadow-2xl flex flex-col justify-between select-none">
                    <div className="w-full h-10 bg-slate-950 -mx-6 mt-2"></div>
                    <div className="space-y-2">
                      <div className="flex justify-end pr-4 text-[9px] text-slate-400 uppercase tracking-wider">CVV</div>
                      <div className="flex items-center justify-between bg-white text-slate-900 px-3 py-1.5 rounded font-mono text-sm font-semibold">
                        <span className="text-xs text-slate-300">xxxx xxxx xxxx</span>
                        <span>{cvv || '•••'}</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-slate-500 text-center leading-tight">
                      This is a secure mock payment card simulation for testing Sri Lanka Police fine collection.
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment inputs form */}
              <div className="glass-panel p-6 rounded-2xl shadow-xl border border-slate-850">
                <form onSubmit={handlePayment} className="space-y-4">
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-700"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                        onFocus={() => setIsFlipped(true)}
                        onBlur={() => setIsFlipped(false)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-6 shadow-lg shadow-emerald-600/20"
                  >
                    {isPaying ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing LKR {fineDetails.amount.toLocaleString()}...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Settle Fine Payment Now</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
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
