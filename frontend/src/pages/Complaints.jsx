import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Send } from 'lucide-react'

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [form, setForm] = useState({ title: '', description: '', category: 'general', is_anonymous: false })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchComplaints() }, [])

  const fetchComplaints = () => {
    axios.get('/complaints/my').then(res => setComplaints(res.data))
  }

  const submit = async (e) => {
    e.preventDefault()
    await axios.post('/complaints', form)
    setForm({ title: '', description: '', category: 'general', is_anonymous: false })
    setShowForm(false)
    fetchComplaints()
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_review: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Complaints & Suggestions</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          {showForm ? 'Cancel' : 'Submit New'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="welfare">Welfare</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="suggestion">Suggestion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm({...form, is_anonymous: e.target.checked})} />
            Submit anonymously
          </label>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
            <Send size={16} /> Submit
          </button>
        </form>
      )}

      <div className="space-y-3">
        {complaints.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{c.title}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[c.status] || 'bg-gray-100'}`}>{c.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{c.description}</p>
            {c.admin_response && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                <span className="font-semibold">Admin Response:</span> {c.admin_response}
              </div>
            )}
            <div className="mt-3 text-xs text-gray-400">Submitted {new Date(c.created_at).toLocaleDateString()}</div>
          </div>
        ))}
        {complaints.length === 0 && <p className="text-center text-gray-400 py-8">No complaints submitted yet.</p>}
      </div>
    </div>
  )
}