import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sprout,
  Filter,
} from 'lucide-react';
import { api } from '../../api/apiClient';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const SmartAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ critical: 0, warning: 0, info: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/alerts');
      setAlerts(data.alerts || []);
      setCounts(data.counts || { critical: 0, warning: 0, info: 0, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts =
    selectedSeverity === 'All'
      ? alerts
      : alerts.filter((a) => {
          if (selectedSeverity === 'CRITICAL') return a.severity === 'high';
          if (selectedSeverity === 'WARNING') return a.severity === 'medium';
          if (selectedSeverity === 'INFO') return a.severity === 'low';
          return true;
        });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Smart Environmental Alerts Engine
        </h2>
        <p className="text-xs text-slate-500 dark:text-emerald-400/80 mt-0.5">
          Automated rule-based risk detection: survival rate dips, verification bottlenecks & milestone delays
        </p>
      </div>

      {/* Severity Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div
          onClick={() => setSelectedSeverity('All')}
          className={`bg-white dark:bg-[#0b241b] rounded-2xl border p-4 shadow-card cursor-pointer transition ${
            selectedSeverity === 'All'
              ? 'border-forest-700 dark:border-emerald-500 ring-2 ring-forest-700/10 dark:ring-emerald-500/20'
              : 'border-slate-200/80 dark:border-emerald-900/40'
          }`}
        >
          <span className="text-[10px] text-slate-500 dark:text-emerald-400/80 uppercase font-medium">All Triggered Rules</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{counts.total}</div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Total platform signals</span>
        </div>

        <div
          onClick={() => setSelectedSeverity('CRITICAL')}
          className={`bg-white dark:bg-[#0b241b] rounded-2xl border p-4 shadow-card cursor-pointer transition ${
            selectedSeverity === 'CRITICAL'
              ? 'border-rose-600 ring-2 ring-rose-600/10 dark:ring-rose-500/20'
              : 'border-slate-200/80 dark:border-emerald-900/40'
          }`}
        >
          <span className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            Critical Risk
          </span>
          <div className="text-2xl font-bold font-mono text-rose-900 dark:text-rose-300 mt-1">{counts.critical}</div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Survival &lt; 70% threshold</span>
        </div>

        <div
          onClick={() => setSelectedSeverity('WARNING')}
          className={`bg-white dark:bg-[#0b241b] rounded-2xl border p-4 shadow-card cursor-pointer transition ${
            selectedSeverity === 'WARNING'
              ? 'border-amber-600 ring-2 ring-amber-600/10 dark:ring-amber-500/20'
              : 'border-slate-200/80 dark:border-emerald-900/40'
          }`}
        >
          <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">Warnings</span>
          <div className="text-2xl font-bold font-mono text-amber-900 dark:text-amber-300 mt-1">{counts.warning}</div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400">Pending review & deadlines</span>
        </div>

        <div
          onClick={() => setSelectedSeverity('INFO')}
          className={`bg-white dark:bg-[#0b241b] rounded-2xl border p-4 shadow-card cursor-pointer transition ${
            selectedSeverity === 'INFO'
              ? 'border-blue-600 ring-2 ring-blue-600/10 dark:ring-blue-500/20'
              : 'border-slate-200/80 dark:border-emerald-900/40'
          }`}
        >
          <span className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold">Operational Info</span>
          <div className="text-2xl font-bold font-mono text-blue-900 dark:text-blue-300 mt-1">{counts.info}</div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400">Dormant activity & notices</span>
        </div>
      </div>

      {/* Alert Feed */}
      {loading ? (
        <LoadingSpinner text="Evaluating live database rules against thresholds..." />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All systems optimal"
          description="No rule-based alerts triggered for this filter criteria."
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isHigh = alert.severity === 'high';
            const isMedium = alert.severity === 'medium';

            const borderStyle = isHigh
              ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/20'
              : isMedium
              ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/20'
              : 'border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#0b241b]';

            const Icon = isHigh ? AlertCircle : isMedium ? AlertTriangle : Info;
            const iconColor = isHigh
              ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
              : isMedium
              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
              : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60';

            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 shadow-card hover:shadow-elevated transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${borderStyle}`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-emerald-950/60 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-emerald-800/40">
                        {alert.projectCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                            : isMedium
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {alert.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                        {alert.metric}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <span className="text-forest-900 dark:text-emerald-400 font-semibold">Recommended Action:</span>
                      <span>{alert.actionRequired}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (alert.category === 'Pending Verification') {
                        navigate('/activities');
                      } else if (alert.category === 'Low Survival Rate') {
                        navigate('/survival');
                      } else {
                        navigate(`/projects/${alert.projectId}`);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#071912] border border-slate-200 dark:border-emerald-900/40 hover:bg-slate-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-subtle transition flex items-center gap-1.5"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
