import React, { useState } from 'react';
import { login } from '../services/authAPI';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await login({ username, password });
      loginUser(data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[32px] shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-blue-600/10 mb-6 group hover:bg-blue-600/20 transition-all duration-300">
              <ShieldCheck className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Rejection Analysis</h1>
            <p className="text-slate-400 font-medium">Production Quality Tracking System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  className="w-full bg-slate-950/50 border-2 border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-600 font-medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border-2 border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-600 font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 text-lg"
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <CheckCircle2 className="w-5 h-5 opacity-50" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-sm">
              Use <span className="text-blue-500 font-mono">admin / admin@123</span> for testing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}