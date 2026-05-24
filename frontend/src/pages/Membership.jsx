import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, Clock, AlertCircle, RefreshCw, Hourglass } from 'lucide-react';

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
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isExpired = card && new Date(card.expiry_date) < new Date();
  const daysRemaining = card ? Math.ceil((new Date(card.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard size={32} /> Membership Card
        </h1>
        <p className="text-blue-100 mt-2">Your official LOTSA membership identification</p>
      </div>

      {message && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
          <CheckCircle size={20} /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* PENDING APPROVAL STATE */}
      {!card && pendingPayment && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <Hourglass size={64} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Submitted</h2>
          <p className="text-gray-500 mb-6">Your membership payment is awaiting admin approval. You'll receive your digital card once approved.</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md mx-auto text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">Ksh {pendingPayment.amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">M-Pesa Receipt:</span>
              <span className="font-mono font-semibold">{pendingPayment.mpesa_receipt}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Submitted:</span>
              <span className="font-semibold">{new Date(pendingPayment.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending Approval</span>
            </div>
          </div>
        </div>
      )}

      {/* NO CARD + NO PENDING → PAYMENT FORM */}
      {!card && !pendingPayment && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <CreditCard size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Get Your Membership Card</h2>
            <p className="text-gray-500">Pay Ksh 100 and submit your M-Pesa receipt. Admin will approve and generate your card.</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Card Benefits:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Vote in student elections</li>
              <li>✓ Access exclusive events</li>
              <li>✓ Official student identification</li>
              <li>✓ Valid for 1 year</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Amount:</strong> Ksh 100<br/>
              <strong>Paybill:</strong> 247247<br/>
              <strong>Account:</strong> Your Admission Number<br/>
              <strong>Valid for:</strong> 1 Year
            </p>
          </div>

          <form onSubmit={makePayment} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Transaction Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value)}
                placeholder="e.g., QJ7H9XYZ12"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">Enter the M-Pesa confirmation code from your SMS</p>
            </div>
            <button
              type="submit"
              disabled={paying}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {paying ? 'Submitting...' : 'Submit Payment (Ksh 100)'}
            </button>
          </form>
        </div>
      )}

      {/* ACTIVE CARD STATE */}
      {card && (
        <div className="space-y-6">
          {/* Digital Card */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">LOTUBAE Student Association</div>
                  <div className="text-2xl font-bold mt-1">MEMBERSHIP CARD</div>
                </div>
                <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
                  {card.is_active ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-blue-200 text-xs uppercase tracking-wider">Card Number</div>
                  <div className="text-xl font-mono font-bold tracking-wider">{card.card_number}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-blue-200 text-xs uppercase tracking-wider">Member Name</div>
                    <div className="font-semibold">{user?.profile?.full_name}</div>
                  </div>
                  <div>
                    <div className="text-blue-200 text-xs uppercase tracking-wider">Admission No</div>
                    <div className="font-semibold">{user?.profile?.admission_number}</div>
                  </div>
                  <div>
                    <div className="text-blue-200 text-xs uppercase tracking-wider">Course</div>
                    <div className="font-semibold">{user?.profile?.course}</div>
                  </div>
                  <div>
                    <div className="text-blue-200 text-xs uppercase tracking-wider">Year</div>
                    <div className="font-semibold">Year {user?.profile?.year_of_study}</div>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-white/20">
                  <div>
                    <div className="text-blue-200 text-xs uppercase tracking-wider">Valid Until</div>
                    <div className="font-semibold flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(card.expiry_date).toLocaleDateString()}
                      {isExpired && <span className="text-red-300 text-xs ml-2">(EXPIRED)</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {card.is_active && !isExpired ? (
                      <div className="flex items-center gap-1 text-green-300">
                        <CheckCircle size={16} /> Valid
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-300">
                        <AlertCircle size={16} /> {isExpired ? 'Expired' : 'Inactive'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Renewal Section */}
          {card.is_active && !isExpired && daysRemaining <= 30 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-orange-800 mb-2 flex items-center gap-2">
                <RefreshCw size={20} /> Renewal Available
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                Your card expires in {daysRemaining} days. Renew now to maintain uninterrupted access.
              </p>
              <button
                onClick={renewCard}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700"
              >
                Renew Card (Ksh 100)
              </button>
            </div>
          )}

          {/* Card Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Card Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Issue Date</div>
                <div className="font-medium">{new Date(card.issue_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Expiry Date</div>
                <div className="font-medium">{new Date(card.expiry_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Amount Paid</div>
                <div className="font-medium">Ksh {card.amount_paid}</div>
              </div>
              <div>
                <div className="text-gray-500">Payment Status</div>
                <div className="font-medium capitalize">{card.payment_status}</div>
              </div>
              {card.mpesa_receipt && (
                <div className="col-span-2">
                  <div className="text-gray-500">Receipt Number</div>
                  <div className="font-medium font-mono">{card.mpesa_receipt}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}