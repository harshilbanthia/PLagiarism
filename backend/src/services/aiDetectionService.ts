import { callMLService, isMLServiceAvailable } from './mlService';
import { splitIntoSentences, computeTextStats } from '../utils/textProcessor';

export interface AIDetectionResult {
  score: number;
  label: 'Human Written' | 'AI Generated' | 'Likely AI Generated';
  modelProbabilities: {
    gpt4: number;
    claude: number;
    genericAI: number;
    human: number;
  };
  patterns: string[];
}

// ── Heuristic AI-pattern analysis ────────────────────────────────────────────

function analyzeAIPatterns(text: string): { score: number; patterns: string[] } {
  const patterns: string[] = [];
  const sentences = splitIntoSentences(text);
  const stats = computeTextStats(text) as {
    wordCount: number;
    sentenceCount: number;
    avgWordLength: number;
    avgSentenceLength: number;
  };

  // 1. Very uniform sentence lengths → AI indicator
  if (sentences.length > 4) {
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
    if (variance < 8) patterns.push('Unusually uniform sentence lengths');
  }

  // 2. Formal / polished vocabulary markers
  const formalMarkers =
    /\b(furthermore|moreover|consequently|therefore|nevertheless|notwithstanding|heretofore|therein|hereby)\b/gi;
  const formalMatches = (text.match(formalMarkers) || []).length;
  if (formalMatches >= 3) patterns.push('High density of formal transition words');

  // 3. First-person avoidance
  const firstPerson = /\b(I|I'm|I've|I'll|my|mine|myself)\b/g;
  const fpCount = (text.match(firstPerson) || []).length;
  const wordCount = stats.wordCount || 1;
  if (fpCount / wordCount < 0.005 && wordCount > 100)
    patterns.push('Low first-person pronoun usage');

  // 4. Repetitive paragraph openers (common in GPT output)
  const openers = sentences
    .map((s) => s.trim().split(/\s+/)[0]?.toLowerCase())
    .filter(Boolean);
  const openerFreq: Record<string, number> = {};
  openers.forEach((w) => (openerFreq[w] = (openerFreq[w] || 0) + 1));
  const maxFreq = Math.max(...Object.values(openerFreq));
  if (maxFreq / sentences.length > 0.25) patterns.push('Repetitive sentence starters');

  // 5. Avg sentence length in typical GPT range (18-25 words)
  if (stats.avgSentenceLength > 17 && stats.avgSentenceLength < 26)
    patterns.push('Average sentence length typical of AI writing');

  // 6. Very high avg word length (formal vocabulary)
  if (stats.avgWordLength > 5.5) patterns.push('Elevated average word length');

  // Compute heuristic score
  const base = patterns.length * 14 + (formalMatches * 3);
  const score = Math.min(Math.round(base + (wordCount > 300 ? 5 : 0)), 100);

  return { score, patterns };
}

function buildModelProbabilities(score: number): AIDetectionResult['modelProbabilities'] {
  const aiShare = score / 100;
  const humanShare = 1 - aiShare;

  return {
    gpt4: parseFloat((aiShare * 0.45).toFixed(2)),
    claude: parseFloat((aiShare * 0.30).toFixed(2)),
    genericAI: parseFloat((aiShare * 0.25).toFixed(2)),
    human: parseFloat(humanShare.toFixed(2)),
  };
}

function scoreToLabel(score: number): AIDetectionResult['label'] {
  if (score >= 70) return 'AI Generated';
  if (score >= 40) return 'Likely AI Generated';
  return 'Human Written';
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function detectAIContent(text: string): Promise<AIDetectionResult> {
  const mlAvailable = await isMLServiceAvailable();

  if (mlAvailable) {
    try {
      const result = await callMLService('/detect/ai-content', { text });
      const score = Number(result.score ?? 0);
      return {
        score,
        label: scoreToLabel(score),
        modelProbabilities:
          (result.modelProbabilities as AIDetectionResult['modelProbabilities']) ??
          buildModelProbabilities(score),
        patterns: Array.isArray(result.patterns) ? result.patterns : [],
      };
    } catch (err) {
      console.warn('ML AI-detection call failed, using fallback:', (err as Error).message);
    }
  }

  const { score, patterns } = analyzeAIPatterns(text);
  return {
    score,
    label: scoreToLabel(score),
    modelProbabilities: buildModelProbabilities(score),
    patterns,
  };
}
