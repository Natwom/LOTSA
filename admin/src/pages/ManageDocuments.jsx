import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { Plus, FileText, Trash2, Eye, Download, Upload, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

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
  const [form, setForm] = useState({ title: '', description: '', file_type: 'general' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = () => {
    setLoading(true);
    axios.get('/documents/admin/all').then((res) => {
      setDocuments(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const openContent = async (doc) => {
    setPreviewDoc(doc);
    setContentLoading(true);
    setDocContent('');
    try {
      const res = await axios.get(`/documents/${doc.id}/content`);
      setDocContent(res.data.content || 'No content available.');
    } catch (err) {
      setDocContent('Failed to load document content.');
    } finally {
      setContentLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { alert('Please select a file'); return; }

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
      key: 'file_type', label: 'Type',
      render: (val) => (
        <span className={`capitalize text-xs font-semibold px-2 py-1 rounded-full ${
          val === 'constitution' ? 'bg-purple-100 text-purple-700' :
          val === 'student_database' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>{val.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'file_name', label: 'File',
      render: (val, row) => (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={14} />
          <span className="truncate max-w-[150px]">{val}</span>
          <span className="text-xs text-gray-400">({formatSize(row.file_size)})</span>
        </div>
      ),
    },
    {
      key: 'is_active', label: 'Status',
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {val ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          {val ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    { key: 'uploaded_at', label: 'Uploaded', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <p className="text-gray-500 mt-1">Upload constitution, student database, and other files</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <Upload size={18} /> {showForm ? 'Cancel' : 'Upload Document'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select value={form.file_type} onChange={(e) => setForm({ ...form, file_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="general">General</option>
                <option value="constitution">Constitution</option>
                <option value="student_database">Student Database</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {selectedFile && <p className="text-sm text-gray-500 mt-1">Selected: {selectedFile.name} ({formatSize(selectedFile.size)})</p>}
          </div>
          <button type="submit" disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      <DataTable columns={columns} data={documents} loading={loading}
        actions={(row) => (
          <>
            <button onClick={() => openContent(row)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Read Content">
              <Eye size={16} />
            </button>
            <a href={getFileUrl(row.file_url)} target="_blank" rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
              <Download size={16} />
            </a>
            <button onClick={() => toggleDoc(row.id)}
              className={`p-2 rounded-lg transition-colors ${row.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
              title={row.is_active ? 'Hide' : 'Show'}>
              <Eye size={16} />
            </button>
            <button onClick={() => deleteDoc(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 size={16} />
            </button>
          </>
        )}
      />

      {/* Content Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{previewDoc.title}</h3>
                <p className="text-sm text-gray-500">{previewDoc.file_name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={getFileUrl(previewDoc.file_url)} download
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                  <Download size={16} /> Download
                </a>
                <button onClick={() => { setPreviewDoc(null); setDocContent(''); }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-50 overflow-hidden">
              {contentLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Loader2 size={32} className="animate-spin mb-3" />
                  <p className="text-sm">Extracting document content...</p>
                </div>
              ) : docContent.startsWith('Could not') || docContent.startsWith('Preview not') || docContent.startsWith('This PDF') || docContent.startsWith('This document') ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <AlertCircle size={40} className="text-amber-400 mb-3" />
                  <p className="text-sm max-w-md text-center">{docContent}</p>
                  <a href={getFileUrl(previewDoc.file_url)} download
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                    Download File
                  </a>
                </div>
              ) : (
                <div className="h-full overflow-y-auto bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                    {docContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}