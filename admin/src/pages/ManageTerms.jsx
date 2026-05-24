import { useState } from 'react'
import { 
  FileText, Save, Check, Plus, Trash2, Edit3, 
  BookOpen, Clock, Eye 
} from 'lucide-react'

export default function ManageTerms() {
  const [saved, setSaved] = useState(false)
  const [terms, setTerms] = useState([
    { id: 1, title: 'Student Code of Conduct', version: '2.1', updated: '2024-01-15', active: true, content: 'All users must be currently enrolled students...' },
    { id: 2, title: 'Data Privacy Policy', version: '1.3', updated: '2024-01-10', active: true, content: 'Your personal data is collected solely for...' },
    { id: 3, title: 'Election Rules', version: '3.0', updated: '2023-12-01', active: true, content: 'Only students with active membership...' },
  ])
  const [editing, setEditing] = useState(null)
  const [editContent, setEditContent] = useState('')

  const handleSave = () => {
    if (editing) {
      setTerms(prev => prev.map(t => t.id === editing ? {...t, content: editContent, version: incrementVersion(t.version), updated: new Date().toISOString().split('T')[0]} : t))
      setEditing(null)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const incrementVersion = (v) => {
    const [major, minor] = v.split('.').map(Number)
    return `${major}.${minor + 1}`
  }

  return (
    <div className="page-container max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title mb-2">Terms & Conditions</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage platform terms, policies, and legal documents</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Document
        </button>
      </div>

      <div className="space-y-6">
        {/* Documents List */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-dark-border">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Document</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Version</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {terms.map(term => (
                  <tr key={term.id} className="border-b border-gray-50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-dark-border/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{term.title}</p>
                          <p className="text-xs text-gray-500">{term.content.substring(0, 40)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-dark-border rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">
                        v{term.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={12} /> {term.updated}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${term.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${term.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {term.active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditing(term.id); setEditContent(term.content) }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Editor */}
        {editing && (
          <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
                <BookOpen size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Editing: {terms.find(t => t.id === editing)?.title}
              </h2>
            </div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={12}
              className="input-field font-mono text-sm"
              placeholder="Enter document content..."
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setEditing(null)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className={`btn-primary flex items-center gap-2 ${saved ? 'bg-emerald-500' : ''}`}
              >
                {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save & Publish</>}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 text-center">
            <Eye size={20} className="mx-auto text-primary-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,240</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Views</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <Check size={20} className="mx-auto text-emerald-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">98%</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Acceptance Rate</div>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <FileText size={20} className="mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{terms.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Active Documents</div>
          </div>
        </div>
      </div>
    </div>
  )
}