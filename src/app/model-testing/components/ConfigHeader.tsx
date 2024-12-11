import { RotateCw } from 'lucide-react'
import { MODEL_CONFIGS } from '@/config/model-testing/models'
import { XMLLM_STRATEGIES } from '../constants'
import { getPriceCategory } from '../utils/price'
import type { ModelTestConfig } from '../types'
import type { ModelConfig } from '@/config/model-testing/models'

interface ConfigHeaderProps {
  config: ModelTestConfig
  onRunConfig: (modelId: string, config: ModelTestConfig) => void
}

export function ConfigHeader({ config, onRunConfig }: ConfigHeaderProps) {
  const getConfigDescription = (config: ModelTestConfig, model?: ModelConfig) => {
    const parts = [
      model?.name || config.modelId,
      config.useHints ? 'Hints' : null,
      config.strategy !== 'default' ? 
        XMLLM_STRATEGIES.find(v => v.id === config.strategy)?.name : null
    ].filter(Boolean)
    
    return parts.join(' + ')
  }

  const model = MODEL_CONFIGS.find(m => m.id === config.modelId)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">
          {getConfigDescription(config, model)}
        </span>
        <button
          onClick={() => onRunConfig(config.modelId, config)}
          className="text-xs text-primary hover:text-primary/80 
                    flex items-center gap-1 opacity-50 hover:opacity-100"
          title="Run tests for this configuration"
        >
          <RotateCw className="w-3 h-3" />
          <span>Run</span>
        </button>
      </div>
      
      <div className="flex flex-wrap gap-1 text-xs">
        {model && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className={getPriceCategory(model.input_price).color}>
              {getPriceCategory(model.input_price).label}
            </span>
            <span className="opacity-50">/</span>
            <span className={getPriceCategory(model.output_price).color}>
              {getPriceCategory(model.output_price).label}
            </span>
          </span>
        )}
        {config.useHints && (
          <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">Hints</span>
        )}
        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
          {XMLLM_STRATEGIES.find(v => v.id === config.strategy)?.name}
        </span>
      </div>
    </div>
  )
} 