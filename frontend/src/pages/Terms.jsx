import { useState } from 'react'
import { 
  Shield, BookOpen, Vote, MessageSquare, FileText, 
  CheckCircle, AlertCircle, ChevronDown, GraduationCap 
} from 'lucide-react'
import { Link } from 'react-router-dom'

const sections = [
  {
    id: 'conduct',
    icon: Shield,
    title: 'Student Code of Conduct',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
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
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
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
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
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
    color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400',
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
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
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
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
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

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
          <GraduationCap size={32} className="text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Terms & Conditions</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          The rules and guidelines governing your use of LOTSA CONNECT. By using this platform, you agree to abide by these terms.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-dark-border rounded-full text-xs font-medium text-gray-500 dark:text-gray-400">
          <BookOpen size={12} /> Last updated: January 15, 2024 • Version 2.1
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-4 mb-10">
        {sections.map(section => {
          const isOpen = expanded.includes(section.id)
          const Icon = section.icon
          return (
            <div 
              key={section.id} 
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-lg' : ''}`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
              >
                <div className={`p-2.5 rounded-xl ${section.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{section.title}</h3>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-0">
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle size={16} className="text-primary-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Acceptance */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="flex items-start gap-3 justify-center mb-4">
          <button
            onClick={() => setAccepted(!accepted)}
            className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${accepted ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}
          >
            {accepted && <CheckCircle size={14} className="text-white" />}
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
            I have read and agree to abide by the LOTSA CONNECT Terms & Conditions, 
            Student Code of Conduct, and Data Privacy Policy. I understand that violation 
            of these terms may result in suspension of my account and referral to the 
            University Disciplinary Committee.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            disabled={!accepted}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${accepted 
              ? 'btn-primary' 
              : 'bg-gray-200 dark:bg-dark-border text-gray-400 cursor-not-allowed'
            }`}
          >
            I Agree to Terms
          </button>
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Questions about these terms? Contact the <a href="#" className="text-primary-600 hover:underline">LOTSA Legal & Welfare Committee</a>
        </p>
      </div>
    </div>
  )
}