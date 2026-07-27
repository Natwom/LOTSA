import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Pin, Calendar, Megaphone, Bell, Search, ArrowRight, Clock, Filter } from 'lucide-react'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setLoading(true)
    axios.get('/announcements').then(res => {
      setAnnouncements(res.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Category styling config
  const categoryConfig = {
    general:    { color: 'bg-gray-100 text-gray-700 border-gray-200', accent: 'border-l-gray-400', icon: Megaphone },
    academic:   { color: 'bg-blue-50 text-blue-700 border-blue-200', accent: 'border-l-blue-500', icon: Bell },
    sports:     { color: 'bg-orange-50 text-orange-700 border-orange-200', accent: 'border-l-orange-500', icon: Bell },
    cultural:   { color: 'bg-purple-50 text-purple-700 border-purple-200', accent: 'border-l-purple-500', icon: Bell },
    meeting:    { color: 'bg-green-50 text-green-700 border-green-200', accent: 'border-l-green-500', icon: Calendar },
    election:   { color: 'bg-red-50 text-red-700 border-red-200', accent: 'border-l-red-500', icon: Bell },
    emergency:  { color: 'bg-red-100 text-red-800 border-red-300', accent: 'border-l-red-600', icon: Bell },
  }

  const getCategoryStyle = (cat) => categoryConfig[cat?.toLowerCase()] || categoryConfig.general

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Unique categories from data
  const categories = ['all', ...new Set(announcements.map(a => a.category?.toLowerCase() || 'general'))]

  // Filter logic
  const filtered = announcements.filter(ann => {
    const cat = ann.category?.toLowerCase() || 'general'
    const matchesCategory = selectedCategory === 'all' || cat === selectedCategory
    const matchesSearch = !searchQuery || 
      ann.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const pinned = filtered.filter(a => a.is_pinned)
  const regular = filtered.filter(a => !a.is_pinned)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Megaphone size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
            Stay updated with the latest news, events, and important notices from the LOTSA leadership team.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Updates' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned / Featured Section */}
      {pinned.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-gray-800">
            <Pin size={18} className="text-blue-600 fill-blue-600" />
            <h2 className="text-lg font-bold">Featured & Pinned</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{pinned.length}</span>
          </div>
          <div className="grid gap-4">
            {pinned.map(ann => {
              const style = getCategoryStyle(ann.category)
              const Icon = style.icon
              return (
                <div 
                  key={ann.id} 
                  className={`bg-white rounded-xl shadow-md border border-gray-200 border-l-4 ${style.accent} p-6 hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style.color}`}>
                          <Icon size={12} /> {ann.category || 'General'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">
                          <Clock size={11} /> {formatRelativeTime(ann.created_at)}
                        </span>
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Pin size={10} className="fill-amber-700" /> Pinned
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{ann.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{ann.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Regular Announcements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bell size={18} className="text-gray-500" /> 
            Latest Updates
            {regular.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">{regular.length}</span>
            )}
          </h2>
        </div>

        {regular.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {regular.map(ann => {
              const style = getCategoryStyle(ann.category)
              const Icon = style.icon
              const isRecent = (new Date() - new Date(ann.created_at)) < 86400000 * 2 // 2 days

              return (
                <div 
                  key={ann.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${style.color}`}>
                      <Icon size={11} /> {ann.category || 'General'}
                    </span>
                    <div className="flex items-center gap-2">
                      {isRecent && (
                        <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{ann.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">{ann.content}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar size={12} /> {formatRelativeTime(ann.created_at)}
                    </span>
                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 border-dashed">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600">No announcements found</h3>
            <p className="text-gray-400 mt-1 text-sm max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all' 
                ? "Try adjusting your search or filter to see more results." 
                : "Check back later for updates from the LOTSA leadership team."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}