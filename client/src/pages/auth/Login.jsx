import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('admin@vanatrack.org');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back', 'Successfully authenticated to VanaTrack platform');
      navigate('/');
    } catch (err) {
      toast.error('Authentication Failed', err.message || 'Invalid credentials provided');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-[#081c15] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-forest-600 text-forest-950 shadow-xl shadow-emerald-950/80 mb-4 ring-4 ring-emerald-500/20">
          <Sprout className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          VANATRACK
        </h2>
        <p className="mt-1 text-xs text-emerald-400 font-medium tracking-widest uppercase">
          From Planting to Proof
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Environmental Impact Intelligence Platform for Akshaya Vana
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#0f2e22] border border-[#1b4d3a] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl text-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-emerald-500/70" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@vanatrack.org"
                  className="block w-full rounded-xl border border-emerald-900/60 bg-[#071912] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-emerald-500/70" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full rounded-xl border border-emerald-900/60 bg-[#071912] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-forest-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Persona Credentials for Evaluator */}
          <div className="mt-6 pt-5 border-t border-emerald-900/40">
            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300/80 mb-2.5">
              <span>Quick Test Personas (One-Click)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@vanatrack.org', 'Admin@123')}
                className="w-full text-left p-2.5 rounded-xl bg-[#092218] border border-emerald-800/30 hover:border-emerald-500/50 hover:bg-[#0c2c1f] transition group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                    <span>Admin</span>
                    <span className="text-[10px] font-normal text-emerald-400 font-mono">
                      (Ananya Sharma)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">admin@vanatrack.org • Full Access</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  Admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@vanatrack.org', 'Manager@123')}
                className="w-full text-left p-2.5 rounded-xl bg-[#092218] border border-emerald-800/30 hover:border-emerald-500/50 hover:bg-[#0c2c1f] transition group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                    <span>Project Manager</span>
                    <span className="text-[10px] font-normal text-emerald-400 font-mono">
                      (Karthik Nair)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">manager@vanatrack.org • Field & Verifier</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Manager
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('viewer@vanatrack.org', 'Viewer@123')}
                className="w-full text-left p-2.5 rounded-xl bg-[#092218] border border-emerald-800/30 hover:border-emerald-500/50 hover:bg-[#0c2c1f] transition group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                    <span>Viewer / Auditor</span>
                    <span className="text-[10px] font-normal text-emerald-400 font-mono">
                      (Dr. Rohini Sen)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">viewer@vanatrack.org • Read-only</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-500/20 text-slate-300">
                  Viewer
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

