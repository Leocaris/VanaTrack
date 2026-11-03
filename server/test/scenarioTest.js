import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { seedDatabase } from '../seed/seedData.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import PlantingActivity from '../models/PlantingActivity.js';
import SurvivalInspection from '../models/SurvivalInspection.js';
import { calculateProjectStats, calculateGlobalStats } from '../services/calculationService.js';
import { evaluateSmartAlerts } from '../services/alertService.js';

const runTests = async () => {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING VANATRACK AUTOMATED VERIFICATION & TEST SCENARIOS');
  console.log('===============================================================\n');

  await connectDB();
  await seedDatabase();

  // Test 1: User Authentication & Role Validation
  console.log('▶ Test 1: Verifying User Accounts & Password Matching...');
  const admin = await User.findOne({ email: 'admin@vanatrack.org' }).select('+password');
  const manager = await User.findOne({ email: 'manager@vanatrack.org' }).select('+password');
  const viewer = await User.findOne({ email: 'viewer@vanatrack.org' }).select('+password');

  const adminPassValid = await admin.matchPassword('Admin@123');
  const managerPassValid = await manager.matchPassword('Manager@123');
  const viewerPassValid = await viewer.matchPassword('Viewer@123');

  if (!adminPassValid || !managerPassValid || !viewerPassValid) {
    throw new Error('❌ Password hashing verification failed!');
  }
  console.log('  ✅ Admin, Manager, and Viewer password matching verified successfully.');

  // Test 2: Crucial Test Scenario Baseline
  // Project target: 1000 trees.
  // Initially verified plantation count: 600.
  console.log('\n▶ Test 2: Checking Baseline Scenario (Target 1000 trees, 600 verified)...');
  const project1 = await Project.findOne({ projectId: 'PRJ-2026-001' });
  let stats = await calculateProjectStats(project1._id);

  console.log(`  Initial Target: ${stats.targetTrees}`);
  console.log(`  Initial Verified: ${stats.verifiedTrees}`);
  console.log(`  Initial Pending: ${stats.pendingTrees}`);
  console.log(`  Initial Remaining: ${stats.remainingTarget}`);
  console.log(`  Initial Completion: ${stats.completionPercentage}%`);

  if (stats.targetTrees !== 1000 || stats.verifiedTrees !== 600 || stats.remainingTarget !== 400 || stats.completionPercentage !== 60) {
    throw new Error(`❌ Baseline scenario mismatch! Expected Target=1000, Verified=600, Remaining=400, Completion=60%. Got: ${JSON.stringify(stats)}`);
  }
  console.log('  ✅ Baseline values match exactly: 600 verified / 1000 target (60%).');

  // Test 3: Verification of Pending 250 trees
  // "Later, another 250 trees are verified. Expected result: Verified plantation count: 850, Remaining target: 150, Completion: 85%"
  console.log('\n▶ Test 3: Verifying pending 250-tree batch (ACT-WYD-003)...');
  const pendingActivity = await PlantingActivity.findOne({
    projectId: project1._id,
    activityCode: 'ACT-WYD-003',
  });

  if (!pendingActivity || pendingActivity.treesPlanted !== 250) {
    throw new Error('❌ Pending activity ACT-WYD-003 with 250 trees not found!');
  }

  // Simulate Auditor verification
  pendingActivity.verificationStatus = 'Verified';
  pendingActivity.verifiedBy = admin._id;
  pendingActivity.verifiedAt = new Date();
  pendingActivity.verificationNotes = 'Field drone footage and sapling spacing approved.';
  await pendingActivity.save();

  // Recalculate stats
  stats = await calculateProjectStats(project1._id);
  console.log(`  Updated Target: ${stats.targetTrees}`);
  console.log(`  Updated Verified: ${stats.verifiedTrees}`);
  console.log(`  Updated Pending: ${stats.pendingTrees}`);
  console.log(`  Updated Remaining: ${stats.remainingTarget}`);
  console.log(`  Updated Completion: ${stats.completionPercentage}%`);

  if (stats.verifiedTrees !== 850) {
    throw new Error(`❌ Expected verified count 850, got ${stats.verifiedTrees}`);
  }
  if (stats.remainingTarget !== 150) {
    throw new Error(`❌ Expected remaining target 150, got ${stats.remainingTarget}`);
  }
  if (stats.completionPercentage !== 85) {
    throw new Error(`❌ Expected completion percentage 85%, got ${stats.completionPercentage}%`);
  }
  console.log('  ✅ SCENARIO PASSED: Verified=850, Remaining=150, Completion=85%!');

  // Test 4: Survival Monitoring Calculation Formula
  // Formula: Survival Rate = (Surviving Trees / Inspected Trees) * 100
  // Crucial: Repeated inspections must NOT add to planted trees!
  console.log('\n▶ Test 4: Verifying Survival Monitoring Formula & Double-Count Guard...');
  const inspection = await SurvivalInspection.findOne({ projectId: project1._id, inspectionType: '30-Day' });
  const calculatedRate = (inspection.treesSurviving / inspection.treesInspected) * 100;

  if (Math.abs(calculatedRate - inspection.survivalRate) > 0.01) {
    throw new Error(`❌ Survival rate calculation error! Expected ${calculatedRate}, got ${inspection.survivalRate}`);
  }
  console.log(`  Inspection: ${inspection.treesSurviving}/${inspection.treesInspected} trees survived = ${inspection.survivalRate}%`);

  // Verify that inspection trees (200) were NOT added to planted trees (remains 850)
  if (stats.verifiedTrees !== 850) {
    throw new Error('❌ CRITICAL: Inspection counts leaked into planted trees!');
  }
  console.log('  ✅ Survival inspections correctly segregated from planted totals.');

  // Test 5: Smart Alerts Dynamic Evaluation
  console.log('\n▶ Test 5: Verifying Rule-Based Smart Alerts...');
  const alerts = await evaluateSmartAlerts();
  console.log(`  Generated ${alerts.length} dynamic alerts from database state:`);
  alerts.forEach((a) => {
    console.log(`  - [${a.type}] ${a.category}: ${a.title}`);
  });

  const lowSurvivalAlert = alerts.find((a) => a.category === 'Low Survival Rate');
  if (!lowSurvivalAlert) {
    throw new Error('❌ Expected low survival rate alert for Bengaluru Urban Corridors (< 70%)!');
  }
  console.log('  ✅ Smart alerts correctly flagged low survival rate project.');

  // Test 6: Global Analytics Dashboard Aggregations
  console.log('\n▶ Test 6: Verifying Database-Driven Dashboard Aggregation...');
  const global = await calculateGlobalStats();
  console.log(`  Total Projects: ${global.totalProjects}`);
  console.log(`  Active Projects: ${global.activeProjects}`);
  console.log(`  Total Target Trees: ${global.totalTreeTarget.toLocaleString()}`);
  console.log(`  Verified Trees: ${global.verifiedTreesPlanted.toLocaleString()}`);
  console.log(`  Pending Trees: ${global.pendingVerificationTrees.toLocaleString()}`);
  console.log(`  Overall Survival Rate: ${global.overallSurvivalRate}%`);
  console.log(`  Projects Requiring Attention: ${global.projectsRequiringAttention}`);

  if (global.totalProjects !== 5 || global.totalTreeTarget !== 19500) {
    throw new Error('❌ Global database metrics mismatch!');
  }
  console.log('  ✅ Global metrics computed dynamically from DB collections.');

  await closeDB();
  console.log('\n===============================================================');
  console.log('🎉 ALL BACKEND BUSINESS LOGIC & SCENARIO TESTS PASSED (6/6)');
  console.log('===============================================================\n');
};

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});

