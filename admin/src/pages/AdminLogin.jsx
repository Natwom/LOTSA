import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AdminAuthContext'
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (!loading && user && (user.role === 'admin' || user.role === 'leader')) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [loading, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoggingIn(true)
    
    try {
      const u = await login(email, password)
      if (u.role === 'admin' || u.role === 'leader') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError('Access denied. Admin privileges required.')
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Login failed'
      setError(msg)
    } finally {
      setIsLoggingIn(false)
    }
  }

  // While checking existing session, show loading (prevents flash of login form)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">LOTSA ADMIN</h1>
          <p className="text-slate-400 mt-2">Management Portal Sign In</p>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-400 text-sm rounded-lg border border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
                placeholder="admin@lotsa.ac.ke"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Secure admin access only. Unauthorized entry is prohibited.
        </p>
      </div>
    </div>
  )
}