'use client'

import { useState, useEffect } from 'react'
import { stream, ModelPreference, types } from '@/utils/xmllm'

// Define the test prompt
const DEFAULT_PROMPT = "How many suns are there?";

// Define the schema
const DEFAULT_SCHEMA = {
  answers: types.array(String, 'one possible answer')
}

// Define provider aliases
const PROVIDER_ALIASES = [
  // Anthropic models
  'anthropic:superfast',
  'anthropic:fast',
  'anthropic:good',
  
  // OpenAI models
  'openai:superfast',
  'openai:fast',
  'openai:good',
  
  // Together AI models
  'togetherai:fast',
  'togetherai:good',
  
  // OpenRouter models
  'openrouter:mistralai/ministral-3b',
  'openrouter:mistralai/ministral-8b',
  'openrouter:mistralai/mixtral-8x7b',
  'openrouter:meta-llama/llama-3.3-70b-instruct',
  'openrouter:microsoft/phi-3.5-mini-128k-instruct',

  'openrouter:superfast',
  'openrouter:fast',
  'openrouter:good',
  
  // Other providers
  'mistralai:fast',
  'mistralai:good',
  'perplexityai:fast',
  'perplexityai:good'
]

interface ModelResult {
  modelId: string
  status: 'pending' | 'running' | 'success' | 'error'
  startTime?: number
  endTime?: number
  duration?: number
  output?: any
  error?: string
  rawOutput?: string
}

export default function ProvidersPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [results, setResults] = useState<ModelResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [runningModels, setRunningModels] = useState<Set<string>>(new Set())
  const [concurrencyLimit, setConcurrencyLimit] = useState(5)

  // Initialize results with all provider aliases
  useEffect(() => {
    const initialResults = PROVIDER_ALIASES.map(modelId => ({
      modelId,
      status: 'pending' as const
    }))
    setResults(initialResults)
  }, [])

  const runTest = async (modelId: string) => {
    if (runningModels.has(modelId)) return
    
    // Add to running models set
    setRunningModels(prev => new Set(prev).add(modelId))
    
    // Update status to running
    setResults(prev => 
      prev.map(result => 
        result.modelId === modelId 
          ? { 
              ...result, 
              status: 'running', 
              startTime: Date.now(),
              output: undefined,
              error: undefined,
              duration: undefined,
              endTime: undefined,
              rawOutput: undefined
            } 
          : result
      )
    )

    try {
      let rawOutput = ''
      
      const modelStream = stream({
        prompt,
        schema: DEFAULT_SCHEMA,
        model: modelId as ModelPreference,
        onChunk: (chunk: string) => {
          rawOutput += chunk
        },
        max_tokens: 1000,
        temperature: 0.7
      })

      const result = await modelStream.last()
      
      // Update with success
      setResults(prev => 
        prev.map(r => 
          r.modelId === modelId 
            ? { 
                ...r, 
                status: 'success', 
                endTime: Date.now(),
                duration: Date.now() - (r.startTime || 0),
                output: result,
                rawOutput
              } 
            : r
        )
      )
    } catch (error) {
      // Update with error
      setResults(prev => 
        prev.map(r => 
          r.modelId === modelId 
            ? { 
                ...r, 
                status: 'error', 
                endTime: Date.now(),
                duration: Date.now() - (r.startTime || 0),
                error: error instanceof Error ? error.message : String(error)
              } 
            : r
        )
      )
    } finally {
      // Remove from running models set
      setRunningModels(prev => {
        const newSet = new Set(prev)
        newSet.delete(modelId)
        return newSet
      })
    }
  }

  const runAllTests = async () => {
    if (isRunning) return
    setIsRunning(true)
    
    // Reset results
    setResults(prev => prev.map(result => ({
      ...result,
      status: 'pending',
      output: undefined,
      error: undefined,
      duration: undefined,
      startTime: undefined,
      endTime: undefined,
      rawOutput: undefined
    })))

    try {
      // Create a queue of models to test
      const queue = [...PROVIDER_ALIASES]
      
      // Process queue with concurrency
      const runNextBatch = async () => {
        // Get next batch based on concurrency limit and what's not already running
        const currentRunning = runningModels.size
        const availableSlots = concurrencyLimit - currentRunning
        
        if (availableSlots <= 0 || queue.length === 0) return
        
        const batch = queue.splice(0, availableSlots)
        
        // Start all tests in this batch concurrently
        await Promise.all(batch.map(modelId => runTest(modelId)))
        
        // If there are more items in the queue, process the next batch
        if (queue.length > 0) {
          await runNextBatch()
        }
      }
      
      // Start processing the queue
      await runNextBatch()
      
      // Wait for all running tests to complete
      while (runningModels.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Provider Alias Testing</h1>
          <p className="text-muted-foreground">
            Test a prompt across all available provider aliases to compare performance
          </p>
        </header>

        {/* Controls */}
        <div className="mb-8 space-y-4 bg-card p-4 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium mb-2">Test Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-24 p-3 rounded-lg border bg-background font-mono text-sm resize-none"
              placeholder="Enter your test prompt here..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Concurrency Limit: {concurrencyLimit}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={concurrencyLimit}
              onChange={(e) => setConcurrencyLimit(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Maximum number of models to test simultaneously
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm">
              {runningModels.size > 0 && (
                <span className="text-blue-500">
                  Running {runningModels.size} model(s)...
                </span>
              )}
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running All Tests...' : 'Run All Tests'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map(result => (
              <div 
                key={result.modelId} 
                className={`border rounded-lg overflow-hidden ${
                  result.status === 'success' 
                    ? 'border-green-500/30' 
                    : result.status === 'error'
                      ? 'border-red-500/30'
                      : result.status === 'running'
                        ? 'border-blue-500/30'
                        : 'border-border'
                }`}
              >
                <div className="p-3 border-b border-border bg-card flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{result.modelId}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      result.status === 'pending' 
                        ? 'bg-muted text-muted-foreground' 
                        : result.status === 'running'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : result.status === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {result.status === 'pending' ? 'Pending' : 
                       result.status === 'running' ? 'Running' :
                       result.status === 'success' ? 'Success' : 'Error'}
                    </div>
                    
                    {result.status !== 'running' && (
                      <button
                        onClick={() => runTest(result.modelId)}
                        disabled={runningModels.has(result.modelId)}
                        className="text-xs px-2 py-1 bg-primary/80 text-primary-foreground rounded-full
                                 hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {runningModels.has(result.modelId) ? 'Running...' : 'Run'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-muted/30">
                  {result.status === 'pending' && (
                    <div className="text-center text-muted-foreground py-4">
                      Waiting to run...
                    </div>
                  )}
                  
                  {result.status === 'running' && (
                    <div className="text-center text-muted-foreground py-4">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      Processing...
                    </div>
                  )}
                  
                  {result.status === 'success' && (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        Completed in {(result.duration! / 1000).toFixed(2)}s
                      </div>
                      
                      <div className="font-mono text-sm overflow-auto max-h-40 bg-background p-2 rounded border border-border">
                        <pre>{JSON.stringify(result.output, null, 2)}</pre>
                      </div>
                      
                      {result.rawOutput && (
                        <div>
                          <div className="text-xs font-medium mb-1">Raw Output:</div>
                          <div className="font-mono text-xs overflow-auto max-h-20 bg-background p-2 rounded border border-border">
                            {result.rawOutput}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.status === 'error' && (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        Failed after {(result.duration! / 1000).toFixed(2)}s
                      </div>
                      
                      <div className="font-mono text-sm overflow-auto max-h-40 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300">
                        {result.error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 