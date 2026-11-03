import SurvivalInspection from '../models/SurvivalInspection.js';
import Project from '../models/Project.js';
import { calculateProjectStats } from '../services/calculationService.js';
import { logAudit } from '../services/auditService.js';

// @desc    Get all survival inspections with filtering
// @route   GET /api/survival
// @access  Private
export const getInspections = async (req, res, next) => {
  try {
    const { projectId, inspectionType, healthCondition } = req.query;
    const query = {};

    if (projectId && projectId !== 'All') {
      query.projectId = projectId;
    }

    if (inspectionType && inspectionType !== 'All') {
      query.inspectionType = inspectionType;
    }

    if (healthCondition && healthCondition !== 'All') {
      query.healthCondition = healthCondition;
    }

    const inspections = await SurvivalInspection.find(query)
      .populate('projectId', 'projectId name targetTrees category location')
      .populate('activityId', 'activityCode plantationDate treesPlanted')
      .populate('recordedBy', 'name email role')
      .sort({ inspectionDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: inspections.length,
      inspections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single survival inspection by ID
// @route   GET /api/survival/:id
// @access  Private
export const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await SurvivalInspection.findById(req.params.id)
      .populate('projectId', 'projectId name targetTrees')
      .populate('activityId', 'activityCode plantationDate treesPlanted')
      .populate('recordedBy', 'name email role');

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection record not found',
      });
    }

    res.json({
      success: true,
      inspection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new survival inspection
// @route   POST /api/survival
// @access  Admin & Project Manager
export const createInspection = async (req, res, next) => {
  try {
    const {
      projectId,
      activityId,
      inspectionType,
      inspectionDate,
      treesInspected,
      treesSurviving,
      notes,
      healthCondition,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const inspected = Number(treesInspected);
    const surviving = Number(treesSurviving);

    if (isNaN(inspected) || inspected <= 0 || !Number.isInteger(inspected)) {
      return res.status(400).json({
        success: false,
        message: 'Trees inspected must be a positive integer greater than 0',
      });
    }

    if (isNaN(surviving) || surviving < 0 || !Number.isInteger(surviving)) {
      return res.status(400).json({
        success: false,
        message: 'Trees surviving must be a non-negative integer',
      });
    }

    if (surviving > inspected) {
      return res.status(400).json({
        success: false,
        message: 'Surviving trees cannot exceed total trees inspected',
      });
    }

    const dead = inspected - surviving;
    const survivalRate = Number(((surviving / inspected) * 100).toFixed(2));

    const inspection = await SurvivalInspection.create({
      projectId,
      activityId: activityId || null,
      inspectionType,
      inspectionDate: inspectionDate || new Date(),
      treesInspected: inspected,
      treesSurviving: surviving,
      treesDead: dead,
      survivalRate,
      notes: notes || '',
      healthCondition: healthCondition || 'Good',
      recordedBy: req.user._id,
    });

    await logAudit({
      user: req.user,
      action: 'INSPECTION_RECORDED',
      entityType: 'SurvivalInspection',
      entityId: inspection._id,
      recordTitle: `${project.name} (${inspectionType} - ${survivalRate}%)`,
      newValue: inspection.toObject(),
      reason: `Survival inspection logged by ${req.user.name}: ${surviving}/${inspected} trees survived (${survivalRate}%).`,
    });

    const projectStats = await calculateProjectStats(projectId);

    res.status(201).json({
      success: true,
      inspection,
      projectStats,
      message: `Inspection recorded successfully. Project survival rate is now ${projectStats.survivalRate || survivalRate}%. Note: This inspection has not modified planted tree counts.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update survival inspection
// @route   PUT /api/survival/:id
// @access  Admin & Project Manager
export const updateInspection = async (req, res, next) => {
  try {
    const inspection = await SurvivalInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection record not found',
      });
    }

    const previousValue = inspection.toObject();
    const {
      inspectionType,
      inspectionDate,
      treesInspected,
      treesSurviving,
      notes,
      healthCondition,
    } = req.body;

    if (inspectionType !== undefined) inspection.inspectionType = inspectionType;
    if (inspectionDate !== undefined) inspection.inspectionDate = inspectionDate;
    if (notes !== undefined) inspection.notes = notes;
    if (healthCondition !== undefined) inspection.healthCondition = healthCondition;

    if (treesInspected !== undefined || treesSurviving !== undefined) {
      const inspected = treesInspected !== undefined ? Number(treesInspected) : inspection.treesInspected;
      const surviving = treesSurviving !== undefined ? Number(treesSurviving) : inspection.treesSurviving;

      if (surviving > inspected) {
        return res.status(400).json({
          success: false,
          message: 'Surviving trees cannot exceed total inspected',
        });
      }

      inspection.treesInspected = inspected;
      inspection.treesSurviving = surviving;
      inspection.treesDead = inspected - surviving;
      inspection.survivalRate = Number(((surviving / inspected) * 100).toFixed(2));
    }

    const updated = await inspection.save();

    await logAudit({
      user: req.user,
      action: 'INSPECTION_UPDATED',
      entityType: 'SurvivalInspection',
      entityId: updated._id,
      recordTitle: `${inspection.inspectionType} audit`,
      previousValue,
      newValue: updated.toObject(),
      reason: `Inspection record updated by ${req.user.name}`,
    });

    const projectStats = await calculateProjectStats(updated.projectId);

    res.json({
      success: true,
      inspection: updated,
      projectStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete survival inspection
// @route   DELETE /api/survival/:id
// @access  Admin only
export const deleteInspection = async (req, res, next) => {
  try {
    const inspection = await SurvivalInspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection record not found',
      });
    }

    const projectId = inspection.projectId;

    await logAudit({
      user: req.user,
      action: 'INSPECTION_DELETED',
      entityType: 'SurvivalInspection',
      entityId: inspection._id,
      recordTitle: `${inspection.inspectionType} inspection`,
      previousValue: inspection.toObject(),
      reason: `Inspection deleted by Admin ${req.user.name}`,
    });

    await inspection.deleteOne();

    const projectStats = await calculateProjectStats(projectId);

    res.json({
      success: true,
      message: 'Inspection record removed',
      projectStats,
    });
  } catch (error) {
    next(error);
  }
};
