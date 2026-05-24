import { useState } from 'react'
import { 
  Settings, Save, Check, Globe, Bell, Shield, 
  Palette, ToggleLeft, AlertTriangle 
} from 'lucide-react'

export default function ManageSettings() {
  const [saved, setSaved] = useState(false)
  const [platformSettings, setPlatformSettings] = useState({
    site_name: 'LOTSA CONNECT',
    allow_registration: true,
    require_membership_for_voting: true,
    require_membership_for_events: false,
    max_file_upload_size: 10,
    allow_anonymous_complaints: true,
    maintenance_mode: false,
    default_language: 'en',
    email_notifications_enabled: true,
    push_notifications_enabled: true,
    theme_default: 'light',
    academic_year: '2023-2024',
    semester_current: 2,
    registration_deadline: '2024-03-01',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-8">
        <h1 className="section-title mb-2">Platform Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Control global platform behavior and student experience</p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
              <Settings size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">General Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Platform Name</label>
              <input 
                value={platformSettings.site_name}
                onChange={e => setPlatformSettings({...platformSettings, site_name: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Academic Year</label>
              <input 
                value={platformSettings.academic_year}
                onChange={e => setPlatformSettings({...platformSettings, academic_year: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Semester</label>
              <select 
                value={platformSettings.semester_current}
                onChange={e => setPlatformSettings({...platformSettings, semester_current: parseInt(e.target.value)})}
                className="input-field"
              >
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
                <option value={3}>Summer / Special</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Deadline</label>
              <input 
                type="date"
                value={platformSettings.registration_deadline}
                onChange={e => setPlatformSettings({...platformSettings, registration_deadline: e.target.value})}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
              <ToggleLeft size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Feature Flags</h2>
          </div>

          <div className="space-y-4">
            <AdminToggle 
              label="Allow New Registrations"
              desc="Enable or disable student sign-ups"
              checked={platformSettings.allow_registration}
              onChange={v => setPlatformSettings({...platformSettings, allow_registration: v})}
            />
            <AdminToggle 
              label="Require Membership for Voting"
              desc="Only paid members can participate in elections"
              checked={platformSettings.require_membership_for_voting}
              onChange={v => setPlatformSettings({...platformSettings, require_membership_for_voting: v})}
            />
            <AdminToggle 
              label="Require Membership for Events"
              desc="Restrict event RSVP to paid members only"
              checked={platformSettings.require_membership_for_events}
              onChange={v => setPlatformSettings({...platformSettings, require_membership_for_events: v})}
            />
            <AdminToggle 
              label="Allow Anonymous Complaints"
              desc="Students can submit complaints without revealing identity"
              checked={platformSettings.allow_anonymous_complaints}
              onChange={v => setPlatformSettings({...platformSettings, allow_anonymous_complaints: v})}
            />
          </div>
        </div>

        {/* Maintenance */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
              <AlertTriangle size={18} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">System Controls</h2>
          </div>

          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
            <AdminToggle 
              label="Maintenance Mode"
              desc="Put the platform in read-only mode for all non-admin users"
              checked={platformSettings.maintenance_mode}
              onChange={v => setPlatformSettings({...platformSettings, maintenance_mode: v})}
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className={`btn-primary flex items-center gap-2 ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
          >
            {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Platform Settings</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminToggle({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}