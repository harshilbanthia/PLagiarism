import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { Analysis } from '../models/Analysis';
import { detectPlagiarism } from '../services/plagiarismService';
import { detectAIContent } from '../services/aiDetectionService';
import { analyzeWithOpenAI } from '../services/openaiService';
import { computeTextStats } from '../utils/textProcessor';
import * as redisClient from '../config/redis';

// ── POST /api/analysis/analyze ────────────────────────────────────────────────

export async function analyze(req: Request, res: Response): Promise<void> {
  const { text, title } = req.body as { text: string; title?: string };
  const userId = req.user?.userId;
  const start = Date.now();

  try {
    const cacheKey = `analysis:${Buffer.from(text.slice(0, 200)).toString('base64')}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    // Run all detection services in parallel
    const [plagiarismResult, aiResult] = await Promise.all([
      detectPlagiarism(text),
      detectAIContent(text),
    ]);

    const openaiAnalysis = await analyzeWithOpenAI(
      text,
      plagiarismResult.score,
      aiResult.score
    );

    const stats = computeTextStats(text) as {
      wordCount: number;
      sentenceCount: number;
      avgWordLength: number;
      avgSentenceLength: number;
    };

    const analysisDoc = await Analysis.create({
      userId: userId ? new Types.ObjectId(userId) : undefined,
      text,
      title: title || 'Untitled Analysis',
      plagiarismScore: plagiarismResult.score,
      aiDetectionScore: aiResult.score,
      aiDetectionLabel: aiResult.label,
      sources: plagiarismResult.sources,
      aiAnalysis: openaiAnalysis,
      mlAnalysis: {
        semanticSimilarity: plagiarismResult.score / 100,
        fingerprintMatch: plagiarismResult.score / 100,
        paraphraseScore: aiResult.score / 100,
        languageDetected: 'en',
      },
      status: 'completed',
      processingTime: Date.now() - start,
    });

    const payload = {
      id: analysisDoc._id,
      plagiarismScore: plagiarismResult.score,
      aiDetectionScore: aiResult.score,
      aiDetectionLabel: aiResult.label,
      sources: plagiarismResult.sources,
      aiAnalysis: openaiAnalysis,
      mlAnalysis: analysisDoc.mlAnalysis,
      patterns: aiResult.patterns,
      modelProbabilities: aiResult.modelProbabilities,
      textStats: stats,
      processingTime: analysisDoc.processingTime,
      status: 'completed',
      createdAt: analysisDoc.createdAt,
    };

    await redisClient.set(cacheKey, JSON.stringify(payload), 3600);

    res.status(200).json(payload);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed', message: (err as Error).message });
  }
}

// ── GET /api/analysis/history ─────────────────────────────────────────────────

export async function getHistory(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  try {
    const analyses = await Analysis.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-text')
      .lean();
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history', message: (err as Error).message });
  }
}

// ── GET /api/analysis/stats ───────────────────────────────────────────────────

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const userFilter = { userId: new Types.ObjectId(userId) };

  try {
    const [aggregate, recent] = await Promise.all([
      Analysis.aggregate([
        { $match: userFilter },
        {
          $group: {
            _id: null,
            totalAnalyses: { $sum: 1 },
            avgPlagiarismScore: { $avg: '$plagiarismScore' },
            avgAIScore: { $avg: '$aiDetectionScore' },
          },
        },
      ]),
      // Activity for last 7 days
      Analysis.aggregate([
        {
          $match: {
            ...userFilter,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const stats = aggregate[0] ?? { totalAnalyses: 0, avgPlagiarismScore: 0, avgAIScore: 0 };

    res.json({
      totalAnalyses: stats.totalAnalyses,
      avgPlagiarismScore: parseFloat((stats.avgPlagiarismScore ?? 0).toFixed(1)),
      avgAIScore: parseFloat((stats.avgAIScore ?? 0).toFixed(1)),
      activityLast7Days: recent.map((d: { _id: string; count: number }) => ({
        date: d._id,
        count: d.count,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', message: (err as Error).message });
  }
}

// ── GET /api/analysis/:id ─────────────────────────────────────────────────────

export async function getAnalysis(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid analysis ID' });
    return;
  }

  try {
    const cacheKey = `analysis:id:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.json({ ...JSON.parse(cached), cached: true });
      return;
    }

    const analysis = await Analysis.findById(id).lean();
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found' });
      return;
    }

    await redisClient.set(cacheKey, JSON.stringify(analysis), 3600);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analysis', message: (err as Error).message });
  }
}

// ── DELETE /api/analysis/:id ──────────────────────────────────────────────────

export async function deleteAnalysis(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const userId = req.user!.userId;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Invalid analysis ID' });
    return;
  }

  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found or access denied' });
      return;
    }

    await redisClient.del(`analysis:id:${id}`);
    res.json({ message: 'Analysis deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete analysis', message: (err as Error).message });
  }
}
