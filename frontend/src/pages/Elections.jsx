import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { User, Clock, Lock, CreditCard, Vote } from 'lucide-react'

export default function Elections() {
  const [elections, setElections] = useState([])
  const [votedElections, setVotedElections] = useState([])
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchElections()
    fetchMembership()
  }, [])

  const fetchElections = () => {
    setLoading(true)
    setError('')
    axios.get('/elections?active=true')
      .then((res) => {
        console.log('Elections loaded:', res.data)
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
    try {
      await axios.post(`/elections/${electionId}/vote`, { candidate_id: candidateId })
      setVotedElections([...votedElections, electionId])
      alert('Vote cast successfully!')
    } catch (err) {
      alert(err.response?.data?.detail || 'Voting failed')
    }
  }

  const hasValidMembership = membership && membership.is_active && new Date(membership.expiry_date) > new Date()

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl">
        <p className="font-medium">Error loading elections</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Active Elections</h1>
        {hasValidMembership && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CreditCard size={14} /> Membership Active
          </div>
        )}
      </div>

      {!hasValidMembership && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Lock size={20} className="text-yellow-600" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">Membership Required</p>
            <p className="text-xs text-yellow-600">You need an active membership card to vote. <a href="/membership" className="underline">Apply here</a></p>
          </div>
        </div>
      )}

      {elections.map(election => (
        <div key={election.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{election.title}</h2>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <Clock size={14} /> Ends {new Date(election.end_time).toLocaleString()}
              </p>
            </div>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{election.position}</span>
          </div>

          {election.require_membership && !hasValidMembership ? (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Lock size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Membership card required to view candidates and vote</p>
              <a href="/membership" className="text-blue-600 text-sm font-medium hover:underline mt-1 inline-block">Get Membership Card →</a>
            </div>
          ) : votedElections.includes(election.id) ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
              <User size={16} /> You have already voted in this election.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(election.candidates || []).map(candidate => (
                <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                      {candidate.photo_url ? (
                        <img src={candidate.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{candidate.student?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{candidate.student?.course || ''}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{candidate.manifesto || 'No manifesto provided'}</p>
                  <button
                    onClick={() => castVote(election.id, candidate.id)}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                  >
                    Vote
                  </button>
                </div>
              ))}
              {(election.candidates || []).length === 0 && (
                <div className="col-span-full text-center py-4 text-gray-400 text-sm">
                  No candidates registered yet
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {elections.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Vote size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No active elections</h3>
          <p className="text-gray-400 mt-1">Check back later for upcoming elections</p>
        </div>
      )}
    </div>
  )
}