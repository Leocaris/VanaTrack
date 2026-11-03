import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  TreePine,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api } from '../../api/apiClient';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CATEGORIES = [
  'All',
  'Agroforestry',
  'Mangrove Restoration',
  'Urban Greenery',
  'Afforestation',
  'Reforestation',
  'Biodiversity Corridor',
];

const STATUSES = ['All', 'Active', 'Planned', 'Completed', 'On Hold'];

export const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  // Create form state
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    category: 'Agroforestry',
    location: '',
    latitude: 11.6854,
    longitude: 76.1320,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetTrees: 1000,
    projectManager: '',
    status: 'Active',
  });
  const [submitting, setSubmitting] = useState(false);

  const { canManage, isAdmin, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (selectedStatus !== 'All') queryParams.append('status', selectedStatus);
      queryParams.append('sortBy', sortBy);

      const data = await api.get(`/projects?${queryParams.toString()}`);
      setProjects(data.projects || []);
    } catch (err) {
      toast.error('Failed to load projects', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get('/auth/users');
      setUsers(data.users || []);
      if (data.users && data.users.length > 0 && !formData.projectManager) {
        setFormData((prev) => ({ ...prev, projectManager: data.users[0]._id }));
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, selectedCategory, selectedStatus, sortBy]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', formData);
      toast.success('Project Initialized', `Project ${formData.projectId} added to registry`);
      setIsCreateModalOpen(false);
      // Reset form
      setFormData({
        projectId: '',
        name: '',
        description: '',
        category: 'Agroforestry',
        location: '',
        latitude: 12.9716,
        longitude: 77.5946,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetTrees: 1000,
        projectManager: users[0]?._id || '',
        status: 'Active',
      });
      fetchProjects();
    } catch (err) {
      toast.error('Creation Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Environmental Projects Registry
          </h2>
          <p className="text-xs text-slate-500">
            Master repository of verified restoration sites and quantitative targets
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-semibold shadow-card transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Register New Project</span>
          </button>
        )}
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project name, ID, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700 focus:border-forest-700 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-forest-700"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-forest-700"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-forest-700 font-mono"
            >
              <option value="createdAt">Sort: Created Date</option>
              <option value="targetTrees">Sort: Target Size</option>
              <option value="name">Sort: Project Name</option>
              <option value="startDate">Sort: Start Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner text="Querying project database..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects match criteria"
          description="Try broadening your search query or reset filter categories."
          actionText={canManage ? 'Register New Project' : undefined}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const stats = project.stats || {};
            const verified = stats.verifiedTrees || 0;
            const target = project.targetTrees || 1;
            const remaining = stats.remainingTarget ?? Math.max(0, target - verified);
            const completion = stats.completionPercentage ?? Math.round((verified / target) * 100);

            return (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-forest-50 text-forest-900 border border-forest-100">
                        {project.projectId}
                      </span>
                      <Badge variant={project.status} size="xs">
                        {project.status}
                      </Badge>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-forest-800 flex items-center gap-0.5 transition">
                      <span>Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-forest-900 transition">
                    {project.name}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {project.description || 'No detailed mission description logged.'}
                  </p>
                </div>

                {/* Progress & Target Section */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                  <ProgressBar
                    value={verified}
                    max={target}
                    size="md"
                    label="Target Completion"
                    sublabel={`${verified.toLocaleString()} / ${target.toLocaleString()} trees`}
                  />

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">
                        Remaining Target
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {remaining.toLocaleString()} trees
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">
                        Survival Audit
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          stats.survivalRate === null
                            ? 'text-slate-400'
                            : stats.survivalRate >= 75
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {stats.survivalRate !== null ? `${stats.survivalRate}%` : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="capitalize">{project.category}</span>
                    <span>Manager: {project.projectManager?.name || 'Assigned Lead'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register Environmental Project"
        subtitle="Establish quantitative tree planting target and geo-boundary baseline"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Code ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PRJ-2026-006"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Western Ghats Agroforestry"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Project Description
            </label>
            <textarea
              rows={2}
              placeholder="Ecological scope, community partnerships, soil conditions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Trees *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.targetTrees}
                onChange={(e) =>
                  setFormData({ ...formData, targetTrees: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              >
                {STATUSES.filter((s) => s !== 'All').map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Wayanad, Kerala"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-forest-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-forest-900 text-white font-semibold hover:bg-forest-950 transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Save & Initialize Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
