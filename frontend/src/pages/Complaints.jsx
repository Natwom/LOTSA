import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { 
  Send, MessageSquare, AlertTriangle, Shield, Clock, 
  CheckCircle, Search, Plus, X, User, Eye, Filter 
} from 'lucide-react'

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    category: 'general', 
    is_anonymous: false 
  })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => { fetchComplaints() }, [])

  const fetchComplaints = () => {
    setLoading(true)
    axios.get('/complaints/my').then(res => {
      setComplaints(res.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const submit = async (e) => {
    e.preventDefault()
    await axios.post('/complaints', form)
    setForm({ title: '', description: '', category: 'general', is_anonymous: false })
    setShowForm(false)
    fetchComplaints()
  }

  const statusConfig = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock, label: 'Pending' },
    in_review: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Eye, label: 'In Review' },
    resolved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle, label: 'Resolved' },
  }

  const getStatusStyle = (status) => statusConfig[status] || statusConfig.pending

  const categories = [
    { key: 'all', label: 'All Submissions' },
    { key: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' },
    { key: 'academic', label: 'Academic', color: 'bg-blue-100 text-blue-700' },
    { key: 'welfare', label: 'Welfare', color: 'bg-pink-100 text-pink-700' },
    { key: 'infrastructure', label: 'Infrastructure', color: 'bg-orange-100 text-orange-700' },
    { key: 'suggestion', label: 'Suggestion', color: 'bg-purple-100 text-purple-700' },
  ]

  const getCategoryStyle = (cat) => categories.find(c => c.key === cat)?.color || 'bg-gray-100 text-gray-700'

  const filtered = complaints.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory
    const matchesSearch = !searchQuery || 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-red-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <MessageSquare size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Complaints & Suggestions</h1>
          </div>
          <p className="text-red-100 text-lg max-w-2xl leading-relaxed">
            Your voice matters. Submit complaints, suggestions, or feedback directly to the LOTSA leadership team.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm shadow-sm"
          />
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
            showForm 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200' 
              : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'
          }`}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Submit New</>}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.key 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Submission Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-rose-50 rounded-lg">
              <MessageSquare size={18} className="text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">New Submission</h3>
          </div>
          
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Title</label>
                <input 
                  required 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  placeholder="Brief summary of your concern..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none text-sm transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none text-sm transition-all"
                >
                  {categories.filter(c => c.key !== 'all').map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
              <textarea 
                required 
                rows={4} 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                placeholder="Provide detailed information about your complaint or suggestion..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none text-sm transition-all resize-none" 
              />
            </div>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <input 
                type="checkbox" 
                checked={form.is_anonymous} 
                onChange={e => setForm({...form, is_anonymous: e.target.checked})} 
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
              />
              <div>
                <p className="text-sm font-semibold text-gray-700">Submit anonymously</p>
                <p className="text-xs text-gray-500">Your identity will be hidden from other students</p>
              </div>
            </label>
            <button 
              type="submit" 
              className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-md shadow-rose-100"
            >
              <Send size={16} /> Submit
            </button>
          </form>
        </div>
      )}

      {/* Complaints List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(c => {
            const status = getStatusStyle(c.status)
            const StatusIcon = status.icon
            
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${getCategoryStyle(c.category)}`}>
                        {c.category}
                      </span>
                      {c.is_anonymous && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1">
                          <User size={10} /> Anonymous
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${status.bg} ${status.text} ${status.border} flex-shrink-0`}>
                    <StatusIcon size={12} /> {status.label}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{c.description}</p>
                
                {c.admin_response && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Shield size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Admin Response</span>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">{c.admin_response}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                    <Clock size={11} /> Submitted {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  {c.status === 'resolved' && (
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle size={11} /> Resolved
                    </span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No submissions yet</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all' 
                ? "Try adjusting your search or filter." 
                : "Click 'Submit New' to file your first complaint or suggestion."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}