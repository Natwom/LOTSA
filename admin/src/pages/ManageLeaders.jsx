import { useEffect, useState } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { Plus, Upload, Trash2, Award, AlertCircle, CheckCircle, Loader2, Users } from 'lucide-react';

export default function ManageLeaders() {
  const [leaders, setLeaders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_id: '', position: '', bio: '', display_order: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaders();
    fetchUsers();
  }, []);

  const fetchLeaders = () => {
    setLoading(true);
    axios.get('/leaders?active_only=false').then((res) => {
      setLeaders(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const fetchUsers = () => {
    // Fetch ALL users (students + non-students) so leadership can include patrons
    axios.get('/auth/users').then((res) => setUsers(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const res = await axios.post('/leaders', form);
      if (selectedFile && res.data.id) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        await axios.post(`/leaders/${res.data.id}/upload-photo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setForm({ user_id: '', position: '', bio: '', display_order: 0 });
      setSelectedFile(null);
      setShowForm(false);
      setMessage('Leader added successfully!');
      fetchLeaders();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add leader. The user may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeLeader = async (id) => {
    if (!confirm('WARNING: This will PERMANENTLY delete this leader from the database. Continue?')) return;
    try {
      await axios.delete(`/leaders/${id}`);
      setMessage('Leader permanently deleted.');
      fetchLeaders();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete leader.');
    }
  };

  const columns = [
    {
      key: 'photo_url',
      label: 'Photo',
      render: (val) => val ? (
        <img src={val} alt="" className="w-12 h-12 rounded-full object-cover object-top" />
      ) : (
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400"><Award size={20} /></div>
      )
    },
    {
      key: 'user_id',
      label: 'Name',
      render: (_, row) => {
        // Non-students don't have profile, use user.full_name
        return row.user?.profile?.full_name || row.user?.full_name || 'Unknown'
      }
    },
    {
      key: 'user_id',
      label: 'Role',
      render: (_, row) => {
        const role = row.user?.role
        const isNonStudent = ['patron', 'deputy_patron', 'committee_member'].includes(role)
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold ${isNonStudent ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {isNonStudent ? 'Non-Student' : 'Student'}
          </span>
        )
      }
    },
    { key: 'position', label: 'Position' },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { key: 'display_order', label: 'Order' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Leaders</h1>
          <p className="text-gray-500 mt-1">Add and manage LOTSA leadership team (Students & Non-Students)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add Leader'}
        </button>
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

      {showForm && (
        <form onSubmit={handleSubmit} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 ${isSubmitting ? 'opacity-70 pointer-events-none' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
              <select
                required
                disabled={isSubmitting}
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              >
                <option value="">Choose a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.profile?.full_name || u.full_name || 'Unknown'} 
                    {u.profile?.admission_number ? ` (${u.profile.admission_number})` : ` [${u.role}]`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                <Users size={12} className="inline mr-1" />
                Both students and non-students (patrons, committee) can be assigned leadership roles.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                required
                disabled={isSubmitting}
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              >
                <option value="">Select position...</option>
                <option value="President">President</option>
                <option value="Secretary General">Secretary General</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Organizing Secretary">Organizing Secretary</option>
                <option value="Academic Rep">Academic Rep</option>
                <option value="Welfare Rep">Welfare Rep</option>
                <option value="Patron">Patron</option>
                <option value="Deputy Patron">Deputy Patron</option>
                <option value="Deputy President">Deputy President</option>
                <option value="High school representative">High school representative</option>
                <option value="Games Director">Games Director</option>
                <option value="Committee Member">Committee Member</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                disabled={isSubmitting}
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input
                type="file"
                accept="image/*"
                disabled={isSubmitting}
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
              />
              <p className="text-xs text-amber-600 mt-1">
                Tip: Use portrait-oriented photos (taller than wide) for best results. The frontend crops from the top down.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              rows={3}
              disabled={isSubmitting}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
              placeholder="Brief biography..."
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Adding...
              </>
            ) : (
              'Add Leader'
            )}
          </button>
        </form>
      )}

      <DataTable
        columns={columns}
        data={leaders}
        loading={loading}
        actions={(row) => (
          <button
            onClick={() => removeLeader(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Permanently Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      />
    </div>
  );
}