import express from 'express';
import {
  getActivities,
  getActivityById,
  createActivity,
  verifyActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { uploadEvidence } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getActivities)
  .post(
    authorizeRoles('admin', 'project_manager'),
    uploadEvidence.single('evidencePhoto'),
    createActivity
  );

router
  .route('/:id')
  .get(getActivityById)
  .put(
    authorizeRoles('admin', 'project_manager'),
    uploadEvidence.single('evidencePhoto'),
    updateActivity
  )
  .delete(authorizeRoles('admin'), deleteActivity);

router.patch(
  '/:id/verify',
  authorizeRoles('admin', 'project_manager'),
  verifyActivity
);

export default router;
