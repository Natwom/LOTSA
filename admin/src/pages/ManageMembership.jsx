import { useEffect, useState } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { CreditCard, CheckCircle, XCircle, Clock, Search, AlertCircle, UserCheck, UserX } from 'lucide-react';

export default function ManageMembership() {
  const [cards, setCards] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'cards'
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    // Fetch both in parallel
    Promise.all([
      axios.get('/membership/all'),
      axios.get('/admin/payments/pending')
    ]).then(([cardsRes, pendingRes]) => {
      setCards(cardsRes.data || []);
      setPendingPayments(pendingRes.data || []);
      setLoading(false);
    }).catch((err) => {
      setError(err.response?.data?.detail || 'Failed to load data');
      setLoading(false);
    });
  };

  const handleApprove = async (paymentId) => {
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`/admin/payments/${paymentId}/approve`);
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Approval failed');
    }
  };

  const handleReject = async (paymentId) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`/admin/payments/${paymentId}/reject`);
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Rejection failed');
    }
  };

  const filteredCards = cards.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.card_number?.toLowerCase().includes(term) ||
      c.user?.profile?.full_name?.toLowerCase().includes(term) ||
      c.user?.profile?.admission_number?.toLowerCase().includes(term)
    );
  });

  const statusBadge = (card) => {
    if (!card.is_active) return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Inactive</span>;
    const isExpired = new Date(card.expiry_date) < new Date();
    if (isExpired) return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Expired</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
  };

  const cardColumns = [
    { key: 'card_number', label: 'Card Number', render: (val) => <span className="font-mono font-bold text-blue-600">{val}</span> },
    { key: 'user_id', label: 'Student Name', render: (_, row) => row.user?.profile?.full_name || 'Unknown' },
    { key: 'user_id', label: 'Admission No', render: (_, row) => row.user?.profile?.admission_number || 'Unknown' },
    { key: 'user_id', label: 'Course', render: (_, row) => row.user?.profile?.course || 'Unknown' },
    { key: 'amount_paid', label: 'Amount', render: (val) => `Ksh ${val}` },
    { key: 'is_active', label: 'Status', render: (_, row) => statusBadge(row) },
    { key: 'expiry_date', label: 'Expiry', render: (val) => <div className="flex items-center gap-1 text-gray-600"><Clock size={14} />{new Date(val).toLocaleDateString()}</div> },
  ];

  const pendingColumns = [
    { key: 'user_id', label: 'Student Name', render: (_, row) => row.user?.profile?.full_name || 'Unknown' },
    { key: 'user_id', label: 'Admission No', render: (_, row) => row.user?.profile?.admission_number || 'Unknown' },
    { key: 'user_id', label: 'Course', render: (_, row) => row.user?.profile?.course || 'Unknown' },
    { key: 'mpesa_receipt', label: 'M-Pesa Receipt', render: (val) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{val}</span> },
    { key: 'amount', label: 'Amount', render: (val) => <span className="font-semibold text-green-700">Ksh {val}</span> },
    { key: 'created_at', label: 'Submitted', render: (val) => new Date(val).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membership Management</h1>
          <p className="text-gray-500 mt-1">{cards.length} cards issued · {pendingPayments.length} pending approval</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Clock size={16} /> Pending ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <CreditCard size={16} /> All Cards ({cards.length})
          </button>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{cards.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Cards</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{cards.filter(c => c.is_active && new Date(c.expiry_date) > new Date()).length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{pendingPayments.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Pending Approval</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">Ksh {cards.reduce((sum, c) => sum + (c.amount_paid || 0), 0)}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</div>
        </div>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-yellow-50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={18} className="text-yellow-600" /> Payments Awaiting Approval
              </h2>
              <p className="text-sm text-gray-500 mt-1">Review M-Pesa receipts and approve to generate membership cards</p>
            </div>
            {pendingPayments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-3 text-green-300" />
                <p className="font-medium">No pending payments</p>
                <p className="text-sm">All payments have been processed</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                    <tr>
                      {pendingColumns.map((col) => (
                        <th key={col.key + col.label} className="px-4 py-3 text-left">{col.label}</th>
                      ))}
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        {pendingColumns.map((col) => (
                          <td key={col.key + col.label} className="px-4 py-3">
                            {col.render ? col.render(p[col.key], p) : p[col.key]}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                              title="Approve & Generate Card"
                            >
                              <UserCheck size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(p.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                              title="Reject Payment"
                            >
                              <UserX size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Cards Tab */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
          </div>
          <DataTable
            columns={cardColumns}
            data={filteredCards}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}