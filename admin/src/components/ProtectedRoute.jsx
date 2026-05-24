import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AdminAuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'admin' && user.role !== 'leader') return <Navigate to="/admin/login" replace />
  return children
}