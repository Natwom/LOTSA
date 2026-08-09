import { createContext, useState, useContext, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('user_settings')
    return saved ? JSON.parse(saved) : {
      department: '', year_of_study: 1, semester: 1,
      notifications_enabled: true, email_notifications: true, push_notifications: true,
      event_reminders: true, election_alerts: true, privacy_mode: 'public',
      show_online_status: true, allow_messages_from: 'everyone',
      language: 'en', font_size: 'normal', reduced_motion: false, high_contrast: false,
    }
  })

  useEffect(() => {
    const root = window.document.documentElement
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('user_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/auth/me').then(res => setUser(res.data)).catch(() => {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('role', res.data.role)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`
    const userRes = await axios.get('/auth/me')
    setUser(userRes.data)
    try {
      const s = await axios.get('/settings/me')
      if (s.data) setSettings(prev => ({ ...prev, ...s.data }))
    } catch (e) {}
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    window.location.href = '/#/login'
  }

  const updateSettings = async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    try { await axios.put('/settings/me', newSettings) } catch (e) {}
  }

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const isStudent = () => user?.role === 'student'
  const isAdmin = () => user?.role === 'admin'
  const isPatron = () => user?.role === 'patron'
  const isDeputyPatron = () => user?.role === 'deputy_patron'
  const isCommitteeMember = () => user?.role === 'committee_member'
  const isLeadership = () => ['patron', 'deputy_patron', 'committee_member', 'admin', 'leader'].includes(user?.role)
  const isNonStudent = () => ['patron', 'deputy_patron', 'committee_member'].includes(user?.role)

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, loading, theme, toggleTheme, settings, updateSettings,
      isStudent, isAdmin, isPatron, isDeputyPatron, isCommitteeMember, isLeadership, isNonStudent
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)