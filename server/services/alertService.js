import Project from '../models/Project.js';
import PlantingActivity from '../models/PlantingActivity.js';
import SurvivalInspection from '../models/SurvivalInspection.js';
import { calculateProjectStats } from './calculationService.js';

/**
 * Evaluates smart rule-based alerts dynamically from live database state.
 */
export const evaluateSmartAlerts = async () => {
  const alerts = [];
  const projects = await Project.find().populate('projectManager', 'name email');
  const now = new Date();

  for (const project of projects) {
    const stats = await calculateProjectStats(project._id);
    if (!stats) continue;

    // Rule 1: Pending Verification
    if (stats.pendingTrees > 0) {
      alerts.push({
        id: `pending-${project._id}`,
        projectId: project._id,
        projectCode: project.projectId,
        projectName: project.name,
        type: 'WARNING',
        category: 'Pending Verification',
        title: `${stats.pendingTrees.toLocaleString()} trees awaiting verification`,
        message: `Project ${project.projectId} has pending plantation submissions requiring field evidence review.`,
        metric: `${stats.pendingTrees} trees pending`,
        severity: 'medium',
        actionRequired: 'Review evidence photos & verify or reject',
        createdAt: new Date(),
      });
    }

    // Rule 2: Low Tree Survival Rate (< 70%)
    if (stats.survivalRate !== null && stats.survivalRate < 70) {
      alerts.push({
        id: `survival-${project._id}`,
        projectId: project._id,
        projectCode: project.projectId,
        projectName: project.name,
        type: 'CRITICAL',
        category: 'Low Survival Rate',
        title: `Critical survival rate of ${stats.survivalRate}%`,
        message: `Field survival rate for ${project.name} has dipped below the 70% threshold (${stats.totalSurviving}/${stats.totalInspected} surviving). Soil and moisture intervention needed.`,
        metric: `${stats.survivalRate}% survival`,
        severity: 'high',
        actionRequired: 'Schedule remedial planting or irrigation audit',
        createdAt: new Date(),
      });
    }

    // Rule 3: Approaching Deadlines with Low Progress
    const endDate = new Date(project.endDate);
    const daysUntilEnd = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilEnd > 0 && daysUntilEnd <= 60 && stats.completionPercentage < 50 && project.status === 'Active') {
      alerts.push({
        id: `deadline-${project._id}`,
        projectId: project._id,
        projectCode: project.projectId,
        projectName: project.name,
        type: 'WARNING',
        category: 'Deadline Approaching',
        title: `Target deadline in ${daysUntilEnd} days, only ${stats.completionPercentage}% completed`,
        message: `Project ${project.name} has ${stats.remainingTarget.toLocaleString()} trees remaining against target with deadline on ${endDate.toLocaleDateString()}.`,
        metric: `${stats.completionPercentage}% of ${project.targetTrees} target`,
        severity: daysUntilEnd <= 30 ? 'high' : 'medium',
        actionRequired: 'Accelerate planting batches or extend project schedule',
        createdAt: new Date(),
      });
    }

    // Rule 4: Projects with No Recent Activity (> 45 days)
    const latestActivity = await PlantingActivity.findOne({ projectId: project._id })
      .sort({ plantationDate: -1 });

    let daysSinceLastActivity = null;
    if (latestActivity) {
      daysSinceLastActivity = Math.floor((now - new Date(latestActivity.plantationDate)) / (1000 * 60 * 60 * 24));
    } else {
      daysSinceLastActivity = Math.floor((now - new Date(project.startDate)) / (1000 * 60 * 60 * 24));
    }

    if (project.status === 'Active' && daysSinceLastActivity > 45) {
      alerts.push({
        id: `inactive-${project._id}`,
        projectId: project._id,
        projectCode: project.projectId,
        projectName: project.name,
        type: 'INFO',
        category: 'Stalled Activity',
        title: `No plantation logged in past ${daysSinceLastActivity} days`,
        message: `Active project ${project.name} has no recent field plantation records recorded.`,
        metric: `${daysSinceLastActivity} days dormant`,
        severity: 'low',
        actionRequired: 'Check with Project Manager for field schedule',
        createdAt: new Date(),
      });
    }

    // Rule 5: Target Overshoot or Invalid Project Data
    if (stats.verifiedTrees > project.targetTrees) {
      alerts.push({
        id: `overshoot-${project._id}`,
        projectId: project._id,
        projectCode: project.projectId,
        projectName: project.name,
        type: 'NOTICE',
        category: 'Target Exceeded',
        title: `Target exceeded by ${(stats.verifiedTrees - project.targetTrees).toLocaleString()} trees`,
        message: `Verified planting total (${stats.verifiedTrees}) exceeds baseline target (${project.targetTrees}). Adjust target if intentional.`,
        metric: `${stats.verifiedTrees}/${project.targetTrees} trees`,
        severity: 'low',
        actionRequired: 'Review target revision',
        createdAt: new Date(),
      });
    }
  }

  return alerts;
};
