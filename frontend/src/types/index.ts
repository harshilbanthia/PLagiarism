export interface AnalysisResult {
  id: string
  text: string
  plagiarismScore: number
  aiDetectionScore: number
  aiDetectionLabel: string
  sources: SourceMatch[]
  aiAnalysis: AIAnalysis
  createdAt: string
}

export interface SourceMatch {
  url: string
  title: string
  similarity: number
  matchedText: string
}

export interface AIAnalysis {
  summary: string
  keyFindings: string[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
  contentType: string
}

export interface HistoryItem {
  id: string
  title: string
  plagiarismScore: number
  aiDetectionScore: number
  createdAt: string
}

export interface DashboardStats {
  totalAnalyses: number
  avgPlagiarismScore: number
  avgAIScore: number
  recentActivity: ActivityPoint[]
}

export interface ActivityPoint {
  date: string
  analyses: number
  plagiarismDetected: number
  aiDetected: number
}
