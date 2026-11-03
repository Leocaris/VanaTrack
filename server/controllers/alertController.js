import { evaluateSmartAlerts } from '../services/alertService.js';

// @desc    Get dynamic rule-based alerts evaluated from database
// @route   GET /api/alerts
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await evaluateSmartAlerts();

    // Group alerts by severity
    const counts = {
      critical: alerts.filter((a) => a.severity === 'high').length,
      warning: alerts.filter((a) => a.severity === 'medium').length,
      info: alerts.filter((a) => a.severity === 'low').length,
      total: alerts.length,
    };

    res.json({
      success: true,
      counts,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};
