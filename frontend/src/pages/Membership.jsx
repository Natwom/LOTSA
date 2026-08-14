import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, CheckCircle, Clock, AlertCircle, RefreshCw, 
  Hourglass, Shield, Sparkles, QrCode, Calendar, Wallet 
} from 'lucide-react';

export default function Membership() {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [mpesaCode, setMpesaCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/membership/my-card'),
      axios.get('/membership/my-payment')
    ]).then(([cardRes, paymentRes]) => {
      setCard(cardRes.data);
      setPendingPayment(paymentRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const makePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post('/membership/pay', {
        amount: 100,
        payment_method: 'mpesa',
        mpesa_receipt: mpesaCode || undefined
      });
      setMessage(res.data.message);
      setMpesaCode('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed');
    }
    setPaying(false);
  };

  const renewCard = async () => {
    if (!card) return;
    try {
      const res = await axios.post(`/membership/${card.id}/renew`);
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Renewal failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const isExpired = card && new Date(card.expiry_date) < new Date();
  const daysRemaining = card ? Math.ceil((new Date(card.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <CreditCard size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Membership Card</h1>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            Your official LOTSA identification. Unlock voting, exclusive events, and student privileges.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-fade-in">
          <CheckCircle size={20} className="flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-fade-in">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* PENDING */}
      {!card && pendingPayment && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Hourglass size={36} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Submitted</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Your membership payment is awaiting admin approval. You'll receive your digital card once verified.</p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-w-md mx-auto text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-gray-900">Ksh {pendingPayment.amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">M-Pesa Receipt</span>
              <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border">{pendingPayment.mpesa_receipt}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Submitted</span>
              <span className="font-medium text-gray-700">{new Date(pendingPayment.created_at).toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                <Clock size={12} /> Pending Approval
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NO CARD */}
      {!card && !pendingPayment && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={36} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Your Membership Card</h2>
            <p className="text-gray-500 max-w-md mx-auto">Pay Ksh 100 and submit your M-Pesa receipt. Admin will approve and generate your digital card.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
              <Shield size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-800">Vote in Elections</p>
                <p className="text-xs text-blue-600 mt-0.5">Shape the future of LOTSA</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-start gap-3">
              <Calendar size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-purple-800">Exclusive Events</p>
                <p className="text-xs text-purple-600 mt-0.5">Members-only gatherings</p>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-start gap-3">
              <QrCode size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Digital ID Card</p>
                <p className="text-xs text-emerald-600 mt-0.5">Official student identification</p>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-start gap-3">
              <Wallet size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-800">Valid for 1 Year</p>
                <p className="text-xs text-orange-600 mt-0.5">Annual renewal required</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><Wallet size={16} /> Payment Instructions</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-amber-700">
              <div><span className="font-semibold">Amount:</span> Ksh 100</div>
              <div><span className="font-semibold">Paybill:</span> 400200</div>
              <div><span className="font-semibold">Account:</span> 1092275</div>
              <div><span className="font-semibold">Valid for:</span> 1 Year</div>
            </div>
          </div>

          <form onSubmit={makePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">M-Pesa Transaction Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value)}
                placeholder="e.g., QJ7H9XYZ12"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none uppercase font-mono text-sm transition-all"
              />
              <p className="text-xs text-gray-400 mt-1.5">Enter the M-Pesa confirmation code from your SMS</p>
            </div>
            <button
              type="submit"
              disabled={paying}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100 active:scale-[0.99]"
            >
              {paying ? 'Submitting Payment...' : 'Submit Payment (Ksh 100)'}
            </button>
          </form>
        </div>
      )}

      {/* ACTIVE CARD */}
      {card && (
        <div className="space-y-6">
          {/* Digital Card */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <div className="text-blue-200 text-xs font-bold uppercase tracking-[0.2em]">LOTUBAE Student Association</div>
                  <div className="text-2xl font-bold mt-1 tracking-tight">MEMBERSHIP CARD</div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 ${
                  card.is_active && !isExpired ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'
                }`}>
                  {card.is_active && !isExpired ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-blue-200 text-[10px] uppercase tracking-[0.2em] font-medium">Card Number</div>
                  <div className="text-2xl font-mono font-bold tracking-widest mt-0.5">{card.card_number}</div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <div className="text-blue-200 text-[10px] uppercase tracking-[0.2em] font-medium">Member Name</div>
                    <div className="font-semibold text-sm mt-0.5">{user?.profile?.full_name}</div>
                  </div>
                  <div>
                    <div className="text-blue-200 text-[10px] uppercase tracking-[0.2em] font-medium">Admission No</div>
                    <div className="font-semibold text-sm mt-0.5">{user?.profile?.admission_number}</div>
                  </div>
                  <div>
                    <div className="text-blue-200 text-[10px] uppercase tracking-[0.2em] font-medium">Course</div>
                    <div className="font-semibold text-sm mt-0.5">{user?.profile?.course}</div>
                  </div>
                  <div>
                    <div className="text-blue-200 text-[10px] uppercase tracking-[0.2em] font-medium">Year</div>
                    <div className="font-semibold text-sm mt-0.5">Year {user?.profile?.year_of_study}</div>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-5 border-t border-white/15">
                  <div>
                    <div className="text-blue-200 text-[10px] uppercase tracking-[0.2em] font-medium">Valid Until</div>
                    <div className="font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(card.expiry_date).toLocaleDateString()}
                      {isExpired && <span className="text-red-300 text-xs font-bold ml-1">(EXPIRED)</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {card.is_active && !isExpired ? (
                      <div className="flex items-center gap-1.5 text-green-300 text-sm font-bold">
                        <CheckCircle size={16} /> Valid
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-300 text-sm font-bold">
                        <AlertCircle size={16} /> {isExpired ? 'Expired' : 'Inactive'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Renewal Banner */}
          {card.is_active && !isExpired && daysRemaining <= 30 && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <RefreshCw size={24} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-800">Renewal Available</h3>
                <p className="text-sm text-orange-600 mt-0.5">Your card expires in <span className="font-bold">{daysRemaining} days</span>. Renew now to maintain uninterrupted access.</p>
              </div>
              <button
                onClick={renewCard}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-100 flex-shrink-0"
              >
                Renew (Ksh 100)
              </button>
            </div>
          )}

          {/* Card Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Card Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Issue Date</div>
                <div className="font-semibold text-gray-900">{new Date(card.issue_date).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Expiry Date</div>
                <div className="font-semibold text-gray-900">{new Date(card.expiry_date).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Amount Paid</div>
                <div className="font-semibold text-gray-900">Ksh {card.amount_paid}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Status</div>
                <div className="font-semibold capitalize text-gray-900">{card.payment_status}</div>
              </div>
              {card.mpesa_receipt && (
                <div className="col-span-2 md:col-span-4 bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Receipt Number</div>
                  <div className="font-mono font-semibold text-gray-900">{card.mpesa_receipt}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
