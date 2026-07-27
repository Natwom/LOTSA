import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { 
  Calendar, MapPin, Clock, CheckCircle, Loader2, 
  Search, Filter, Users, ArrowRight, PartyPopper, 
  Trophy, BookOpen, Mic, Vote, Dumbbell, Music
} from 'lucide-react'

export default function Events() {
  const [events, setEvents] = useState([])
  const [registered, setRegistered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    axios.get('/events/')
      .then(res => setEvents(res.data || []))
      .catch(err => {
        console.error('Fetch events error:', err)
        setError('Failed to load events')
      })
      .finally(() => setLoading(false))

    axios.get('/events/my-registrations')
      .then(res => setRegistered((res.data || []).map(r => r.event_id)))
      .catch(console.error)
  }, [])

  const register = async (eventId) => {
    try {
      await axios.post(`/events/${eventId}/register`)
      setRegistered([...registered, eventId])
    } catch (err) {
      console.error('Register error:', err)
      alert(err.response?.data?.detail || 'Failed to register')
    }
  }

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date - now
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMs < 0) return 'Ended'
    if (diffMins < 1) return 'Starting now'
    if (diffMins < 60) return `Starts in ${diffMins}m`
    if (diffHours < 24) return `Starts in ${diffHours}h`
    if (diffDays < 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Category configuration with icons, colors, and gradients
  const categoryConfig = {
    meeting:     { icon: Mic,       color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    gradient: 'from-blue-500 to-indigo-600' },
    sports:      { icon: Dumbbell,  color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-200',  gradient: 'from-orange-500 to-red-500' },
    cultural:    { icon: Music,     color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200',  gradient: 'from-purple-500 to-pink-500' },
    academic:    { icon: BookOpen,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-600' },
    election:    { icon: Vote,      color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     gradient: 'from-red-500 to-rose-600' },
    general:     { icon: PartyPopper, color: 'text-gray-600',  bg: 'bg-gray-50',    border: 'border-gray-200',    gradient: 'from-gray-500 to-slate-600' },
  }

  const getCategoryStyle = (cat) => categoryConfig[cat?.toLowerCase()] || categoryConfig.general

  // Derive categories from data
  const categories = ['all', ...new Set(events.map(e => e.category?.toLowerCase() || 'general'))]

  const now = new Date()
  
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now)
  const pastEvents = events.filter(e => new Date(e.event_date) < now)

  const baseList = activeTab === 'upcoming' ? upcomingEvents : pastEvents

  const filtered = baseList.filter(event => {
    const cat = event.category?.toLowerCase() || 'general'
    const matchesCategory = selectedCategory === 'all' || cat === selectedCategory
    const matchesSearch = !searchQuery || 
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Sort: upcoming by nearest first, past by most recent first
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.event_date)
    const dateB = new Date(b.event_date)
    return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA
  })

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} className="text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-red-700">{error}</h3>
        <p className="text-red-500 text-sm mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Calendar size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          </div>
          <p className="text-indigo-100 text-lg max-w-2xl leading-relaxed">
            Discover and register for upcoming meetings, sports, cultural activities, and academic events.
          </p>
        </div>
      </div>

      {/* Tabs & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'past' 
                ? 'bg-gray-800 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Past ({pastEvents.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events by title, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {categories.map(cat => {
            const style = getCategoryStyle(cat === 'all' ? 'general' : cat)
            const Icon = style.icon
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon size={14} /> {cat === 'all' ? 'All Events' : cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map(event => {
            const style = getCategoryStyle(event.category)
            const Icon = style.icon
            const isRegistered = registered.includes(event.id)
            const isPast = new Date(event.event_date) < new Date()
            const relativeTime = formatRelativeTime(event.event_date)

            return (
              <div 
                key={event.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                {/* Banner Image or Gradient Fallback */}
                <div className="relative h-52 overflow-hidden">
                  {event.banner_url ? (
                    <img 
                      src={event.banner_url} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                      <Icon size={48} className="text-white/80" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className={`absolute top-4 left-4 ${style.bg} ${style.color} border ${style.border} px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm bg-opacity-90`}>
                    <Icon size={12} /> {event.category || 'General'}
                  </div>

                  {/* Time Badge */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Clock size={12} /> {relativeTime}
                  </div>

                  {/* Registered Badge */}
                  {isRegistered && (
                    <div className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <CheckCircle size={12} /> Registered
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Calendar size={14} className="text-gray-500" />
                      </div>
                      <span className="font-medium">{formatDateTime(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <MapPin size={14} className="text-gray-500" />
                      </div>
                      <span className="truncate">{event.location || 'Location TBA'}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-5 flex-1">
                    {event.description || 'No description available.'}
                  </p>

                  {/* Action */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    {isPast ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Event Ended</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Users size={12} /> {event.registrations?.length || 0} attended
                        </span>
                      </div>
                    ) : isRegistered ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                          <CheckCircle size={16} /> You're all set!
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Users size={12} /> {event.registrations?.length || 0} going
                        </span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => register(event.id)} 
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                      >
                        Register Now <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
            <Calendar size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming events' : 'No past events'}
          </h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' 
              ? "Try adjusting your search or filter to find what you're looking for." 
              : activeTab === 'upcoming' 
                ? "Check back soon for new events from the LOTSA team!" 
                : "Events you attended will appear here."}
          </p>
        </div>
      )}
    </div>
  )
}