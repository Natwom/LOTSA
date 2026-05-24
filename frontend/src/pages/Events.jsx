import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Calendar, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react'

export default function Events() {
  const [events, setEvents] = useState([])
  const [registered, setRegistered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // >>> FIX: trailing slash "/" prevents 307 redirect
    axios.get('/events/')
      .then(res => setEvents(res.data))
      .catch(err => {
        console.error('Fetch events error:', err)
        setError('Failed to load events')
      })
      .finally(() => setLoading(false))

    axios.get('/events/my-registrations')
      .then(res => setRegistered(res.data.map(r => r.event_id)))
      .catch(console.error)
  }, [])

  const register = async (eventId) => {
    try {
      await axios.post(`/events/${eventId}/register`)
      setRegistered([...registered, eventId])
    } catch (err) {
      console.error('Register error:', err)
      alert(err.response?.data?.detail || 'Failed to register')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <Calendar size={48} />
            </div>
            <div className="p-5">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">{event.category}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2"><Clock size={14} /> {new Date(event.event_date).toLocaleString()}</div>
                <div className="flex items-center gap-2"><MapPin size={14} /> {event.location}</div>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
              {registered.includes(event.id) ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium"><CheckCircle size={16} /> Registered</div>
              ) : (
                <button onClick={() => register(event.id)} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Register for Event
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}