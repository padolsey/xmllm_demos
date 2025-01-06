'use client'

import React from 'react'
import { AgentConfig } from '../types'
import { personaConfigs } from '../config/agents'
import { Switch } from '@/components/ui/switch'

interface AgentConfigSectionProps {
  agents: AgentConfig[]
  setAgents: (agents: AgentConfig[]) => void
  disabled?: boolean
}

export default function AgentConfigSection({
  agents,
  setAgents,
  disabled
}: AgentConfigSectionProps) {
  // Initialize with one of each type of agent, but inactive
  const handleInitialize = () => {
    const initialAgents = Object.keys(personaConfigs).map((persona) => ({
      id: crypto.randomUUID(),
      persona: persona,
      active: false
    })) as AgentConfig[]
    setAgents(initialAgents)
  }

  // Call handleInitialize when component mounts if no agents exist
  React.useEffect(() => {
    if (agents.length === 0) {
      handleInitialize()
    }
  }, [])

  const toggleAgent = (id: string) => {
    setAgents(
      agents.map(agent =>
        agent.id === id ? { ...agent, active: !agent.active } : agent
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg">Evaluation Personas</h2>
        <div className="text-sm opacity-70">
          {agents.filter(a => a.active).length} active
        </div>
      </div>

      <div className="grid gap-3">
        {agents.map((agent) => {
          if (!agent.persona) return null
          const config = personaConfigs[agent.persona]
          return (
            <div
              key={agent.id}
              onClick={() => !disabled && toggleAgent(agent.id)}
              className={`p-4 rounded-lg border text-left transition-colors cursor-pointer
                relative overflow-hidden bg-[hsl(var(--idea-bg))]
                ${agent.active 
                  ? 'border-[hsl(var(--idea-text))]'
                  : 'border-[hsl(var(--idea-border))]'
                }
                ${disabled ? 'opacity-50' : 'hover:bg-[hsl(var(--idea-surface))]'}
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{config.title}</div>
                    <Switch
                      checked={agent.active ?? false}
                      onCheckedChange={() => toggleAgent(agent.id)}
                      disabled={disabled}
                    />
                  </div>
                  <div className="text-sm opacity-70 mt-1">
                    {config.description}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 