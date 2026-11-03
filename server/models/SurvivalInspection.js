import mongoose from 'mongoose';

const survivalInspectionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantingActivity',
      default: null,
      index: true,
    },
    inspectionType: {
      type: String,
      enum: ['30-Day', '90-Day', '180-Day', 'Annual', 'Ad-Hoc'],
      required: [true, 'Inspection milestone type is required'],
    },
    inspectionDate: {
      type: Date,
      required: [true, 'Inspection date is required'],
    },
    treesInspected: {
      type: Number,
      required: [true, 'Inspected trees count is required'],
      min: [1, 'Must inspect at least 1 tree'],
      validate: {
        validator: Number.isInteger,
        message: 'Trees inspected must be an integer',
      },
    },
    treesSurviving: {
      type: Number,
      required: [true, 'Surviving trees count is required'],
      min: [0, 'Surviving trees cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Surviving trees must be an integer',
      },
    },
    treesDead: {
      type: Number,
      default: 0,
      min: [0, 'Dead trees count cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Dead trees must be an integer',
      },
    },
    survivalRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    healthCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
      default: 'Good',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Auditor reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

survivalInspectionSchema.pre('validate', function (next) {
  if (this.treesInspected != null && this.treesSurviving != null) {
    if (this.treesSurviving > this.treesInspected) {
      this.invalidate('treesSurviving', 'Surviving trees cannot exceed trees inspected');
    }
    // Auto calculate treesDead if omitted or keep consistent
    if (this.treesDead == null || this.treesDead === 0) {
      this.treesDead = this.treesInspected - this.treesSurviving;
    }
    // Calculate survival rate to 2 decimal places
    this.survivalRate = Number(((this.treesSurviving / this.treesInspected) * 100).toFixed(2));
  }
  next();
});

const SurvivalInspection = mongoose.model('SurvivalInspection', survivalInspectionSchema);
export default SurvivalInspection;

