'use client'

import React, { useState, useEffect } from 'react'
import { stream } from '@/utils/xmllm'
import type { ModelPreference, HintType } from 'xmllm'
import { useTheme } from '../theme-provider'
import { useTestResults } from './hooks/useTestResults'
import { MODEL_CONFIGS } from '@/config/model-testing/models'
import { TestCase, TEST_CASES } from '@/config/model-testing/test-cases'
import type { TestResult, ModelTestConfig } from './types'
import { X, RotateCw, Plus } from 'lucide-react'
import PQueue from 'p-queue'
import { ConfigItem } from './components/ConfigItem'
import { TestTableResults } from './components/TestTableResults'
import { CompareStrategiesDialog } from './components/CompareStrategiesDialog'

// Define the default enabled models
const DEFAULT_ENABLED_MODELS = ['qwen-7b-turbo', 'ministral-8b']

// Add XMLLM strategies type
type XMLLMStrategy = {
  id: 'default' | 'minimal' | 'structured' | 'assertive' | 'exemplar';
  name: string;
  description: string;
}

// Define available strategies
const XMLLM_STRATEGIES: XMLLMStrategy[] = [
  {
    id: 'default',
    name: 'Default XMLLM',
    description: 'Original balanced strategy as previously defined'
  },
  {
    id: 'minimal',
    name: 'Minimal XML Guide',
    description: 'Bare minimum instructions focusing on XML output requirements'
  },
  {
    id: 'structured',
    name: 'Structured with Grammar Examples',
    description: 'Includes concrete examples to guide the model'
  },
  {
    id: 'assertive',
    name: 'Assertive Compliance',
    description: 'More forceful instructions emphasizing strict compliance'
  },
  {
    id: 'exemplar',
    name: 'Example-Driven Guidance',
    description: 'Shows a small example to help the model understand the schema before the real request'
  }
];

const MAX_CONCURRENT_TESTS = 3

// Add helper to generate all strategy combinations
const generateStrategyComparisons = (modelId: string) => {
  const strategies = XMLLM_STRATEGIES.map(s => s.id)
  return [
    // Base strategies without hints
    ...strategies.map(strategy => ({
      modelId,
      useHints: false,
      strategy
    })),
    // Strategies with hints
    ...strategies.map(strategy => ({
      modelId,
      useHints: true,
      strategy
    }))
  ]
}

// Add these constants near the top of the file
const RATE_LIMIT = 30 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute in milliseconds

// Add this helper function after the existing helper functions
const checkRateLimit = () => {
  const now = Date.now()
  const requests = JSON.parse(localStorage.getItem('xmllm_requests') || '[]') as number[]
  
  // Filter to only include requests from the last minute
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_WINDOW)
  
  // Save filtered list back to localStorage
  localStorage.setItem('xmllm_requests', JSON.stringify(recentRequests))
  
  return recentRequests.length < RATE_LIMIT
}

// Add this helper to record a new request
const recordRequest = () => {
  const now = Date.now()
  const requests = JSON.parse(localStorage.getItem('xmllm_requests') || '[]') as number[]
  requests.push(now)
  localStorage.setItem('xmllm_requests', JSON.stringify(requests))
}

export default function ModelTesting() {

  // Add state for showing selector
  const [showingTestSelector, setShowingTestSelector] = useState<number | null>(null)
  const { theme } = useTheme()
  const [results, setResults] = useState<TestResult[]>([])
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set())
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set())
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [collapsedConfigs, setCollapsedConfigs] = useState<Set<number>>(new Set())
  const [activeConfigs, setActiveConfigs] = useState<ModelTestConfig[]>([
    {
      modelId: 'qwen-7b-turbo',
      useHints: false,
      strategy: 'default'
    },
    {
      modelId: 'ministral-8b',
      useHints: false,
      strategy: 'default'
    }
  ])

  const { 
    savedResults, 
    setSavedResults, 
    recentModels, 
    saveResult, 
    updateRecentModels 
  } = useTestResults()

  const toggleExpand = (boxId: string) => {
    setExpandedBoxes(prev => {
      const next = new Set(prev)
      if (next.has(boxId)) {
        next.delete(boxId)
      } else {
        next.add(boxId)
      }
      return next
    })
  }

  const addConfig = () => {
    setActiveConfigs(prev => {
      const lastConfig = prev[prev.length - 1]
      return [...prev, {
        ...(lastConfig ? { ...lastConfig } : {
          modelId: DEFAULT_ENABLED_MODELS[0],
          useHints: false,
          strategy: 'default'
        })
      }]
    })
  }

  async function runTest(testCase: TestCase, testConfig: ModelTestConfig, forceRun: boolean = false) {
    // Check rate limit first
    if (!checkRateLimit()) {
      const errorResult = {
        config: testConfig,
        testId: testCase.id,
        rawXml: '',
        parsedJson: null,
        success: false,
        error: 'Rate limit exceeded: Maximum 30 requests per minute',
        timestamp: Date.now(),
        timing: {
          start: Date.now(),
          end: Date.now()
        }
      }
      setResults(prev => [...prev, errorResult])
      saveResult(errorResult)
      setRateLimitError('Rate limit exceeded: Please wait a minute before making more requests')
      return
    }

    const modelConfig = MODEL_CONFIGS.find(m => m.id === testConfig.modelId)!
    const testKey = `${JSON.stringify(testConfig)}-${testCase.id}`
    setRunningTests(prev => new Set(prev).add(testKey))
    setConnectionError(null)
    setRateLimitError(null)
    
    const startTime = Date.now()
    let rawXml = ''

    try {
      // Record the request
      recordRequest()
      
      console.log('Starting test:', { testCase, testConfig })
      
      const schema = eval(`(${testCase.schema})`)
      console.log('Parsed schema:', schema)

      const initialResult = {
        config: testConfig,
        testId: testCase.id,
        rawXml: '',
        parsedJson: null,
        success: 'ongoing' as const,
        timestamp: Date.now(),
        timing: {
          start: startTime,
          end: 0
        }
      }
      setResults(prev => [...prev, initialResult])

      let streamConfig = {
        prompt: testCase.prompt,
        system: testCase.system,
        max_tokens: 1200,
        schema,
        // cache: !forceRun,
        cache: true,
        model: modelConfig.config as ModelPreference,
        hints: testConfig.useHints ? eval(`(${testCase.hints})` as any) as HintType : undefined,
        strategy: testConfig.strategy,
        onChunk: (chunk: string) => {
          rawXml += chunk
          setResults(prev => prev.map(r => 
            JSON.stringify(r.config) === JSON.stringify(testConfig) && r.testId === testCase.id
              ? { ...r, rawXml }
              : r
          ))
        }
      };

      console.log('Creating stream with config:', streamConfig)
      const theStream = stream(streamConfig)

      const result = await theStream.last()
      console.log('Stream completed with result:', result)

      const success = testCase.validate ? testCase.validate(result) : true

      const finalResult = {
        config: testConfig,
        testId: testCase.id,
        rawXml,
        parsedJson: result,
        success,
        timestamp: Date.now(),
        timing: {
          start: startTime,
          end: Date.now()
        }
      }

      setResults(prev => prev.map(r => 
        JSON.stringify(r.config) === JSON.stringify(testConfig) && r.testId === testCase.id
          ? finalResult
          : r
      ))
      saveResult(finalResult)
      updateRecentModels(testConfig.modelId)

    } catch (error) {
      console.error('Test error:', error)
      const errorResult = {
        config: testConfig,
        testId: testCase.id,
        rawXml,
        parsedJson: null,
        success: false,
        error: error instanceof Error 
          ? `${error.name}: ${error.message}` 
          : 'Unknown error',
        timestamp: Date.now(),
        timing: {
          start: startTime,
          end: Date.now()
        }
      }
      setResults(prev => prev.map(r => 
        JSON.stringify(r.config) === JSON.stringify(testConfig) && r.testId === testCase.id
          ? errorResult
          : r
      ))
      saveResult(errorResult)
    } finally {
      setRunningTests(prev => {
        const next = new Set(prev)
        next.delete(testKey)
        return next
      })
    }
  }

  async function runAllTests() {
    setIsRunning(true)
    setResults([])

    const queue = new PQueue({ concurrency: MAX_CONCURRENT_TESTS })

    try {
      const testPromises = activeConfigs.flatMap(config => 
        // Run all test cases for each config
        TEST_CASES.map(testCase => 
          queue.add(() => runTest(testCase, config))
        )
      )

      await Promise.all(testPromises)
    } finally {
      setIsRunning(false)
    }
  }

  const clearModelResults = (modelId: string) => {
    // Clear results from state
    setResults(prev => prev.filter(r => r.config?.modelId !== modelId))
    // Clear from localStorage
    setSavedResults(prev => prev.filter(r => r.config?.modelId !== modelId))
  }

  const runModelTests = async (modelId: string, configToRun: ModelTestConfig) => {
    // Clear only this config's results
    setResults(prev => prev.filter(r => 
      JSON.stringify(r.config) !== JSON.stringify(configToRun)
    ))
    setSavedResults(prev => prev.filter(r => 
      JSON.stringify(r.config) !== JSON.stringify(configToRun)
    ))
    
    const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId)
    if (!modelConfig) return
    
    const queue = new PQueue({ concurrency: MAX_CONCURRENT_TESTS })

    const testPromises = TEST_CASES.map(testCase => 
      queue.add(() => runTest(testCase, configToRun, true))
    )

    await Promise.all(testPromises)
  }

  // Add toggle function
  const toggleConfigCollapse = (index: number) => {
    setCollapsedConfigs(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // First, add a new state to track any open popup
  const [openPopup, setOpenPopup] = useState<{type: 'strategy' | 'tests', index: number} | null>(null)

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openPopup && !(event.target as Element).closest('.popup-content')) {
        setOpenPopup(null)
        setShowingTestSelector(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openPopup])

  const handleConfigUpdate = (index: number, updates: Partial<ModelTestConfig>) => {
    setActiveConfigs(prev => prev.map((c, i) => 
      i === index ? { ...c, ...updates } : c
    ))
  }

  // Add state for the dialog
  const [showCompareDialog, setShowCompareDialog] = useState(false)

  // Add this state:
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Model Testing Matrix</h1>
              <p className="text-muted-foreground">
                Test XMLLM's compliance across different models, schemas, and strategies
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning || activeConfigs.length === 0}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2 min-w-[200px]"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>Run All Tests</span>
                </>
              )}
            </button>
          </div>
          {rateLimitError && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-4 rounded-lg">
              <div className="font-medium">Rate Limit Warning</div>
              <p className="text-sm mt-1">{rateLimitError}</p>
            </div>
          )}
          {connectionError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
              <div className="font-medium">Connection Error</div>
              <p className="text-sm mt-1">{connectionError}</p>
              <p className="text-sm mt-2">
                Make sure the XMLLM server is running at http://localhost:3124
              </p>
            </div>
          )}
        </header>

        <div className="grid grid-cols-[400px,1fr] gap-8">
          <div className="space-y-4">
            <div className="sticky top-8">
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div className="space-y-4">
                  {activeConfigs.map((config, index) => (
                    <ConfigItem
                      key={index}
                      config={config}
                      index={index}
                      onUpdate={handleConfigUpdate}
                      onRemove={(index) => setActiveConfigs(prev => prev.filter((_, i) => i !== index))}
                    />
                  ))}
                </div>

                <div className="space-y-2 mt-4 p-3 border-t border-border">
                  <button
                    onClick={addConfig}
                    className="w-full px-4 py-2 border border-dashed border-border rounded-lg
                              hover:border-primary hover:text-primary transition-colors
                              flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Configuration</span>
                  </button>

                  <button
                    onClick={() => setShowCompareDialog(true)}
                    className="w-full px-4 py-2 border border-dashed border-border rounded-lg
                              hover:border-primary hover:text-primary transition-colors
                              flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 7h12M8 12h12M8 17h12M4 7h0M4 12h0M4 17h0" />
                    </svg>
                    <span>Compare All Strategies</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-x-auto">
            <TestTableResults
              activeConfigs={activeConfigs}
              results={results}
              runningTests={runningTests}
              selectedTest={selectedTest}
              expandedBoxes={expandedBoxes}
              theme={theme}
              onRunConfig={runModelTests}
              onToggleExpand={toggleExpand}
              onSelectTest={setSelectedTest}
            />
          </div>
        </div>
      </div>

      {showCompareDialog && (
        <CompareStrategiesDialog
          onSelect={(modelId) => setActiveConfigs(generateStrategyComparisons(modelId))}
          onClose={() => setShowCompareDialog(false)}
        />
      )}
    </div>
  )
}
