import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AdminAuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  // Still checking token — show loading spinner
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

  // No user or wrong role → kick to login
  if (!user || (user.role !== 'admin' && user.role !== 'leader')) {
    return <Navigate to="/admin/login" replace />
  }

  // Authenticated admin/leader → render the child routes
  return <Outlet />
}