import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

function signToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ userId, email }, secret, { expiresIn: '24h' });
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body as {
    email: string;
    password: string;
    name: string;
  };

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const user = await User.create({ email, password, name });
    const token = signToken(String(user._id), user.email);

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed', message: (err as Error).message });
  }
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = signToken(String(user._id), user.email);
    res.json({ token, user: user.toJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', message: (err as Error).message });
  }
}

// ── GET /api/auth/profile ─────────────────────────────────────────────────────

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', message: (err as Error).message });
  }
}

// ── PUT /api/auth/settings ────────────────────────────────────────────────────

export async function updateSettings(req: Request, res: Response): Promise<void> {
  const { openaiApiKey, huggingfaceApiKey, sensitivity } = req.body as {
    openaiApiKey?: string;
    huggingfaceApiKey?: string;
    sensitivity?: number;
  };

  try {
    const update: Record<string, unknown> = {};
    if (openaiApiKey !== undefined) update['settings.openaiApiKey'] = openaiApiKey;
    if (huggingfaceApiKey !== undefined) update['settings.huggingfaceApiKey'] = huggingfaceApiKey;
    if (sensitivity !== undefined) {
      const s = Number(sensitivity);
      if (s < 0 || s > 1) {
        res.status(400).json({ error: 'sensitivity must be between 0 and 1' });
        return;
      }
      update['settings.sensitivity'] = s;
    }

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Settings updated', user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', message: (err as Error).message });
  }
}
