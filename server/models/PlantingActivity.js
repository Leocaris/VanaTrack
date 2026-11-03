import mongoose from 'mongoose';

const plantingActivitySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    activityCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    plantationDate: {
      type: Date,
      required: [true, 'Plantation date is required'],
      validate: {
        validator: function (value) {
          // Date cannot be in far future (allow up to today + 1 day for timezone drift)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return value <= tomorrow;
        },
        message: 'Plantation date cannot be in the future',
      },
    },
    treesPlanted: {
      type: Number,
      required: [true, 'Number of trees planted is required'],
      min: [1, 'Number of trees planted must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Number of trees planted must be an integer',
      },
    },
    location: {
      type: String,
      required: [true, 'Plantation site location is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    speciesList: {
      type: [String],
      default: [],
    },
    evidencePhotoUrl: {
      type: String,
      default: '',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitter user reference is required'],
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

plantingActivitySchema.index({ projectId: 1, verificationStatus: 1 });

const PlantingActivity = mongoose.model('PlantingActivity', plantingActivitySchema);
export default PlantingActivity;
