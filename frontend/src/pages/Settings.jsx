import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  User, Bell, Shield, Palette, Globe, Accessibility, 
  Save, Check, AlertTriangle, BookOpen, ChevronRight 
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { Link } from 'react-router-dom'

export default function Settings() {
  const { user, settings, updateSettings } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

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
    <div className="page-container max-w-4xl">
      <div className="mb-8">
        <h1 className="section-title mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id 
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border/50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-dark-border">
            <Link to="/terms" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border/50 transition-colors">
              <BookOpen size={18} />
              Terms & Conditions
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Academic Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your university-specific details. This helps us personalize your experience.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department / Faculty</label>
                  <select 
                    value={localSettings.department}
                    onChange={e => setLocalSettings({...localSettings, department: e.target.value})}
                    className="input-field"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course / Program</label>
                  <input 
                    type="text" 
                    value={user?.profile?.course || ''}
                    readOnly
                    className="input-field bg-gray-50 dark:bg-dark-border/30 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Managed by admin</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year of Study</label>
                  <select 
                    value={localSettings.year_of_study}
                    onChange={e => setLocalSettings({...localSettings, year_of_study: parseInt(e.target.value)})}
                    className="input-field"
                  >
                    {[1,2,3,4,5,6].map(y => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Semester</label>
                  <select 
                    value={localSettings.semester}
                    onChange={e => setLocalSettings({...localSettings, semester: parseInt(e.target.value)})}
                    className="input-field"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Summer / Special</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Number</label>
                  <input 
                    type="text" 
                    value={user?.profile?.admission_number || ''}
                    readOnly
                    className="input-field bg-gray-50 dark:bg-dark-border/30 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    value={localSettings.phone_number || user?.profile?.phone_number || ''}
                    onChange={e => setLocalSettings({...localSettings, phone_number: e.target.value})}
                    placeholder="+254 7XX XXX XXX"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose how and when you want to be notified.</p>
              </div>

              <div className="space-y-4">
                <ToggleSetting 
                  label="Push Notifications"
                  desc="Receive browser push notifications for important updates"
                  checked={localSettings.push_notifications}
                  onChange={v => setLocalSettings({...localSettings, push_notifications: v})}
                />
                <ToggleSetting 
                  label="Email Notifications"
                  desc="Get weekly digests and important emails to your student email"
                  checked={localSettings.email_notifications}
                  onChange={v => setLocalSettings({...localSettings, email_notifications: v})}
                />
                <ToggleSetting 
                  label="Event Reminders"
                  desc="Get reminded 24 hours and 1 hour before events you RSVP'd to"
                  checked={localSettings.event_reminders}
                  onChange={v => setLocalSettings({...localSettings, event_reminders: v})}
                />
                <ToggleSetting 
                  label="Election Alerts"
                  desc="Be notified when new elections open and results are published"
                  checked={localSettings.election_alerts}
                  onChange={v => setLocalSettings({...localSettings, election_alerts: v})}
                />
                <ToggleSetting 
                  label="Announcement Digest"
                  desc="Daily summary of all announcements instead of instant alerts"
                  checked={localSettings.announcement_digest || false}
                  onChange={v => setLocalSettings({...localSettings, announcement_digest: v})}
                />
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Privacy Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your information and contact you.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Visibility</label>
                  <select 
                    value={localSettings.privacy_mode}
                    onChange={e => setLocalSettings({...localSettings, privacy_mode: e.target.value})}
                    className="input-field"
                  >
                    <option value="public">Public — All students can see my profile</option>
                    <option value="members">Members Only — Only verified members</option>
                    <option value="friends">Friends Only — People I chat with</option>
                    <option value="private">Private — Hide everything except name</option>
                  </select>
                </div>

                <ToggleSetting 
                  label="Show Online Status"
                  desc="Let others see when you're active on the platform"
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

              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Data Privacy Notice</h3>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Your academic data is stored securely and never shared with third parties. 
                      Read our <Link to="/terms" className="underline">Privacy Policy</Link> for details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Appearance</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customize how LOTSA CONNECT looks for you.</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
                    <Palette size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
                    <p className="text-xs text-gray-500">Easier on the eyes during night study</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-gray-400" />
                  <select 
                    value={localSettings.language}
                    onChange={e => setLocalSettings({...localSettings, language: e.target.value})}
                    className="input-field w-auto"
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
            <div className="glass-card rounded-2xl p-6 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Accessibility</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Make the platform work better for your needs.</p>
              </div>

              <div className="space-y-4">
                <ToggleSetting 
                  label="Reduced Motion"
                  desc="Disable animations and transitions for better performance"
                  checked={localSettings.reduced_motion}
                  onChange={v => setLocalSettings({...localSettings, reduced_motion: v})}
                />
                <ToggleSetting 
                  label="High Contrast Mode"
                  desc="Increase contrast for better visibility"
                  checked={localSettings.high_contrast}
                  onChange={v => setLocalSettings({...localSettings, high_contrast: v})}
                />
                
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
                  <div className="flex gap-2">
                    {['small', 'normal', 'large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setLocalSettings({...localSettings, font_size: size})}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${localSettings.font_size === size 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className={`btn-primary flex items-center gap-2 ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
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
    <div className="flex items-start justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-dark-border/30 transition-colors">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg ${checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}