import { createContext, useState, useContext, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/auth/me')
        .then(res => {
          if (res.data.role === 'admin' || res.data.role === 'leader') {
            setUser(res.data)
          } else {
            localStorage.removeItem('admin_token')
          }
        })
        .catch(() => localStorage.removeItem('admin_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password })
    localStorage.setItem('admin_token', res.data.access_token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`
    const userRes = await axios.get('/auth/me')
    setUser(userRes.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    window.location.href = '/admin/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)