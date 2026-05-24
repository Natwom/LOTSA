import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { DollarSign, CheckCircle, Clock, AlertCircle, Calendar, CreditCard } from 'lucide-react';

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

  useEffect(() => {
    fetchStatus();
    fetchHistory();
  }, []);

  const fetchStatus = () => {
    axios.get('/contributions/my-status').then(res => {
      setStatus(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const fetchHistory = () => {
    axios.get('/contributions/my-payments').then(res => setHistory(res.data));
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

  const getStatusIcon = (paymentStatus, verified) => {
    if (paymentStatus === 'completed' || verified) return <CheckCircle size={20} className="text-green-500" />;
    if (paymentStatus === 'pending') return <Clock size={20} className="text-amber-500" />;
    return <AlertCircle size={20} className="text-red-400" />;
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Monthly Contributions</h1>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Active Contribution Periods</h2>
        {status.length === 0 && <p className="text-gray-500">No active contribution periods</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {status.map(item => (
            <div key={item.period.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{item.period.title}</h3>
                  <p className="text-sm text-gray-500">{item.period.month}/{item.period.year} • KES {item.period.amount}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  {getStatusIcon(item.payment_status, item.verified)}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium capitalize ${
                    item.verified ? 'text-green-600' :
                    item.payment_status === 'pending' ? 'text-amber-600' :
                    'text-red-500'
                  }`}>
                    {item.verified ? 'Verified' : item.payment_status === 'unpaid' ? 'Unpaid' : item.payment_status}
                  </span>
                </div>
                {item.paid_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Paid</span>
                    <span className="text-gray-700">{new Date(item.paid_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {!item.verified && item.payment_status !== 'pending' && (
                <button
                  onClick={() => { setSelectedPeriod(item.period); setShowPayForm(true); setPayForm({...payForm, amount: item.period.amount}); }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} /> Pay Now
                </button>
              )}
              {item.payment_status === 'pending' && (
                <div className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium text-center">
                  Awaiting Verification
                </div>
              )}
              {item.verified && (
                <div className="w-full py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Paid & Verified
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Payment History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No payment history</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Period</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{p.period?.title || 'Unknown'}</td>
                      <td className="px-6 py-3 text-sm font-mono">KES {p.amount}</td>
                      <td className="px-6 py-3 text-sm capitalize">{p.payment_method}</td>
                      <td className="px-6 py-3 text-sm font-mono text-gray-600">{p.mpesa_receipt || '-'}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{new Date(p.paid_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showPayForm && selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Pay Contribution</h3>
            <p className="text-sm text-gray-500">{selectedPeriod.title} • KES {selectedPeriod.amount}</p>
            
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={payForm.payment_method}
                  onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Receipt / Transaction Code</label>
                <input
                  type="text"
                  required
                  value={payForm.mpesa_receipt}
                  onChange={(e) => setPayForm({ ...payForm, mpesa_receipt: e.target.value })}
                  placeholder="e.g. QK7X9Y2Z"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayForm(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
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