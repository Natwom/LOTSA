import { createContext, useState, useContext, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      setLoading(false)
      setAuthChecked(true)
      return
    }

    axios.get('/auth/me')
      .then(res => {
        const role = res.data.role
        if (role === 'admin' || role === 'leader') {
          setUser(res.data)
        } else {
          console.warn('[AUTH] Role not admin/leader:', role)
          localStorage.removeItem('admin_token')
        }
      })
      .catch(err => {
        const status = err.response?.status
        console.error('[AUTH] /auth/me failed:', status, err.response?.data?.detail || err.message)
        // Only remove token on actual 401, not network errors
        if (status === 401) {
          localStorage.removeItem('admin_token')
        }
      })
      .finally(() => {
        setLoading(false)
        setAuthChecked(true)
      })
  }, [])

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password })
    const token = res.data.access_token
    localStorage.setItem('admin_token', token)

    // Set header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

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
    <AuthContext.Provider value={{ user, login, logout, loading, authChecked }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)