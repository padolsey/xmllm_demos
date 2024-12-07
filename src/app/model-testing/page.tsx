'use client'

import React, { useState } from 'react'
import { stream } from '@/utils/xmllm'
import type { ModelPreference, HintType } from 'xmllm'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTheme } from '../theme-provider'
import { ModelSelector } from './components/ModelSelector'
import { useTestResults } from './hooks/useTestResults'
import { ModelConfig, MODEL_CONFIGS } from '@/config/model-testing/models'
import { TestCase, TEST_CASES } from '@/config/model-testing/test-cases'
import type { TestResult } from './types'
import { getPriceCategory } from './utils/price'

// Define the default enabled models
const DEFAULT_ENABLED_MODELS = ['claude3-haiku', 'sonar-small', 'gpt-4o-mini']

export default function ModelTesting() {
  const { theme } = useTheme()
  const [results, setResults] = useState<TestResult[]>([])
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [activeModels, setActiveModels] = useState<string[]>(DEFAULT_ENABLED_MODELS)
  const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(new Set())
  const [useHints, setUseHints] = useState(false)
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set())
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [useSudoPrompt, setUseSudoPrompt] = useState(false)

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

  async function runTest(testCase: TestCase, modelConfig: ModelConfig) {
    const testKey = `${modelConfig.id}-${testCase.id}`
    setRunningTests(prev => new Set(prev).add(testKey))
    setConnectionError(null)
    
    const startTime = Date.now()
    let rawXml = ''

    try {
      console.log('Starting test:', { testCase, modelConfig })
      
      const schema = eval(`(${testCase.schema})`)
      console.log('Parsed schema:', schema)

      const initialResult = {
        modelId: modelConfig.id,
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

      const streamConfig = {
        prompt: testCase.prompt,
        system: testCase.system,
        schema,
        model: modelConfig.config as ModelPreference,
        hints: useHints ? eval(`(${testCase.hints})` as any) as HintType : undefined,
        sudoPrompt: useSudoPrompt,
        onChunk: (chunk: string) => {
          console.log('chunk:::', chunk)
          rawXml += chunk
          setResults(prev => prev.map(r => 
            r.modelId === modelConfig.id && r.testId === testCase.id
              ? { ...r, rawXml }
              : r
          ))
        }
      }

      console.log('Creating stream with config:', streamConfig)
      const theStream = stream(streamConfig)

      const result = await theStream.last()
      console.log('Stream completed with result:', result)

      const success = testCase.validate ? testCase.validate(result) : true

      const finalResult = {
        modelId: modelConfig.id,
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
        r.modelId === modelConfig.id && r.testId === testCase.id
          ? finalResult
          : r
      ))
      saveResult(finalResult)
      updateRecentModels(modelConfig.id)

    } catch (error) {
      console.error('Test error:', error)
      const errorResult = {
        modelId: modelConfig.id,
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
        r.modelId === modelConfig.id && r.testId === testCase.id
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

    try {
      for (const testCase of TEST_CASES) {
        for (const modelId of activeModels) {
          const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId)
          if (modelConfig) {
            await runTest(testCase, modelConfig)
          }
        }
      }
    } finally {
      setIsRunning(false)
    }
  }

  const clearModelResults = (modelId: string) => {
    // Clear results from state
    setResults(prev => prev.filter(r => r.modelId !== modelId))
    // Clear from localStorage
    setSavedResults(prev => prev.filter((r: TestResult) => r.modelId !== modelId))
  }

  const runModelTests = async (modelId: string) => {
    // First clear existing results
    clearModelResults(modelId)
    
    // Find the model config
    const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId)
    if (!modelConfig) return
    
    // Run all test cases for this model
    for (const testCase of TEST_CASES) {
      await runTest(testCase, modelConfig)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Model Testing Matrix</h1>
          <p className="text-muted-foreground">
            Test XMLLM's resilience across different models and schemas
          </p>
        </header>

        {connectionError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
            <div className="font-medium">Connection Error</div>
            <p className="text-sm mt-1">{connectionError}</p>
            <p className="text-sm mt-2">
              Make sure the XMLLM server is running at http://localhost:3124
            </p>
          </div>
        )}

        <div className="grid grid-cols-[360px,1fr] gap-8">
          <div className="space-y-4">
            <div className="sticky top-8">
              <div className="space-y-6 mb-4 p-4 border border-border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseHints(prev => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${useHints ? 'bg-primary' : 'bg-muted'}
                      `}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${useHints ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                    <span className="text-sm font-medium">Use Hints</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-[52px]">
                    Provides example data to guide the LLM beyond just schema structure
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseSudoPrompt(prev => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${useSudoPrompt ? 'bg-primary' : 'bg-muted'}
                      `}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${useSudoPrompt ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                    <span className="text-sm font-medium">Sudo Prompting</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-[52px]">
                    Adds forceful dialog to make the LLM follow instructions more strictly
                  </div>
                </div>
              </div>

              <button
                onClick={runAllTests}
                disabled={isRunning || activeModels.length === 0}
                className="mb-2 w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg
                        disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>

              <ModelSelector
                models={MODEL_CONFIGS}
                activeModels={activeModels}
                onModelToggle={(modelId) => {
                  setActiveModels(prev =>
                    prev.includes(modelId)
                      ? prev.filter(id => id !== modelId)
                      : [...prev, modelId]
                  )
                }}
                recentModels={recentModels}
                savedResults={new Set(
                  savedResults.map(r => `${r.modelId}-${r.testId}`)
                )}
              />
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr>
                  <th className="bg-card p-4 border-b border-r border-border font-medium text-left w-[250px] min-w-[250px]">
                    Test Cases
                  </th>
                  {activeModels.map(modelId => {
                    const model = MODEL_CONFIGS.find(m => m.id === modelId)
                    return (
                      <th key={modelId} 
                          className="bg-card p-4 border-b border-r border-border font-medium text-left w-[300px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{model?.name}</span>
                            {model && (
                              <span className="text-xs flex items-center gap-1">
                                <span className={getPriceCategory(model.input_price).color}>
                                  {getPriceCategory(model.input_price).label}
                                </span>
                                <span className="text-muted-foreground/50">/</span>
                                <span className={getPriceCategory(model.output_price).color}>
                                  {getPriceCategory(model.output_price).label}
                                </span>
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => runModelTests(modelId)}
                            className="text-xs text-primary hover:text-primary/80 
                                       flex items-center gap-1 opacity-50 hover:opacity-100"
                          >
                            <svg 
                              viewBox="0 0 24 24" 
                              className="w-3 h-3"
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Run
                          </button>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {TEST_CASES.map(testCase => (
                  <React.Fragment key={testCase.id}>
                    <tr>
                      <td className="p-4 border-r border-b border-border bg-card/50 align-top">
                        <h3 className="font-medium">{testCase.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {testCase.description}
                        </p>
                        {selectedTest === testCase.id ? (
                          <button
                            onClick={() => setSelectedTest(null)}
                            className="text-sm text-primary mt-2"
                          >
                            Hide Details
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTest(testCase.id)}
                            className="text-sm text-primary mt-2"
                          >
                            Show Details
                          </button>
                        )}
                      </td>

                      {activeModels.map(modelId => {
                        const result = results.find(r => 
                          r.modelId === modelId && r.testId === testCase.id
                        )
                        
                        return (
                          <td key={`${testCase.id}-${modelId}`} 
                              className="p-4 border-b border-r border-border align-top">
                            {result ? (
                              <div className="space-y-2">
                                <div className={`text-sm font-medium ${
                                  result.success === 'ongoing' 
                                    ? 'text-primary'
                                    : result.success 
                                      ? 'text-emerald-500' 
                                      : 'text-red-500'
                                }`}>
                                  {result.success === 'ongoing' 
                                    ? 'In Progress' 
                                    : result.success 
                                      ? 'Success' 
                                      : 'Failed'
                                  }
                                  <span className="text-muted-foreground ml-2">
                                    ({((result.timing.end - result.timing.start) / 1000).toFixed(1)}s)
                                  </span>
                                </div>

                                <div className="text-xs">
                                  <div className="font-medium mb-1">Raw XML:</div>
                                  <div className="relative">
                                    <pre className={`bg-muted p-2 rounded overflow-auto transition-[max-height] duration-200 
                                      max-w-full break-all whitespace-pre-wrap ${
                                      expandedBoxes.has(`${result.modelId}-${result.testId}-xml`)
                                        ? 'max-h-[600px]'
                                        : 'max-h-[100px]'
                                    }`}>
                                      {result.rawXml || 'No XML generated'}
                                    </pre>
                                    <button
                                      onClick={() => toggleExpand(`${result.modelId}-${result.testId}-xml`)}
                                      className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] 
                                                bg-primary/20 hover:bg-primary/30 rounded 
                                                text-primary font-medium shadow-sm"
                                    >
                                      {expandedBoxes.has(`${result.modelId}-${result.testId}-xml`) ? 'Collapse' : 'Expand'}
                                    </button>
                                  </div>
                                </div>

                                <div className="text-xs">
                                  <div className="font-medium mb-1">Parsed JSON:</div>
                                  <div className="relative">
                                    <pre className={`bg-muted p-2 rounded overflow-auto transition-[max-height] duration-200 ${
                                      expandedBoxes.has(`${result.modelId}-${result.testId}-json`)
                                        ? 'max-h-[600px]'
                                        : 'max-h-[100px]'
                                    }`}>
                                      {JSON.stringify(result.parsedJson, null, 2) || 'No JSON parsed'}
                                    </pre>
                                    <button
                                      onClick={() => toggleExpand(`${result.modelId}-${result.testId}-json`)}
                                      className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] 
                                                bg-primary/20 hover:bg-primary/30 rounded 
                                                text-primary font-medium shadow-sm"
                                    >
                                      {expandedBoxes.has(`${result.modelId}-${result.testId}-json`) ? 'Collapse' : 'Expand'}
                                    </button>
                                  </div>
                                </div>

                                {result.error && (
                                  <div className="text-xs text-red-500">
                                    Error: {result.error}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {runningTests.has(`${modelId}-${testCase.id}`) ? (
                                  <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
                                      <circle 
                                        className="opacity-25" 
                                        cx="12" 
                                        cy="12" 
                                        r="10" 
                                        stroke="currentColor" 
                                        strokeWidth="4"
                                        fill="none"
                                      />
                                      <path 
                                        className="opacity-75" 
                                        fill="currentColor" 
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                    </svg>
                                    <span>Running...</span>
                                  </div>
                                ) : (
                                  'Not tested'
                                )}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>

                    {selectedTest === testCase.id && (
                      <tr>
                        <td colSpan={activeModels.length + 1} className="border-b border-border bg-card/30 p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Schema</h4>
                              <div className="relative">
                                <CodeMirror
                                  value={testCase.schema}
                                  height={expandedBoxes.has(`schema-${testCase.id}`) ? "400px" : "200px"}
                                  theme={theme === 'dark' ? oneDark : undefined}
                                  extensions={[javascript()]}
                                  editable={false}
                                />
                                <button
                                  onClick={() => toggleExpand(`schema-${testCase.id}`)}
                                  className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] 
                                            bg-primary/20 hover:bg-primary/30 rounded 
                                            text-primary font-medium shadow-sm"
                                >
                                  {expandedBoxes.has(`schema-${testCase.id}`) ? 'Collapse' : 'Expand'}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Prompt</h4>
                                <div className="bg-muted p-3 rounded">
                                  {testCase.prompt}
                                </div>
                              </div>

                              {testCase.system && (
                                <div>
                                  <h4 className="font-medium mb-2">System</h4>
                                  <div className="bg-muted p-3 rounded">
                                    {testCase.system}
                                  </div>
                                </div>
                              )}

                              {testCase.hints && (
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Hints
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      {useHints ? '(Active)' : '(Inactive)'}
                                    </span>
                                  </h4>
                                  <div className="relative">
                                    <CodeMirror
                                      value={testCase.hints}
                                      height={expandedBoxes.has(`hints-${testCase.id}`) ? "400px" : "200px"}
                                      theme={theme === 'dark' ? oneDark : undefined}
                                      extensions={[javascript()]}
                                      editable={false}
                                    />
                                    <button
                                      onClick={() => toggleExpand(`hints-${testCase.id}`)}
                                      className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] 
                                                bg-primary/20 hover:bg-primary/30 rounded 
                                                text-primary font-medium shadow-sm"
                                    >
                                      {expandedBoxes.has(`hints-${testCase.id}`) ? 'Collapse' : 'Expand'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}