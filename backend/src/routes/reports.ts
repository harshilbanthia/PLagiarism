import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { authenticateToken } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import { Analysis } from '../models/Analysis';

const router = Router();

router.use(generalLimiter);
router.use(authenticateToken);

// ── GET /api/reports ──────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  try {
    const reports = await Analysis.find({
      userId: new Types.ObjectId(req.user!.userId),
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('_id title plagiarismScore aiDetectionScore status createdAt')
      .lean();

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', message: (err as Error).message });
  }
});

// ── GET /api/reports/:id ──────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid report ID' });
    return;
  }

  try {
    const report = await Analysis.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(req.user!.userId),
    }).lean();

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report', message: (err as Error).message });
  }
});

// ── POST /api/reports/:id/export ──────────────────────────────────────────────

router.post('/:id/export', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { format = 'pdf' } = req.body as { format?: string };

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid report ID' });
    return;
  }

  // PDF/CSV export is a placeholder – return a descriptive response
  res.json({
    message: `Export to ${format} queued`,
    reportId: id,
    format,
    status: 'pending',
    note: 'PDF/CSV export functionality requires a dedicated rendering service.',
  });
});

export default router;
