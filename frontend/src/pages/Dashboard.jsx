import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { 
  Bell, Calendar, Vote, FileText, MessageSquare, 
  TrendingUp, Zap, Clock, ChevronRight, Users, 
  Loader2, MessageCircle, UsersRound, CreditCard,
  ArrowUpRight, Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, settings } = useAuth()
  const [stats, setStats] = useState({ announcements: 0, events: 0, elections: 0, complaints: 0 })
  const [activity, setActivity] = useState({ events_attended: 0, votes_cast: 0, messages_sent: 0, groups_joined: 0 })
  const [announcements, setAnnouncements] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [a, e, el, c, act] = await Promise.all([
          axios.get('/announcements?limit=3'),
          axios.get('/events?upcoming=true&limit=3'),
          axios.get('/elections?active=true'),
          axios.get('/complaints/my'),
          axios.get('/students/me/activity')
        ])
        setAnnouncements(a.data)
        setEvents(e.data)
        setStats({
          announcements: a.data.length,
          events: e.data.length,
          elections: el.data.length,
          complaints: c.data.length,
        })
        setActivity(act.data)
      } catch (err) {
        console.log('Dashboard data fetch error:', err)
        setActivity({ events_attended: 0, votes_cast: 0, messages_sent: 0, groups_joined: 0 })
      } finally {
        setLoading(false)
        setActivityLoading(false)
      }
    }
    fetchData()
  }, [])

  const quickActions = [
    { to: '/events', icon: Calendar, label: 'Browse Events', color: 'bg-emerald-600', hover: 'hover:bg-emerald-700', desc: 'Find upcoming activities' },
    { to: '/elections', icon: Vote, label: 'Cast Vote', color: 'bg-violet-600', hover: 'hover:bg-violet-700', desc: 'Active elections' },
    { to: '/complaints', icon: FileText, label: 'File Complaint', color: 'bg-orange-600', hover: 'hover:bg-orange-700', desc: 'Report an issue' },
    { to: '/chat', icon: MessageSquare, label: 'Open Chat', color: 'bg-teal-600', hover: 'hover:bg-teal-700', desc: 'Message members' },
  ]

  const activityItems = [
    { label: 'Events Attended', value: activity.events_attended, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Votes Cast', value: activity.votes_cast, icon: Vote, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Messages Sent', value: activity.messages_sent, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Groups Joined', value: activity.groups_joined, icon: UsersRound, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ]

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'Student'

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Student Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-300 max-w-lg text-sm leading-relaxed">
              {settings?.department ? `Department of ${settings.department} • ` : ''}
              Year {user?.profile?.year_of_study || settings?.year_of_study || 1} • Semester {settings?.semester || 1}
            </p>
            
            <div className="mt-6 flex flex-wrap gap-3">
              {quickActions.map(action => (
                <Link 
                  key={action.to}
                  to={action.to}
                  className={`flex items-center gap-2 px-4 py-2.5 ${action.color} ${action.hover} text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                >
                  <action.icon size={15} />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<Bell size={20} />} 
            label="Announcements" 
            value={stats.announcements} 
            color="bg-blue-600" 
            subtext="Latest updates"
            loading={loading}
          />
          <StatCard 
            icon={<Calendar size={20} />} 
            label="Upcoming Events" 
            value={stats.events} 
            color="bg-emerald-600" 
            subtext="This week"
            loading={loading}
          />
          <StatCard 
            icon={<Vote size={20} />} 
            label="Active Elections" 
            value={stats.elections} 
            color="bg-violet-600" 
            subtext="Ongoing"
            loading={loading}
          />
          <StatCard 
            icon={<FileText size={20} />} 
            label="My Complaints" 
            value={stats.complaints} 
            color="bg-orange-600" 
            subtext="Tracked"
            loading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Announcements Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Latest Announcements</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Stay updated with official communications</p>
                  </div>
                </div>
                <Link to="/announcements" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                  View all <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="space-y-3">
                {announcements.length > 0 ? announcements.map((ann) => (
                  <div 
                    key={ann.id} 
                    className="group p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-sm">{ann.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ann.content}</p>
                        <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-400 font-medium">
                          <Clock size={12} />
                          {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Bell size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-sm">No announcements yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Your Activity</h2>
                  <p className="text-xs text-slate-500 font-medium">Based on your platform usage</p>
                </div>
              </div>

              {activityLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-emerald-600" />
                  <span className="ml-2 text-sm text-slate-500 font-medium">Loading your activity...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activityItems.map((item, i) => (
                    <div key={i} className={`text-center p-5 rounded-xl ${item.bg} border ${item.border} hover:shadow-md transition-all`}>
                      <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                        <item.icon size={20} className={item.color} />
                      </div>
                      <div className="text-2xl font-extrabold text-slate-900">{item.value}</div>
                      <div className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Calendar size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Upcoming</h2>
                </div>
              </div>
              
              <div className="space-y-3">
                {events.length > 0 ? events.map(evt => (
                  <div key={evt.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all cursor-pointer group">
                    <div className="bg-white rounded-xl p-2.5 text-center min-w-[56px] shadow-sm border border-slate-100">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        {new Date(evt.event_date).toLocaleString('default', { month: 'short' })}
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {new Date(evt.event_date).getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-700 transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Clock size={11} /> {evt.location || 'TBA'}
                      </p>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                )) : (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Calendar size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No upcoming events</p>
                  </div>
                )}
              </div>
              
              <Link to="/events" className="block mt-5 text-center text-sm font-bold text-emerald-600 hover:text-emerald-700 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100">
                Browse all events
              </Link>
            </div>

            {/* Membership Status */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-lg font-bold">Membership</h2>
                </div>
                <p className="text-emerald-100 text-sm leading-relaxed mb-5">
                  Your LOTSA membership gives you voting rights and exclusive event access.
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200 mb-1">Current Status</div>
                    <div className="font-bold flex items-center gap-2 text-sm">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
                      </span>
                      Active Member
                    </div>
                  </div>
                  <Link to="/membership" className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-bold hover:bg-white/30 transition-colors border border-white/10">
                    Manage
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-start gap-3">
                <Zap size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Pro Tip</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Keep your profile updated to receive personalized event recommendations and election alerts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, subtext, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} text-white p-2.5 rounded-xl shadow-lg`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
          {subtext}
        </span>
      </div>
      <h3 className="text-3xl font-extrabold text-slate-900 mb-1">
        {loading ? (
          <span className="inline-block w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
        ) : (
          value
        )}
      </h3>
      <p className="text-sm text-slate-500 font-semibold">{label}</p>
    </div>
  )
}