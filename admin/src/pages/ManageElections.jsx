import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { 
  Plus, Vote, BarChart3, UserPlus, Clock, Users, X, AlertCircle,
  Image as ImageIcon, Trash2, Upload, Loader2
} from 'lucide-react';

export default function ManageElections() {
  const [elections, setElections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', position: '', description: '', start_time: '', end_time: '', require_membership: true });
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [voters, setVoters] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Candidate modal state
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ student_id: '', manifesto: '' });
  const [candidateElectionId, setCandidateElectionId] = useState(null);
  const [candidatePhoto, setCandidatePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const photoInputRef = useRef(null);

  // Candidate viewer state
  const [viewingCandidates, setViewingCandidates] = useState(null);
  const [candidatesList, setCandidatesList] = useState([]);

  useEffect(() => {
    fetchElections();
    fetchStudents();
  }, []);

  const fetchElections = () => {
    setLoading(true);
    setError('');
    axios.get('/elections').then((res) => {
      setElections(res.data || []);
      setLoading(false);
    }).catch((err) => {
      setError(err.response?.data?.detail || 'Failed to load elections');
      setLoading(false);
    });
  };

  const fetchStudents = () => {
    axios.get('/auth/users').then((res) => {
      setStudents((res.data || []).filter(u => u.role === 'student' && u.profile));
    }).catch(() => setStudents([]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/elections', {
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });
      setSuccess('Election created successfully!');
      setForm({ title: '', position: '', description: '', start_time: '', end_time: '', require_membership: true });
      setShowForm(false);
      fetchElections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create election. Check all fields.');
    }
  };

  const openCandidateModal = (electionId) => {
    setCandidateElectionId(electionId);
    setCandidateForm({ student_id: '', manifesto: '' });
    setCandidatePhoto(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    setShowCandidateModal(true);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCandidatePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidateForm.student_id) {
      setError('Please select a student');
      return;
    }

    setAddingCandidate(true);
    setError('');
    const formData = new FormData();
    formData.append('student_id', candidateForm.student_id);
    formData.append('manifesto', candidateForm.manifesto);
    if (candidatePhoto) {
      formData.append('photo', candidatePhoto);
    }

    try {
      await axios.post(`/elections/${candidateElectionId}/candidates`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Candidate added successfully!');
      setShowCandidateModal(false);
      setCandidateForm({ student_id: '', manifesto: '' });
      setCandidatePhoto(null);
      setPhotoPreview(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
      fetchElections();
      if (viewingCandidates === candidateElectionId) {
        viewCandidates(candidateElectionId);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add candidate');
    } finally {
      setAddingCandidate(false);
    }
  };

  const viewCandidates = async (electionId) => {
    try {
      const res = await axios.get(`/elections/${electionId}/candidates`);
      setCandidatesList(res.data || []);
      setViewingCandidates(electionId);
      setResults([]);
      setVoters([]);
      setSelectedElection(null);
    } catch (err) {
      setError('Failed to load candidates');
    }
  };

  const removeCandidate = async (electionId, candidateId) => {
    if (!confirm('Remove this candidate?')) return;
    try {
      await axios.delete(`/elections/${electionId}/candidates/${candidateId}`);
      setSuccess('Candidate removed!');
      fetchElections();
      if (viewingCandidates === electionId) {
        viewCandidates(electionId);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove candidate');
    }
  };

  const viewResults = async (electionId) => {
    try {
      const res = await axios.get(`/elections/${electionId}/results`);
      setResults(res.data || []);
      setVoters([]);
      setSelectedElection(electionId);
      setViewingCandidates(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load results');
    }
  };

  const viewVoters = async (electionId) => {
    try {
      const res = await axios.get(`/elections/${electionId}/voters`);
      setVoters(res.data?.voters || []);
      setResults([]);
      setSelectedElection(electionId);
      setViewingCandidates(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load voters');
    }
  };

  const columns = [
    { key: 'title', label: 'Election Title' },
    { key: 'position', label: 'Position' },
    {
      key: 'start_time',
      label: 'Start',
      render: (val) => <div className="flex items-center gap-1.5 text-gray-600"><Clock size={14} />{new Date(val).toLocaleDateString()}</div>,
    },
    {
      key: 'end_time',
      label: 'End',
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: 'require_membership',
      label: 'Membership',
      render: (val) => val ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Required</span> : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Open</span>
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {val ? 'Active' : 'Closed'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Election Management</h1>
          <p className="text-gray-500 mt-1">Create and monitor student elections</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Election'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
          <p className="text-sm font-medium">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Election Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select Position</option>
                <option value="Chairperson">Chairperson</option>
                <option value="Secretary">Secretary</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Organizing Secretary">Organizing Secretary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input type="datetime-local" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="datetime-local" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.require_membership}
              onChange={(e) => setForm({ ...form, require_membership: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            Require active membership card to vote
          </label>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700">
            Create Election
          </button>
        </form>
      )}

      {/* View Candidates Section */}
      {viewingCandidates && candidatesList.length >= 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} /> Candidates ({candidatesList.length})
            </h3>
            <button onClick={() => setViewingCandidates(null)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          {candidatesList.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No candidates yet. Click "Add Candidate" to add one.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatesList.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {c.photo_url ? (
                      <img
                        src={c.photo_url}
                        alt={c.student?.full_name || 'Candidate'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <ImageIcon size={48} />
                        <span className="text-xs mt-2">No photo</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900">{c.student?.full_name || 'Unknown'}</h4>
                    <p className="text-xs text-gray-500 mb-1">{c.student?.admission_number || ''} • {c.student?.course || ''}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{c.manifesto || 'No manifesto'}</p>
                    <button
                      onClick={() => removeCandidate(viewingCandidates, c.id)}
                      className="w-full py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedElection && results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} /> Election Results
          </h3>
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.candidate_id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {r.photo_url ? (
                    <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={16} /></div>
                  )}
                </div>
                <div className="w-32 font-medium text-gray-800">{r.name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full flex items-center justify-end px-2 text-xs text-white font-semibold transition-all"
                    style={{ width: `${Math.max(r.vote_percentage || 0, 3)}%` }}
                  >
                    {r.votes}
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-semibold text-gray-700">{r.votes} votes</div>
              </div>
            ))}
          </div>
          <button onClick={() => setSelectedElection(null)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
            Close results
          </button>
        </div>
      )}

      {selectedElection && voters.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} /> Voter List ({voters.length} total)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Admission No</th>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left">Voted For</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {voters.map((v, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-gray-600">{v.admission_number}</td>
                    <td className="px-4 py-3 text-gray-600">{v.course}</td>
                    <td className="px-4 py-3 text-blue-600">{v.candidate_voted}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(v.voted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setSelectedElection(null)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
            Close voter list
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={elections}
        loading={loading}
        actions={(row) => (
          <>
            <button onClick={() => openCandidateModal(row.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Add Candidate">
              <UserPlus size={16} />
            </button>
            <button onClick={() => viewCandidates(row.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Candidates">
              <Users size={16} />
            </button>
            <button onClick={() => viewResults(row.id)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="View Results">
              <BarChart3 size={16} />
            </button>
            <button onClick={() => viewVoters(row.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Voters">
              <Users size={16} />
            </button>
          </>
        )}
      />

      {elections.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Vote size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No elections created yet</h3>
          <p className="text-gray-400 mt-1">Click "New Election" to create one</p>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Add Candidate</h3>
              <button onClick={() => setShowCandidateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  required
                  value={candidateForm.student_id}
                  onChange={(e) => setCandidateForm({ ...candidateForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.profile.id}>
                      {s.profile.full_name} ({s.profile.admission_number})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              {/* Photo Preview */}
              {photoPreview && (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-gray-500">{candidatePhoto?.name}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manifesto</label>
                <textarea
                  rows={3}
                  value={candidateForm.manifesto}
                  onChange={(e) => setCandidateForm({ ...candidateForm, manifesto: e.target.value })}
                  placeholder="Candidate's manifesto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCandidateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addingCandidate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addingCandidate ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {addingCandidate ? 'Adding...' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}