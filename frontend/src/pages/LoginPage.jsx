import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader2, Heart, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome to CHWS Dashboard');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 animate-gradient-x p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 rounded-3xl backdrop-blur-xl mb-4 shadow-2xl shadow-blue-900/20 border border-white/20">
            <div className="relative">
              <Activity className="w-10 h-10 text-white" />
              <Heart className="w-4 h-4 text-cyan-300 absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">CHWS Dashboard</h1>
          <p className="text-blue-100 text-lg">
            Community Health Worker System
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-blue-200 text-sm">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>eCHIS</span>
            </div>
            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
            <span>OpenMRS Integrated</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/30 p-8 border border-white/20 animate-fade-in-up-delay">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-full">
              <span className="text-xs font-medium text-blue-700">Secure Access</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fade-in-up-delay-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="Enter your username"
                autoFocus
              />
            </div>
            <div className="animate-fade-in-up-delay-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
              Create Account
            </Link>
          </p>
          <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Demo Credentials
            </p>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span><strong className="text-gray-700">Admin:</strong> admin</span>
                <span className="font-mono text-gray-500">Password123!</span>
              </div>
              <div className="flex justify-between">
                <span><strong className="text-gray-700">Manager:</strong> manager</span>
                <span className="font-mono text-gray-500">Password123!</span>
              </div>
              <div className="flex justify-between">
                <span><strong className="text-gray-700">CHW:</strong> chw1</span>
                <span className="font-mono text-gray-500">Password123!</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-100 text-xs mt-8 animate-fade-in-up-delay">
          Community Health Worker Dashboard v1.0 — Ministry of Health
        </p>
      </div>
    </div>
  );
}
