import { Bell, Menu, Settings, Moon, Sun, LogOut, User, Shield, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import axios from '../api/axios'

export default function Navbar({ onMenuClick }) {
  const { user, logout, theme, toggleTheme } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  // Fetch real notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      setNotifLoading(true)
      try {
        const res = await axios.get('/notifications?limit=5')
        setNotifications(res.data || [])
      } catch (err) {
        console.log('Notifications fetch error:', err)
        setNotifications([])
      } finally {
        setNotifLoading(false)
      }
    }
    fetchNotifications()
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllRead = async () => {
    try {
      await axios.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.log('Mark read error:', err)
    }
  }

  const markOneRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.log('Mark read error:', err)
    }
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'event': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'election': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
      case 'complaint': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
      case 'announcement': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      case 'chat': return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="glass-nav h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden z-50 animate-slide-in-right">
              <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={18} className="animate-spin text-primary-500" />
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markOneRead(n.id)}
                      className={`p-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 cursor-pointer transition-colors flex items-start gap-3 ${!n.is_read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getNotifIcon(n.type)}`}>
                        <Bell size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatTime(n.created_at)}</p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Bell size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
              </div>
              
              <Link 
                to="/notifications" 
                onClick={() => setNotifOpen(false)}
                className="block p-3 text-center text-sm text-primary-600 hover:text-primary-700 font-medium border-t border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-dark-border rounded-xl p-1.5 pr-3 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-primary-500/30">
              {user?.profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{user?.profile?.full_name || 'Student'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden z-50 animate-slide-in-right">
              <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.profile?.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                <p className="text-xs text-primary-600 font-medium mt-1">{user?.profile?.admission_number}</p>
              </div>
              <div className="p-2">
                <button onClick={() => { setProfileOpen(false); navigate('/profile') }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                  <User size={16} /> My Profile
                </button>
                <button onClick={() => { setProfileOpen(false); navigate('/settings') }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                  <Settings size={16} /> Settings
                </button>
                <button onClick={() => { setProfileOpen(false); navigate('/terms') }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                  <FileText size={16} /> Terms & Conditions
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => { window.location.href = 'http://localhost:5174/admin/dashboard' }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                    <Shield size={16} /> Admin Panel
                  </button>
                )}
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-dark-border">
                <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}