import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AdminAuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading, authChecked } = useAuth()
  const location = useLocation()

  // If we have a token and haven't finished checking yet, show loading
  // This prevents bouncing to login while /auth/me is in flight
  if (loading && localStorage.getItem('admin_token')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (user.role !== 'admin' && user.role !== 'leader') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}