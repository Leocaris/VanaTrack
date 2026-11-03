import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: [true, 'Project ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Agroforestry',
        'Mangrove Restoration',
        'Urban Greenery',
        'Afforestation',
        'Reforestation',
        'Biodiversity Corridor',
      ],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: 'End date must be greater than or equal to start date',
      },
    },
    targetTrees: {
      type: Number,
      required: [true, 'Target trees count is required'],
      min: [1, 'Target trees must be at least 1'],
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project Manager is required'],
    },
    status: {
      type: String,
      enum: ['Planned', 'Active', 'Completed', 'On Hold'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relationship to activities
projectSchema.virtual('activities', {
  ref: 'PlantingActivity',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual relationship to survival inspections
projectSchema.virtual('inspections', {
  ref: 'SurvivalInspection',
  localField: '_id',
  foreignField: 'projectId',
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
