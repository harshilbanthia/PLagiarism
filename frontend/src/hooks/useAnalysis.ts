import { useState, useCallback } from 'react'
import type { AnalysisResult } from '../types'
import { analyzeText as apiAnalyzeText, analyzeFile as apiAnalyzeFile } from '../services/api'

interface UseAnalysisState {
  result: AnalysisResult | null
  loading: boolean
  error: string | null
}

interface UseAnalysisReturn extends UseAnalysisState {
  analyze: (text: string) => Promise<void>
  analyzeFile: (file: File) => Promise<void>
  clearResult: () => void
  clearError: () => void
}

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    result: null,
    loading: false,
    error: null,
  })

  const analyze = useCallback(async (text: string) => {
    setState({ result: null, loading: true, error: null })
    try {
      const result = await apiAnalyzeText(text)
      setState({ result, loading: false, error: null })
    } catch (err) {
      setState({
        result: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Analysis failed',
      })
    }
  }, [])

  const analyzeFile = useCallback(async (file: File) => {
    setState({ result: null, loading: true, error: null })
    try {
      const result = await apiAnalyzeFile(file)
      setState({ result, loading: false, error: null })
    } catch (err) {
      setState({
        result: null,
        loading: false,
        error: err instanceof Error ? err.message : 'File analysis failed',
      })
    }
  }, [])

  const clearResult = useCallback(() => {
    setState((s) => ({ ...s, result: null }))
  }, [])

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return { ...state, analyze, analyzeFile, clearResult, clearError }
}
