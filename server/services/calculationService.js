import mongoose from 'mongoose';
import Project from '../models/Project.js';
import PlantingActivity from '../models/PlantingActivity.js';
import SurvivalInspection from '../models/SurvivalInspection.js';

/**
 * Calculates real-time, database-driven metrics for a single project.
 * Adheres strictly to business rules:
 * - Only 'Verified' activities contribute to confirmed plantation totals.
 * - Inspection counts are never summed as planted trees.
 */
export const calculateProjectStats = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const objectId = new mongoose.Types.ObjectId(projectId);

  // Aggregate planting activities by verificationStatus
  const activityAggregation = await PlantingActivity.aggregate([
    { $match: { projectId: objectId } },
    {
      $group: {
        _id: '$verificationStatus',
        totalTrees: { $sum: '$treesPlanted' },
        count: { $sum: 1 },
      },
    },
  ]);

  let verifiedTrees = 0;
  let pendingTrees = 0;
  let rejectedTrees = 0;
  let totalActivities = 0;

  activityAggregation.forEach((group) => {
    totalActivities += group.count;
    if (group._id === 'Verified') verifiedTrees = group.totalTrees;
    else if (group._id === 'Pending') pendingTrees = group.totalTrees;
    else if (group._id === 'Rejected') rejectedTrees = group.totalTrees;
  });

  const targetTrees = project.targetTrees || 0;
  const remainingTarget = Math.max(0, targetTrees - verifiedTrees);
  const completionPercentage =
    targetTrees > 0 ? Number(Math.min(100, (verifiedTrees / targetTrees) * 100).toFixed(1)) : 0;

  // Aggregate survival inspections
  const survivalAggregation = await SurvivalInspection.aggregate([
    { $match: { projectId: objectId } },
    {
      $group: {
        _id: null,
        totalInspected: { $sum: '$treesInspected' },
        totalSurviving: { $sum: '$treesSurviving' },
        totalDead: { $sum: '$treesDead' },
        inspectionCount: { $sum: 1 },
        latestInspectionDate: { $max: '$inspectionDate' },
      },
    },
  ]);

  let averageSurvivalRate = null;
  let totalInspected = 0;
  let totalSurviving = 0;
  let inspectionCount = 0;
  let latestInspectionDate = null;

  if (survivalAggregation.length > 0) {
    totalInspected = survivalAggregation[0].totalInspected;
    totalSurviving = survivalAggregation[0].totalSurviving;
    inspectionCount = survivalAggregation[0].inspectionCount;
    latestInspectionDate = survivalAggregation[0].latestInspectionDate;

    if (totalInspected > 0) {
      averageSurvivalRate = Number(((totalSurviving / totalInspected) * 100).toFixed(1));
    }
  }

  return {
    projectId: project._id,
    projectCode: project.projectId,
    name: project.name,
    category: project.category,
    status: project.status,
    targetTrees,
    verifiedTrees,
    pendingTrees,
    rejectedTrees,
    remainingTarget,
    completionPercentage,
    survivalRate: averageSurvivalRate,
    totalInspected,
    totalSurviving,
    inspectionCount,
    latestInspectionDate,
    totalActivities,
  };
};

/**
 * Global database-driven aggregation for dashboard statistics
 */
export const calculateGlobalStats = async () => {
  const totalProjects = await Project.countDocuments();
  const activeProjects = await Project.countDocuments({ status: 'Active' });

  // Sum total target trees across all projects
  const targetAggregation = await Project.aggregate([
    {
      $group: {
        _id: null,
        totalTarget: { $sum: '$targetTrees' },
      },
    },
  ]);
  const totalTreeTarget = targetAggregation.length > 0 ? targetAggregation[0].totalTarget : 0;

  // Aggregate all activities globally
  const activityAggregation = await PlantingActivity.aggregate([
    {
      $group: {
        _id: '$verificationStatus',
        totalTrees: { $sum: '$treesPlanted' },
        activityCount: { $sum: 1 },
      },
    },
  ]);

  let verifiedTreesPlanted = 0;
  let pendingVerificationTrees = 0;
  let rejectedTrees = 0;

  activityAggregation.forEach((g) => {
    if (g._id === 'Verified') verifiedTreesPlanted = g.totalTrees;
    else if (g._id === 'Pending') pendingVerificationTrees = g.totalTrees;
    else if (g._id === 'Rejected') rejectedTrees = g.totalTrees;
  });

  // Global Survival Rate from all inspections
  const survivalAggregation = await SurvivalInspection.aggregate([
    {
      $group: {
        _id: null,
        totalInspected: { $sum: '$treesInspected' },
        totalSurviving: { $sum: '$treesSurviving' },
      },
    },
  ]);

  let overallSurvivalRate = 0;
  if (
    survivalAggregation.length > 0 &&
    survivalAggregation[0].totalInspected > 0
  ) {
    overallSurvivalRate = Number(
      ((survivalAggregation[0].totalSurviving / survivalAggregation[0].totalInspected) * 100).toFixed(1)
    );
  }

  // Calculate projects requiring attention
  // Rule: Projects with survival rate < 70%, or pending verifications > 0, or deadline within 30 days with < 50% completion
  const projects = await Project.find();
  let projectsRequiringAttention = 0;

  for (const proj of projects) {
    const stats = await calculateProjectStats(proj._id);
    const now = new Date();
    const daysUntilEnd = (new Date(proj.endDate) - now) / (1000 * 60 * 60 * 24);

    const isLowSurvival = stats.survivalRate !== null && stats.survivalRate < 70;
    const isApproachingDeadlineLowProgress = daysUntilEnd > 0 && daysUntilEnd <= 30 && stats.completionPercentage < 50;
    const hasPendingReview = stats.pendingTrees > 0;

    if (isLowSurvival || isApproachingDeadlineLowProgress || hasPendingReview) {
      projectsRequiringAttention++;
    }
  }

  return {
    totalProjects,
    activeProjects,
    totalTreeTarget,
    verifiedTreesPlanted,
    pendingVerificationTrees,
    rejectedTrees,
    overallSurvivalRate,
    projectsRequiringAttention,
  };
};
