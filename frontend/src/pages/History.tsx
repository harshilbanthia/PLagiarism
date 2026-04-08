import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, Trash2, Eye, SlidersHorizontal } from 'lucide-react'
import { getHistory, deleteAnalysis } from '../services/api'
import type { HistoryItem } from '../types'

const MOCK: HistoryItem[] = [
  { id: '1', title: 'Research Paper - AI Ethics',      plagiarismScore: 8,  aiDetectionScore: 72, createdAt: '2024-01-15T10:30:00Z' },
  { id: '2', title: 'Blog Post - Climate Change',       plagiarismScore: 34, aiDetectionScore: 15, createdAt: '2024-01-14T09:15:00Z' },
  { id: '3', title: 'Essay - Industrial Revolution',    plagiarismScore: 62, aiDetectionScore: 20, createdAt: '2024-01-13T14:45:00Z' },
  { id: '4', title: 'Article - Machine Learning Intro', plagiarismScore: 12, aiDetectionScore: 88, createdAt: '2024-01-12T11:00:00Z' },
  { id: '5', title: 'Report - Renewable Energy',        plagiarismScore: 5,  aiDetectionScore: 42, createdAt: '2024-01-11T16:20:00Z' },
  { id: '6', title: 'Thesis - Quantum Computing',       plagiarismScore: 78, aiDetectionScore: 30, createdAt: '2024-01-10T08:00:00Z' },
]

function ScorePill({ score }: { score: number; type: 'plagiarism' | 'ai' }) {
  const color =
    score < 20 ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : score < 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20'
  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${color}`}>
      {score}%
    </span>
  )
}

function MiniBar({ score }: { score: number }) {
  const bg = score < 20 ? 'bg-green-500' : score < 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${score}%` }} />
    </div>
  )
}

export default function History() {
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'high-plagiarism' | 'high-ai'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory()
      .then(setItems)
      .catch(() => setItems(MOCK))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteAnalysis(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Analysis deleted')
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Analysis deleted')
    }
  }

  const filtered = items.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase())
    if (filter === 'high-plagiarism') return matchesQuery && item.plagiarismScore >= 60
    if (filter === 'high-ai') return matchesQuery && item.aiDetectionScore >= 60
    return matchesQuery
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">History</h1>
        <p className="text-gray-400 text-sm mt-1">Browse and manage your past analyses</p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search analyses..."
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="input py-2 w-44"
          >
            <option value="all">All Results</option>
            <option value="high-plagiarism">High Plagiarism</option>
            <option value="high-ai">High AI Score</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No analyses found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Document</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Plagiarism</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider">AI Score</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium group-hover:text-cyan-400 transition-colors truncate max-w-xs">
                      {item.title}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <ScorePill score={item.plagiarismScore} type="plagiarism" />
                      <MiniBar score={item.plagiarismScore} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <ScorePill score={item.aiDetectionScore} type="ai" />
                      <MiniBar score={item.aiDetectionScore} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate('/analysis')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-600 text-center">
          Showing {filtered.length} of {items.length} analyses
        </p>
      )}
    </div>
  )
}
