import { createContext, useState, useContext, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      setLoading(false)
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    axios.get('/auth/me')
      .then(res => {
        const u = res.data
        if (u.role === 'admin' || u.role === 'leader') {
          setUser(u)
        } else {
          localStorage.removeItem('admin_token')
          delete axios.defaults.headers.common['Authorization']
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token')
        delete axios.defaults.headers.common['Authorization']
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password })
    const token = res.data.access_token
    localStorage.setItem('admin_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    const userRes = await axios.get('/auth/me')
    setUser(userRes.data)
    return userRes.data
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