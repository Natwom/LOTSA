import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { FileText, Download, Calendar, Database, ScrollText, File } from 'lucide-react';

// Helper: handles both Cloudinary URLs and old local paths
const getFileUrl = (fileUrl) => {
  if (!fileUrl) return '#';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `https://lotsa-api.onrender.com${fileUrl}`;
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    axios.get('/documents/').then(res => {
      setDocuments(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredDocs = activeTab === 'all'
    ? documents
    : documents.filter(d => d.file_type === activeTab);

  const getIcon = (type) => {
    if (type === 'constitution') return <ScrollText size={24} className="text-purple-500" />;
    if (type === 'student_database') return <Database size={24} className="text-blue-500" />;
    return <FileText size={24} className="text-gray-500" />;
  };

  const tabs = [
    { key: 'all', label: 'All Documents' },
    { key: 'constitution', label: 'Constitution' },
    { key: 'student_database', label: 'Student Database' },
    { key: 'general', label: 'General' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
      
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                {getIcon(doc.file_type)}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                doc.file_type === 'constitution' ? 'bg-purple-100 text-purple-700' :
                doc.file_type === 'student_database' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {doc.file_type.replace('_', ' ')}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{doc.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{doc.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(doc.uploaded_at).toLocaleDateString()}</span>
              <span>{doc.file_name}</span>
            </div>
            <a
              href={getFileUrl(doc.file_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Download size={16} /> Download
            </a>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <File size={48} className="mx-auto mb-3 opacity-50" />
          <p>No documents found in this category</p>
        </div>
      )}
    </div>
  );
}