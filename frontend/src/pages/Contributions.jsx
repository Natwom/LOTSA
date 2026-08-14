import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { 
  DollarSign, CheckCircle, Clock, AlertCircle, Calendar, 
  CreditCard, Search, TrendingUp, Wallet, Receipt, X 
} from 'lucide-react';

export default function Contributions() {
  const [status, setStatus] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payForm, setPayForm] = useState({
    amount: '',
    payment_method: 'mpesa',
    mpesa_receipt: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, []);

  const fetchStatus = () => {
    setLoading(true);
    axios.get('/contributions/my-status').then(res => {
      setStatus(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const fetchHistory = () => {
    axios.get('/contributions/my-payments').then(res => setHistory(res.data || []));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/contributions/pay', {
        period_id: selectedPeriod.id,
        amount: parseInt(payForm.amount),
        payment_method: payForm.payment_method,
        mpesa_receipt: payForm.mpesa_receipt,
      });
      setShowPayForm(false);
      setPayForm({ amount: '', payment_method: 'mpesa', mpesa_receipt: '' });
      setSelectedPeriod(null);
      fetchStatus();
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.detail || 'Payment submission failed');
    }
  };

  const getStatusBadge = (item) => {
    if (item.verified) return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
        <CheckCircle size={11} /> Verified
      </span>
    );
    if (item.payment_status === 'pending') return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
        <Clock size={11} /> Pending
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">
        <AlertCircle size={11} /> Unpaid
      </span>
    );
  };

  const filteredStatus = status.filter(item => 
    !searchQuery || item.period?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Wallet size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Monthly Contributions</h1>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            Track your contribution status, make payments, and view your complete payment history.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{status.filter(s => s.verified).length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Paid & Verified</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock size={24} className="text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{status.filter(s => s.payment_status === 'pending').length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{status.filter(s => s.payment_status === 'unpaid').length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Unpaid</div>
          </div>
        </div>
      </div>

      {/* Active Periods */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" /> Active Contribution Periods
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search periods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm"
            />
          </div>
        </div>

        {filteredStatus.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Wallet size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No active contribution periods</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStatus.map(item => (
              <div key={item.period.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.period.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{item.period.month}/{item.period.year} • <span className="font-semibold text-gray-700">KES {item.period.amount}</span></p>
                  </div>
                  {getStatusBadge(item)}
                </div>

                {item.paid_at && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg">
                    <Calendar size={12} /> Paid on {new Date(item.paid_at).toLocaleDateString()}
                  </div>
                )}

                {!item.verified && item.payment_status !== 'pending' && (
                  <button
                    onClick={() => { setSelectedPeriod(item.period); setShowPayForm(true); setPayForm({...payForm, amount: item.period.amount}); }}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={15} /> Pay Now
                  </button>
                )}
                {item.payment_status === 'pending' && (
                  <div className="w-full py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold text-center border border-amber-200 flex items-center justify-center gap-2">
                    <Clock size={15} /> Awaiting Verification
                  </div>
                )}
                {item.verified && (
                  <div className="w-full py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-bold text-center border border-green-200 flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Paid & Verified
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Receipt size={20} className="text-slate-600" /> Payment History
        </h2>
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Receipt size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No payment history yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{p.period?.title || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm font-mono font-semibold">KES {p.amount}</td>
                      <td className="px-6 py-4 text-sm capitalize text-gray-600">{p.payment_method}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500 bg-gray-50 rounded-lg">{p.mpesa_receipt || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.paid_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {showPayForm && selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pay Contribution</h3>
                <p className="text-sm text-gray-500">{selectedPeriod.title} • KES {selectedPeriod.amount}</p>
              </div>
              <button onClick={() => setShowPayForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Payment Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <Wallet size={16} /> M-Pesa Payment Instructions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-amber-700">
                <div><span className="font-semibold">Paybill:</span> 400200</div>
                <div><span className="font-semibold">Account:</span> 1092275</div>
                <div><span className="font-semibold">Amount:</span> KES {selectedPeriod.amount}</div>
                <div><span className="font-semibold">Period:</span> {selectedPeriod.title}</div>
              </div>
              <p className="text-xs text-amber-600 mt-2">Use these exact details for every contribution payment.</p>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount (KES)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Payment Method</label>
                <select
                  value={payForm.payment_method}
                  onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Transaction Code</label>
                <input
                  type="text"
                  required
                  value={payForm.mpesa_receipt}
                  onChange={(e) => setPayForm({ ...payForm, mpesa_receipt: e.target.value })}
                  placeholder="e.g. QK7X9Y2Z"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-mono uppercase"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayForm(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
