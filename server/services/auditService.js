import AuditLog from '../models/AuditLog.js';

/**
 * Record an audit trail entry.
 * Never throws an error that crashes the calling business logic,
 * but logs reliably to the AuditLog collection.
 */
export const logAudit = async ({
  user,
  action,
  entityType,
  entityId,
  recordTitle = '',
  previousValue = null,
  newValue = null,
  changes = null,
  reason = '',
}) => {
  try {
    const auditEntry = new AuditLog({
      userId: user?._id || user?.id || null,
      userEmail: user?.email || 'system@vanatrack.org',
      userRole: user?.role || 'system',
      action,
      entityType,
      entityId: String(entityId),
      recordTitle,
      previousValue,
      newValue,
      changes,
      reason,
      timestamp: new Date(),
    });

    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('⚠️ Failed to record audit log:', error.message);
    return null;
  }
};
