import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Announcements from './pages/Announcements'
import Events from './pages/Events'
import Elections from './pages/Elections'
import Complaints from './pages/Complaints'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Leaders from './pages/Leaders'
import Membership from './pages/Membership'
import Settings from './pages/Settings'
import Terms from './pages/Terms'
import Documents from './pages/Documents'
import Contributions from './pages/Contributions'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/events" element={<Events />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/leaders" element={<Leaders />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/contributions" element={<Contributions />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App