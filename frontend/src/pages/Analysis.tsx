import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Download,
  Save,
  RefreshCw,
  AlertCircle,
  Loader2,
  Bot,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useAnalysis } from '../hooks/useAnalysis'
import UploadZone from '../components/Upload/UploadZone'
import PlagiarismResults from '../components/Results/PlagiarismResults'
import AIDetectionResults from '../components/Results/AIDetectionResults'
import SimilarityChart from '../components/Results/SimilarityChart'
import type { AnalysisResult } from '../types'

const DEMO_RESULT: AnalysisResult = {
  id: 'demo',
  text: 'Sample analyzed text',
  plagiarismScore: 34,
  aiDetectionScore: 72,
  aiDetectionLabel: 'Likely AI Generated',
  sources: [
    {
      url: 'https://example.com/article1',
      title: 'Sample Article on AI Ethics',
      similarity: 34,
      matchedText: 'Artificial intelligence raises profound ethical questions about...',
    },
    {
      url: 'https://example.org/paper2',
      title: 'Machine Learning Overview',
      similarity: 18,
      matchedText: 'Machine learning algorithms can be broadly categorized...',
    },
  ],
  aiAnalysis: {
    summary:
      'This content shows strong indicators of AI generation with 72% confidence. The text exhibits consistent formal tone, uniform sentence structure, and patterns typical of large language models.',
    keyFindings: [
      'High perplexity score consistent with AI generation',
      'Repetitive grammatical patterns detected',
      'Unusual consistency in paragraph length',
      'Low burstiness — typical of AI-generated text',
    ],
    riskLevel: 'high',
    recommendations: [
      'Verify authorship with the original author',
      'Request additional human-specific context or perspective',
      'Use multiple detection methods for confirmation',
    ],
    contentType: 'Academic Essay',
  },
  createdAt: new Date().toISOString(),
}

const riskColors: Record<string, string> = {
  low: 'text-green-400 bg-green-500/10 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
}

const riskIcons: Record<string, React.ReactNode> = {
  low: <CheckCircle size={16} className="text-green-400" />,
  medium: <AlertTriangle size={16} className="text-yellow-400" />,
  high: <AlertCircle size={16} className="text-red-400" />,
}

export default function Analysis() {
  const { result, loading, error, analyze, analyzeFile, clearResult } = useAnalysis()
  const [useDemo, setUseDemo] = useState(false)

  const displayResult = useDemo ? DEMO_RESULT : result

  const handleExport = () => {
    if (!displayResult) return
    const blob = new Blob([JSON.stringify(displayResult, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-${displayResult.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Results exported!')
  }

  const handleSave = () => {
    toast.success('Results saved to history!')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Analysis</h1>
          <p className="text-gray-400 text-sm mt-1">Detect plagiarism and AI-generated content</p>
        </div>
        <button
          onClick={() => { setUseDemo(true); clearResult() }}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <Bot size={14} />
          Load Demo
        </button>
      </div>

      {/* Upload zone */}
      <UploadZone
        onSubmitText={async (text) => {
          setUseDemo(false)
          await analyze(text)
        }}
        onSubmitFile={async (file) => {
          setUseDemo(false)
          await analyzeFile(file)
        }}
        loading={loading}
      />

      {/* Loading state */}
      {loading && (
        <div className="card flex flex-col items-center gap-4 py-12">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20" />
            <Loader2 size={40} className="absolute inset-0 m-auto text-cyan-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">AI is analyzing your content...</p>
            <p className="text-gray-500 text-sm mt-1">
              Checking plagiarism sources and AI patterns
            </p>
          </div>
          <div className="flex gap-1 loading-dots">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="card border-red-500/30 bg-red-500/5 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Analysis failed</p>
            <p className="text-red-400/70 text-sm">{error}</p>
          </div>
          <button onClick={clearResult} className="ml-auto btn-secondary text-xs">
            <RefreshCw size={12} />
          </button>
        </div>
      )}

      {/* Results */}
      {displayResult && !loading && (
        <div className="space-y-6">
          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-secondary text-xs flex items-center gap-1.5">
                <Save size={13} />
                Save
              </button>
              <button onClick={handleExport} className="btn-secondary text-xs flex items-center gap-1.5">
                <Download size={13} />
                Export
              </button>
              <button
                onClick={() => { setUseDemo(false); clearResult() }}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                New Analysis
              </button>
            </div>
          </div>

          {/* Side-by-side results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlagiarismResults result={displayResult} />
            <AIDetectionResults result={displayResult} />
          </div>

          {/* AI Analysis Summary */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">AI Analysis Summary</h2>
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  riskColors[displayResult.aiAnalysis.riskLevel]
                }`}
              >
                {riskIcons[displayResult.aiAnalysis.riskLevel]}
                {displayResult.aiAnalysis.riskLevel.toUpperCase()} RISK
              </span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              {displayResult.aiAnalysis.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key findings */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-medium text-white mb-3">Key Findings</h3>
                <ul className="space-y-2">
                  {displayResult.aiAnalysis.keyFindings.map((finding, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-medium text-white mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {displayResult.aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                Content type: {displayResult.aiAnalysis.contentType}
              </span>
            </div>
          </div>

          {/* Similarity chart */}
          <SimilarityChart result={displayResult} />
        </div>
      )}
    </div>
  )
}
