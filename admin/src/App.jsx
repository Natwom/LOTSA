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
import ManageLeaders from './pages/ManageLeaders'
import ManageMembership from './pages/ManageMembership'
import ManageSettings from './pages/ManageSettings'
import ManageTerms from './pages/ManageTerms'
import AdminChat from './pages/AdminChat'
import Reports from './pages/Reports'
import ManageDocuments from './pages/ManageDocuments'
import ManageContributions from './pages/ManageContributions'

function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/announcements" element={<ManageAnnouncements />} />
            <Route path="/admin/events" element={<ManageEvents />} />
            <Route path="/admin/elections" element={<ManageElections />} />
            <Route path="/admin/complaints" element={<ManageComplaints />} />
            <Route path="/admin/leaders" element={<ManageLeaders />} />
            <Route path="/admin/membership" element={<ManageMembership />} />
            <Route path="/admin/settings" element={<ManageSettings />} />
            <Route path="/admin/terms" element={<ManageTerms />} />
            <Route path="/admin/chat" element={<AdminChat />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/documents" element={<ManageDocuments />} />
            <Route path="/admin/contributions" element={<ManageContributions />} />
          </Route>
        </Routes>
      </Router>
    </AdminAuthProvider>
  )
}

export default App