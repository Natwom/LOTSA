import { useEffect, useState } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { Filter, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [responding, setResponding] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    setLoading(true);
    axios.get('/admin/complaints', { params: filter !== 'all' ? { status: filter } : {} }).then((res) => {
      setComplaints(res.data);
      setLoading(false);
    });
  };

  const updateStatus = async (id, status) => {
    await axios.put(`/complaints/${id}/status`, { status });
    fetchComplaints();
  };

  const submitResponse = async (id) => {
    await axios.put(`/complaints/${id}/response`, { admin_response: response });
    setResponding(null);
    setResponse('');
    fetchComplaints();
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_review: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
  };

  const columns = [
    { key: 'title', label: 'Subject' },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <span className="capitalize text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{val}</span>,
    },
    {
      key: 'student_id',
      label: 'Submitted By',
      render: (_, row) => (row.is_anonymous ? <span className="text-gray-400 italic">Anonymous</span> : row.student?.profile?.full_name || 'Unknown'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[val]}`}>{val.replace('_', ' ')}</span>,
    },
    { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complaints & Suggestions</h1>
          <p className="text-gray-500 mt-1">Review and respond to student submissions</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'in_review', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); fetchComplaints(); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {responding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <MessageSquare size={18} /> Respond to Complaint
          </h3>
          <textarea
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
          />
          <div className="flex gap-2">
            <button onClick={() => submitResponse(responding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
              Send Response
            </button>
            <button onClick={() => setResponding(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={complaints}
        loading={loading}
        actions={(row) => (
          <>
            {row.status !== 'resolved' && (
              <>
                <button onClick={() => updateStatus(row.id, 'in_review')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Mark In Review">
                  <AlertTriangle size={16} />
                </button>
                <button onClick={() => updateStatus(row.id, 'resolved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark Resolved">
                  <CheckCircle size={16} />
                </button>
              </>
            )}
            <button onClick={() => { setResponding(row.id); setResponse(row.admin_response || ''); }} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Respond">
              <MessageSquare size={16} />
            </button>
          </>
        )}
      />
    </div>
  );
}