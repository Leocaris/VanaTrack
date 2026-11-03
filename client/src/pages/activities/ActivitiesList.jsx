import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../api/apiClient';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ActivitiesList = () => {
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Verify modal state
  const [verifyingActivity, setVerifyingActivity] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New activity form
  const [formData, setFormData] = useState({
    projectId: '',
    treesPlanted: 250,
    plantationDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    speciesList: 'Teak, Neem, Rosewood',
    evidencePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
  });

  const { canManage, user } = useAuth();
  const toast = useToast();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedProject !== 'All') queryParams.append('projectId', selectedProject);
      if (selectedStatus !== 'All') queryParams.append('status', selectedStatus);

      const [actRes, projRes] = await Promise.all([
        api.get(`/activities?${queryParams.toString()}`),
        api.get('/projects'),
      ]);

      setActivities(actRes.activities || []);
      setProjects(projRes.projects || []);

      if (projRes.projects && projRes.projects.length > 0 && !formData.projectId) {
        setFormData((prev) => ({
          ...prev,
          projectId: projRes.projects[0]._id,
          location: projRes.projects[0].location,
        }));
      }
    } catch (err) {
      toast.error('Failed to load activities', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [search, selectedProject, selectedStatus]);

  const handleVerify = async (status) => {
    if (!verifyingActivity) return;
    setSubmitting(true);
    try {
      const res = await api.patch(`/activities/${verifyingActivity._id}/verify`, {
        status,
        verificationNotes,
      });

      toast.success(
        status === 'Verified' ? 'Planting Batch Verified' : 'Planting Batch Rejected',
        res.message || `Activity updated to ${status}`
      );

      setVerifyingActivity(null);
      setVerificationNotes('');
      fetchActivities();
    } catch (err) {
      toast.error('Verification Action Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/activities', formData);
      toast.success('Activity Logged', 'Planting activity registered; pending auditor verification');
      setIsNewModalOpen(false);
      fetchActivities();
    } catch (err) {
      toast.error('Submission Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Planting Activities & Evidence Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-emerald-400/80">
            Field reports, sapling counts, photographic evidence, and auditor verification workflow
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-950 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-card transition"
          >
            <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>Submit Planting Activity</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-4 shadow-card space-y-3 transition-colors duration-200">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by activity code, location, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071912] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[200px] truncate"
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectId}: {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071912] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Verification Statuses</option>
              <option value="Pending">Pending Audit</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving planting records from database..." />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No planting activities found"
          description="Try clearing search filters or submit a new planting activity."
          actionText={canManage ? 'Submit New Activity' : undefined}
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 shadow-card overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-emerald-950/40 border-b border-slate-200 dark:border-emerald-900/40 text-slate-500 dark:text-emerald-400 uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Activity Code</th>
                  <th className="px-5 py-3.5">Environmental Project</th>
                  <th className="px-5 py-3.5">Plantation Date</th>
                  <th className="px-5 py-3.5">Trees Planted</th>
                  <th className="px-5 py-3.5">Field Site</th>
                  <th className="px-5 py-3.5">Evidence Photo</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/30">
                {activities.map((act) => (
                  <tr key={act._id} className="hover:bg-slate-50/50 dark:hover:bg-emerald-950/30 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {act.activityCode}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {act.projectId?.name || 'Project'}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {act.projectId?.projectId}
                      </div>
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
                          <span>Photo Evidence</span>
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
                          <span>Review & Verify</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          {act.verifiedBy ? (
                            <span>Audited by {act.verifiedBy.name}</span>
                          ) : (
                            <span>Logged</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verify / Reject Modal */}
      <Modal
        isOpen={!!verifyingActivity}
        onClose={() => setVerifyingActivity(null)}
        title="Auditor Verification & Decision"
        subtitle={`Review photographic proof for ${verifyingActivity?.activityCode} (${verifyingActivity?.treesPlanted} trees)`}
      >
        <div className="space-y-4 text-xs">
          {verifyingActivity?.evidencePhotoUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-emerald-900/40 max-h-56 bg-slate-900">
              <img
                src={verifyingActivity.evidencePhotoUrl}
                alt="Field Evidence"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="bg-slate-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-slate-200/80 dark:border-emerald-900/40 space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-200">
            <div><strong>Project:</strong> {verifyingActivity?.projectId?.name} ({verifyingActivity?.projectId?.projectId})</div>
            <div><strong>Location:</strong> {verifyingActivity?.location}</div>
            <div><strong>Trees Planted:</strong> {verifyingActivity?.treesPlanted} saplings</div>
            <div><strong>Submitted By:</strong> {verifyingActivity?.submittedBy?.name || 'Field Lead'}</div>
            <div><strong>Species:</strong> {verifyingActivity?.speciesList?.join(', ') || 'Mixed Indigenous'}</div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Verification Notes / Ground Truth Audit Log:
            </label>
            <textarea
              rows={2}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="e.g. Geotag coordinates match flight permit; saplings count confirmed by grid sampling..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleVerify('Rejected')}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-semibold border border-rose-200 dark:border-rose-900/40 transition"
            >
              Reject Activity
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleVerify('Verified')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-sm"
            >
              Verify {verifyingActivity?.treesPlanted} Trees
            </button>
          </div>
        </div>
      </Modal>

      {/* New Activity Submission Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Submit New Planting Activity"
        subtitle="Log field planting with sapling counts and photographic evidence"
      >
        <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Select Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => {
                const p = projects.find((x) => x._id === e.target.value);
                setFormData({
                  ...formData,
                  projectId: e.target.value,
                  location: p ? p.location : formData.location,
                });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectId}: {p.name} (Target: {p.targetTrees})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Number of Trees Planted *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.treesPlanted}
                onChange={(e) =>
                  setFormData({ ...formData, treesPlanted: parseInt(e.target.value) || 0 })
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
                value={formData.plantationDate}
                onChange={(e) =>
                  setFormData({ ...formData, plantationDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Field Site Location *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Supporting Photograph URL *
            </label>
            <input
              type="url"
              required
              value={formData.evidencePhotoUrl}
              onChange={(e) => setFormData({ ...formData, evidencePhotoUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Species Planted (Comma separated)
            </label>
            <input
              type="text"
              value={formData.speciesList}
              onChange={(e) => setFormData({ ...formData, speciesList: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-50 dark:bg-[#071912] text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#071912] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-800/40 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-emerald-950/40 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-forest-900 dark:bg-emerald-600 text-white font-semibold hover:bg-forest-950 dark:hover:bg-emerald-500 transition shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
