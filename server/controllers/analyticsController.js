import Project from '../models/Project.js';
import PlantingActivity from '../models/PlantingActivity.js';
import SurvivalInspection from '../models/SurvivalInspection.js';
import { calculateGlobalStats, calculateProjectStats } from '../services/calculationService.js';

// @desc    Get top-level dashboard metrics & all calculated charts
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Top summary cards
    const summary = await calculateGlobalStats();

    // 2. Project-wise Progress Breakdown
    const projects = await Project.find().sort({ targetTrees: -1 });
    const projectProgress = await Promise.all(
      projects.map(async (p) => {
        const stats = await calculateProjectStats(p._id);
        return {
          id: p._id,
          code: p.projectId,
          name: p.name,
          category: p.category,
          status: p.status,
          target: p.targetTrees,
          verified: stats.verifiedTrees,
          pending: stats.pendingTrees,
          remaining: stats.remainingTarget,
          completion: stats.completionPercentage,
          survivalRate: stats.survivalRate,
        };
      })
    );

    // 3. Monthly Plantation Trends (Aggregated from PlantingActivity)
    // Groups verified and reported trees by Month & Year
    const monthlyTrendsAgg = await PlantingActivity.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$plantationDate' },
            month: { $month: '$plantationDate' },
            status: '$verificationStatus',
          },
          trees: { $sum: '$treesPlanted' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly trends into clean chart data array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    monthlyTrendsAgg.forEach((item) => {
      const key = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: key,
          verifiedTrees: 0,
          pendingTrees: 0,
          totalReported: 0,
        };
      }
      if (item._id.status === 'Verified') {
        monthlyMap[key].verifiedTrees += item.trees;
      } else if (item._id.status === 'Pending') {
        monthlyMap[key].pendingTrees += item.trees;
      }
      monthlyMap[key].totalReported += item.trees;
    });

    const monthlyTrends = Object.values(monthlyMap);

    // 4. Project Category Distribution
    const categoryAgg = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          targetTrees: { $sum: '$targetTrees' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const categoryDistribution = categoryAgg.map((c) => ({
      name: c._id,
      count: c.count,
      targetTrees: c.targetTrees,
    }));

    // 5. Project Status Distribution
    const statusAgg = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusDistribution = statusAgg.map((s) => ({
      status: s._id,
      count: s.count,
    }));

    // 6. Recent verified plantation feed
    const recentActivities = await PlantingActivity.find()
      .populate('projectId', 'projectId name')
      .populate('submittedBy', 'name')
      .sort({ plantationDate: -1 })
      .limit(6);

    res.json({
      success: true,
      summary,
      charts: {
        monthlyTrends,
        projectProgress,
        categoryDistribution,
        statusDistribution,
      },
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};
