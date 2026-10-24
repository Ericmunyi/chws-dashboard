import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Loader2, ArrowRight, Users, BarChart3, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">CHWS Dashboard</div>
                <div className="text-xs text-slate-400 leading-tight">Building Healthier Communities</div>
              </div>
            </div>
            <Link
              to="/register"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    eCHIS & OpenMRS Integrated
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    <div className="flex flex-wrap gap-x-3">
                      <span className="animate-slide-word">Transforming</span>
                      <span className="animate-slide-word-delay-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Community
                      </span>
                      <span className="animate-slide-word-delay-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Health
                      </span>
                      <span className="animate-slide-word-delay-3">Across</span>
                      <span className="animate-slide-word-delay-3">Africa</span>
                    </div>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-xl animate-fade-blur">
                    Empowering Community Health Workers with intelligent tools for patient care, data management, and seamless integration with national health systems.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <Users className="w-6 h-6 text-cyan-400 mb-2" />
                    <div className="text-2xl font-bold text-white">CHW</div>
                    <div className="text-sm text-slate-400">Focused Care</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <BarChart3 className="w-6 h-6 text-blue-400 mb-2" />
                    <div className="text-2xl font-bold text-white">Real-time</div>
                    <div className="text-sm text-slate-400">Analytics</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-white">Secure</div>
                    <div className="text-sm text-slate-400">& Compliant</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                        <p className="text-slate-400">Access your dashboard</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                        <span className="text-xs font-medium text-cyan-400">Secure Portal</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                          placeholder="Enter your username"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 pr-12"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-cyan-400 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                          Create Account
                        </Link>
                      </p>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                      <p className="text-xs font-medium text-slate-300 mb-2">Demo Credentials</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 rounded-lg bg-slate-900/50">
                          <div className="text-slate-400 mb-1">Admin</div>
                          <div className="text-cyan-400 font-mono">admin</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-slate-900/50">
                          <div className="text-slate-400 mb-1">Manager</div>
                          <div className="text-cyan-400 font-mono">manager</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-slate-900/50">
                          <div className="text-slate-400 mb-1">CHW</div>
                          <div className="text-cyan-400 font-mono">chw1</div>
                        </div>
                      </div>
                      <div className="mt-2 text-center text-xs text-slate-500 font-mono">Password123!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            Community Health Worker Dashboard v1.0 — Ministry of Health
          </p>
        </div>
      </footer>
    </div>
  );
}
