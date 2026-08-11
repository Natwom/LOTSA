import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { 
  FileText, Download, Calendar, Database, ScrollText, File, 
  X, Eye, Search, FolderOpen 
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('/documents/').then(res => {
      setDocuments(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredDocs = documents.filter(d => {
    const matchesTab = activeTab === 'all' || d.file_type === activeTab;
    const matchesSearch = !searchQuery ||
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getIcon = (type) => {
    if (type === 'constitution') return <ScrollText size={24} className="text-purple-500" />;
    if (type === 'student_database') return <Database size={24} className="text-blue-500" />;
    return <FileText size={24} className="text-gray-500" />;
  };

  const getTypeColor = (type) => {
    if (type === 'constitution') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (type === 'student_database') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const tabs = [
    { key: 'all', label: 'All Documents', icon: FolderOpen },
    { key: 'constitution', label: 'Constitution', icon: ScrollText },
    { key: 'student_database', label: 'Student Database', icon: Database },
    { key: 'general', label: 'General', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-slate-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <FolderOpen size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          </div>
          <p className="text-slate-200 text-lg max-w-2xl leading-relaxed">
            Access official documents, constitutions, databases, and important files from the LOTSA archive.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:bg-white outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === tab.key 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                  {getIcon(doc.file_type)}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${getTypeColor(doc.file_type)}`}>
                  {doc.file_type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-700 transition-colors">{doc.title}</h3>
              <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed">{doc.description || 'No description available.'}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400 mb-5">
                <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
                  <Calendar size={11} /> {new Date(doc.uploaded_at).toLocaleDateString()}
                </span>
                <span className="truncate max-w-[120px] font-mono text-[10px]">{doc.file_name}</span>
              </div>
              
              <div className="flex gap-2">
                {isPdf(doc.file_name) && (
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    <Eye size={15} /> View
                  </button>
                )}
                <a
                  href={getFileUrl(doc.file_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors ${isPdf(doc.file_name) ? 'flex-1' : 'w-full'}`}
                >
                  <Download size={15} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
            <File size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No documents found</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {searchQuery || activeTab !== 'all' 
              ? "Try adjusting your search or filter." 
              : "Documents will be uploaded by the admin team soon."}
          </p>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{previewDoc.title}</h3>
                <p className="text-sm text-gray-500">{previewDoc.file_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getFileUrl(previewDoc.file_url)}
                  download
                  className="px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Download size={15} /> Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 bg-gray-100 relative">
              {/* 
                FIX: Use <embed> instead of <iframe> for PDFs.
                <embed> has native browser PDF support and handles 
                cross-origin Cloudinary URLs better than <iframe>.
              */}
              <embed
                src={getFileUrl(previewDoc.file_url)}
                type="application/pdf"
                className="w-full h-full rounded-xl bg-white shadow-sm"
              />
              {/* Fallback message if embed fails to render */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm bg-white/80 px-4 py-2 rounded-lg hidden">
                  If the document doesn't appear, please use the Download button.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}