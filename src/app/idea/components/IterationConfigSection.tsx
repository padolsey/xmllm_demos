'use client'

import { IdeaConfig } from '../types'

interface IterationConfigSectionProps {
  config: IdeaConfig
  setConfig: (config: IdeaConfig) => void
  disabled?: boolean
}

export default function IterationConfigSection({
  config,
  setConfig,
  disabled
}: IterationConfigSectionProps) {
  const handleChange = (key: keyof IdeaConfig, value: any) => {
    setConfig({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Iteration Settings</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Number of Iterations
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={config.iterations}
            onChange={e => handleChange('iterations', parseInt(e.target.value) || 1)}
            disabled={disabled}
            placeholder="Enter number of iterations"
            className="w-full px-3 py-2 bg-background rounded-lg border border-border text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-opacity-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Pairing Method
          </label>
          <select
            value={config.pairingMethod}
            onChange={e => handleChange('pairingMethod', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 bg-background rounded-lg border border-border text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="random">Random</option>
            <option value="tournament">Tournament</option>
            <option value="round-robin">Round Robin</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="allowNewIdeas"
            checked={config.allowNewIdeas}
            onChange={e => handleChange('allowNewIdeas', e.target.checked)}
            disabled={disabled}
            className="rounded border-border text-primary focus:ring-primary/20"
          />
          <label htmlFor="allowNewIdeas" className="text-sm font-medium">
            Allow agents to propose new ideas
          </label>
        </div>
      </div>
    </div>
  )
} 