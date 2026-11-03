import PlantingActivity from '../models/PlantingActivity.js';
import Project from '../models/Project.js';
import { calculateProjectStats } from '../services/calculationService.js';
import { logAudit } from '../services/auditService.js';

// @desc    Get all planting activities with filtering
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res, next) => {
  try {
    const { projectId, status, search } = req.query;
    const query = {};

    if (projectId && projectId !== 'All') {
      query.projectId = projectId;
    }

    if (status && status !== 'All') {
      query.verificationStatus = status;
    }

    if (search) {
      query.$or = [
        { activityCode: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const activities = await PlantingActivity.find(query)
      .populate('projectId', 'projectId name targetTrees category')
      .populate('submittedBy', 'name email role')
      .populate('verifiedBy', 'name email role')
      .sort({ plantationDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single planting activity by ID
// @route   GET /api/activities/:id
// @access  Private
export const getActivityById = async (req, res, next) => {
  try {
    const activity = await PlantingActivity.findById(req.params.id)
      .populate('projectId', 'projectId name targetTrees category location')
      .populate('submittedBy', 'name email role')
      .populate('verifiedBy', 'name email role');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Planting activity record not found',
      });
    }

    res.json({
      success: true,
      activity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new planting activity with evidence
// @route   POST /api/activities
// @access  Admin & Project Manager
export const createActivity = async (req, res, next) => {
  try {
    const {
      projectId,
      plantationDate,
      treesPlanted,
      location,
      description,
      speciesList,
      evidencePhotoUrl,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Invalid project reference: Project not found',
      });
    }

    const treesCount = Number(treesPlanted);
    if (!treesCount || treesCount <= 0 || !Number.isInteger(treesCount)) {
      return res.status(400).json({
        success: false,
        message: 'Planted trees count must be a positive whole integer',
      });
    }

    // Generate unique Activity Code
    const count = await PlantingActivity.countDocuments({ projectId });
    const codeSuffix = String(count + 1).padStart(3, '0');
    const projectCodeShort = project.projectId.replace('PRJ-', '');
    const activityCode = `ACT-${projectCodeShort}-${codeSuffix}`;

    // Handle evidence photo: either from file upload (req.file) or passed URL
    let photoUrl = evidencePhotoUrl || '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Parse speciesList if passed as comma-separated string or array
    let parsedSpecies = [];
    if (Array.isArray(speciesList)) {
      parsedSpecies = speciesList;
    } else if (typeof speciesList === 'string' && speciesList.trim().length > 0) {
      parsedSpecies = speciesList.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const activity = await PlantingActivity.create({
      projectId,
      activityCode,
      plantationDate: plantationDate || new Date(),
      treesPlanted: treesCount,
      location: location || project.location,
      description: description || '',
      speciesList: parsedSpecies,
      evidencePhotoUrl: photoUrl,
      submittedBy: req.user._id,
      verificationStatus: 'Pending',
    });

    await logAudit({
      user: req.user,
      action: 'ACTIVITY_SUBMITTED',
      entityType: 'PlantingActivity',
      entityId: activity._id,
      recordTitle: `${activity.activityCode} (${treesCount} trees)`,
      newValue: activity.toObject(),
      reason: `Planting activity submitted by ${req.user.name}. Status: Pending Verification.`,
    });

    // Return activity and updated project stats
    const updatedStats = await calculateProjectStats(projectId);

    res.status(201).json({
      success: true,
      activity,
      projectStats: updatedStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify or Reject planting activity
// @route   PATCH /api/activities/:id/verify
// @access  Admin & Project Manager
export const verifyActivity = async (req, res, next) => {
  try {
    const { status, verificationNotes } = req.body;

    if (!['Verified', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "Verified", "Rejected", or "Pending"',
      });
    }

    const activity = await PlantingActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Planting activity not found',
      });
    }

    const previousStatus = activity.verificationStatus;
    const previousValue = activity.toObject();

    activity.verificationStatus = status;
    activity.verifiedBy = req.user._id;
    activity.verifiedAt = new Date();
    if (verificationNotes !== undefined) {
      activity.verificationNotes = verificationNotes;
    }

    const updatedActivity = await activity.save();
    await updatedActivity.populate('submittedBy', 'name email role');
    await updatedActivity.populate('verifiedBy', 'name email role');
    await updatedActivity.populate('projectId', 'projectId name targetTrees');

    // Record audit trail
    await logAudit({
      user: req.user,
      action: status === 'Verified' ? 'ACTIVITY_VERIFIED' : 'ACTIVITY_REJECTED',
      entityType: 'PlantingActivity',
      entityId: updatedActivity._id,
      recordTitle: `${updatedActivity.activityCode} (${updatedActivity.treesPlanted} trees)`,
      previousValue: { verificationStatus: previousStatus },
      newValue: {
        verificationStatus: status,
        verifiedBy: req.user.name,
        verificationNotes,
      },
      reason: `Status transition from [${previousStatus}] to [${status}]. Auditor note: ${verificationNotes || 'None'}`,
    });

    // Recalculate dependent project statistics
    const recalculatedStats = await calculateProjectStats(updatedActivity.projectId._id || updatedActivity.projectId);

    res.json({
      success: true,
      activity: updatedActivity,
      projectStats: recalculatedStats,
      message: `Activity ${updatedActivity.activityCode} successfully marked as ${status}. Project verified count is now ${recalculatedStats.verifiedTrees} trees (${recalculatedStats.completionPercentage}% of target).`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update planting activity details
// @route   PUT /api/activities/:id
// @access  Admin & Project Manager
export const updateActivity = async (req, res, next) => {
  try {
    const activity = await PlantingActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Planting activity not found',
      });
    }

    const previousValue = activity.toObject();
    const { treesPlanted, location, description, plantationDate, speciesList } = req.body;

    if (treesPlanted !== undefined) {
      const num = Number(treesPlanted);
      if (!num || num <= 0 || !Number.isInteger(num)) {
        return res.status(400).json({
          success: false,
          message: 'Trees planted must be a positive integer',
        });
      }
      activity.treesPlanted = num;
    }

    if (location !== undefined) activity.location = location;
    if (description !== undefined) activity.description = description;
    if (plantationDate !== undefined) activity.plantationDate = plantationDate;

    if (req.file) {
      activity.evidencePhotoUrl = `/uploads/${req.file.filename}`;
    }

    if (speciesList !== undefined) {
      activity.speciesList = Array.isArray(speciesList)
        ? speciesList
        : speciesList.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const updated = await activity.save();

    await logAudit({
      user: req.user,
      action: 'ACTIVITY_UPDATED',
      entityType: 'PlantingActivity',
      entityId: updated._id,
      recordTitle: updated.activityCode,
      previousValue,
      newValue: updated.toObject(),
      reason: `Activity modified by ${req.user.name}`,
    });

    const projectStats = await calculateProjectStats(updated.projectId);

    res.json({
      success: true,
      activity: updated,
      projectStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete planting activity
// @route   DELETE /api/activities/:id
// @access  Admin only
export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await PlantingActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    const projectId = activity.projectId;

    await logAudit({
      user: req.user,
      action: 'ACTIVITY_DELETED',
      entityType: 'PlantingActivity',
      entityId: activity._id,
      recordTitle: `${activity.activityCode} (${activity.treesPlanted} trees)`,
      previousValue: activity.toObject(),
      reason: `Activity deleted by Administrator ${req.user.name}`,
    });

    await activity.deleteOne();

    const recalculatedStats = await calculateProjectStats(projectId);

    res.json({
      success: true,
      message: 'Activity deleted successfully',
      projectStats: recalculatedStats,
    });
  } catch (error) {
    next(error);
  }
};
