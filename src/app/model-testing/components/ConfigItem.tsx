import { ModelConfig, MODEL_CONFIGS } from '@/config/model-testing/models'
import type { ModelTestConfig } from '../types'
import { X } from 'lucide-react'
import { StrategySelect } from './StrategySelect'
import { HintsToggle } from './HintsToggle'
import { ParserSelect } from './ParserSelect'
import { IdioFormatSelect } from './IdioFormatSelect'

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
    <div className="space-y-4 p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3">
        <select
          value={config.modelId}
          onChange={(e) => onUpdate(index, { modelId: e.target.value })}
          className="text-sm p-2 rounded-md border border-border bg-background
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

        <button
          onClick={() => onRemove(index)}
          className="ml-auto p-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 
                    rounded-md transition-colors"
          title="Remove configuration"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Strategy</div>
          <StrategySelect 
            value={config.strategy}
            onChange={(value) => onUpdate(index, { strategy: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Hints</div>
          <div className="">
            <HintsToggle
              enabled={config.useHints}
              onChange={(enabled) => onUpdate(index, { useHints: enabled })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">Parser:</div>
          <button
            onClick={() => onUpdate(index, { 
              parser: config.parser === 'xml' ? 'idio' : 'xml',
              idioFormat: config.parser === 'xml' ? 'Classic' : config.idioFormat
            })}
            className={`px-3 py-1.5 text-sm rounded-full
                      ${config.parser === 'xml' 
                        ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                        : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
                      }`}
          >
            {config.parser.toUpperCase()}
          </button>
        </div>

        {config.parser === 'idio' && (
          <IdioFormatSelect
            value={config.idioFormat}
            onChange={(format) => onUpdate(index, { idioFormat: format })}
          />
        )}
      </div>
    </div>
  )
} 