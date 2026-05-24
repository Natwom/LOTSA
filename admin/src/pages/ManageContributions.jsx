import { useEffect, useState } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { Plus, Calendar, DollarSign, CheckCircle, XCircle, Users, TrendingUp, Clock } from 'lucide-react';

export default function ManageContributions() {
  const [periods, setPeriods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [form, setForm] = useState({
    title: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 100,
    due_date: '',
  });

  useEffect(() => {
    fetchPeriods();
    fetchStats();
  }, []);

  const fetchPeriods = () => {
    setLoading(true);
    axios.get('/contributions/periods').then((res) => {
      setPeriods(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const fetchStats = () => {
    axios.get('/contributions/stats').then((res) => setStats(res.data));
  };

  const fetchPayments = (periodId) => {
    axios.get(`/contributions/periods/${periodId}/payments`).then((res) => {
      setPayments(res.data);
      setSelectedPeriod(periodId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/contributions/periods', {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null
      });
      setForm({ title: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: 100, due_date: '' });
      setShowForm(false);
      fetchPeriods();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create period');
    }
  };

  const verifyPayment = async (paymentId) => {
    try {
      await axios.put(`/contributions/payments/${paymentId}/verify`);
      fetchPayments(selectedPeriod);
      fetchStats();
    } catch (err) {
      alert('Verification failed');
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const periodColumns = [
    { key: 'title', label: 'Period' },
    {
      key: 'month',
      label: 'Month/Year',
      render: (val, row) => <span>{months[val - 1]} {row.year}</span>,
    },
    {
      key: 'amount',
      label: 'Amount (KES)',
      render: (val) => <span className="font-mono font-semibold">KES {val}</span>,
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'No due date',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Monthly Contributions</h1>
          <p className="text-gray-500 mt-1">Manage contribution periods and verify payments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Period'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><Calendar size={16} /> Total Periods</div>
            <div className="text-2xl font-bold">{stats.total_periods}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><Users size={16} /> Total Payments</div>
            <div className="text-2xl font-bold">{stats.total_payments}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><TrendingUp size={16} /> Collected (KES)</div>
            <div className="text-2xl font-bold text-green-600">KES {stats.total_collected_kes}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2"><Clock size={16} /> Pending</div>
            <div className="text-2xl font-bold text-amber-600">{stats.pending_verifications}</div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. May 2026 Contribution" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
              <input type="number" required min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700">
            Create Period
          </button>
        </form>
      )}

      <DataTable
        columns={periodColumns}
        data={periods}
        loading={loading}
        actions={(row) => (
          <button
            onClick={() => fetchPayments(row.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Payments"
          >
            <DollarSign size={16} />
          </button>
        )}
      />

      {selectedPeriod && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Payments for {periods.find(p => p.id === selectedPeriod)?.title}</h3>
            <button onClick={() => setSelectedPeriod(null)} className="text-gray-400 hover:text-gray-600">
              <XCircle size={20} />
            </button>
          </div>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Receipt</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{p.user?.email || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">ID: {p.user_id}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">KES {p.amount}</td>
                      <td className="px-4 py-3 text-sm capitalize">{p.payment_method}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.mpesa_receipt || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          p.status === 'completed' ? 'bg-green-100 text-green-700' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => verifyPayment(p.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Verify Payment"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}