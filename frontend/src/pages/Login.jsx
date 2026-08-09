import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Eye, EyeOff, ArrowRight, GraduationCap, 
  Mail, Lock, AlertTriangle, ShieldCheck 
} from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const data = await login(email, password)
      // Route based on role — all authenticated users go to dashboard
      // The dashboard will show different content based on role
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden p-4">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-4 ring-1 ring-white/20 shadow-xl">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LOTSA CONNECT</h1>
          <p className="text-blue-200/80 text-sm font-medium mt-2">
            LOTUBAE Student Association Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-8 border border-white/10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your portal</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="you@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                Keep me signed in for 30 days
              </span>
            </label>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 font-medium uppercase tracking-wider">or</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
                Register now
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck size={12} />
              <span>Secure, encrypted, and verified</span>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/60">
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <span>•</span>
          <Link to="/" className="hover:text-white transition-colors">Back to Home</Link>
          <span>•</span>
          <span>© 2024 LOTSA</span>
        </div>
      </div>
    </div>
  )
}