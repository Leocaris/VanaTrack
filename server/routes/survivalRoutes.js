import express from 'express';
import {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
} from '../controllers/survivalController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getInspections)
  .post(authorizeRoles('admin', 'project_manager'), createInspection);

router
  .route('/:id')
  .get(getInspectionById)
  .put(authorizeRoles('admin', 'project_manager'), updateInspection)
  .delete(authorizeRoles('admin'), deleteInspection);

export default router;

