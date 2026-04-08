import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateSettings,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middleware/validation';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);

// Rate limiter applied before auth for authenticated routes
router.get('/profile', generalLimiter, authenticateToken, getProfile);
router.put('/settings', generalLimiter, authenticateToken, updateSettings);

export default router;
