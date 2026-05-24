import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { 
  Download, Users, Calendar, Vote, AlertCircle, TrendingUp,
  FileText, Loader2, CheckCircle, FileSpreadsheet 
} from 'lucide-react';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    axios.get('/admin/dashboard/stats').then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Download helper: converts JSON data to CSV and triggers download
  const downloadCSV = (filename, data) => {
    // Flatten nested objects for CSV
    const flattenObject = (obj, prefix = '') => {
      let result = {};
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          result[prefix + key] = '';
        } else if (Array.isArray(obj[key])) {
          result[prefix + key] = `[${obj[key].length} items]`;
        } else if (typeof obj[key] === 'object' && !(obj[key] instanceof Date)) {
          const nested = flattenObject(obj[key], prefix + key + '_');
          result = { ...result, ...nested };
        } else {
          result[prefix + key] = obj[key];
        }
      }
      return result;
    };

    // If data has a known array property, use that; otherwise wrap
    let rows = [];
    if (data.students) rows = data.students;
    else if (data.events) rows = data.events;
    else if (data.elections) rows = data.elections;
    else if (data.complaints) rows = data.complaints;
    else rows = [data];

    if (rows.length === 0) {
      alert('No data available for this report');
      return;
    }

    const flatRows = rows.map(r => flattenObject(r));
    const headers = Object.keys(flatRows[0]);
    const csvRows = [
      headers.join(','),
      ...flatRows.map(row => headers.map(h => {
        const val = row[h] ?? '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(','))
    ];
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download JSON
  const downloadJSON = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fetch and download report
  const handleDownload = async (reportType, format) => {
    setDownloading(reportType);
    try {
      const endpointMap = {
        'student-enrollment': '/admin/reports/student-enrollment',
        'event-participation': '/admin/reports/event-participation',
        'election-results': '/admin/reports/election-results',
        'complaints-resolution': '/admin/reports/complaints-resolution',
        'platform-analytics': '/admin/reports/platform-analytics'
      };
      
      const res = await axios.get(endpointMap[reportType]);
      const data = res.data;
      
      if (format === 'csv') {
        downloadCSV(reportType, data);
      } else {
        downloadJSON(reportType, data);
      }
    } catch (err) {
      console.log('Download error:', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    { 
      id: 'student-enrollment',
      title: 'Student Enrollment Report', 
      description: `Complete list of all registered students with course/year breakdown. Currently ${stats?.total_students || 0} students.`,
      icon: <Users size={20} />, 
      color: 'bg-blue-50 text-blue-600',
      stats: stats?.total_students
    },
    { 
      id: 'event-participation',
      title: 'Event Participation Report', 
      description: 'RSVP counts, attendance tracking, and participation rates for all events.',
      icon: <Calendar size={20} />, 
      color: 'bg-green-50 text-green-600',
      stats: stats?.upcoming_events
    },
    { 
      id: 'election-results',
      title: 'Election Results Report', 
      description: 'Detailed vote counts, candidate performance, and winner declarations.',
      icon: <Vote size={20} />, 
      color: 'bg-purple-50 text-purple-600',
      stats: stats?.active_elections
    },
    { 
      id: 'complaints-resolution',
      title: 'Complaints Resolution Report', 
      description: `Status breakdown and average response times. ${stats?.pending_complaints || 0} pending.`,
      icon: <AlertCircle size={20} />, 
      color: 'bg-orange-50 text-orange-600',
      stats: stats?.pending_complaints
    },
    { 
      id: 'platform-analytics',
      title: 'Platform Analytics', 
      description: 'User engagement, chat activity, membership stats, and revenue tracking.',
      icon: <TrendingUp size={20} />, 
      color: 'bg-teal-50 text-teal-600',
      stats: null
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Generate and download association reports with real data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center mb-4`}>
              {report.icon}
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">{report.title}</h3>
              {report.stats !== null && (
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {report.stats}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{report.description}</p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleDownload(report.id, 'csv')}
                disabled={downloading === report.id}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {downloading === report.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <FileSpreadsheet size={16} /> CSV
                  </>
                )}
              </button>
              <button 
                onClick={() => handleDownload(report.id, 'json')}
                disabled={downloading === report.id}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {downloading === report.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <FileText size={16} /> JSON
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Live Summary Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">{stats.total_students}</div>
              <div className="text-xs text-blue-500 mt-1 uppercase tracking-wide font-medium">Students</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="text-2xl font-bold text-emerald-700">{stats.active_members}</div>
              <div className="text-xs text-emerald-500 mt-1 uppercase tracking-wide font-medium">Members</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-700">{stats.upcoming_events}</div>
              <div className="text-xs text-purple-500 mt-1 uppercase tracking-wide font-medium">Events</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <div className="text-2xl font-bold text-amber-700">{stats.active_elections}</div>
              <div className="text-xs text-amber-500 mt-1 uppercase tracking-wide font-medium">Elections</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-700">{stats.pending_complaints}</div>
              <div className="text-xs text-red-500 mt-1 uppercase tracking-wide font-medium">Complaints</div>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-xl">
              <div className="text-2xl font-bold text-cyan-700">{stats.pending_payments}</div>
              <div className="text-xs text-cyan-500 mt-1 uppercase tracking-wide font-medium">Payments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}