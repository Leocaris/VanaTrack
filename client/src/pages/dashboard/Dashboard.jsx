import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Sprout,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../../api/apiClient';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const CATEGORY_COLORS = ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { canManage } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/analytics/dashboard');
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing real-time environmental database aggregations..." size="lg" />;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-rose-800 dark:text-rose-300 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto mb-2" />
        <h3 className="font-bold text-sm">Dashboard Analytics Offline</h3>
        <p className="text-xs mt-1 text-rose-600 dark:text-rose-300">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, charts, recentActivities } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Test Scenario Spotlight Banner */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-950 to-[#0b241b] rounded-2xl p-4 sm:p-5 text-white border border-forest-800/60 dark:border-emerald-800/50 shadow-elevated relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Key Test Scenario
              </span>
              <span className="text-xs text-emerald-300/80 font-medium">Akshaya Vana Benchmark PRJ-2026-001</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold mt-1 text-white">
              Wayanad Reforestation: Target 1,000 Trees • 600 Verified Initially
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Currently has <strong>250 pending trees</strong> awaiting verification. When verified, total becomes{' '}
              <strong>850 trees (85% completion, 150 remaining)</strong>. Test the real-time recalculation now!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/activities')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify 250 Trees Activity</span>
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="px-3 py-2 rounded-xl bg-forest-800/80 hover:bg-forest-800 text-white text-xs font-medium border border-forest-700/60 transition"
            >
              View Project
            </button>
          </div>
        </div>
      </div>

      {/* 7 Required Database-Driven Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <StatCard
          title="Total Projects"
          value={summary.totalProjects}
          subtext="Registered portfolio"
          icon={FolderKanban}
          accent="forest"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Active Projects"
          value={summary.activeProjects}
          subtext="Currently planting"
          icon={Activity}
          accent="emerald"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          title="Total Target"
          value={summary.totalTreeTarget.toLocaleString()}
          subtext="Target trees committed"
          icon={Target}
          accent="sage"
        />
        <StatCard
          title="Verified Planted"
          value={summary.verifiedTreesPlanted.toLocaleString()}
          subtext="Confirmed by audit"
          icon={CheckCircle2}
          accent="forest"
          trend={`${Math.round((summary.verifiedTreesPlanted / (summary.totalTreeTarget || 1)) * 100)}%`}
          trendType="positive"
        />
        <StatCard
          title="Pending Review"
          value={summary.pendingVerificationTrees.toLocaleString()}
          subtext="Awaiting evidence audit"
          icon={Clock}
          accent="amber"
          trendType="warning"
          onClick={() => navigate('/activities')}
        />
        <StatCard
          title="Survival Rate"
          value={`${summary.overallSurvivalRate}%`}
          subtext="Inspection baseline"
          icon={Sprout}
          accent={summary.overallSurvivalRate >= 75 ? 'emerald' : 'rose'}
          trend={summary.overallSurvivalRate >= 80 ? 'Optimal' : 'Needs attention'}
          trendType={summary.overallSurvivalRate >= 80 ? 'positive' : 'warning'}
          onClick={() => navigate('/survival')}
        />
        <StatCard
          title="Attention Needed"
          value={summary.projectsRequiringAttention}
          subtext="Alerts & thresholds"
          icon={AlertTriangle}
          accent={summary.projectsRequiringAttention > 0 ? 'rose' : 'forest'}
          trendType={summary.projectsRequiringAttention > 0 ? 'negative' : 'neutral'}
          onClick={() => navigate('/alerts')}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Plantation Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-5 shadow-card transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Monthly Plantation Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-400/80">
                Verified vs. Pending trees planted per calendar month (DB Aggregated)
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/40">
              Database Live
            </span>
          </div>

          <div className="h-72 w-full">
            {charts.monthlyTrends && charts.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.monthlyTrends}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#14382a' : '#f1f5f9'} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a231a',
                      borderRadius: '0.75rem',
                      border: '1px solid #1b4d3a',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val.toLocaleString()} trees`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="verifiedTrees"
                    name="Verified Trees"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorVerified)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pendingTrees"
                    name="Pending Verification"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorPending)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No plantation activity logs recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution Donut Chart */}
        <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-5 shadow-card transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Project Category Mix
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-400/80">Distribution across environmental biomes</p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {charts.categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a231a',
                    borderRadius: '0.75rem',
                    border: '1px solid #1b4d3a',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [`${val} projects`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Legend */}
          <div className="mt-2 space-y-1.5">
            {charts.categoryDistribution.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 truncate">{cat.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-800 dark:text-white">
                  {cat.count} ({cat.targetTrees.toLocaleString()} trees)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project-Wise Progress Bar Chart & Target Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Target vs Verified Progress (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-5 shadow-card transition-colors duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Project Target vs. Verified Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-400/80">
                Direct comparison of planned target trees against verified field plantings
              </p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-forest-800 dark:text-emerald-400 hover:text-forest-950 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Manage Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.projectProgress}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#14382a' : '#f1f5f9'} />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a231a',
                    borderRadius: '0.75rem',
                    border: '1px solid #1b4d3a',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [`${val.toLocaleString()} trees`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="target" name="Target Target" fill={isDark ? '#334155' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified" name="Verified Trees" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Breakdown & Quick Links */}
        <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-5 shadow-card transition-colors duration-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Project Lifecycle Health
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-400/80 mb-4">Status & inspection coverage</p>

            <div className="space-y-3">
              {charts.projectProgress.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50/80 dark:bg-emerald-950/40 border border-slate-100 dark:border-emerald-900/30">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</span>
                    <Badge variant={p.status} size="xs">
                      {p.status}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={p.verified}
                    max={p.target}
                    size="sm"
                    sublabel={`${p.verified.toLocaleString()} / ${p.target.toLocaleString()}`}
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Remaining: {p.remaining.toLocaleString()} trees</span>
                    <span className="font-medium text-emerald-800 dark:text-emerald-400">
                      Survival: {p.survivalRate !== null ? `${p.survivalRate}%` : 'Pending audit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Need to record field data?</span>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/activities')}
                className="px-2.5 py-1.5 rounded-lg bg-forest-800 dark:bg-emerald-700 text-white text-xs font-semibold hover:bg-forest-900 dark:hover:bg-emerald-600 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Activity</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Field Evidence Stream */}
      <div className="bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-5 shadow-card transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Field Planting Submissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-400/80">
              Photographic field evidence stream & auditor verification status
            </p>
          </div>
          <button
            onClick={() => navigate('/activities')}
            className="text-xs font-semibold text-forest-800 dark:text-emerald-400 hover:text-forest-950 dark:hover:text-emerald-300 flex items-center gap-1"
          >
            <span>All Submissions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div
                key={act._id}
                className="rounded-xl border border-slate-200/80 dark:border-emerald-900/40 overflow-hidden hover:shadow-card transition flex flex-col justify-between bg-white dark:bg-[#081e16]"
              >
                {act.evidencePhotoUrl && (
                  <div className="h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                    <img
                      src={act.evidencePhotoUrl}
                      alt={act.activityCode}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={act.verificationStatus} size="xs">
                        {act.verificationStatus}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      <span>{act.activityCode}</span>
                      <span className="text-forest-900 dark:text-emerald-400 font-sans font-bold">
                        {act.treesPlanted.toLocaleString()} trees
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium truncate">
                      {act.projectId?.name || 'Environmental Project'}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {act.location}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-emerald-900/30 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>
                      {new Date(act.plantationDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="truncate max-w-[120px]">
                      By {act.submittedBy?.name || 'Field Lead'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-xs text-slate-400">
              No recent field submissions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
