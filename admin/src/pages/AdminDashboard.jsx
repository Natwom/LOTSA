import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { 
  Users, Calendar, Vote, AlertCircle, MessageSquare, 
  TrendingUp, Zap, ArrowUpRight, ArrowDownRight,
  GraduationCap, CreditCard, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/admin/dashboard/stats').then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: 'from-blue-500 to-blue-600', trend: '+12%', trendUp: true },
    { label: 'Active Members', value: stats?.active_members || 0, icon: CreditCard, color: 'from-emerald-500 to-emerald-600', trend: '+5%', trendUp: true },
    { label: 'Upcoming Events', value: stats?.upcoming_events || 0, icon: Calendar, color: 'from-purple-500 to-purple-600', trend: 'This week', trendUp: true },
    { label: 'Active Elections', value: stats?.active_elections || 0, icon: Vote, color: 'from-orange-500 to-orange-600', trend: 'Ongoing', trendUp: true },
    { label: 'Pending Complaints', value: stats?.pending_complaints || 0, icon: AlertCircle, color: 'from-red-500 to-red-600', trend: 'Needs attention', trendUp: false },
    { label: 'Active Chats', value: stats?.active_chats || 0, icon: MessageSquare, color: 'from-teal-500 to-teal-600', trend: 'Live', trendUp: true },
  ];

  const quickActions = [
    { to: '/admin/students', icon: Users, label: 'Manage Students', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
    { to: '/admin/elections', icon: Vote, label: 'Create Election', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
    { to: '/admin/events', icon: Calendar, label: 'Post Event', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { to: '/admin/complaints', icon: AlertCircle, label: 'View Complaints', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
  ];

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome to the LOTSA management portal</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 hover-lift stat-glow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-dark-border rounded-lg w-16 h-8 inline-block" />
                  ) : (
                    card.value
                  )}
                </h3>
              </div>
              <div className={`bg-gradient-to-br ${card.color} text-white p-2.5 rounded-xl shadow-lg`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium">
              {card.trendUp ? (
                <ArrowUpRight size={14} className="text-emerald-500" />
              ) : (
                <ArrowDownRight size={14} className="text-red-500" />
              )}
              <span className={card.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
              <Zap size={18} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <Link 
                key={i}
                to={action.to}
                className={`p-4 rounded-xl ${action.color} hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
              >
                <action.icon size={24} className="mb-3" />
                <span className="text-sm font-semibold">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <TrendingUp size={18} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-dark-border/30 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">New student registration</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{i * 2} minutes ago</p>
                </div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}