import crypto from 'crypto';

// ── normalizeText ─────────────────────────────────────────────────────────────

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── splitIntoSentences ────────────────────────────────────────────────────────

export function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ── extractKeyPhrases ─────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'at', 'to', 'for', 'of', 'and',
  'or', 'but', 'not', 'with', 'as', 'by', 'from', 'this', 'that', 'was', 'are',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'can', 'its', 'into', 'than',
  'then', 'so', 'if', 'about', 'up', 'out', 'also', 'more', 'other', 'their',
  'they', 'which', 'who', 'when', 'where', 'what', 'how', 'all', 'each', 'were',
]);

export function extractKeyPhrases(text: string): string[] {
  const words = normalizeText(text).split(/\s+/);

  // Count word frequencies excluding stop words
  const freq: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 3 && !STOP_WORDS.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  // Extract bigrams from original (case-preserved) sentences
  const sentences = splitIntoSentences(text);
  const phrases: string[] = [];
  for (const sentence of sentences.slice(0, 20)) {
    const sentWords = sentence
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()));

    for (let i = 0; i < sentWords.length - 1; i++) {
      if (
        freq[sentWords[i].toLowerCase()] > 1 ||
        freq[sentWords[i + 1].toLowerCase()] > 1
      ) {
        phrases.push(`${sentWords[i]} ${sentWords[i + 1]}`);
      }
    }
  }

  // Fall back to top single keywords if no bigrams found
  if (phrases.length === 0) {
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w);
  }

  // Deduplicate and return top phrases
  return [...new Set(phrases)].slice(0, 10);
}

// ── computeFingerprint ────────────────────────────────────────────────────────

export function computeFingerprint(text: string): string {
  return crypto
    .createHash('sha256')
    .update(normalizeText(text))
    .digest('hex');
}

// ── computeTextStats ──────────────────────────────────────────────────────────

export function computeTextStats(text: string): {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgWordLength: number;
  avgSentenceLength: number;
  charCount: number;
  uniqueWordRatio: number;
} {
  const sentences = splitIntoSentences(text);
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const avgWordLength =
    words.length > 0
      ? words.reduce((sum, w) => sum + w.length, 0) / words.length
      : 0;

  const avgSentenceLength =
    sentences.length > 0 ? words.length / sentences.length : 0;

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const uniqueWordRatio = words.length > 0 ? uniqueWords.size / words.length : 0;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgWordLength: parseFloat(avgWordLength.toFixed(2)),
    avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
    charCount: text.length,
    uniqueWordRatio: parseFloat(uniqueWordRatio.toFixed(3)),
  };
}
