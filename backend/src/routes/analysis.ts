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

// ── Authenticated routes: rate limiter BEFORE auth (static paths before /:id) ─
router.get('/history', generalLimiter, authenticateToken, getHistory);
router.get('/stats', generalLimiter, authenticateToken, getDashboardStats);

// ── Param routes ──────────────────────────────────────────────────────────────
router.get('/:id', generalLimiter, getAnalysis);
router.delete('/:id', generalLimiter, authenticateToken, deleteAnalysis);

export default router;
