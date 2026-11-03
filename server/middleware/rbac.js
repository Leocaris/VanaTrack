/**
 * Role-Based Access Control (RBAC) middleware
 * Admin: Full access across all resources, configuration & user management
 * Project Manager: Can create/edit projects, submit activities, record survival inspections, verify activities
 * Viewer: Read-only access to dashboards, reports, and geo maps
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: Role [${req.user.role}] is not authorized to perform this operation. Required: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

