import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AdminAuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  // Checking session — show splash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-lg font-medium text-white mb-1">Checking session...</h2>
          <p className="text-slate-400 text-sm">Please wait while we verify your credentials</p>
        </div>
      </div>
    )
  }

  // No valid admin session → redirect to login
  if (!user || (user.role !== 'admin' && user.role !== 'leader')) {
    return <Navigate to="/admin/login" replace />
  }

  // Authenticated → render the nested routes
  return <Outlet />
}