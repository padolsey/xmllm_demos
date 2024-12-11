import { ModelConfig, MODEL_CONFIGS } from '@/config/model-testing/models'
import type { ModelTestConfig } from '../types'
import { X } from 'lucide-react'
import { StrategySelect } from './StrategySelect'
import { HintsToggle } from './HintsToggle'

interface ConfigItemProps {
  config: ModelTestConfig
  index: number
  onUpdate: (index: number, updates: Partial<ModelTestConfig>) => void
  onRemove: (index: number) => void
}

export function ConfigItem({ config, index, onUpdate, onRemove }: ConfigItemProps) {
  const getGroupedModels = () => {
    const groups: Record<string, ModelConfig[]> = {}
    MODEL_CONFIGS.forEach(model => {
      const provider = model.config.inherit
      if (!groups[provider]) groups[provider] = []
      groups[provider].push(model)
    })
    return groups
  }

  return (
    <div className="flex items-center gap-3 p-2 border border-border rounded-lg hover:border-primary/50 transition-colors">
      <select
        value={config.modelId}
        onChange={(e) => onUpdate(index, { modelId: e.target.value })}
        className="w-[160px] text-xs p-1.5 rounded-md border border-border bg-background
                  focus:border-primary focus:ring-1 focus:ring-primary"
      >
        {Object.entries(getGroupedModels()).map(([provider, models]) => (
          <optgroup key={provider} label={provider.toUpperCase()}>
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <StrategySelect 
        value={config.strategy}
        onChange={(value) => onUpdate(index, { strategy: value })}
      />

      <HintsToggle
        enabled={config.useHints}
        onChange={(enabled) => onUpdate(index, { useHints: enabled })}
      />

      <button
        onClick={() => onRemove(index)}
        className="ml-auto p-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 
                  rounded-md transition-colors"
        title="Remove configuration"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
} 