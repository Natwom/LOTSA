import { useEffect, useState } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { Search, Filter, UserCheck, UserX, Mail } from 'lucide-react';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    axios.get('/admin/students').then((res) => {
      setStudents(res.data);
      setLoading(false);
    });
  };

  const toggleStatus = async (studentId, currentStatus) => {
    await axios.put(`/admin/students/${studentId}/status?is_active=${!currentStatus}`);
    fetchStudents();
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.profile?.admission_number?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true : filter === 'active' ? s.is_active : !s.is_active;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    { key: 'profile.full_name', label: 'Name', render: (_, row) => row.profile?.full_name || 'N/A' },
    { key: 'profile.admission_number', label: 'Admission No', render: (_, row) => row.profile?.admission_number || 'N/A' },
    { key: 'email', label: 'Email' },
    { key: 'profile.course', label: 'Course', render: (_, row) => row.profile?.course || 'N/A' },
    { key: 'profile.year_of_study', label: 'Year', render: (_, row) => `Year ${row.profile?.year_of_study || '?'}` },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val ? 'Active' : 'Suspended'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
          <p className="text-gray-500 mt-1">{students.length} total students registered</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Students</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        loading={loading}
        actions={(row) => (
          <>
            <button
              onClick={() => toggleStatus(row.id, row.is_active)}
              className={`p-2 rounded-lg transition-colors ${row.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
              title={row.is_active ? 'Suspend' : 'Activate'}
            >
              {row.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
            </button>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Send Email">
              <Mail size={16} />
            </button>
          </>
        )}
      />
    </div>
  );
}