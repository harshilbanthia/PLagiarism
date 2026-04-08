import axios from 'axios'
import type { AnalysisResult, DashboardStats, HistoryItem } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'An error occurred'
    return Promise.reject(new Error(message))
  },
)

export async function analyzeText(
  text: string,
  options?: Record<string, unknown>,
): Promise<AnalysisResult> {
  const { data } = await api.post<AnalysisResult>('/analyze/text', { text, ...options })
  return data
}

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<AnalysisResult>('/analyze/file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getHistory(): Promise<HistoryItem[]> {
  const { data } = await api.get<HistoryItem[]>('/history')
  return data
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  const { data } = await api.get<AnalysisResult>(`/analysis/${id}`)
  return data
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/stats')
  return data
}

export async function deleteAnalysis(id: string): Promise<void> {
  await api.delete(`/analysis/${id}`)
}
