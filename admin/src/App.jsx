import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ManageStudents from './pages/ManageStudents'
import ManageAnnouncements from './pages/ManageAnnouncements'
import ManageEvents from './pages/ManageEvents'
import ManageElections from './pages/ManageElections'
import ManageComplaints from './pages/ManageComplaints'
import AdminChat from './pages/AdminChat'
import Reports from './pages/Reports'

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          {/* Public login route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected admin routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<ManageStudents />} />
              <Route path="/admin/announcements" element={<ManageAnnouncements />} />
              <Route path="/admin/events" element={<ManageEvents />} />
              <Route path="/admin/elections" element={<ManageElections />} />
              <Route path="/admin/complaints" element={<ManageComplaints />} />
              <Route path="/admin/chat" element={<AdminChat />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  )
}

export default App