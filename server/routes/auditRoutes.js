import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAuditLogs);

export default router;
