import { useEffect, useState } from 'react'
import type { TestResult } from '../types'

// Helper to migrate old format to new format
const migrateResult = (result: any): TestResult => {
  if (result.config) {
    // Remove useSudoPrompt if it exists in the config
    const { useSudoPrompt, ...config } = result.config
    return {
      ...result,
      config
    }
  }

  // Convert old format to new format
  return {
    ...result,
    config: {
      modelId: result.modelId,
      useHints: false, // Default values for new fields
      strategy: 'default',
      selectedTests: []
    }
  }
}

export function useTestResults() {
  const [savedResults, setSavedResults] = useState<TestResult[]>([])
  const [recentModels, setRecentModels] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('modelTestResults')
    if (saved) {
      // Migrate old results to new format
      const migrated = JSON.parse(saved).map(migrateResult)
      setSavedResults(migrated)
      // Update localStorage with migrated format
      localStorage.setItem('modelTestResults', JSON.stringify(migrated))
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