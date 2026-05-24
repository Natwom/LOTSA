import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from '../api/axios'
import { Camera, Save } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.profile?.full_name || '',
    course: user?.profile?.course || '',
    year_of_study: user?.profile?.year_of_study || '',
    phone_number: user?.profile?.phone_number || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await axios.put('/students/me/profile', form)
    setSaving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
              {user?.profile?.full_name?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-1.5 rounded-full hover:bg-gray-700"><Camera size={14} /></button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.profile?.full_name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-blue-600 font-medium mt-1">{user?.profile?.admission_number}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input value={form.course} onChange={e => setForm({...form, course: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
              <input type="number" value={form.year_of_study} onChange={e => setForm({...form, year_of_study: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="pt-2">
            <button disabled={saving} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}