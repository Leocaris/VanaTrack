import express from 'express';
import {
  login,
  getMe,
  getUsers,
  register,
  triggerSeed,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);
router.post('/register', protect, authorizeRoles('admin'), register);
router.post('/seed', triggerSeed);

export default router;

