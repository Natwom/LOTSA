import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { 
  Bell, Calendar, Vote, FileText, MessageSquare, 
  TrendingUp, Zap, Clock, ChevronRight, Users, 
  Loader2, MessageCircle, UsersRound 
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
    { to: '/events', icon: Calendar, label: 'Browse Events', color: 'bg-emerald-500', desc: 'Find upcoming activities' },
    { to: '/elections', icon: Vote, label: 'Cast Vote', color: 'bg-purple-500', desc: 'Active elections' },
    { to: '/complaints', icon: FileText, label: 'File Complaint', color: 'bg-orange-500', desc: 'Report an issue' },
    { to: '/chat', icon: MessageSquare, label: 'Open Chat', color: 'bg-teal-500', desc: 'Message members' },
  ]

  const activityItems = [
    { label: 'Events Attended', value: activity.events_attended, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Votes Cast', value: activity.votes_cast, icon: Vote, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Messages Sent', value: activity.messages_sent, icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Groups Joined', value: activity.groups_joined, icon: UsersRound, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ]

  return (
    <div className="page-container space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-8 text-white shadow-2xl shadow-primary-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-primary-200" />
            <span className="text-sm font-medium text-primary-100">Student Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-primary-100 max-w-lg">
            {settings?.department && `Department of ${settings.department} • `}
            Year {user?.profile?.year_of_study || settings?.year_of_study || 1} • Semester {settings?.semester || 1}
          </p>
          
          <div className="mt-6 flex flex-wrap gap-3">
            {quickActions.map(action => (
              <Link 
                key={action.to}
                to={action.to}
                className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/25 transition-colors"
              >
                <action.icon size={14} />
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
          color="bg-blue-500" 
          trend="+2 today"
          loading={loading}
        />
        <StatCard 
          icon={<Calendar size={20} />} 
          label="Upcoming Events" 
          value={stats.events} 
          color="bg-emerald-500" 
          trend="This week"
          loading={loading}
        />
        <StatCard 
          icon={<Vote size={20} />} 
          label="Active Elections" 
          value={stats.elections} 
          color="bg-purple-500" 
          trend="Ongoing"
          loading={loading}
        />
        <StatCard 
          icon={<FileText size={20} />} 
          label="My Complaints" 
          value={stats.complaints} 
          color="bg-orange-500" 
          trend="Tracked"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements Feed */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="section-title">Latest Announcements</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Stay updated with official communications</p>
                </div>
              </div>
              <Link to="/announcements" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-3">
              {announcements.length > 0 ? announcements.map((ann, i) => (
                <div 
                  key={ann.id} 
                  className="group p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50 hover:bg-blue-50 dark:hover:bg-primary-900/20 border border-transparent hover:border-blue-200 dark:hover:border-primary-800 transition-all duration-200 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">{ann.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ann.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Clock size={12} />
                        {new Date(ann.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No announcements yet</p>
                </div>
              )}
            </div>
          </div>

          {/* REAL ACTIVITY SECTION */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <div>
                <h2 className="section-title">Your Activity</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Based on your actual platform usage</p>
              </div>
            </div>

            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-primary-500" />
                <span className="ml-2 text-sm text-gray-500">Loading your activity...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activityItems.map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-dark-border/30 transition-colors">
                    <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <item.icon size={20} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Calendar size={18} />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">Upcoming</h2>
              </div>
            </div>
            
            <div className="space-y-3">
              {events.length > 0 ? events.map(evt => (
                <div key={evt.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-bg/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer group">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl p-2 text-center min-w-[50px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider">{new Date(evt.event_date).toLocaleString('default', { month: 'short' })}</div>
                    <div className="text-xl font-bold">{new Date(evt.event_date).getDate()}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{evt.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {evt.location}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming events</p>
              )}
            </div>
            
            <Link to="/events" className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              Browse all events
            </Link>
          </div>

          {/* Membership Status */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users size={18} />
              </div>
              <h2 className="font-bold">Membership</h2>
            </div>
            <p className="text-primary-100 text-sm mb-4">Your LOTSA membership gives you voting rights and exclusive event access.</p>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-primary-200 uppercase tracking-wider font-medium">Status</div>
                <div className="font-bold flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Active
                </div>
              </div>
              <Link to="/membership" className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, trend, loading }) {
  return (
    <div className="stat-glow glass-card rounded-2xl p-5 hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div className={`${color} text-white p-2.5 rounded-xl shadow-lg`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-dark-border px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {loading ? <span className="animate-pulse bg-gray-200 dark:bg-dark-border rounded w-8 h-8 inline-block" /> : value}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
    </div>
  )
}