import OpenAI from 'openai';

export interface OpenAIAnalysis {
  summary: string;
  keyFindings: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  contentType: string;
}

// ── Rule-based fallback ───────────────────────────────────────────────────────

function ruleBasedAnalysis(
  plagiarismScore: number,
  aiScore: number
): OpenAIAnalysis {
  const combinedRisk = (plagiarismScore + aiScore) / 2;
  const riskLevel: 'low' | 'medium' | 'high' =
    combinedRisk >= 60 ? 'high' : combinedRisk >= 30 ? 'medium' : 'low';

  const keyFindings: string[] = [];
  if (plagiarismScore > 50)
    keyFindings.push(`High plagiarism score of ${plagiarismScore.toFixed(1)}% detected`);
  else if (plagiarismScore > 20)
    keyFindings.push(`Moderate plagiarism indicators (${plagiarismScore.toFixed(1)}%)`);
  else keyFindings.push('Minimal plagiarism detected');

  if (aiScore > 60)
    keyFindings.push(`Content is likely AI-generated (${aiScore.toFixed(1)}% confidence)`);
  else if (aiScore > 35)
    keyFindings.push(`Mixed signals of AI authorship (${aiScore.toFixed(1)}%)`);
  else keyFindings.push('Content appears predominantly human-written');

  const recommendations: string[] = [];
  if (plagiarismScore > 40)
    recommendations.push('Add citations and quotation marks for borrowed content');
  if (aiScore > 50)
    recommendations.push('Revise to include personal voice, anecdotes, and perspective');
  if (riskLevel === 'high')
    recommendations.push('Consider significant rewriting before submission');
  if (recommendations.length === 0)
    recommendations.push('Content looks original – minor proofreading recommended');

  const contentType =
    aiScore > 60 ? 'AI-Generated Content' :
    aiScore > 35 ? 'Mixed (Human + AI)' :
    'Human-Written Content';

  const summary =
    `Analysis complete. Plagiarism score: ${plagiarismScore.toFixed(1)}%, ` +
    `AI detection score: ${aiScore.toFixed(1)}%. ` +
    `Overall risk level is ${riskLevel}.`;

  return { summary, keyFindings, riskLevel, recommendations, contentType };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function analyzeWithOpenAI(
  text: string,
  plagiarismScore: number,
  aiScore: number
): Promise<OpenAIAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.info('OPENAI_API_KEY not set – using rule-based analysis');
    return ruleBasedAnalysis(plagiarismScore, aiScore);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const userPrompt = `
Analyse the following text for plagiarism and AI-generated content indicators.

Text (first 1000 chars):
"""
${text.slice(0, 1000)}
"""

Detection scores already computed:
- Plagiarism score: ${plagiarismScore.toFixed(1)}%
- AI-generation probability: ${aiScore.toFixed(1)}%

Respond ONLY with valid JSON matching this exact schema:
{
  "summary": "<2-3 sentence overview>",
  "keyFindings": ["<finding 1>", "<finding 2>", "<finding 3>"],
  "riskLevel": "<low|medium|high>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "contentType": "<e.g. Academic Essay, News Article, AI-Generated Report>"
}
`.trim();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert plagiarism and AI content detection analyst. Respond only with the requested JSON.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as Partial<OpenAIAnalysis>;

    return {
      summary: parsed.summary ?? '',
      keyFindings: parsed.keyFindings ?? [],
      riskLevel: (['low', 'medium', 'high'] as const).includes(parsed.riskLevel as 'low' | 'medium' | 'high')
        ? (parsed.riskLevel as 'low' | 'medium' | 'high')
        : 'low',
      recommendations: parsed.recommendations ?? [],
      contentType: parsed.contentType ?? 'Unknown',
    };
  } catch (err) {
    console.warn('OpenAI call failed, falling back to rule-based analysis:', (err as Error).message);
    return ruleBasedAnalysis(plagiarismScore, aiScore);
  }
}
