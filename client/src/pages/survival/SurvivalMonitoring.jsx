import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Filter,
  Search,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  UserCheck,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { api } from '../../api/apiClient';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SurvivalMonitoring = () => {
  const [inspections, setInspections] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    inspectionType: '30-Day',
    inspectionDate: new Date().toISOString().split('T')[0],
    treesInspected: 200,
    treesSurviving: 184,
    notes: 'Strong root anchoring and healthy apical shoots.',
    healthCondition: 'Good',
  });

  const { canManage } = useAuth();
  const toast = useToast();

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedMilestone !== 'All') queryParams.append('inspectionType', selectedMilestone);
      if (selectedProject !== 'All') queryParams.append('projectId', selectedProject);

      const [inspRes, projRes] = await Promise.all([
        api.get(`/survival?${queryParams.toString()}`),
        api.get('/projects'),
      ]);

      setInspections(inspRes.inspections || []);
      setProjects(projRes.projects || []);

      if (projRes.projects && projRes.projects.length > 0 && !formData.projectId) {
        setFormData((prev) => ({ ...prev, projectId: projRes.projects[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load survival logs', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [selectedMilestone, selectedProject]);

  const handleRecordInspection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/survival', formData);
      toast.success('Inspection Logged', res.message || 'Survival audit saved');
      setIsModalOpen(false);
      fetchInspections();
    } catch (err) {
      toast.error('Submission Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregate stats
  const totalInspected = inspections.reduce((acc, i) => acc + i.treesInspected, 0);
  const totalSurviving = inspections.reduce((acc, i) => acc + i.treesSurviving, 0);
  const totalDead = inspections.reduce((acc, i) => acc + i.treesDead, 0);
  const aggregateRate =
    totalInspected > 0 ? ((totalSurviving / totalInspected) * 100).toFixed(1) : 0;
  const criticalCount = inspections.filter((i) => i.survivalRate < 70).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Tree Survival Rate Monitoring
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Key Differentiating Feature
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Post-planting longitudinal audits (30, 90, 180-Day) measuring biomass permanence
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-semibold shadow-card transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Record Milestone Inspection</span>
          </button>
        )}
      </div>

      {/* Explanatory Methodology Card */}
      <div className="bg-gradient-to-r from-emerald-950 to-forest-900 rounded-2xl p-5 text-white border border-emerald-800/40 shadow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
              <Info className="w-4 h-4" />
              <span>Scientific Formula & Data Integrity Rule</span>
            </div>
            <div className="text-sm font-semibold text-white font-mono bg-white/10 px-3 py-1.5 rounded-lg inline-block border border-white/10">
              Survival Rate (%) = (Surviving Trees / Inspected Trees) × 100
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Inspections evaluate the health of existing planting batches. In accordance with carbon verification
              standards, repeat inspection counts are strictly kept independent and are <strong>never</strong> added
              as newly planted trees.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl border border-white/10 flex-shrink-0">
            <div>
              <span className="text-[10px] uppercase text-emerald-300 font-bold block">
                Portfolio Survival
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {aggregateRate}%
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Inspection Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card">
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            Sample Trees Inspected
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {totalInspected.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Audited across {inspections.length} logs</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card">
          <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
            Surviving Trees
          </span>
          <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
            {totalSurviving.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">{aggregateRate}% survival baseline</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card">
          <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">
            Mortality Count
          </span>
          <div className="text-xl font-bold font-mono text-rose-900 mt-1">
            {totalDead.toLocaleString()}
          </div>
          <span className="text-[10px] text-rose-500">
            {totalInspected > 0 ? ((totalDead / totalInspected) * 100).toFixed(1) : 0}% mortality
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card">
          <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
            Sub-70% Warning Sites
          </span>
          <div className="text-xl font-bold font-mono text-amber-900 mt-1">
            {criticalCount}
          </div>
          <span className="text-[10px] text-amber-600">Remedial action required</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Milestone:</span>
          {['All', '30-Day', '90-Day', '180-Day', 'Annual'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMilestone(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
                selectedMilestone === m
                  ? 'bg-forest-900 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Project:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-forest-700"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.projectId}: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inspections Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving survival inspection logs..." />
      ) : inspections.length === 0 ? (
        <EmptyState
          title="No inspections match criteria"
          description="Record a 30-day, 90-day, or 180-day inspection for any registered project."
          actionText={canManage ? 'Record New Inspection' : undefined}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {inspections.map((insp) => {
            const isCritical = insp.survivalRate < 70;
            return (
              <div
                key={insp._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-forest-50 text-forest-900 border border-forest-100">
                      {insp.inspectionType} Milestone
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        insp.survivalRate >= 80
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isCritical
                          ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {insp.survivalRate}% Survival
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 truncate">
                    {insp.projectId?.name || 'Project Site'}
                  </h3>

                  <div className="mt-1 text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <span>{insp.projectId?.projectId}</span>
                    <span>•</span>
                    <span>{insp.projectId?.location}</span>
                  </div>

                  {/* Quantitative breakdown numbers */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 mt-3 bg-slate-50/80 rounded-xl border border-slate-100 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Inspected</span>
                      <span className="font-bold text-slate-900">{insp.treesInspected}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 block font-sans font-medium">Surviving</span>
                      <span className="font-bold text-emerald-700">{insp.treesSurviving}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-500 block font-sans font-medium">Dead</span>
                      <span className="font-bold text-rose-700">{insp.treesDead}</span>
                    </div>
                  </div>

                  {/* Progress visualization */}
                  <div className="mt-3">
                    <ProgressBar
                      value={insp.treesSurviving}
                      max={insp.treesInspected}
                      size="sm"
                      color={insp.survivalRate >= 75 ? 'emerald' : 'amber'}
                      showPercent={false}
                    />
                  </div>

                  {insp.notes && (
                    <p className="mt-3 text-xs text-slate-600 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      "{insp.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(insp.inspectionDate).toLocaleDateString()}</span>
                  </div>
                  <div>Auditor: {insp.recordedBy?.name || 'Field Specialist'}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Inspection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Field Survival Audit"
        subtitle="Perform milestone sampling of planted sapling batches"
      >
        <form onSubmit={handleRecordInspection} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectId}: {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Milestone Interval *
              </label>
              <select
                value={formData.inspectionType}
                onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              >
                <option value="30-Day">30-Day Post-Planting</option>
                <option value="90-Day">90-Day Post-Planting</option>
                <option value="180-Day">180-Day Post-Planting</option>
                <option value="Annual">Annual Audit</option>
                <option value="Ad-Hoc">Ad-Hoc Field Audit</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Inspection Date *
              </label>
              <input
                type="date"
                required
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trees Inspected (Sample Size) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.treesInspected}
                onChange={(e) =>
                  setFormData({ ...formData, treesInspected: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trees Surviving *
              </label>
              <input
                type="number"
                min="0"
                max={formData.treesInspected}
                required
                value={formData.treesSurviving}
                onChange={(e) =>
                  setFormData({ ...formData, treesSurviving: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>
          </div>

          {/* Live Mathematical Formula Preview */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs font-mono">
            <span>
              Mortality: {Math.max(0, formData.treesInspected - formData.treesSurviving)} trees
            </span>
            <span className="font-bold text-emerald-950">
              Survival Rate:{' '}
              {formData.treesInspected > 0
                ? ((formData.treesSurviving / formData.treesInspected) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Field Observations
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-forest-900 text-white font-semibold hover:bg-forest-950 transition shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Survival Audit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
