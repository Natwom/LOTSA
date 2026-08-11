import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Bell, Calendar, Vote, FileText, MessageSquare, 
  User, LogOut, Award, CreditCard, Settings, X, GraduationCap,
  BookOpen, Wallet
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
  { to: '/announcements', icon: Bell, label: 'Announcements', color: 'text-amber-500' },
  { to: '/events', icon: Calendar, label: 'Events', color: 'text-emerald-500' },
  { to: '/elections', icon: Vote, label: 'Elections', color: 'text-purple-500' },
  { to: '/leaders', icon: Award, label: 'Leadership', color: 'text-rose-500' },
  { to: '/membership', icon: CreditCard, label: 'Membership', color: 'text-cyan-500' },
  { to: '/documents', icon: BookOpen, label: 'Documents', color: 'text-indigo-500' },
  { to: '/contributions', icon: Wallet, label: 'Contributions', color: 'text-pink-500' },
  { to: '/complaints', icon: FileText, label: 'Complaints', color: 'text-orange-500' },
  { to: '/chat', icon: MessageSquare, label: 'Chat', color: 'text-teal-500' },
  { to: '/profile', icon: User, label: 'Profile', color: 'text-indigo-500' },
  { to: '/settings', icon: Settings, label: 'Settings', color: 'text-gray-500' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, user } = useAuth()
  const location = useLocation()

  // FIX: unified name resolution
  const displayName = user?.profile?.full_name || user?.full_name || 'User'
  const isStudent = !!user?.profile

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">LOTSA CONNECT</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Student Portal</p>
          </div>
        </div>
        
        {/* Student ID Badge — only for students */}
        {isStudent && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Student ID</p>
            <p className="text-sm font-bold text-primary-700 dark:text-primary-300 mt-0.5">{user.profile.admission_number}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{user.profile.course}</p>
          </div>
        )}
        
        {/* Non-student badge */}
        {!isStudent && user && (
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Role</p>
            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 capitalize">{user.role?.replace('_', ' ')}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.to
          const Icon = item.icon
          return (
            <NavLink 
              key={item.to} 
              to={item.to}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border/50 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={18} className={`transition-transform duration-200 ${isActive ? 'text-white' : item.color} group-hover:scale-110`} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-border">
        <div className="px-4 mb-3">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{displayName}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
        <button 
          onClick={logout} 
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center">
          © 2024 LOTSA. All rights reserved.
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border hidden lg:flex flex-col z-20 shadow-xl shadow-black/5">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <aside className={`absolute left-0 top-0 h-full w-72 bg-white dark:bg-dark-card shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border lg:hidden">
            <span className="font-bold text-gray-900 dark:text-white">Menu</span>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg">
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="flex flex-col h-[calc(100%-60px)]">
            {sidebarContent}
          </div>
        </aside>
      </div>
    </>
  )
}