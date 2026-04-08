import { Bot, User } from 'lucide-react'
import type { AnalysisResult } from '../../types'

interface AIDetectionResultsProps {
  result: AnalysisResult
}

const modelProbabilities = (score: number) => [
  { name: 'GPT-4 / GPT-4o', probability: Math.round(score * 0.4), color: 'from-green-500 to-emerald-500' },
  { name: 'Claude', probability: Math.round(score * 0.25), color: 'from-purple-500 to-violet-500' },
  { name: 'Generic AI', probability: Math.round(score * 0.35), color: 'from-cyan-500 to-blue-500' },
  { name: 'Human Written', probability: 100 - score, color: 'from-orange-500 to-amber-500' },
]

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function MainGauge({ score }: { score: number }) {
  const color =
    score < 30 ? '#22c55e' : score < 70 ? '#f59e0b' : '#ef4444'
  const label =
    score < 30 ? 'Likely Human' : score < 70 ? 'Mixed Content' : 'Likely AI'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Background arc (semi-circle) */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#1f2937"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 157} 157`}
            style={{
              transition: 'stroke-dasharray 0.8s ease',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-end justify-center pb-2">
          <div className="flex flex-col items-center">
            {score >= 50 ? (
              <Bot size={18} className="text-purple-400 mb-1" />
            ) : (
              <User size={18} className="text-green-400 mb-1" />
            )}
            <span className="text-2xl font-bold text-white">{score}%</span>
            <span className="text-xs text-gray-400">AI Score</span>
          </div>
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
          score < 30 ? 'badge-low' : score < 70 ? 'badge-medium' : 'badge-high'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export default function AIDetectionResults({ result }: AIDetectionResultsProps) {
  const models = modelProbabilities(result.aiDetectionScore)

  return (
    <div className="card flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">AI Detection</h2>
        <span
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
            result.aiDetectionScore < 30
              ? 'badge-low'
              : result.aiDetectionScore < 70
              ? 'badge-medium'
              : 'badge-high'
          }`}
        >
          {result.aiDetectionLabel}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center">
        <MainGauge score={result.aiDetectionScore} />
      </div>

      {/* Model probabilities */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400">Model Attribution</h3>
        {models.map(({ name, probability, color }) => (
          <div key={name} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">{name}</span>
              <span className="text-gray-400">{probability}%</span>
            </div>
            <ScoreBar value={probability} color={color} />
          </div>
        ))}
      </div>

      {/* Pattern analysis */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <p className="text-xs font-medium text-gray-400 mb-2">Pattern Analysis</p>
        <div className="flex flex-wrap gap-2">
          {['Repetitive structure', 'Formal tone', 'High perplexity', 'Consistent style'].map(
            (pattern) => (
              <span
                key={pattern}
                className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >
                {pattern}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
