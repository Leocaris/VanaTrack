import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorizeRoles('admin', 'project_manager'), createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(authorizeRoles('admin', 'project_manager'), updateProject)
  .delete(authorizeRoles('admin'), deleteProject);

export default router;

