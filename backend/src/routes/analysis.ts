import { Router } from 'express';
import {
  analyze,
  getHistory,
  getAnalysis,
  deleteAnalysis,
  getDashboardStats,
} from '../controllers/analysisController';
import { authenticateToken } from '../middleware/auth';
import { validateAnalysis, handleValidationErrors } from '../middleware/validation';

const router = Router();

// ── Public routes (auth optional) ────────────────────────────────────────────
router.post('/analyze', validateAnalysis, handleValidationErrors, analyze);

// ── Authenticated routes (static paths must come before /:id) ────────────────
router.get('/history', authenticateToken, getHistory);
router.get('/stats', authenticateToken, getDashboardStats);

// ── Param routes ──────────────────────────────────────────────────────────────
router.get('/:id', getAnalysis);
router.delete('/:id', authenticateToken, deleteAnalysis);

export default router;
