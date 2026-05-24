import { useEffect, useState } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { Plus, Pin, Trash2, Edit3 } from 'lucide-react';

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', is_pinned: false });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    setLoading(true);
    axios.get('/announcements').then((res) => {
      setAnnouncements(res.data);
      setLoading(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/announcements', form);
    setForm({ title: '', content: '', category: 'general', is_pinned: false });
    setShowForm(false);
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    await axios.delete(`/announcements/${id}`);
    fetchAnnouncements();
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: (val) => <span className="capitalize text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{val}</span> },
    {
      key: 'is_pinned',
      label: 'Pinned',
      render: (val) => val ? <Pin size={16} className="text-blue-600" /> : <span className="text-gray-300">—</span>,
    },
    { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-500 mt-1">Manage and publish association announcements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="welfare">Welfare</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            Pin this announcement
          </label>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700">
            Publish Announcement
          </button>
        </form>
      )}

      <DataTable
        columns={columns}
        data={announcements}
        loading={loading}
        actions={(row) => (
          <>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => deleteAnnouncement(row.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      />
    </div>
  );
}