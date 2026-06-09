import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { FileText, Download, Calendar, Database, ScrollText, File, X, Eye } from 'lucide-react';

const getFileUrl = (fileUrl) => {
  if (!fileUrl) return '#';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `https://lotsa-api.onrender.com${fileUrl}`;
};

const isPdf = (fileName) => fileName?.toLowerCase().endsWith('.pdf');

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [previewDoc, setPreviewDoc] = useState(null);

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
              <span className="truncate max-w-[120px]">{doc.file_name}</span>
            </div>
            
            <div className="flex gap-2">
              {isPdf(doc.file_name) && (
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Eye size={16} /> View
                </button>
              )}
              <a
                href={getFileUrl(doc.file_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors ${isPdf(doc.file_name) ? 'flex-1' : 'w-full'}`}
              >
                <Download size={16} /> Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <File size={48} className="mx-auto mb-3 opacity-50" />
          <p>No documents found in this category</p>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900">{previewDoc.title}</h3>
                <p className="text-sm text-gray-500">{previewDoc.file_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getFileUrl(previewDoc.file_url)}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download size={16} /> Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-100">
              <iframe
                src={getFileUrl(previewDoc.file_url)}
                className="w-full h-full rounded-lg bg-white"
                title={previewDoc.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}