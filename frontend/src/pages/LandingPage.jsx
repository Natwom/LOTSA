import { Link } from 'react-router-dom'
import { 
  ArrowRight, Users, Calendar, MessageSquare, Shield, 
  Zap, Heart, Globe, ChevronDown, GraduationCap,
  Menu, X, MapPin, Star
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-slate-200 py-3 shadow-sm' : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">LOTSA CONNECT</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2 font-medium">LOTUBAE Student Association</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">Features</a>
            <Link to="/leaders" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">Leadership</Link>
            <Link to="/terms" className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors">Terms</Link>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 px-4 py-2">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg py-4 px-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Features</a>
            <Link to="/leaders" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Leadership</Link>
            <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-600 py-2">Terms</Link>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" className="text-sm font-semibold text-center py-2.5 border border-slate-200 rounded-lg">Sign In</Link>
              <Link to="/register" className="text-sm font-semibold bg-emerald-600 text-white text-center py-2.5 rounded-lg">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <MapPin size={12} />
            Bridging Campuses. Building Futures.
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
            The Official Network for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">LOTUBAE Students</span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            One platform connecting university and college students across the nation. 
            Events, elections, contributions, and real-time collaboration — all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Join the Community <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">
              Already a Member? Sign In
            </Link>
          </div>

          <div className="mt-16 flex justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-emerald-500" />
              <span className="font-medium">Free for Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" />
              <span className="font-medium">Secure Voting</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-500" />
              <span className="font-medium">Instant Alerts</span>
            </div>
          </div>

          <div className="mt-12 animate-bounce">
            <a href="#features" className="text-slate-400 hover:text-emerald-600 transition-colors">
              <ChevronDown size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-12 z-10 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,500+', label: 'Registered Students', icon: Users },
            { value: '150+', label: 'Events Hosted', icon: Calendar },
            { value: '100%', label: 'Digital Voting', icon: Shield },
            { value: '24/7', label: 'Platform Access', icon: Zap },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon size={20} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Platform Features</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-4">Everything You Need in One Place</h2>
            <p className="text-slate-600 text-lg">From digital membership cards to secure elections, LOTSA CONNECT handles it all so you can focus on your studies and community.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users size={22} />} 
              title="Digital Membership" 
              desc="Apply for your official LOTSA membership card, track payments, and verify your status digitally. Valid for one full academic year."
              color="bg-blue-600"
            />
            <FeatureCard 
              icon={<Calendar size={22} />} 
              title="Events & Activities" 
              desc="Discover upcoming events, RSVP instantly, and receive reminders. From academic seminars to cultural celebrations across campuses."
              color="bg-emerald-600"
            />
            <FeatureCard 
              icon={<Shield size={22} />} 
              title="Secure Elections" 
              desc="Cast your vote with confidence. Our transparent, anonymous voting system ensures fair leadership selection with real-time results."
              color="bg-violet-600"
            />
            <FeatureCard 
              icon={<MessageSquare size={22} />} 
              title="Real-time Messaging" 
              desc="Stay connected with group chats, direct messages, and file sharing. Built-in read receipts and instant notifications."
              color="bg-pink-600"
            />
            <FeatureCard 
              icon={<Heart size={22} />} 
              title="Complaint Portal" 
              desc="Submit anonymous or named complaints. Track resolution status and admin responses from the Welfare Committee."
              color="bg-orange-600"
            />
            <FeatureCard 
              icon={<Globe size={22} />} 
              title="Leadership Directory" 
              desc="Browse the current executive committee, view their portfolios, and access direct communication channels with student leaders."
              color="bg-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to Join the Community?</h2>
          <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Become a verified member today and unlock full access to voting, events, exclusive announcements, and direct communication with student leadership across campuses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold text-base hover:bg-emerald-50 transition-colors shadow-xl inline-flex items-center justify-center gap-2">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/terms" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/10 transition-colors inline-flex items-center justify-center">
              Read Terms & Conditions
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <span className="text-white font-bold text-xl">LOTSA CONNECT</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm mb-6">
                The official digital platform of the LOTUBAE Student Association. Empowering university and college students through technology, transparency, and community.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <Globe size={18} />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <MessageSquare size={18} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Register</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Report an Issue</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">© 2026 LOTUBAE Student Association. All rights reserved.</div>
            <div className="text-sm">Built for students, by students.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color }) {
  return (
    <div className="group p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}