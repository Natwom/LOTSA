import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import { 
  Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, 
  GraduationCap, User, Hash, BookOpen, 
  Calendar, Mail, Phone, Lock, ShieldCheck, Zap 
} from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
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

  // ==================== KENYAN PHONE VALIDATION ====================

  const formatKenyanPhone = (value) => {
    let digits = value.replace(/\D/g, '')
    if (digits.startsWith('0')) {
      digits = '254' + digits.slice(1)
    }
    if (digits.startsWith('7') && digits.length <= 9) {
      digits = '254' + digits
    }
    if (digits.length > 12) {
      digits = digits.slice(0, 12)
    }
    return digits
  }

  const validateKenyanPhone = (digits) => {
    if (!digits) {
      setPhoneError('')
      return true
    }
    if (!digits.startsWith('254')) {
      setPhoneError('Must start with 254 or 07')
      return false
    }
    if (digits.length !== 12) {
      setPhoneError(`${12 - digits.length} more digits needed`)
      return false
    }
    const prefix = digits.slice(3, 5)
    const validPrefixes = ['10', '11', '12', '70', '71', '72', '73', '74', '79', '75', '76', '77', '78']
    if (!validPrefixes.includes(prefix)) {
      setPhoneError('Invalid prefix. Valid: 070x-079x, 010x-012x')
      return false
    }
    setPhoneError('')
    return true
  }

  const handlePhoneChange = (e) => {
    const raw = e.target.value
    const digits = formatKenyanPhone(raw)
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

  // ==================== ADMISSION VALIDATION ====================

  const validateAdmission = (value) => {
    if (!value) {
      setAdmissionError('')
      return true
    }
    const pattern = /^LOTSA 2025(\d{4})$/
    const match = value.match(pattern)
    if (!match) {
      setAdmissionError('Format: LOTSA 2025XXXX')
      return false
    }
    const digits = match[1]
    const uniqueDigits = new Set(digits)
    if (uniqueDigits.size !== 4) {
      setAdmissionError('4 digits must all be different')
      return false
    }
    setAdmissionError('')
    return true
  }

  const handleAdmissionChange = (e) => {
    const value = e.target.value.toUpperCase()
    setForm({ ...form, admission_number: value })
    validateAdmission(value)
  }

  // ==================== STEP VALIDATION ====================

  const isStep1Valid = () => {
    return form.full_name && 
           form.admission_number && 
           !admissionError && 
           form.course && 
           form.year_of_study &&
           form.phone_number &&
           !phoneError &&
           form.phone_number.length === 12
  }

  const isStep2Valid = () => {
    return form.email && 
           form.password && 
           form.password.length >= 6 && 
           form.password === form.confirm_password
  }

  // ==================== SUBMIT ====================

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (!validateAdmission(form.admission_number)) {
      setError('Please fix the admission number format')
      return
    }
    if (!validateKenyanPhone(form.phone_number)) {
      setError('Please enter a valid Kenyan phone number')
      return
    }
    setError('')
    setIsLoading(true)

    const payload = {
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      admission_number: form.admission_number,
      course: form.course,
      year_of_study: parseInt(form.year_of_study),
      phone_number: form.phone_number || null
    }
    console.log('Sending registration payload:', payload)

    try {
      const res = await axios.post('/auth/register', payload)
      console.log('Registration success:', res.data)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      console.error('FULL ERROR:', err)
      const detail = err.response?.data?.detail
      const msg = typeof detail === 'string' 
        ? detail 
        : (typeof err.response?.data === 'string' ? err.response.data : JSON.stringify(err.response?.data))
      setError(msg || `Server error (${err.response?.status || 'unknown'})`)
      setIsLoading(false)
    }
  }

  // ==================== SUCCESS SCREEN ====================

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden p-4">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative text-center">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/20 shadow-xl">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Welcome to LOTSA!</h2>
        <p className="text-blue-200 text-lg mb-2">Your account has been created successfully.</p>
        <p className="text-blue-300/80 text-sm">Redirecting you to login...</p>
        <div className="mt-6 w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-white rounded-full animate-[loading_2.5s_ease-out_forwards]" style={{
            animation: 'loading 2.5s ease-out forwards'
          }} />
        </div>
      </div>
    </div>
  )

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden p-4">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-3 ring-1 ring-white/20 shadow-xl">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">LOTSA CONNECT</h1>
          <p className="text-blue-200/80 text-sm font-medium mt-1">Join the LOTUBAE Student Community</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-8 border border-white/10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 ? 'Step 1: Student Information' : 'Step 2: Account Security'}
            </p>
            {/* Progress bar */}
            <div className="mt-4 flex gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        required 
                        value={form.full_name} 
                        onChange={e => setForm({...form, full_name: e.target.value})}
                        placeholder="Daniel Natwom"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Admission Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Admission No.</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        required 
                        value={form.admission_number} 
                        onChange={handleAdmissionChange}
                        placeholder="LOTSA 2025XXXX"
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                          admissionError 
                            ? 'border-red-300 bg-red-50' 
                            : form.admission_number && !admissionError
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      />
                    </div>
                    {admissionError && (
                      <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle size={10} /> {admissionError}
                      </p>
                    )}
                    {!admissionError && form.admission_number && (
                      <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1">
                        <ShieldCheck size={10} /> Valid format
                      </p>
                    )}
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Course</label>
                    <div className="relative">
                      <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        required 
                        value={form.course} 
                        onChange={e => setForm({...form, course: e.target.value})}
                        placeholder="e.g. Computer Science"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Year</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select 
                        required 
                        value={form.year_of_study} 
                        onChange={e => setForm({...form, year_of_study: e.target.value})}
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm appearance-none"
                      >
                        <option value="">Select Year</option>
                        {[1,2,3,4,5,6].map(y => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone <span className="text-[10px] font-normal normal-case text-gray-400">(Kenyan)</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required 
                      value={displayPhone(form.phone_number)} 
                      onChange={handlePhoneChange}
                      placeholder="07XX XXX XXX"
                      inputMode="numeric"
                      className={`w-full pl-9 pr-12 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-mono tracking-wide ${
                        phoneError 
                          ? 'border-red-300 bg-red-50' 
                          : form.phone_number && !phoneError && form.phone_number.length === 12
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {form.phone_number && !phoneError && form.phone_number.length === 12 && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </div>
                  </div>
                  {phoneError && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle size={10} /> {phoneError}
                    </p>
                  )}
                  {!phoneError && form.phone_number && form.phone_number.length === 12 && (
                    <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1">
                      <ShieldCheck size={10} /> Valid Kenyan number
                    </p>
                  )}
                  {form.phone_number && form.phone_number.length < 12 && !phoneError && (
                    <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
                      <Zap size={10} /> {12 - form.phone_number.length} more digits
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enter as 07XX XXX XXX or 2547XX XXX XXX
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={() => isStep1Valid() && setStep(2)}
                  disabled={!isStep1Valid()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      required 
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="student@lotsa.ac.ke"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      minLength={6}
                      value={form.password} 
                      onChange={e => setForm({...form, password: e.target.value})}
                      placeholder="Min. 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength */}
                  <div className="flex gap-1 mt-1.5">
                    {[1,2,3,4].map(i => (
                      <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          form.password.length >= i * 2 ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type={showConfirm ? 'text' : 'password'} 
                      required 
                      value={form.confirm_password} 
                      onChange={e => setForm({...form, confirm_password: e.target.value})}
                      placeholder="Repeat password"
                      className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm ${
                        form.confirm_password && form.password !== form.confirm_password
                          ? 'border-red-300 bg-red-50'
                          : form.confirm_password && form.password === form.confirm_password
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirm(!showConfirm)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirm_password && form.password !== form.confirm_password && (
                    <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 pt-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    required
                    id="terms"
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-800 transition-colors leading-relaxed">
                    I agree to the <Link to="/terms" className="text-blue-600 hover:underline font-bold">Terms & Conditions</Link> and <Link to="/terms" className="text-blue-600 hover:underline font-bold">Privacy Policy</Link>
                  </span>
                </label>

                <div className="flex gap-3 pt-1">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={!isStep2Valid() || isLoading}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
                Sign In
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
              <Zap size={10} />
              <span>Secure, encrypted, and student-verified</span>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/60">
          <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          <span className="text-white/20">•</span>
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span className="text-white/20">•</span>
          <span className="text-white/40">© 2024 LOTSA</span>
        </div>
      </div>
    </div>
  )
}