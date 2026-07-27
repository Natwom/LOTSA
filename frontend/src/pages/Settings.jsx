import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  User, Bell, Shield, Palette, Globe, Accessibility, 
  Save, Check, AlertTriangle, BookOpen, ChevronRight, Moon, Sun 
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Settings() {
  const { user, settings, updateSettings } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings || {})

  const handleSave = async () => {
    await updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'profile', label: 'Academic Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-slate-300 text-lg">Manage your account preferences and platform settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-800 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link to="/terms" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              <BookOpen size={18} />
              Terms & Conditions
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Academic Information</h2>
                <p className="text-sm text-gray-500">Update your university-specific details.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Department / Faculty</label>
                  <select 
                    value={localSettings.department || ''}
                    onChange={e => setLocalSettings({...localSettings, department: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:bg-white outline-none text-sm"
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business & Economics</option>
                    <option value="Medicine">Medicine & Health Sciences</option>
                    <option value="Law">Law</option>
                    <option value="Education">Education</option>
                    <option value="Arts">Arts & Social Sciences</option>
                    <option value="Agriculture">Agriculture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Course / Program</label>
                  <input 
                    type="text" 
                    value={user?.profile?.course || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm cursor-not-allowed text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Managed by admin</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Year of Study</label>
                  <select 
                    value={localSettings.year_of_study || 1}
                    onChange={e => setLocalSettings({...localSettings, year_of_study: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:bg-white outline-none text-sm"
                  >
                    {[1,2,3,4,5,6].map(y => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Current Semester</label>
                  <select 
                    value={localSettings.semester || 1}
                    onChange={e => setLocalSettings({...localSettings, semester: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:bg-white outline-none text-sm"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Summer / Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Registration Number</label>
                  <input 
                    type="text" 
                    value={user?.profile?.admission_number || ''}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm cursor-not-allowed text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={localSettings.phone_number || user?.profile?.phone_number || ''}
                    onChange={e => setLocalSettings({...localSettings, phone_number: e.target.value})}
                    placeholder="+254 7XX XXX XXX"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:bg-white outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500">Choose how and when you want to be notified.</p>
              </div>
              <div className="space-y-3">
                <ToggleSetting 
                  label="Push Notifications"
                  desc="Receive browser push notifications for important updates"
                  checked={localSettings.push_notifications}
                  onChange={v => setLocalSettings({...localSettings, push_notifications: v})}
                />
                <ToggleSetting 
                  label="Email Notifications"
                  desc="Get weekly digests and important emails"
                  checked={localSettings.email_notifications}
                  onChange={v => setLocalSettings({...localSettings, email_notifications: v})}
                />
                <ToggleSetting 
                  label="Event Reminders"
                  desc="Get reminded before events you registered for"
                  checked={localSettings.event_reminders}
                  onChange={v => setLocalSettings({...localSettings, event_reminders: v})}
                />
                <ToggleSetting 
                  label="Election Alerts"
                  desc="Be notified when new elections open"
                  checked={localSettings.election_alerts}
                  onChange={v => setLocalSettings({...localSettings, election_alerts: v})}
                />
                <ToggleSetting 
                  label="Announcement Digest"
                  desc="Daily summary instead of instant alerts"
                  checked={localSettings.announcement_digest || false}
                  onChange={v => setLocalSettings({...localSettings, announcement_digest: v})}
                />
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Privacy Settings</h2>
                <p className="text-sm text-gray-500">Control who can see your information.</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Profile Visibility</label>
                <select 
                  value={localSettings.privacy_mode || 'public'}
                  onChange={e => setLocalSettings({...localSettings, privacy_mode: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                >
                  <option value="public">Public — All students can see my profile</option>
                  <option value="members">Members Only — Only verified members</option>
                  <option value="friends">Friends Only — People I chat with</option>
                  <option value="private">Private — Hide everything except name</option>
                </select>
              </div>

              <div className="space-y-3">
                <ToggleSetting 
                  label="Show Online Status"
                  desc="Let others see when you're active"
                  checked={localSettings.show_online_status}
                  onChange={v => setLocalSettings({...localSettings, show_online_status: v})}
                />
                <ToggleSetting 
                  label="Allow Direct Messages"
                  desc="Receive private messages from other students"
                  checked={(localSettings.allow_messages_from !== 'none')}
                  onChange={v => setLocalSettings({...localSettings, allow_messages_from: v ? 'everyone' : 'none'})}
                />
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-red-800">Data Privacy Notice</h3>
                  <p className="text-xs text-red-600 mt-1">
                    Your academic data is stored securely. Read our <Link to="/terms" className="underline font-bold">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Appearance</h2>
                <p className="text-sm text-gray-500">Customize how LOTSA CONNECT looks.</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Moon size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Dark Mode</p>
                    <p className="text-xs text-gray-500">Easier on the eyes at night</p>
                  </div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-gray-400" />
                  <select 
                    value={localSettings.language || 'en'}
                    onChange={e => setLocalSettings({...localSettings, language: e.target.value})}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-sm"
                  >
                    <option value="en">English</option>
                    <option value="sw">Kiswahili</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Accessibility */}
          {activeTab === 'accessibility' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Accessibility</h2>
                <p className="text-sm text-gray-500">Make the platform work better for your needs.</p>
              </div>

              <div className="space-y-3">
                <ToggleSetting 
                  label="Reduced Motion"
                  desc="Disable animations and transitions"
                  checked={localSettings.reduced_motion}
                  onChange={v => setLocalSettings({...localSettings, reduced_motion: v})}
                />
                <ToggleSetting 
                  label="High Contrast Mode"
                  desc="Increase contrast for better visibility"
                  checked={localSettings.high_contrast}
                  onChange={v => setLocalSettings({...localSettings, high_contrast: v})}
                />
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Font Size</label>
                <div className="flex gap-2">
                  {['small', 'normal', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => setLocalSettings({...localSettings, font_size: size})}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                        (localSettings.font_size || 'normal') === size 
                          ? 'bg-slate-800 text-white' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-lg ${
                saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleSetting({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
      <div>
        <p className="font-bold text-gray-800 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-slate-800' : 'bg-gray-300'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}