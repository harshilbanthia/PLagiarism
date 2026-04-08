import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart2,
  AlertTriangle,
  Bot,
  Layers,
  ArrowRight,
} from 'lucide-react'
import StatsCard from '../components/Dashboard/StatsCard'
import ActivityChart from '../components/Dashboard/ActivityChart'
import type { DashboardStats, HistoryItem } from '../types'
import { getDashboardStats, getHistory } from '../services/api'

const MOCK_STATS: DashboardStats = {
  totalAnalyses: 128,
  avgPlagiarismScore: 18,
  avgAIScore: 34,
  recentActivity: [
    { date: 'Mon', analyses: 12, plagiarismDetected: 3, aiDetected: 5 },
    { date: 'Tue', analyses: 19, plagiarismDetected: 5, aiDetected: 8 },
    { date: 'Wed', analyses: 8,  plagiarismDetected: 2, aiDetected: 3 },
    { date: 'Thu', analyses: 24, plagiarismDetected: 7, aiDetected: 11 },
    { date: 'Fri', analyses: 17, plagiarismDetected: 4, aiDetected: 6 },
    { date: 'Sat', analyses: 22, plagiarismDetected: 6, aiDetected: 9 },
    { date: 'Sun', analyses: 26, plagiarismDetected: 8, aiDetected: 12 },
  ],
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', title: 'Research Paper - AI Ethics', plagiarismScore: 8,  aiDetectionScore: 72, createdAt: '2024-01-15T10:30:00Z' },
  { id: '2', title: 'Blog Post - Climate Change', plagiarismScore: 34, aiDetectionScore: 15, createdAt: '2024-01-14T09:15:00Z' },
  { id: '3', title: 'Essay - Industrial Revolution',plagiarismScore: 62, aiDetectionScore: 20, createdAt: '2024-01-13T14:45:00Z' },
  { id: '4', title: 'Article - Machine Learning',  plagiarismScore: 12, aiDetectionScore: 88, createdAt: '2024-01-12T11:00:00Z' },
]

function ScoreBadge({ score, type }: { score: number; type: 'plagiarism' | 'ai' }) {
  const color =
    score < 20 ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : score < 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20'

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${color}`}>
      {score}% {type === 'ai' ? 'AI' : 'Plag'}
    </span>
  )
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS)
  const [history, setHistory] = useState<HistoryItem[]>(MOCK_HISTORY)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => { /* use mock */ })
    getHistory()
      .then(setHistory)
      .catch(() => { /* use mock */ })
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's your analysis overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Total Analyses"
          value={stats.totalAnalyses}
          icon={<Layers size={20} />}
          change={12}
          changeLabel="vs last week"
          accent="cyan"
        />
        <StatsCard
          label="Avg Plagiarism Score"
          value={`${stats.avgPlagiarismScore}%`}
          icon={<AlertTriangle size={20} />}
          change={-5}
          changeLabel="vs last week"
          accent="yellow"
        />
        <StatsCard
          label="Avg AI Score"
          value={`${stats.avgAIScore}%`}
          icon={<Bot size={20} />}
          change={8}
          changeLabel="vs last week"
          accent="purple"
        />
        <StatsCard
          label="High Risk Docs"
          value={stats.recentActivity.reduce((a, p) => a + p.plagiarismDetected, 0)}
          icon={<BarChart2 size={20} />}
          change={-2}
          changeLabel="vs last week"
          accent="red"
        />
      </div>

      {/* Chart */}
      <ActivityChart data={stats.recentActivity} />

      {/* Recent analyses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent Analyses</h2>
          <Link
            to="/history"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Document</th>
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Plagiarism</th>
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium uppercase tracking-wider">AI Score</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 5).map((item) => (
                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <Link
                      to={`/history`}
                      className="text-white hover:text-cyan-400 transition-colors font-medium truncate max-w-xs block"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <ScoreBadge score={item.plagiarismScore} type="plagiarism" />
                  </td>
                  <td className="py-3 pr-4">
                    <ScoreBadge score={item.aiDetectionScore} type="ai" />
                  </td>
                  <td className="py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
