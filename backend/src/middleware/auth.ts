import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Augment Express request so controllers can access req.user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    // Ensure the embedded userId is a valid ObjectId string
    if (!Types.ObjectId.isValid(payload.userId)) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token has expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

export default authenticateToken;
