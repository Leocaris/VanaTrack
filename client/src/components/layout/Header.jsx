import React from 'react';
import { Menu, Bell, RefreshCw, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/apiClient';

export const Header = ({ onToggleMobile, title = 'Intelligence Dashboard', alertCount = 0 }) => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const toast = useToast();
  const [isResetting, setIsResetting] = React.useState(false);

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset demo database to benchmark state (including the 1,000 trees test scenario)?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.post('/auth/seed');
      toast.success('Database Reset', 'Demo data successfully refreshed. Reloading metrics...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error('Reset Failed', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 dark:bg-[#0a1f17]/90 dark:border-emerald-900/40 backdrop-blur px-4 sm:px-6 transition-colors duration-200">
      {/* Left title & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-emerald-950/40 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-emerald-400/70 hidden sm:block">
            Akshaya Vana Environmental Intelligence & Proof Engine
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-emerald-950/40 hover:bg-slate-50 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-emerald-300 transition shadow-subtle flex items-center justify-center"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Reset / Reseed Demo Data */}
        <button
          onClick={handleResetDemoData}
          disabled={isResetting}
          title="Reset database to initial test scenario benchmark"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-emerald-950/40 hover:bg-slate-50 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-slate-200 text-xs font-medium transition shadow-subtle disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-forest-700 dark:text-emerald-400 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Reset Benchmark</span>
        </button>

        {/* User Role Tag */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-emerald-900/40">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
              {user?.name}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium capitalize mt-0.5 flex items-center justify-end gap-1">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-forest-900 dark:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-forest-700/20 dark:ring-emerald-500/20 shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
