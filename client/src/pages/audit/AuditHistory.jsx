import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  UserCheck,
  FileText,
  Eye,
  ArrowRight,
  Database,
} from 'lucide-react';
import { api } from '../../api/apiClient';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

const ENTITY_TYPES = ['All', 'Project', 'PlantingActivity', 'SurvivalInspection', 'User'];

export const AuditHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('All');
  const [inspectingLog, setInspectingLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedEntity !== 'All') queryParams.append('entityType', selectedEntity);
      queryParams.append('limit', '50');

      const data = await api.get(`/audit?${queryParams.toString()}`);
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, selectedEntity]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Immutable Environmental Audit History
          </h2>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-forest-50 dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 border border-forest-100 dark:border-emerald-800/40">
            Append-Only
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-emerald-400/80 mt-0.5">
          Cryptographically recorded ledger of verification decisions, target changes, and field modifications
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-4 shadow-card flex flex-col md:flex-row items-center gap-3 transition-colors duration-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, record title, user email, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-emerald-400/80">Target Entity:</span>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071912] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving immutable audit records..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No audit logs found"
          description="Actions performed across the platform will appear here with full diff transparency."
        />
      ) : (
        <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 shadow-card overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-emerald-950/40 border-b border-slate-200 dark:border-emerald-900/40 text-slate-500 dark:text-emerald-400 uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Actor / User</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Entity Type</th>
                  <th className="px-5 py-3.5">Record Modified</th>
                  <th className="px-5 py-3.5">Reason / Justification</th>
                  <th className="px-5 py-3.5 text-right">State Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30 font-sans">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-emerald-950/30 transition">
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {log.userId?.name || log.userEmail}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                        Role: {log.userRole?.replace('_', ' ')}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-emerald-950/60 text-slate-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800/40">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {log.entityType}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {log.recordTitle || log.entityId}
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate italic">
                      {log.reason || 'Standard operational update'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {(log.previousValue || log.newValue) && (
                        <button
                          onClick={() => setInspectingLog(log)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-100 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-emerald-300 font-semibold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Diff</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Diff Inspection Modal */}
      <Modal
        isOpen={!!inspectingLog}
        onClose={() => setInspectingLog(null)}
        title="Audit State Diff Inspection"
        subtitle={`${inspectingLog?.action} on ${inspectingLog?.entityType} [${inspectingLog?.recordTitle}]`}
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-slate-200/80 dark:border-emerald-900/40 space-y-1 text-slate-700 dark:text-slate-200">
            <div><strong>Timestamp:</strong> {inspectingLog?.timestamp && new Date(inspectingLog.timestamp).toISOString()}</div>
            <div><strong>Actor:</strong> {inspectingLog?.userEmail} ({inspectingLog?.userRole})</div>
            <div><strong>Reason:</strong> {inspectingLog?.reason}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="font-semibold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1">
                <span>Previous State (Before)</span>
              </div>
              <pre className="bg-[#0f172a] text-slate-200 p-3 rounded-xl overflow-x-auto text-[11px] max-h-60 border border-slate-800">
                {JSON.stringify(inspectingLog?.previousValue, null, 2) || '// No previous state (initial creation)'}
              </pre>
            </div>

            <div>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <span>New State (After)</span>
              </div>
              <pre className="bg-[#0f172a] text-emerald-300 p-3 rounded-xl overflow-x-auto text-[11px] max-h-60 border border-slate-800">
                {JSON.stringify(inspectingLog?.newValue, null, 2) || '// Record deleted'}
              </pre>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/40 flex justify-end">
            <button
              onClick={() => setInspectingLog(null)}
              className="px-4 py-2 bg-slate-900 dark:bg-emerald-700 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-emerald-600 transition"
            >
              Close Diff
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
