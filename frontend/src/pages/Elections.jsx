import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Link } from 'react-router-dom'
import { 
  User, Clock, Lock, CreditCard, Vote, Search, Filter,
  Trophy, CheckCircle, AlertTriangle, ArrowRight, 
  Shield, Calendar, Users, Loader2
} from 'lucide-react'

export default function Elections() {
  const [elections, setElections] = useState([])
  const [votedElections, setVotedElections] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('all')
  const [votingId, setVotingId] = useState(null)

  useEffect(() => {
    fetchElections()
    fetchMembership()
  }, [])

  const fetchElections = () => {
    setLoading(true)
    setError('')
    axios.get('/elections?active=true')
      .then((res) => {
        setElections(res.data || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Elections error:', err)
        setError(err.response?.data?.detail || 'Failed to load elections')
        setLoading(false)
      })

    axios.get('/elections/my-votes')
      .then((res) => {
        setVotedElections((res.data || []).map(v => v.election_id))
      })
      .catch(() => {})
  }

  const fetchMembership = () => {
    axios.get('/membership/my-card')
      .then((res) => setMembership(res.data))
      .catch(() => setMembership(null))
  }

  const castVote = async (electionId, candidateId) => {
    setVotingId(`${electionId}-${candidateId}`)
    try {
      await axios.post(`/elections/${electionId}/vote`, { candidate_id: candidateId })
      setVotedElections(prev => [...prev, electionId])
      // Small delay to show success state
      setTimeout(() => setVotingId(null), 800)
    } catch (err) {
      setVotingId(null)
      alert(err.response?.data?.detail || 'Voting failed')
    }
  }

  const hasValidMembership = membership && membership.is_active && new Date(membership.expiry_date) > new Date()

  const formatCountdown = (endTime) => {
    const end = new Date(endTime)
    const now = new Date()
    const diffMs = end - now

    if (diffMs <= 0) return 'Election ended'

    const diffDays = Math.floor(diffMs / 86400000)
    const diffHours = Math.floor((diffMs % 86400000) / 3600000)
    const diffMins = Math.floor((diffMs % 3600000) / 60000)

    if (diffDays > 0) return `${diffDays}d ${diffHours}h remaining`
    if (diffHours > 0) return `${diffHours}h ${diffMins}m remaining`
    return `${diffMins}m remaining`
  }

  const formatEndDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Position color coding
  const positionColors = {
    'Chairperson': 'bg-blue-600',
    'President': 'bg-blue-600',
    'Secretary': 'bg-purple-600',
    'Secretary General': 'bg-purple-600',
    'Treasurer': 'bg-emerald-600',
    'Organizing Secretary': 'bg-orange-600',
    'Academic Rep': 'bg-pink-600',
    'Welfare Rep': 'bg-teal-600',
    'Patron': 'bg-indigo-600',
    'Deputy Patron': 'bg-indigo-500',
    'Deputy President': 'bg-blue-500',
    'High school representative': 'bg-yellow-600',
    'Games Director': 'bg-red-600',
  }

  const getPositionColor = (pos) => positionColors[pos] || 'bg-gray-600'

  // Derive positions from data
  const positions = ['all', ...new Set(elections.map(e => e.position).filter(Boolean))]

  const filtered = elections.filter(election => {
    const matchesPosition = selectedPosition === 'all' || election.position === selectedPosition
    const matchesSearch = !searchQuery ||
      election.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (election.candidates || []).some(c => 
        c.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesPosition && matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-red-700">{error}</h3>
        <p className="text-red-500 text-sm mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Vote size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Active Elections</h1>
          </div>
          <p className="text-purple-100 text-lg max-w-2xl leading-relaxed">
            Cast your vote and shape the future of LOTSA. Every vote counts in building our student community.
          </p>
        </div>
      </div>

      {/* Membership Status Bar */}
      <div className={`rounded-xl p-4 flex items-center gap-4 border ${
        hasValidMembership 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          hasValidMembership ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          {hasValidMembership ? (
            <Shield size={24} className="text-green-600" />
          ) : (
            <Lock size={24} className="text-amber-600" />
          )}
        </div>
        <div className="flex-1">
          <p className={`font-bold text-sm ${hasValidMembership ? 'text-green-800' : 'text-amber-800'}`}>
            {hasValidMembership ? 'Membership Verified — You are eligible to vote' : 'Membership Required to Vote'}
          </p>
          <p className={`text-xs mt-0.5 ${hasValidMembership ? 'text-green-600' : 'text-amber-600'}`}>
            {hasValidMembership 
              ? 'Your membership card is active. You can participate in all open elections.' 
              : 'You need an active membership card to view candidates and cast your vote.'}
          </p>
        </div>
        {!hasValidMembership && (
          <Link 
            to="/membership" 
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <CreditCard size={14} /> Apply Now
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search elections or candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {positions.map(pos => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                selectedPosition === pos 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {pos === 'all' ? 'All Elections' : pos}
            </button>
          ))}
        </div>
      </div>

      {/* Elections List */}
      {filtered.length > 0 ? (
        <div className="space-y-6">
          {filtered.map(election => {
            const isVoted = votedElections.includes(election.id)
            const isLocked = election.require_membership && !hasValidMembership
            const countdown = formatCountdown(election.end_time)
            const posColor = getPositionColor(election.position)

            return (
              <div 
                key={election.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Election Header */}
                <div className="p-6 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`${posColor} text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                          {election.position}
                        </span>
                        {isVoted && (
                          <span className="bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle size={10} /> Voted
                          </span>
                        )}
                        {election.require_membership && (
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Shield size={10} /> Members Only
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{election.title}</h2>
                      <p className="text-gray-500 text-sm mt-1 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} /> Ends {formatEndDate(election.end_time)}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className={`flex items-center gap-1.5 font-semibold ${
                          countdown === 'Election ended' ? 'text-red-500' : 'text-purple-600'
                        }`}>
                          <Clock size={13} /> {countdown}
                        </span>
                      </p>
                    </div>
                  </div>

                  {election.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">{election.description}</p>
                  )}
                </div>

                {/* Candidates Section */}
                <div className="px-6 pb-6">
                  {isLocked ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                      <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Lock size={28} className="text-gray-400" />
                      </div>
                      <h4 className="font-bold text-gray-700 mb-1">Membership Required</h4>
                      <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
                        This election requires an active membership card to view candidates and vote.
                      </p>
                      <Link 
                        to="/membership" 
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-100"
                      >
                        <CreditCard size={14} /> Get Membership Card
                      </Link>
                    </div>
                  ) : isVoted ? (
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200 flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy size={28} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 text-lg">Thank you for voting!</h4>
                        <p className="text-green-600 text-sm">You have successfully cast your vote in this election. Results will be announced after the election ends.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(election.candidates || []).map(candidate => {
                        const isVoting = votingId === `${election.id}-${candidate.id}`

                        return (
                          <div 
                            key={candidate.id} 
                            className="bg-gray-50 rounded-xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-md transition-all duration-300 group"
                          >
                            {/* Candidate Photo & Info */}
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                                {candidate.photo_url ? (
                                  <img 
                                    src={candidate.photo_url} 
                                    alt={candidate.student?.full_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={28} className="text-purple-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-base truncate">
                                  {candidate.student?.full_name || 'Unknown Candidate'}
                                </h4>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                  {candidate.student?.course || ''} {candidate.student?.year_of_study ? `• Year ${candidate.student.year_of_study}` : ''}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {candidate.student?.admission_number || ''}
                                </p>
                              </div>
                            </div>

                            {/* Manifesto */}
                            {candidate.manifesto && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 bg-white p-3 rounded-lg border border-gray-100">
                                  "{candidate.manifesto}"
                                </p>
                              </div>
                            )}

                            {/* Vote Button */}
                            <button
                              onClick={() => castVote(election.id, candidate.id)}
                              disabled={isVoting}
                              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                isVoting
                                  ? 'bg-green-500 text-white'
                                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-100 active:scale-[0.98]'
                              }`}
                            >
                              {isVoting ? (
                                <>
                                  <CheckCircle size={16} /> Vote Recorded!
                                </>
                              ) : (
                                <>
                                  <Vote size={16} /> Cast Vote
                                </>
                              )}
                            </button>
                          </div>
                        )
                      })}

                      {(election.candidates || []).length === 0 && (
                        <div className="col-span-full text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <Users size={32} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm font-medium">No candidates registered yet</p>
                          <p className="text-gray-400 text-xs mt-0.5">Check back soon for updates</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
            <Vote size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No active elections</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {searchQuery || selectedPosition !== 'all' 
              ? "Try adjusting your search or filter to find what you're looking for." 
              : "There are no active elections at the moment. Check back later for upcoming elections!"}
          </p>
        </div>
      )}
    </div>
  )
}
