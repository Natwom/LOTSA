import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Pin } from 'lucide-react'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    axios.get('/announcements').then(res => setAnnouncements(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className={`bg-white rounded-xl shadow-sm border ${ann.is_pinned ? 'border-blue-300' : 'border-gray-200'} p-6`}>
            <div className="flex items-center gap-2 mb-3">
              {ann.is_pinned && <Pin size={14} className="text-blue-600" />}
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{ann.category}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(ann.created_at).toLocaleDateString()}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{ann.title}</h2>
            <p className="text-gray-600 leading-relaxed">{ann.content}</p>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-center text-gray-400 py-12">No announcements yet.</p>}
      </div>
    </div>
  )
}