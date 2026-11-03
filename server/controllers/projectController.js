import Project from '../models/Project.js';
import { calculateProjectStats } from '../services/calculationService.js';
import { logAudit } from '../services/auditService.js';

// @desc    Get all projects with filtering, sorting, searching & real-time DB metrics
// @route   GET /api/projects
// @access  Private (Admin, Project Manager, Viewer)
export const getProjects = async (req, res, next) => {
  try {
    const { search, category, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { projectId: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sortBy;

    const projects = await Project.find(query)
      .populate('projectManager', 'name email role')
      .sort({ [sortField]: sortOrder });

    // Enhance each project with calculated real-time database stats
    const enhancedProjects = await Promise.all(
      projects.map(async (p) => {
        const stats = await calculateProjectStats(p._id);
        const pObj = p.toObject();
        return {
          ...pObj,
          stats: stats || {
            verifiedTrees: 0,
            pendingTrees: 0,
            rejectedTrees: 0,
            remainingTarget: p.targetTrees,
            completionPercentage: 0,
            survivalRate: null,
            totalActivities: 0,
          },
        };
      })
    );

    res.json({
      success: true,
      count: enhancedProjects.length,
      projects: enhancedProjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with full details & calculated metrics
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'projectManager',
      'name email role'
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const stats = await calculateProjectStats(project._id);

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Admin & Project Manager
export const createProject = async (req, res, next) => {
  try {
    const {
      projectId,
      name,
      description,
      category,
      location,
      latitude,
      longitude,
      startDate,
      endDate,
      targetTrees,
      projectManager,
      status,
    } = req.body;

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be prior to start date',
      });
    }

    // Validate target trees
    if (Number(targetTrees) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target trees must be a positive number greater than 0',
      });
    }

    const newProject = await Project.create({
      projectId: projectId.toUpperCase().trim(),
      name: name.trim(),
      description,
      category,
      location,
      latitude: Number(latitude),
      longitude: Number(longitude),
      startDate,
      endDate,
      targetTrees: Number(targetTrees),
      projectManager: projectManager || req.user._id,
      status: status || 'Active',
    });

    await logAudit({
      user: req.user,
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: newProject._id,
      recordTitle: newProject.name,
      newValue: newProject.toObject(),
      reason: `Project ${newProject.projectId} created by ${req.user.name}`,
    });

    const stats = await calculateProjectStats(newProject._id);

    res.status(201).json({
      success: true,
      project: {
        ...newProject.toObject(),
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin & Project Manager
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const previousValue = project.toObject();

    // Validate dates if updated
    const newStartDate = req.body.startDate || project.startDate;
    const newEndDate = req.body.endDate || project.endDate;
    if (new Date(newEndDate) < new Date(newStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Validate target trees if updated
    if (req.body.targetTrees && Number(req.body.targetTrees) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target trees must be greater than zero',
      });
    }

    // Update allowed fields
    const fieldsToUpdate = [
      'name',
      'description',
      'category',
      'location',
      'latitude',
      'longitude',
      'startDate',
      'endDate',
      'targetTrees',
      'projectManager',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    const updatedProject = await project.save();
    const stats = await calculateProjectStats(updatedProject._id);

    await logAudit({
      user: req.user,
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: updatedProject._id,
      recordTitle: updatedProject.name,
      previousValue,
      newValue: updatedProject.toObject(),
      reason: `Project details updated by ${req.user.name}`,
    });

    res.json({
      success: true,
      project: {
        ...updatedProject.toObject(),
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin only
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await logAudit({
      user: req.user,
      action: 'PROJECT_DELETED',
      entityType: 'Project',
      entityId: project._id,
      recordTitle: project.name,
      previousValue: project.toObject(),
      reason: `Project deleted by Administrator ${req.user.name}`,
    });

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

