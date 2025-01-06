'use client'

import { useState } from 'react'
import { AgentConfig, IdeaConfig } from '../types'
import AgentConfigSection from './AgentConfigSection'
import IdeaConfigSection from './IdeaConfigSection'
import IterationConfigSection from './IterationConfigSection'
import { Wand2 } from 'lucide-react'

interface ConfigPanelProps {
  agentConfigs: AgentConfig[]
  setAgentConfigs: (configs: AgentConfig[]) => void
  ideaConfig: IdeaConfig
  setIdeaConfig: (config: IdeaConfig) => void
  isRunning: boolean
  onStart: () => void
  onStop: () => void
  testingMode: boolean
  problemStatement: string
  setProblemStatement: (statement: string) => void
  handleGenerateFromProblem: () => void
  disabled: boolean
  isGenerating: boolean
}

export default function ConfigPanel({
  agentConfigs,
  setAgentConfigs,
  ideaConfig,
  setIdeaConfig,
  isRunning,
  onStart,
  onStop,
  testingMode,
  problemStatement,
  setProblemStatement,
  handleGenerateFromProblem,
  disabled,
  isGenerating
}: ConfigPanelProps) {
  const [isValid, setIsValid] = useState(true)

  const handleReset = () => {
    setAgentConfigs([{ id: '1', name: 'Agent 1', type: 'default' }])
    setIdeaConfig({
      problem: '',
      initialIdeas: [],
      iterations: 10,
      pairingMethod: 'random',
      allowNewIdeas: true
    })
  }

  return (
    <div className="bg-[hsl(var(--idea-surface))] border border-[hsl(var(--idea-border))] rounded-lg p-6 space-y-6">
      <h1 className="text-xl font-mono">Idea Evolution Lab</h1>
      
      <div className="space-y-4">
        <h2>Problem Statement</h2>
        <textarea
          value={problemStatement}
          onChange={e => setProblemStatement(e.target.value)}
          placeholder="What problem are you trying to solve?"
          disabled={isGenerating}
          className="w-full min-h-[120px] px-3 py-2 bg-[hsl(var(--idea-bg))] border border-[hsl(var(--idea-border))] rounded-lg"
        />
        <button
          onClick={handleGenerateFromProblem}
          disabled={!problemStatement.trim() || isGenerating}
          className="w-full px-4 py-2 border border-[hsl(var(--idea-border))] rounded-lg hover:bg-[hsl(var(--idea-bg))]"
        >
          {isGenerating ? 'Generating...' : 'Generate Solutions'}
        </button>
      </div>

      {ideaConfig.initialIdeas.length > 0 && (
        <>
          <IdeaConfigSection
            config={ideaConfig}
            setConfig={setIdeaConfig}
            disabled={isRunning}
          />
          
          <AgentConfigSection
            agents={agentConfigs}
            setAgents={setAgentConfigs}
            disabled={isRunning}
          />

          <IterationConfigSection
            config={ideaConfig}
            setConfig={setIdeaConfig}
            disabled={isRunning}
          />

          <div className="space-y-2">
            <button
              onClick={isRunning ? onStop : onStart}
              disabled={!isValid}
              className="w-full px-4 py-2 border border-[hsl(var(--idea-border))] rounded-lg hover:bg-[hsl(var(--idea-bg))]"
            >
              {isRunning ? 'Stop Evolution' : 'Start Evolution'}
            </button>

            <button
              onClick={handleReset}
              disabled={isRunning}
              className="w-full px-4 py-2 text-sm opacity-50 hover:opacity-100"
            >
              Reset Everything
            </button>
          </div>
        </>
      )}
    </div>
  )
} 