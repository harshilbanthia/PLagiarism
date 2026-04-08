import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// ── Validation chains ─────────────────────────────────────────────────────────

export const validateAnalysis: ValidationChain[] = [
  body('text')
    .isString()
    .withMessage('text must be a string')
    .trim()
    .isLength({ min: 50 })
    .withMessage('text must be at least 50 characters')
    .isLength({ max: 50000 })
    .withMessage('text must not exceed 50 000 characters'),
  body('title')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('title must not exceed 200 characters'),
];

export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Error-handling middleware ──────────────────────────────────────────────────

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.type, message: e.msg })),
    });
    return;
  }
  next();
}
