import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../context/AdminAuthContext'

export default function AdminNavbar({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <button
        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-gray-800">
              {user?.profile?.full_name || user?.email}
            </div>
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
          <div className="w-9 h-9 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {user?.profile?.full_name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}