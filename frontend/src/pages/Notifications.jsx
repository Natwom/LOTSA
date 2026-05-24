import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Bell, Check } from 'lucide-react'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = () => {
    axios.get('/notifications').then(res => setNotifications(res.data))
  }

  const markRead = async (id) => {
    await axios.put(`/notifications/${id}/read`)
    fetchNotifications()
  }

  const markAllRead = async () => {
    await axios.put('/notifications/mark-all-read')
    fetchNotifications()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <button onClick={markAllRead} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
          <Check size={14} /> Mark all as read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border ${n.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'} transition-colors`}>
            <div className={`p-2 rounded-full ${n.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}><Bell size={16} /></div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              <div className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            {!n.is_read && <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 font-medium hover:underline">Mark read</button>}
          </div>
        ))}
        {notifications.length === 0 && <p className="text-center text-gray-400 py-12">No notifications yet.</p>}
      </div>
    </div>
  )
}