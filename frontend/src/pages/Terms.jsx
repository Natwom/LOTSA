import { useState } from 'react'
import { 
  Shield, BookOpen, Vote, MessageSquare, FileText, 
  CheckCircle, AlertCircle, ChevronDown, GraduationCap,
  Clock, Mail, ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  {
    id: 'conduct',
    icon: Shield,
    title: 'Student Code of Conduct',
    color: 'text-blue-700 bg-blue-50 border-blue-100',
    content: [
      'All users must be currently enrolled students of LOTUBAE or verified alumni.',
      'Respectful communication is mandatory. Harassment, bullying, hate speech, or discrimination of any kind will result in immediate account suspension.',
      'Impersonation of other students, staff, or student leaders is strictly prohibited and may lead to disciplinary action by the university.',
      'Content shared must be appropriate for an academic environment. NSFW content, spam, or malicious links are forbidden.',
      'Students are responsible for all activity under their account. Do not share login credentials.',
    ]
  },
  {
    id: 'privacy',
    icon: Shield,
    title: 'Data Privacy & Protection',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    content: [
      'Your personal data (name, admission number, course, email) is collected solely for platform authentication and association management.',
      'We do not sell, rent, or share your data with third-party advertisers or external organizations.',
      'Academic records and voting history are encrypted and stored securely. Only authorized administrators can access sensitive data.',
      'You have the right to request a copy of your data or request deletion of your account by contacting the LOTSA IT Committee.',
      'Anonymous complaints are truly anonymous — no identifying metadata is stored with anonymous submissions.',
    ]
  },
  {
    id: 'elections',
    icon: Vote,
    title: 'Election Rules & Voting',
    color: 'text-violet-700 bg-violet-50 border-violet-100',
    content: [
      'Only students with active LOTSA membership and verified student status are eligible to vote in elections.',
      'Each student may cast exactly one vote per election position. Duplicate votes are automatically rejected by the system.',
      'Election results are calculated in real-time but kept sealed until the official announcement time set by the Electoral Commission.',
      'Campaigning within the platform must follow the LOTSA Electoral Code. No negative campaigning or personal attacks.',
      'Candidates must submit a manifesto and valid student ID before appearing on the ballot.',
      'Disputes regarding election results must be filed within 48 hours of result publication.',
    ]
  },
  {
    id: 'chat',
    icon: MessageSquare,
    title: 'Chat & Communication Guidelines',
    color: 'text-teal-700 bg-teal-50 border-teal-100',
    content: [
      'All chat messages are subject to moderation. The platform uses automated scanning for harmful content.',
      'Group chat creators are responsible for managing their groups and removing inappropriate members.',
      'Direct messages are private but may be reviewed if a harassment report is filed.',
      'File sharing is limited to 10MB per file. Executable files (.exe, .bat) are blocked for security.',
      'Voice messages and video calls may be recorded by the platform for safety audits (participants will be notified).',
    ]
  },
  {
    id: 'membership',
    icon: FileText,
    title: 'Membership & Payments',
    color: 'text-amber-700 bg-amber-50 border-amber-100',
    content: [
      'LOTSA membership is annual and must be renewed at the beginning of each academic year.',
      'Membership fees are non-refundable except in cases of erroneous duplicate payment.',
      'Payment receipts (M-Pesa) must be retained for at least 30 days as proof of transaction.',
      'Membership cards are digital-first but physical cards can be requested at the LOTSA office.',
      'Membership privileges (voting, event discounts, leadership nomination) are activated within 24 hours of payment confirmation.',
    ]
  },
  {
    id: 'complaints',
    icon: AlertCircle,
    title: 'Complaints & Grievances',
    color: 'text-red-700 bg-red-50 border-red-100',
    content: [
      'Students may file complaints anonymously or with their identity revealed.',
      'All complaints are reviewed by the LOTSA Welfare Committee within 5 business days.',
      'False or malicious complaints intended to harm another student are grounds for disciplinary action.',
      'Complaint submitters will receive status updates at each stage: Received → Under Review → Resolved.',
      'If unsatisfied with the resolution, students may escalate to the University Dean of Students.',
    ]
  },
]

export default function Terms() {
  const [expanded, setExpanded] = useState(['conduct'])
  const [accepted, setAccepted] = useState(false)

  const toggleSection = (id) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const expandAll = () => setExpanded(sections.map(s => s.id))
  const collapseAll = () => setExpanded([])

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Terms & Conditions
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            The rules and guidelines governing your use of LOTSA CONNECT. By using this platform, you agree to abide by these terms as a LOTUBAE student.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm">
            <BookOpen size={12} /> Last updated: August 2026 • Version 2.1
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end gap-3 mb-4">
          <button 
            onClick={expandAll}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition-colors"
          >
            Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button 
            onClick={collapseAll}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-wider transition-colors"
          >
            Collapse All
          </button>
        </div>

        {/* Accordion */}
        <div className="space-y-3 mb-10">
          {sections.map(section => {
            const isOpen = expanded.includes(section.id)
            const Icon = section.icon
            return (
              <div 
                key={section.id} 
                className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-slate-200 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className={`p-2.5 rounded-lg ${section.color} border`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{section.title}</h3>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-6 pt-0">
                    <div className="pl-12 border-l-2 border-slate-100 ml-5">
                      <ul className="space-y-3.5">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                            <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Acceptance Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-emerald-600" />
            Agreement Required
          </h3>
          
          <div 
            onClick={() => setAccepted(!accepted)}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${accepted ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
          >
            <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${accepted ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 bg-white'}`}>
              {accepted && <CheckCircle size={14} className="text-white" />}
            </div>
            <p className={`text-sm leading-relaxed ${accepted ? 'text-emerald-800' : 'text-slate-600'}`}>
              I have read and agree to abide by the LOTSA CONNECT Terms & Conditions, 
              Student Code of Conduct, and Data Privacy Policy. I understand that violation 
              of these terms may result in suspension of my account and referral to the 
              University Disciplinary Committee.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button 
              disabled={!accepted}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${accepted 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:shadow-xl' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle size={16} /> I Agree to Terms
            </button>
            <Link 
              to="/register" 
              className="px-8 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
            >
              Back to Registration
            </Link>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="mt-8 text-center bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail size={16} className="text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">Need Clarification?</span>
          </div>
          <p className="text-sm text-slate-500">
            Contact the <a href="#" className="text-emerald-600 font-semibold hover:underline">LOTSA Legal & Welfare Committee</a> for questions regarding these terms.
          </p>
        </div>

        {/* Bottom Spacing */}
        <div className="mt-8 text-center text-xs text-slate-400">
          © 2026 LOTUBAE Student Association. All rights reserved.
        </div>
      </div>
    </div>
  )
}