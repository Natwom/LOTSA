import { useEffect, useState } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { 
  Plus, Calendar, MapPin, Trash2, Users, ArrowLeft, 
  Search, CheckCircle, XCircle, Download, Loader2,
  Phone, Mail, GraduationCap
} from 'lucide-react';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', location: '', event_date: '', category: 'meeting',
  });

  // Attendee viewer state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState(null);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAttended, setFilterAttended] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    axios.get('/events/admin/all').then((res) => {
      setEvents(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // >>> FIX: trailing slash "/" prevents 307 redirect
      await axios.post('/events/', { 
        ...form, 
        event_date: new Date(form.event_date).toISOString() 
      });
      setForm({ title: '', description: '', location: '', event_date: '', category: 'meeting' });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.error('Create event error:', err);
      alert(err.response?.data?.detail || 'Failed to create event. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    await axios.delete(`/events/${id}`);
    fetchEvents();
  };

  // ==================== ATTENDEE FUNCTIONS ====================

  const viewAttendees = async (eventId) => {
    setAttendeeLoading(true);
    setSelectedEvent(eventId);
    try {
      const res = await axios.get(`/events/admin/${eventId}/attendees`);
      setAttendees(res.data);
    } catch (err) {
      console.log('Fetch attendees error:', err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  const handleCheckIn = async (registrationId) => {
    try {
      await axios.put(`/events/admin/${selectedEvent}/attendees/${registrationId}/check-in`);
      const res = await axios.get(`/events/admin/${selectedEvent}/attendees`);
      setAttendees(res.data);
    } catch (err) {
      console.log('Check-in error:', err);
    }
  };

  const handleUncheck = async (registrationId) => {
    try {
      await axios.put(`/events/admin/${selectedEvent}/attendees/${registrationId}/uncheck`);
      const res = await axios.get(`/events/admin/${selectedEvent}/attendees`);
      setAttendees(res.data);
    } catch (err) {
      console.log('Uncheck error:', err);
    }
  };

  const handleRemove = async (registrationId) => {
    if (!confirm('Remove this attendee from the event?')) return;
    try {
      await axios.delete(`/events/admin/${selectedEvent}/attendees/${registrationId}`);
      const res = await axios.get(`/events/admin/${selectedEvent}/attendees`);
      setAttendees(res.data);
    } catch (err) {
      console.log('Remove error:', err);
    }
  };

  const exportCSV = () => {
    if (!attendees) return;
    const headers = ['Name', 'Admission No.', 'Course', 'Year', 'Email', 'Phone', 'Registered At', 'Attended'];
    const rows = attendees.attendees.map(a => [
      a.student.full_name,
      a.student.admission_number,
      a.student.course,
      a.student.year_of_study,
      a.student.email,
      a.student.phone_number || '',
      new Date(a.registered_at).toLocaleString(),
      a.attended ? 'Yes' : 'No'
    ]);
    const csv = [headers, ...rows].map(r => r.map(f => `"${f}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${attendees.event.title.replace(/\s+/g, '_')}_attendees.csv`;
    a.click();
  };

  // ==================== RENDER: ATTENDEE DETAIL VIEW ====================

  if (selectedEvent && attendees) {
    const filteredAttendees = attendees.attendees.filter(a => {
      if (filterAttended === 'attended') return a.attended;
      if (filterAttended === 'pending') return !a.attended;
      return true;
    }).filter(a => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        a.student.full_name.toLowerCase().includes(term) ||
        a.student.admission_number.toLowerCase().includes(term) ||
        a.student.email.toLowerCase().includes(term) ||
        a.student.course.toLowerCase().includes(term)
      );
    });

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setSelectedEvent(null); setAttendees(null); setSearchTerm(''); setFilterAttended('all'); }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{attendees.event.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
              <Calendar size={14} /> {new Date(attendees.event.event_date).toLocaleString()}
              <MapPin size={14} className="ml-2" /> {attendees.event.location}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 text-center">
            <Users size={24} className="mx-auto text-primary-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{attendees.stats.total_registered}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Registered</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <CheckCircle size={24} className="mx-auto text-emerald-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{attendees.stats.total_attended}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Checked In</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <GraduationCap size={24} className="mx-auto text-purple-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{attendees.stats.attendance_rate}%</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Attendance Rate</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full md:w-auto">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, admission no., course..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={filterAttended}
                onChange={e => setFilterAttended(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm"
              >
                <option value="all">All Attendees</option>
                <option value="attended">Checked In</option>
                <option value="pending">Not Checked In</option>
              </select>
              <button 
                onClick={exportCSV}
                className="px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-all flex items-center gap-2"
              >
                <Download size={16} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {attendeeLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary-500" />
            </div>
          ) : filteredAttendees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admission No.</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((a) => (
                    <tr 
                      key={a.registration_id} 
                      className={`border-b border-gray-50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors ${a.attended ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {a.student.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{a.student.full_name}</p>
                            <p className="text-xs text-gray-500">Year {a.student.year_of_study}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-border px-2 py-1 rounded-md">
                          {a.student.admission_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {a.student.course}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Mail size={12} /> {a.student.email}
                          </p>
                          {a.student.phone_number && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Phone size={12} /> {a.student.phone_number}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(a.registered_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {a.attended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                            <CheckCircle size={12} /> Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                            <XCircle size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.attended ? (
                            <button
                              onClick={() => handleUncheck(a.registration_id)}
                              className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                              title="Undo check-in"
                            >
                              <XCircle size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCheckIn(a.registration_id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              title="Check in"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(a.registration_id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove attendee"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No attendees found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== RENDER: EVENTS LIST ====================

  const columns = [
    { key: 'title', label: 'Event Title' },
    {
      key: 'category',
      label: 'Category',
      render: (val) => (
        <span className="capitalize text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          {val}
        </span>
      ),
    },
    {
      key: 'event_date',
      label: 'Date & Time',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar size={14} />
          {new Date(val).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin size={14} />
          {val || 'TBA'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
          <p className="text-gray-500 mt-1">Create and manage association events</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="meeting">Meeting</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="academic">Academic</option>
                <option value="election">Election</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input type="datetime-local" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      )}

      <DataTable
        columns={columns}
        data={events}
        loading={loading}
        actions={(row) => (
          <>
            <button 
              onClick={() => viewAttendees(row.id)} 
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
              title="View Attendees"
            >
              <Users size={16} />
            </button>
            <button onClick={() => deleteEvent(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
          </>
        )}
      />
    </div>
  );
}