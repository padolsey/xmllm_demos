import React from 'react'
import { RotateCw } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { TEST_CASES } from '@/config/model-testing/test-cases'
import { MODEL_CONFIGS } from '@/config/model-testing/models'
import { XMLLM_STRATEGIES } from '../constants'
import { getPriceCategory } from '../utils/price'
import type { TestResult, ModelTestConfig } from '../types'
import type { ModelConfig } from '@/config/model-testing/models'
import { ConfigHeader } from './ConfigHeader'
import { CopyButton } from './CopyButton'

interface TestTableResultsProps {
  activeConfigs: ModelTestConfig[]
  results: TestResult[]
  runningTests: Set<string>
  selectedTest: string | null
  expandedBoxes: Set<string>
  theme: string
  onRunConfig: (modelId: string, config: ModelTestConfig, testId?: string) => void
  onToggleExpand: (boxId: string) => void
  onSelectTest: (testId: string | null) => void
}

export function TestTableResults({
  activeConfigs,
  results,
  runningTests,
  selectedTest,
  expandedBoxes,
  theme,
  onRunConfig,
  onToggleExpand,
  onSelectTest
}: TestTableResultsProps) {
  return (
    <table className="w-full border-collapse table-fixed">
      <thead>
        <tr>
          <th className="bg-card p-4 border-b border-r border-border font-medium text-left w-[250px] min-w-[250px]">
            Test Cases
          </th>
          {activeConfigs.map((config, index) => (
            <th key={index} 
                className="bg-card p-4 border-b border-r border-border font-medium text-left w-[300px]">
              <ConfigHeader 
                config={config}
                onRunConfig={onRunConfig}
              />
            </th>
          ))}
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
                    onClick={() => onSelectTest(null)}
                    className="text-sm text-primary mt-2"
                  >
                    Hide Details
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectTest(testCase.id)}
                    className="text-sm text-primary mt-2"
                  >
                    Show Details
                  </button>
                )}
              </td>

              {activeConfigs.map((config, index) => {
                const result = results.find(r => 
                  JSON.stringify(r.config) === JSON.stringify(config) && 
                  r.testId === testCase.id
                )
                
                return (
                  <td key={index} 
                      className={`p-4 border-b border-r border-border align-top ${
                        result ? 
                          result.success === 'ongoing'
                            ? 'bg-primary/5 border-l-4 border-l-primary'
                            : result.success === true
                              ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500'
                              : 'bg-red-500/5 border-l-4 border-l-red-500'
                        : 'bg-card/50'
                      }`}
                  >
                    {result ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`text-sm font-medium ${
                            result.success === 'ongoing' 
                              ? 'text-primary'
                              : result.success === true
                                ? 'text-emerald-500' 
                                : 'text-red-500'
                          }`}>
                            {result.success === 'ongoing' 
                              ? 'In Progress' 
                              : result.success === true
                                ? 'Success' 
                                : 'Failed'}
                            <span className="text-muted-foreground ml-2">
                              ({((result.timing.end - result.timing.start) / 1000).toFixed(1)}s)
                            </span>
                          </div>
                          
                          <button
                            onClick={() => onRunConfig(config.modelId, config, testCase.id)}
                            disabled={runningTests.has(`${JSON.stringify(config)}-${testCase.id}`)}
                            className="p-1.5 text-xs bg-primary/10 hover:bg-primary/20 
                                      text-primary rounded-md flex items-center gap-1
                                      disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RotateCw className={`w-3 h-3 ${
                              runningTests.has(`${JSON.stringify(config)}-${testCase.id}`) 
                                ? 'animate-spin' 
                                : ''
                            }`} />
                            <span>Run</span>
                          </button>
                        </div>

                        {typeof result.success === 'string' && result.success !== 'ongoing' && (
                          <div className="mt-1 text-xs font-normal bg-red-500/10 text-red-500 p-2 rounded">
                            Validation Error: {result.success}
                          </div>
                        )}

                        <div className="text-xs">
                          <div className="font-medium mb-1 flex items-center justify-between">
                            <span>Raw LLM Output:</span>
                            <div className="flex items-center gap-2">
                              <CopyButton text={result.rawXml || ''} />
                              <button
                                onClick={() => onToggleExpand(`${JSON.stringify(result.config)}-${result.testId}-xml`)}
                                className="p-1.5 text-xs bg-primary/10 hover:bg-primary/20 
                                          text-primary rounded shadow-sm flex items-center gap-1"
                              >
                                {expandedBoxes.has(`${JSON.stringify(result.config)}-${result.testId}-xml`) ? 'Collapse' : 'Expand'}
                              </button>
                            </div>
                          </div>
                          <div className="relative">
                            <pre className={`bg-muted p-2 rounded overflow-auto transition-[max-height] duration-200 
                              max-w-full break-all whitespace-pre-wrap ${
                              expandedBoxes.has(`${JSON.stringify(result.config)}-${result.testId}-xml`)
                                ? 'max-h-[600px]'
                                : 'max-h-[100px]'
                            }`}>
                              {result.rawXml || 'No XML generated'}
                            </pre>
                          </div>

                          <div className="font-medium mt-4 mb-1 flex items-center justify-between">
                            <span>Parsed JSON:</span>
                            <div className="flex items-center gap-2">
                              <CopyButton text={JSON.stringify(result.parsedJson, null, 2) || ''} />
                              <button
                                onClick={() => onToggleExpand(`${JSON.stringify(result.config)}-${result.testId}-json`)}
                                className="p-1.5 text-xs bg-primary/10 hover:bg-primary/20 
                                          text-primary rounded shadow-sm flex items-center gap-1"
                              >
                                {expandedBoxes.has(`${JSON.stringify(result.config)}-${result.testId}-json`) ? 'Collapse' : 'Expand'}
                              </button>
                            </div>
                          </div>
                          <div className="relative">
                            <pre className={`bg-muted p-2 rounded overflow-auto transition-[max-height] duration-200 
                              max-w-full break-all whitespace-pre-wrap ${
                              expandedBoxes.has(`${JSON.stringify(result.config)}-${result.testId}-json`)
                                ? 'max-h-[600px]'
                                : 'max-h-[100px]'
                            }`}>
                              {JSON.stringify(result.parsedJson, null, 2) || 'No JSON parsed'}
                            </pre>
                          </div>
                        </div>

                        {result.error && (
                          <div className="text-xs text-red-500">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">No results</span>
                        <button
                          onClick={() => onRunConfig(config.modelId, config, testCase.id)}
                          disabled={runningTests.has(`${JSON.stringify(config)}-${testCase.id}`)}
                          className="p-1.5 text-xs bg-primary/10 hover:bg-primary/20 
                                    text-primary rounded-md flex items-center gap-1
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCw className={`w-3 h-3 ${
                            runningTests.has(`${JSON.stringify(config)}-${testCase.id}`) 
                              ? 'animate-spin' 
                              : ''
                          }`} />
                          <span>Run</span>
                        </button>
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>

            {selectedTest === testCase.id && (
              <tr>
                <td colSpan={activeConfigs.length + 1} className="border-b border-border bg-card/30 p-4">
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
                          onClick={() => onToggleExpand(`schema-${testCase.id}`)}
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
                              {activeConfigs.some(c => c.useHints) ? '(Active in some configs)' : '(Inactive)'}
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
                              onClick={() => onToggleExpand(`hints-${testCase.id}`)}
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
  )
}