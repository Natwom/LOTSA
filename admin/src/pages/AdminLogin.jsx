import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AdminAuthContext';
import { Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (res.role === 'admin' || res.role === 'leader') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Admin privileges required.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">LOTSA ADMIN</h1>
          <p className="text-slate-400 mt-2">Management Portal Sign In</p>
        </div>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-400 text-sm rounded-lg border border-red-800">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
                placeholder="admin@lotsa.ac.ke"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>
        </div>
        <p className="text-center text-slate-500 text-sm mt-6">
          Secure admin access only. Unauthorized entry is prohibited.
        </p>
      </div>
    </div>
  );
}