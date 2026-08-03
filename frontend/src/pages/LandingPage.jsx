import { Link } from 'react-router-dom'
import { 
  ArrowRight, Users, Calendar, MessageSquare, Shield, 
  Zap, Heart, Globe, ChevronDown, GraduationCap,
  Menu, X, MapPin, Star, CheckCircle, TrendingUp
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

  const navLinks = [
    { name: 'Features', href: '#features', type: 'scroll' },
    { name: 'How It Works', href: '#how-it-works', type: 'scroll' },
    { name: 'Leadership', href: '/leaders', type: 'route' },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/90 backdrop-blur-md border-slate-200 py-3 shadow-sm' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">LOTSA CONNECT</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-none mt-0.5">LOTUBAE Student Association</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.type === 'scroll' ? (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors px-4 py-2">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2">
                Get Started <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg py-4 px-4 space-y-3">
            {navLinks.map((link) => (
              link.type === 'scroll' ? (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="block text-sm font-medium text-slate-600 hover:text-emerald-700 py-2"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-slate-600 hover:text-emerald-700 py-2"
                >
                  {link.name}
                </Link>
              )
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 text-center py-2.5 border border-slate-200 rounded-lg">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold bg-emerald-600 text-white text-center py-2.5 rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <MapPin size={12} />
                Bridging Campuses. Building Futures.
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                The Official Network for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">LOTUBAE Students</span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                One platform connecting university and college students across the nation. Membership, events, elections, contributions, and real-time collaboration — all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5">
                  Join the Community <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
                  Member Login
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
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
            </div>

            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Zap size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Latest Announcement</div>
                      <div className="text-xs text-slate-500">Posted 2 hours ago</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">New</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="h-2 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-2 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <Users size={20} className="text-emerald-600 mb-2" />
                    <div className="text-lg font-bold text-emerald-900">2,540</div>
                    <div className="text-xs text-emerald-700 font-medium">Active Members</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Calendar size={20} className="text-blue-600 mb-2" />
                    <div className="text-lg font-bold text-blue-900">12</div>
                    <div className="text-xs text-blue-700 font-medium">Upcoming Events</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Election Status</div>
                  <div className="text-sm font-bold text-slate-900">Voting Live</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <a href="#features" className="text-slate-400 hover:text-emerald-600 transition-colors">
              <ChevronDown size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-16 z-10 max-w-6xl mx-auto px-4">
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
              icon={<FileText size={22} />} 
              title="Contributions & Finance" 
              desc="Track monthly contributions, view payment history, and manage your financial obligations to the association transparently."
              color="bg-amber-600"
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

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 mb-4">Get Started in Minutes</h2>
            <p className="text-slate-600 text-lg">Joining LOTSA CONNECT is quick and straightforward. Follow these simple steps to become an active member.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-emerald-100" />

            {[
              { step: '01', title: 'Create Account', desc: 'Register with your student email and complete your profile with admission details.', icon: Users },
              { step: '02', title: 'Get Membership', desc: 'Pay Ksh 100 via M-Pesa Paybill 254254, Account 12345678, and receive your digital card.', icon: CheckCircle },
              { step: '03', title: 'Participate', desc: 'Vote in elections, join events, submit complaints, and engage with the community.', icon: Star },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <div className={`w-16 h-16 ${i === 0 ? 'bg-blue-50 text-blue-600' : i === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} rounded-xl flex items-center justify-center`}>
                    <item.icon size={28} />
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            
            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-amber-400 fill-amber-400" />)}
                </div>
                <blockquote className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
                  "LOTSA CONNECT transformed how we engage with students across different campuses. Elections are fair, events are organized, and communication has never been easier."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    L
                  </div>
                  <div>
                    <div className="text-white font-bold">LOTSA Executive Committee</div>
                    <div className="text-slate-400 text-sm">2025/2026 Academic Year</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <TrendingUp size={24} className="text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">95%</div>
                  <div className="text-slate-400 text-sm">Student Engagement Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <CheckCircle size={24} className="text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">100%</div>
                  <div className="text-slate-400 text-sm">Election Transparency</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <Zap size={24} className="text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">&lt;2min</div>
                  <div className="text-slate-400 text-sm">Average Registration Time</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <Heart size={24} className="text-emerald-400 mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
                  <div className="text-slate-400 text-sm">Student Satisfaction</div>
                </div>
              </div>
            </div>
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
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}