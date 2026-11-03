import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: 'system@vanatrack.org',
    },
    userRole: {
      type: String,
      default: 'system',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Project', 'PlantingActivity', 'SurvivalInspection', 'User', 'System'],
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    recordTitle: {
      type: String,
      default: '',
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    reason: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

