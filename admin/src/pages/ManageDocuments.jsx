import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { Plus, FileText, Trash2, Eye, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';

// Helper: handles both Cloudinary URLs and old local paths
const getFileUrl = (fileUrl) => {
  if (!fileUrl) return '#';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `https://lotsa-api.onrender.com${fileUrl}`;
};

export default function ManageDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    file_type: 'general',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = () => {
    setLoading(true);
    axios.get('/documents/admin/all').then((res) => {
      setDocuments(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('file_type', form.file_type);
    formData.append('file', selectedFile);

    try {
      await axios.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ title: '', description: '', file_type: 'general' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
      fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Delete this document?')) return;
    await axios.delete(`/documents/${id}`);
    fetchDocuments();
  };

  const toggleDoc = async (id) => {
    await axios.put(`/documents/${id}/toggle`);
    fetchDocuments();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'file_type',
      label: 'Type',
      render: (val) => (
        <span className={`capitalize text-xs font-semibold px-2 py-1 rounded-full ${
          val === 'constitution' ? 'bg-purple-100 text-purple-700' :
          val === 'student_database' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {val.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'file_name',
      label: 'File',
      render: (val, row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={14} />
          <span className="truncate max-w-[150px]">{val}</span>
          <span className="text-xs text-gray-400">({formatSize(row.file_size)})</span>
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {val ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          {val ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'uploaded_at',
      label: 'Uploaded',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <p className="text-gray-500 mt-1">Upload constitution, student database, and other files</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Upload size={18} /> {showForm ? 'Cancel' : 'Upload Document'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="general">General</option>
                <option value="constitution">Constitution</option>
                <option value="student_database">Student Database</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-1">Selected: {selectedFile.name} ({formatSize(selectedFile.size)})</p>
            )}
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      <DataTable
        columns={columns}
        data={documents}
        loading={loading}
        actions={(row) => (
          <>
            <a
              href={getFileUrl(row.file_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={16} />
            </a>
            <button
              onClick={() => toggleDoc(row.id)}
              className={`p-2 rounded-lg transition-colors ${row.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
              title={row.is_active ? 'Hide' : 'Show'}
            >
              <Eye size={16} />
            </button>
            <button onClick={() => deleteDoc(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
          </>
        )}
      />
    </div>
  );
}