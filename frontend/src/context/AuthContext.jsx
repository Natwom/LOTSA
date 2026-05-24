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
      department: '',
      year_of_study: 1,
      semester: 1,
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: true,
      event_reminders: true,
      election_alerts: true,
      privacy_mode: 'public',
      show_online_status: true,
      allow_messages_from: 'everyone',
      language: 'en',
      font_size: 'normal',
      reduced_motion: false,
      high_contrast: false,
    }
  })

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Settings persistence
  useEffect(() => {
    localStorage.setItem('user_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
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
    // Load server settings if available
    try {
      const settingsRes = await axios.get('/settings/me')
      if (settingsRes.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data }))
      }
    } catch (e) {
      // Use local settings
    }
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    window.location.href = '/login'
  }

  const updateSettings = async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
    try {
      await axios.put('/settings/me', newSettings)
    } catch (e) {
      console.log('Settings saved locally only')
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, loading, 
      theme, toggleTheme, 
      settings, updateSettings 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)