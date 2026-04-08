import { ExternalLink } from 'lucide-react'
import type { AnalysisResult } from '../../types'

interface PlagiarismResultsProps {
  result: AnalysisResult
}

function CircleScore({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score < 20 ? '#22c55e' : score < 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#1f2937" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}%</span>
          <span className="text-xs text-gray-400">Plagiarism</span>
        </div>
      </div>
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
          score < 20
            ? 'badge-low'
            : score < 60
            ? 'badge-medium'
            : 'badge-high'
        }`}
      >
        {score < 20 ? 'Original' : score < 60 ? 'Partially Plagiarized' : 'Highly Plagiarized'}
      </span>
    </div>
  )
}

function SimilarityBar({ similarity }: { similarity: number }) {
  const color =
    similarity < 20 ? 'bg-green-500' : similarity < 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${similarity}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-10 text-right">{similarity}%</span>
    </div>
  )
}

export default function PlagiarismResults({ result }: PlagiarismResultsProps) {
  return (
    <div className="card flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Plagiarism Analysis</h2>
        <span className="text-xs text-gray-500">{result.sources.length} sources found</span>
      </div>

      {/* Score circle */}
      <div className="flex justify-center">
        <CircleScore score={result.plagiarismScore} />
      </div>

      {/* Source matches */}
      {result.sources.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">Source Matches</h3>
          {result.sources.map((src, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-700">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{src.title}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate mt-0.5"
                  >
                    <ExternalLink size={10} />
                    {src.url}
                  </a>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    src.similarity < 20
                      ? 'badge-low'
                      : src.similarity < 60
                      ? 'badge-medium'
                      : 'badge-high'
                  }`}
                >
                  {src.similarity}%
                </span>
              </div>
              <SimilarityBar similarity={src.similarity} />
              {src.matchedText && (
                <p className="text-xs text-gray-500 italic line-clamp-2">
                  "{src.matchedText}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          No matching sources found
        </div>
      )}
    </div>
  )
}
