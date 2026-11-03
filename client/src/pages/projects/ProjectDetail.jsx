import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  UserCheck,
  Target,
  CheckCircle2,
  Clock,
  Sprout,
  Activity,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  ExternalLink,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../api/apiClient';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManage, isAdmin, user } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' | 'survival' | 'audit'

  // Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [verifyingActivity, setVerifyingActivity] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New Activity form
  const [activityForm, setActivityForm] = useState({
    treesPlanted: 100,
    plantationDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    speciesList: '',
    evidencePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
  });

  // New Inspection form
  const [inspectionForm, setInspectionForm] = useState({
    inspectionType: '30-Day',
    inspectionDate: new Date().toISOString().split('T')[0],
    treesInspected: 100,
    treesSurviving: 95,
    notes: 'Good seedling vigor observed across test plot.',
    healthCondition: 'Good',
  });

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projRes, actRes, inspRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/activities?projectId=${id}`),
        api.get(`/survival?projectId=${id}`),
      ]);

      setProject(projRes.project);
      setActivities(actRes.activities || []);
      setInspections(inspRes.inspections || []);

      if (projRes.project) {
        setActivityForm((prev) => ({
          ...prev,
          location: projRes.project.location,
        }));
      }
    } catch (err) {
      toast.error('Failed to load project dossier', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Handle Verify or Reject
  const handleVerifyAction = async (status) => {
    if (!verifyingActivity) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/activities/${verifyingActivity._id}/verify`, {
        status,
        verificationNotes,
      });

      toast.success(
        status === 'Verified' ? 'Plantation Verified' : 'Plantation Rejected',
        res.message || `Activity marked as ${status}`
      );

      setVerifyingActivity(null);
      setVerificationNotes('');
      // Refresh to update recalculated project stats!
      await fetchProjectData();
    } catch (err) {
      toast.error('Verification Action Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Activity
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/activities', {
        projectId: id,
        ...activityForm,
      });

      toast.success('Activity Logged', 'Field planting recorded; pending auditor verification');
      setIsActivityModalOpen(false);
      setActivityForm({
        treesPlanted: 100,
        plantationDate: new Date().toISOString().split('T')[0],
        location: project?.location || '',
        description: '',
        speciesList: '',
        evidencePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      });
      await fetchProjectData();
    } catch (err) {
      toast.error('Submission Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Inspection
  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/survival', {
        projectId: id,
        ...inspectionForm,
      });

      toast.success('Inspection Logged', res.message || 'Survival audit recorded');
      setIsInspectionModalOpen(false);
      await fetchProjectData();
    } catch (err) {
      toast.error('Inspection Save Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete project ${project.projectId}?`)) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project Removed', 'Project deleted from database');
      navigate('/projects');
    } catch (err) {
      toast.error('Deletion Failed', err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling project environmental dossier..." size="lg" />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The requested environmental project does not exist."
        actionText="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const stats = project.stats || {};
  const target = project.targetTrees || 1;
  const verified = stats.verifiedTrees || 0;
  const pending = stats.pendingTrees || 0;
  const remaining = stats.remainingTarget ?? Math.max(0, target - verified);
  const completion = stats.completionPercentage ?? Math.round((verified / target) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Top breadcrumb & back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-emerald-400 hover:text-slate-800 dark:hover:text-emerald-300 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Registry</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleDeleteProject}
              className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition border border-rose-200 dark:border-rose-900/40"
              title="Delete Project (Admin only)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-6 shadow-card space-y-6 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-forest-50 dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 border border-forest-100 dark:border-emerald-800/40">
                {project.projectId}
              </span>
              <Badge variant={project.status} size="sm">
                {project.status}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-emerald-400 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-900/40">
                {project.category}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
              {project.name}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.location}</span>
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  ({project.latitude.toFixed(4)}°, {project.longitude.toFixed(4)}°)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {new Date(project.startDate).toLocaleDateString()} —{' '}
                  {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Manager: {project.projectManager?.name || 'Assigned Lead'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for Project */}
          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsActivityModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-950 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400 dark:text-white" />
                <span>Submit Planting Activity</span>
              </button>
              <button
                onClick={() => setIsInspectionModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 bg-white dark:bg-[#071912] hover:bg-slate-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-emerald-300 text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition"
              >
                <Activity className="w-3.5 h-3.5 text-forest-800 dark:text-emerald-400" />
                <span>Record Survival Audit</span>
              </button>
            </div>
          )}
        </div>

        {/* Quantitative Target Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-slate-100 dark:border-emerald-900/40">
          <div className="bg-slate-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-slate-100 dark:border-emerald-900/30">
            <span className="text-[10px] text-slate-500 dark:text-emerald-400/80 font-medium uppercase tracking-wider block">
              Target Trees
            </span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
              {target.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Baseline commitment</span>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/60 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/40">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold uppercase tracking-wider block">
              Verified Planted
            </span>
            <span className="text-xl font-bold font-mono text-emerald-950 dark:text-white mt-1 block">
              {verified.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              {completion}% of target completed
            </span>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/60 rounded-xl p-3 border border-amber-100 dark:border-amber-800/40">
            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-xl font-bold font-mono text-amber-950 dark:text-amber-200 mt-1 block">
              {pending.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400">Awaiting evidence audit</span>
          </div>

          <div className="bg-slate-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-slate-100 dark:border-emerald-900/30">
            <span className="text-[10px] text-slate-500 dark:text-emerald-400/80 font-medium uppercase tracking-wider block">
              Remaining Target
            </span>
            <span className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1 block">
              {remaining.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Trees to target</span>
          </div>

          <div className="bg-slate-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-slate-100 dark:border-emerald-900/30">
            <span className="text-[10px] text-slate-500 dark:text-emerald-400/80 font-medium uppercase tracking-wider block">
              Survival Rate
            </span>
            <span
              className={`text-xl font-bold font-mono mt-1 block ${
                stats.survivalRate === null
                  ? 'text-slate-400'
                  : stats.survivalRate >= 75
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {stats.survivalRate !== null ? `${stats.survivalRate}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {stats.totalInspected
                ? `${stats.totalSurviving}/${stats.totalInspected} trees`
                : 'No inspection logged'}
            </span>
          </div>
        </div>

        {/* Live Target Progress Bar */}
        <div className="pt-2">
          <ProgressBar
            value={verified}
            max={target}
            size="lg"
            label="Planting Completion Progress"
            sublabel={`${verified.toLocaleString()} of ${target.toLocaleString()} confirmed`}
          />
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 dark:border-emerald-900/40">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('activities')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'activities'
                ? 'border-forest-900 dark:border-emerald-400 text-forest-900 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Planting Activities & Evidence ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('survival')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'survival'
                ? 'border-forest-900 dark:border-emerald-400 text-forest-900 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Survival Monitoring Audits ({inspections.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Activities & Evidence */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <EmptyState
              title="No planting activities logged yet"
              description="Record the first batch of trees planted with photographic evidence."
              actionText={canManage ? 'Submit Planting Activity' : undefined}
              onAction={() => setIsActivityModalOpen(true)}
            />
          ) : (
            <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 shadow-card overflow-hidden transition-colors duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-emerald-950/40 border-b border-slate-200 dark:border-emerald-900/40 text-slate-500 dark:text-emerald-400 uppercase font-mono tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Activity Code</th>
                      <th className="px-5 py-3.5">Plantation Date</th>
                      <th className="px-5 py-3.5">Trees Planted</th>
                      <th className="px-5 py-3.5">Site Location</th>
                      <th className="px-5 py-3.5">Evidence Photo</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                    {activities.map((act) => (
                      <tr key={act._id} className="hover:bg-slate-50/50 dark:hover:bg-emerald-950/30 transition">
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          {act.activityCode}
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {new Date(act.plantationDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          {act.treesPlanted.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                          {act.location}
                        </td>
                        <td className="px-5 py-4">
                          {act.evidencePhotoUrl ? (
                            <a
                              href={act.evidencePhotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/40"
                            >
                              <Camera className="w-3 h-3" />
                              <span>View Evidence</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[11px]">No photo</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant={act.verificationStatus} size="sm">
                            {act.verificationStatus}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {canManage && act.verificationStatus === 'Pending' ? (
                            <button
                              onClick={() => {
                                setVerifyingActivity(act);
                                setVerificationNotes(act.verificationNotes || '');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1 ml-auto shadow-sm"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Audit / Verify</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                              {act.verifiedBy ? `By ${act.verifiedBy.name}` : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Survival Monitoring */}
      {activeTab === 'survival' && (
        <div className="space-y-4">
          <div className="bg-emerald-950 text-white rounded-2xl p-4 border border-emerald-800/40 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                Survival Rate Intelligence
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Formula: Survival Rate = (Surviving Trees / Inspected Trees) × 100.
                Inspections are never added to planted totals.
              </p>
            </div>
            {canManage && (
              <button
                onClick={() => setIsInspectionModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold rounded-xl text-xs transition"
              >
                Log New Inspection
              </button>
            )}
          </div>

          {inspections.length === 0 ? (
            <EmptyState
              title="No survival inspections recorded yet"
              description="Post-plantation survival audits (30, 90, 180-day) ensure verified carbon permanence."
              actionText={canManage ? 'Record 30-Day Inspection' : undefined}
              onAction={() => setIsInspectionModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inspections.map((insp) => (
                <div
                  key={insp._id}
                  className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-5 shadow-card space-y-3 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-forest-50 dark:bg-emerald-950/60 text-forest-900 dark:text-emerald-300 border border-forest-100 dark:border-emerald-800/40">
                      {insp.inspectionType}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full border ${
                        insp.survivalRate >= 80
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                      }`}
                    >
                      {insp.survivalRate}% Survival
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 dark:bg-emerald-950/40 rounded-xl border border-slate-100 dark:border-emerald-900/30 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-sans">Inspected</span>
                      <span className="font-bold text-slate-900 dark:text-white">{insp.treesInspected}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-sans font-medium">Surviving</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">{insp.treesSurviving}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-rose-500 dark:text-rose-400 block font-sans font-medium">Dead</span>
                      <span className="font-bold text-rose-700 dark:text-rose-300">{insp.treesDead}</span>
                    </div>
                  </div>

                  {insp.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-slate-100 dark:border-emerald-900/30">
                      "{insp.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{new Date(insp.inspectionDate).toLocaleDateString()}</span>
                    <span>Auditor: {insp.recordedBy?.name || 'Field Specialist'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verify / Reject Modal */}
      <Modal
        isOpen={!!verifyingActivity}
        onClose={() => setVerifyingActivity(null)}
        title="Audit & Verify Planting Activity"
        subtitle={`Audit evidence for ${verifyingActivity?.activityCode} (${verifyingActivity?.treesPlanted} trees)`}
      >
        <div className="space-y-4 text-xs">
          {verifyingActivity?.evidencePhotoUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-emerald-900/40 max-h-56">
              <img
                src={verifyingActivity.evidencePhotoUrl}
                alt="Field Evidence"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="bg-slate-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-slate-200/80 dark:border-emerald-900/40 space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-200">
            <div><strong>Location:</strong> {verifyingActivity?.location}</div>
            <div><strong>Quantity:</strong> {verifyingActivity?.treesPlanted} saplings</div>
            <div><strong>Species:</strong> {verifyingActivity?.speciesList?.join(', ') || 'Mixed Native'}</div>
            <div><strong>Plantation Date:</strong> {verifyingActivity?.plantationDate && new Date(verifyingActivity.plantationDate).toLocaleDateString()}</div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Auditor / Verifier Notes:
            </label>
            <textarea
              rows={2}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="e.g. Verified geotag coordinates and sapling canopy spacing..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleVerifyAction('Rejected')}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-semibold border border-rose-200 dark:border-rose-900/40 transition"
            >
              Reject Submission
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleVerifyAction('Verified')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-sm"
            >
              Confirm & Verify {verifyingActivity?.treesPlanted} Trees
            </button>
          </div>
        </div>
      </Modal>

      {/* Submit Planting Activity Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Submit Field Planting Activity"
        subtitle={`Record sapling batches planted for ${project.projectId}`}
      >
        <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Number of Trees Planted *
              </label>
              <input
                type="number"
                min="1"
                required
                value={activityForm.treesPlanted}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, treesPlanted: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] font-mono text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Plantation Date *
              </label>
              <input
                type="date"
                required
                value={activityForm.plantationDate}
                onChange={(e) =>
                  setActivityForm({ ...activityForm, plantationDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Field Location *
            </label>
            <input
              type="text"
              required
              value={activityForm.location}
              onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Evidence Photograph URL
            </label>
            <input
              type="url"
              value={activityForm.evidencePhotoUrl}
              onChange={(e) =>
                setActivityForm({ ...activityForm, evidencePhotoUrl: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Species List (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Teak, Neem, Banyan, Sandalwood"
              value={activityForm.speciesList}
              onChange={(e) =>
                setActivityForm({ ...activityForm, speciesList: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsActivityModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-emerald-950/40 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-forest-900 dark:bg-emerald-600 text-white font-semibold hover:bg-forest-950 dark:hover:bg-emerald-500 transition shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Activity for Audit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Survival Inspection Modal */}
      <Modal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        title="Record Tree Survival Audit"
        subtitle={`Milestone audit for ${project.name}`}
      >
        <form onSubmit={handleCreateInspection} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Milestone Type *
              </label>
              <select
                value={inspectionForm.inspectionType}
                onChange={(e) =>
                  setInspectionForm({ ...inspectionForm, inspectionType: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="30-Day">30-Day Post-Planting</option>
                <option value="90-Day">90-Day Post-Planting</option>
                <option value="180-Day">180-Day Post-Planting</option>
                <option value="Annual">Annual Audit</option>
                <option value="Ad-Hoc">Ad-Hoc Field Audit</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Inspection Date *
              </label>
              <input
                type="date"
                required
                value={inspectionForm.inspectionDate}
                onChange={(e) =>
                  setInspectionForm({ ...inspectionForm, inspectionDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Trees Inspected (Sample) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={inspectionForm.treesInspected}
                onChange={(e) =>
                  setInspectionForm({
                    ...inspectionForm,
                    treesInspected: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] font-mono text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Trees Surviving *
              </label>
              <input
                type="number"
                min="0"
                max={inspectionForm.treesInspected}
                required
                value={inspectionForm.treesSurviving}
                onChange={(e) =>
                  setInspectionForm({
                    ...inspectionForm,
                    treesSurviving: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] font-mono text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Live Calculated Survival Rate Display */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-300">
              Dead: {Math.max(0, inspectionForm.treesInspected - inspectionForm.treesSurviving)} saplings
            </span>
            <span className="font-bold text-emerald-900 dark:text-emerald-300">
              Survival Rate:{' '}
              {inspectionForm.treesInspected > 0
                ? ((inspectionForm.treesSurviving / inspectionForm.treesInspected) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Health & Foliage Condition
            </label>
            <select
              value={inspectionForm.healthCondition}
              onChange={(e) =>
                setInspectionForm({ ...inspectionForm, healthCondition: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Excellent">Excellent (Thriving canopy & shoot growth)</option>
              <option value="Good">Good (Healthy foliage with standard rainfall)</option>
              <option value="Fair">Fair (Mild water stress or pest spots)</option>
              <option value="Poor">Poor (High mortality rate detected)</option>
              <option value="Critical">Critical (Immediate irrigation/intervention needed)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Field Observations
            </label>
            <textarea
              rows={2}
              value={inspectionForm.notes}
              onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInspectionModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-emerald-950/40 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-forest-900 dark:bg-emerald-600 text-white font-semibold hover:bg-forest-950 dark:hover:bg-emerald-500 transition shadow-sm"
            >
              {submitting ? 'Saving...' : 'Record Survival Audit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
