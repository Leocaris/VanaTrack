import AuditLog from '../models/AuditLog.js';

// @desc    Get system audit log history with search & entity filters
// @route   GET /api/audit
// @access  Private
export const getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, action, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (entityType && entityType !== 'All') {
      query.entityType = entityType;
    }

    if (action && action !== 'All') {
      query.action = action;
    }

    if (search) {
      query.$or = [
        { recordTitle: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
      ];
    }

    const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
    const skip = (Math.max(1, Number(page)) - 1) * parsedLimit;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parsedLimit);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / parsedLimit),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

