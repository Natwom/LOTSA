import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Users, Mail, Award } from 'lucide-react';

export default function Leaders() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/leaders?active_only=true').then((res) => {
      setLeaders(res.data);
      setLoading(false);
    });
  }, []);

  const positionColors = {
    'Chairperson': 'bg-blue-600',
    'Secretary': 'bg-purple-600',
    'Treasurer': 'bg-green-600',
    'Organizing Secretary': 'bg-orange-600',
    'Academic Rep': 'bg-pink-600',
    'Welfare Rep': 'bg-teal-600',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users size={32} /> Leadership Team
        </h1>
        <p className="text-blue-100 mt-2 text-lg">Meet the dedicated leaders of LOTUBAE Student Association</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaders.map((leader) => (
            <div key={leader.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-64 bg-gray-100 overflow-hidden">
                {leader.photo_url ? (
                  <img
                    src={`http://localhost:8000${leader.photo_url}`}
                    alt={leader.user?.profile?.full_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <Users size={64} className="text-blue-300" />
                  </div>
                )}
                <div className={`absolute top-4 right-4 ${positionColors[leader.position] || 'bg-gray-600'} text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                  {leader.position}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{leader.user?.profile?.full_name || 'Unknown'}</h3>
                <p className="text-blue-600 font-medium text-sm mt-1">{leader.user?.profile?.course || ''}</p>
                
                {leader.bio && (
                  <p className="text-gray-600 text-sm mt-3 line-clamp-3 leading-relaxed">{leader.bio}</p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <a
                    href={`mailto:${leader.user?.email}`}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Mail size={14} /> Contact
                  </a>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Year {leader.user?.profile?.year_of_study}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {leaders.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Award size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No leaders listed yet</h3>
          <p className="text-gray-400 mt-1">Leadership information will be updated soon</p>
        </div>
      )}
    </div>
  );
}