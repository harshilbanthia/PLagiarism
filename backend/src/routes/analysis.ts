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
import { analysisLimiter, generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// ── Public routes (auth optional) ────────────────────────────────────────────
router.post('/analyze', analysisLimiter, validateAnalysis, handleValidationErrors, analyze);

// ── Authenticated routes (static paths must come before /:id) ────────────────
router.get('/history', authenticateToken, generalLimiter, getHistory);
router.get('/stats', authenticateToken, generalLimiter, getDashboardStats);

// ── Param routes ──────────────────────────────────────────────────────────────
router.get('/:id', generalLimiter, getAnalysis);
router.delete('/:id', authenticateToken, generalLimiter, deleteAnalysis);

export default router;
