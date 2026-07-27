import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Users, Mail, Award, Crown, Search, Filter } from 'lucide-react';

export default function Leaders() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');

  useEffect(() => {
    axios.get('/leaders?active_only=true').then((res) => {
      setLeaders(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
  };

  const getPositionColor = (pos) => positionColors[pos] || 'bg-gray-600';

  const positions = ['all', ...new Set(leaders.map(l => l.position).filter(Boolean))];

  const filtered = leaders.filter(leader => {
    const matchesPos = selectedPosition === 'all' || leader.position === selectedPosition;
    const matchesSearch = !searchQuery || 
      leader.user?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPos && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-64 bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Crown size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Leadership Team</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
            Meet the dedicated student leaders guiding LOTSA forward. Reach out to collaborate or share your ideas.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leaders by name or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {positions.map(pos => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                selectedPosition === pos 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {pos === 'all' ? 'All Leaders' : pos}
            </button>
          ))}
        </div>
      </div>

      {/* Leaders Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((leader) => (
            <div key={leader.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="relative h-72 bg-gray-100 overflow-hidden">
                {leader.photo_url ? (
                  <img
                    src={leader.photo_url}
                    alt={leader.user?.profile?.full_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
                    <Users size={72} className="text-blue-200" />
                  </div>
                )}
                <div className={`absolute top-4 right-4 ${getPositionColor(leader.position)} text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg`}>
                  {leader.position}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{leader.user?.profile?.full_name || 'Unknown'}</h3>
                  <p className="text-white/80 text-sm font-medium">{leader.user?.profile?.course || ''}</p>
                </div>
              </div>
              
              <div className="p-5">
                {leader.bio && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{leader.bio}</p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <a
                    href={`mailto:${leader.user?.email}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
                  >
                    <Mail size={14} /> Contact
                  </a>
                  <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-full">
                    Year {leader.user?.profile?.year_of_study}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5">
            <Award size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No leaders found</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            {searchQuery || selectedPosition !== 'all' 
              ? "Try adjusting your search or filter." 
              : "Leadership information will be updated soon."}
          </p>
        </div>
      )}
    </div>
  );
}