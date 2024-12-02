import { useEffect, useState } from 'react'
import type { TestResult } from '../types'

export function useTestResults() {
  const [savedResults, setSavedResults] = useState<TestResult[]>([])
  const [recentModels, setRecentModels] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('modelTestResults')
    if (saved) {
      setSavedResults(JSON.parse(saved))
    }
    const recent = localStorage.getItem('recentModels')
    if (recent) {
      setRecentModels(JSON.parse(recent))
    }
  }, [])

  const saveResult = (result: TestResult) => {
    setSavedResults(prev => {
      const next = [...prev, result]
      localStorage.setItem('modelTestResults', JSON.stringify(next))
      return next
    })
  }

  const updateRecentModels = (modelId: string) => {
    setRecentModels(prev => {
      const next = [modelId, ...prev.filter(id => id !== modelId)].slice(0, 5)
      localStorage.setItem('recentModels', JSON.stringify(next))
      return next
    })
  }

  return {
    savedResults,
    setSavedResults,
    recentModels,
    saveResult,
    updateRecentModels
  }
} 