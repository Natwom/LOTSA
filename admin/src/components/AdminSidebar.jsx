import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Bell, Calendar, Vote, AlertCircle, MessageSquare, BarChart3, LogOut, Award, CreditCard, FileText, Wallet } from 'lucide-react'
import { useAuth } from '../context/AdminAuthContext'

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/admin/students', icon: <Users size={20} />, label: 'Students' },
  { to: '/admin/announcements', icon: <Bell size={20} />, label: 'Announcements' },
  { to: '/admin/events', icon: <Calendar size={20} />, label: 'Events' },
  { to: '/admin/elections', icon: <Vote size={20} />, label: 'Elections' },
  { to: '/admin/leaders', icon: <Award size={20} />, label: 'Leaders' },
  { to: '/admin/membership', icon: <CreditCard size={20} />, label: 'Membership' },
  { to: '/admin/documents', icon: <FileText size={20} />, label: 'Documents' },
  { to: '/admin/contributions', icon: <Wallet size={20} />, label: 'Contributions' },
  { to: '/admin/complaints', icon: <AlertCircle size={20} />, label: 'Complaints' },
  { to: '/admin/chat', icon: <MessageSquare size={20} />, label: 'Chat Moderation' },
  { to: '/admin/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
]

export default function AdminSidebar() {
  const { logout } = useAuth()
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white hidden lg:flex flex-col z-10">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">LOTSA ADMIN</h1>
        <p className="text-xs text-slate-400 mt-1">Management Portal</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  )
}