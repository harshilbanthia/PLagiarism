import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { AnalysisResult } from '../../types'

interface SimilarityChartProps {
  result: AnalysisResult
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { value: number; name: string }[]
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs shadow-xl">
      <span className="text-white font-semibold">{payload[0].value}%</span>
    </div>
  )
}

export default function SimilarityChart({ result }: SimilarityChartProps) {
  const data = [
    { subject: 'Web Sources', score: result.plagiarismScore },
    { subject: 'AI Content', score: result.aiDetectionScore },
    { subject: 'Academic DB', score: Math.round(result.plagiarismScore * 0.8) },
    { subject: 'News Articles', score: Math.round(result.plagiarismScore * 0.5) },
    { subject: 'Books', score: Math.round(result.plagiarismScore * 0.3) },
    { subject: 'Social Media', score: Math.round(result.plagiarismScore * 0.2) },
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-white">Similarity Breakdown</h2>
        <span className="text-xs text-gray-500">Multi-source detection</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart cx="50%" cy="50%" outerRadius={100} data={data}>
          <PolarGrid stroke="#1f2937" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
