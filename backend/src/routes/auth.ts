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

const router = Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/settings', updateSettings);

export default router;
