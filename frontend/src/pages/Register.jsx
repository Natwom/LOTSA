import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { 
  Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, 
  GraduationCap, User, Hash, BookOpen, 
  Calendar, Mail, Phone, Lock, ShieldCheck, Zap,
  Users, Crown, UserCog
} from 'lucide-react'

const ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap },
  { key: 'patron', label: 'Patron', icon: Crown },
  { key: 'deputy_patron', label: 'Deputy Patron', icon: UserCog },
  { key: 'committee_member', label: 'Committee Member', icon: Users },
]

export default function Register() {
  const [form, setForm] = useState({
    role: 'student',
    full_name: '', admission_number: '', course: '', year_of_study: '', 
    email: '', phone_number: '', password: '', confirm_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [admissionError, setAdmissionError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const isStudent = form.role === 'student'

  const formatKenyanPhone = (value) => {
    let digits = value.replace(/\D/g, '')
    if (digits.startsWith('0')) digits = '254' + digits.slice(1)
    if (digits.startsWith('7') && digits.length <= 9) digits = '254' + digits
    if (digits.length > 12) digits = digits.slice(0, 12)
    return digits
  }

  const validateKenyanPhone = (digits) => {
    if (!digits) { setPhoneError(''); return true }
    if (!digits.startsWith('254')) { setPhoneError('Must start with 254 or 07'); return false }
    if (digits.length !== 12) { setPhoneError(`${12 - digits.length} more digits needed`); return false }
    const prefix = digits.slice(3, 5)
    const validPrefixes = ['10', '11', '12', '70', '71', '72', '73', '74', '79', '75', '76', '77', '78']
    if (!validPrefixes.includes(prefix)) { setPhoneError('Invalid prefix'); return false }
    setPhoneError(''); return true
  }

  const handlePhoneChange = (e) => {
    const digits = formatKenyanPhone(e.target.value)
    setForm({ ...form, phone_number: digits })
    validateKenyanPhone(digits)
  }

  const displayPhone = (digits) => {
    if (!digits) return ''
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }

  const validateAdmission = (value) => {
    if (!value) { setAdmissionError(''); return true }
    const match = value.match(/^LOTSA 2025(\d{4})$/)
    if (!match) { setAdmissionError('Format: LOTSA 2025XXXX'); return false }
    if (new Set(match[1]).size !== 4) { setAdmissionError('4 digits must all be different'); return false }
    setAdmissionError(''); return true
  }

  const handleAdmissionChange = (e) => {
    const value = e.target.value.toUpperCase()
    setForm({ ...form, admission_number: value })
    validateAdmission(value)
  }

  const isStep1Valid = () => {
    const base = form.full_name && form.phone_number && !phoneError && form.phone_number.length === 12
    if (!isStudent) return base
    return base && form.admission_number && !admissionError && form.course && form.year_of_study
  }

  const isStep2Valid = () => {
    return form.email && form.password && form.password.length >= 6 && form.password === form.confirm_password
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return }
    if (isStudent && !validateAdmission(form.admission_number)) { setError('Fix admission number'); return }
    if (!validateKenyanPhone(form.phone_number)) { setError('Invalid phone'); return }
    setError('')
    setIsLoading(true)

    // Build payload as plain strings for the backup endpoint
    const payload = new URLSearchParams()
    payload.append('email', form.email)
    payload.append('password', form.password)
    payload.append('full_name', form.full_name)
    payload.append('phone_number', form.phone_number || '')
    payload.append('role', form.role)

    if (isStudent) {
      payload.append('admission_number', form.admission_number)
      payload.append('course', form.course)
      payload.append('year_of_study', form.year_of_study)
    }

    try {
      // Use the backup endpoint in main.py which accepts form data
      const res = await axios.post('/auth/register', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      console.log('Registration success:', res.data)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      console.error('FULL ERROR:', err)
      const detail = err.response?.data?.detail
      const msg = typeof detail === 'string' ? detail : JSON.stringify(err.response?.data || 'Unknown error')
      setError(msg)
      setIsLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="text-center text-white">
        <CheckCircle size={40} className="mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Welcome to LOTSA!</h2>
        <p className="text-blue-200">Redirecting to login...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <GraduationCap size={28} className="text-white mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white">LOTSA CONNECT</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-sm text-gray-500 mb-4">{isStudent ? (step === 1 ? 'Step 1: Student Info' : 'Step 2: Account') : 'Leadership Registration'}</p>

          {/* Role Selector */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Register as</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon
                const active = form.role === r.key
                return (
                  <button key={r.key} type="button" onClick={() => { setForm({ ...form, role: r.key }); setStep(1); setError('') }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    <Icon size={16} /> {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                      placeholder="John Doe" className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {isStudent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Admission No.</label>
                      <div className="relative">
                        <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required value={form.admission_number} onChange={handleAdmissionChange}
                          placeholder="LOTSA 2025XXXX"
                          className={`w-full pl-9 pr-3 py-2.5 border rounded-xl font-mono text-sm uppercase focus:ring-2 focus:ring-blue-500 ${admissionError ? 'border-red-300 bg-red-50' : form.admission_number && !admissionError ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`} />
                      </div>
                      {admissionError && <p className="text-[11px] text-red-500 mt-1">{admissionError}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Course</label>
                      <div className="relative">
                        <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required value={form.course} onChange={e => setForm({...form, course: e.target.value})}
                          placeholder="Computer Science" className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Year</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select required value={form.year_of_study} onChange={e => setForm({...form, year_of_study: e.target.value})}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
                          <option value="">Select Year</option>
                          {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone (Kenyan)</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required value={displayPhone(form.phone_number)} onChange={handlePhoneChange}
                      placeholder="07XX XXX XXX" inputMode="numeric"
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-mono tracking-wide ${phoneError ? 'border-red-300 bg-red-50' : form.phone_number && !phoneError && form.phone_number.length === 12 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`} />
                  </div>
                  {phoneError && <p className="text-[11px] text-red-500 mt-1">{phoneError}</p>}
                </div>

                <button type="button" onClick={() => isStep1Valid() && setStep(2)} disabled={!isStep1Valid()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="name@email.com" className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} required minLength={6}
                      value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                      placeholder="Min. 6 characters" className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showConfirm ? 'text' : 'password'} required
                      value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})}
                      placeholder="Repeat password"
                      className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 ${form.confirm_password && form.password !== form.confirm_password ? 'border-red-300 bg-red-50' : form.confirm_password && form.password === form.confirm_password ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirm_password && form.password !== form.confirm_password && <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>}
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">Back</button>
                  <button type="submit" disabled={!isStep2Valid() || isLoading}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}