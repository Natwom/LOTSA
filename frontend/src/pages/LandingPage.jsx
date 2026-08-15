import { Link } from 'react-router-dom'
import { 
  ArrowRight, Users, Calendar, MessageSquare, Shield, 
  Zap, Heart, Globe, ChevronDown, GraduationCap,
  Vote, Megaphone, FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight">LOTSA CONNECT</span>
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 ml-2 font-medium">| LOTUBAE Student Association</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary flex items-center gap-2 text-sm">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-bg dark:via-dark-bg dark:to-primary-900/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-float animation-delay-500" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
            Your Campus Life,<br />
            <span className="text-gradient">Digitally Connected</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-100">
            The official digital hub for LOTUBAE Student Association. Events, elections, announcements, and real-time collaboration — all in one beautiful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up animation-delay-200">
            <Link to="/register" className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2">
              Join the Community <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base py-4 px-8 flex items-center justify-center gap-2">
              Already a Member? Sign In
            </Link>
          </div>

          <div className="mt-16 flex justify-center animate-bounce-subtle">
            <ChevronDown size={24} className="text-gray-400" />
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="relative -mt-20 z-10 max-w-6xl mx-auto px-4">
        <div className="glass-card rounded-2xl p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to="/events" className="group flex flex-col items-center justify-center p-5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Calendar size={22} />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Explore Events</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Register & RSVP</span>
          </Link>

          <Link to="/elections" className="group flex flex-col items-center justify-center p-5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
              <Vote size={22} />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Cast Your Vote</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Secure Elections</span>
          </Link>

          <Link to="/announcements" className="group flex flex-col items-center justify-center p-5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <Megaphone size={22} />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">Announcements</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stay Informed</span>
          </Link>

          <Link to="/complaints" className="group flex flex-col items-center justify-center p-5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform duration-300">
              <FileText size={22} />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">File Complaint</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get Support</span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Students,<br />by Students</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Every feature designed to make campus life smoother, more connected, and more engaging.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Users size={24} />} 
              title="Student Management" 
              desc="Digital profiles, admission tracking, and secure membership verification with ID cards."
              color="from-blue-500 to-cyan-500"
              delay="animation-delay-100"
            />
            <FeatureCard 
              icon={<Calendar size={24} />} 
              title="Events & Activities" 
              desc="Create, discover, and RSVP to events. Get reminders and check in digitally at venues."
              color="from-emerald-500 to-teal-500"
              delay="animation-delay-200"
            />
            <FeatureCard 
              icon={<Shield size={24} />} 
              title="Secure Elections" 
              desc="Transparent, anonymous voting with real-time results. One student, one vote, fully audited."
              color="from-violet-500 to-purple-500"
              delay="animation-delay-300"
            />
            <FeatureCard 
              icon={<MessageSquare size={24} />} 
              title="Real-time Chat" 
              desc="Group conversations, direct messages, and file sharing with read receipts."
              color="from-pink-500 to-rose-500"
              delay="animation-delay-100"
            />
            <FeatureCard 
              icon={<Heart size={24} />} 
              title="Complaint Portal" 
              desc="Submit anonymous or named complaints. Track resolution status and admin responses."
              color="from-orange-500 to-amber-500"
              delay="animation-delay-200"
            />
            <FeatureCard 
              icon={<Globe size={24} />} 
              title="Leadership Directory" 
              desc="Browse current student leaders, their portfolios, and direct contact channels."
              color="from-indigo-500 to-primary-500"
              delay="animation-delay-300"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Campus Experience?</h2>
          <p className="text-primary-100 text-lg mb-10 max-w-xl mx-auto">Join thousands of LOTUBAE students already using the platform to stay informed, get involved, and make their voice heard.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors shadow-xl">
              Create Free Account
            </Link>
            <Link to="/terms" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
              Read Terms & Conditions
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="text-white font-bold">LOTSA CONNECT</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link to="/login" className="hover:text-white transition-colors">Student Login</Link>
              <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            </div>
            <div className="text-sm">© 2024 LOTUBAE Student Association. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, color, delay }) {
  return (
    <div className={`group p-6 rounded-2xl bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-dark-border hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 ${delay}`}>
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}