import { useMemo } from 'react'
import { ModelConfig } from '@/config/model-testing/models'
import { getPriceCategory } from '../utils/price'

interface ModelSelectorProps {
  models: ModelConfig[]
  activeModels: string[]
  onModelToggle: (modelId: string) => void
  recentModels: string[]
  savedResults: Set<string>
}

export function ModelSelector({ 
  models, 
  activeModels, 
  onModelToggle,
  recentModels,
  savedResults 
}: ModelSelectorProps) {
  const groupedModels = useMemo(() => {
    const groups: Record<string, ModelConfig[]> = {}
    
    // Recent models first
    if (recentModels.length > 0) {
      groups['Recent'] = models.filter(m => 
        recentModels.includes(m.id)
      )
    }

    // Then group rest by provider
    models.forEach(model => {
      if (!recentModels.includes(model.id)) {
        const provider = model.config.inherit
        if (!groups[provider]) groups[provider] = []
        groups[provider].push(model)
      }
    })

    return groups
  }, [models, recentModels])

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {Object.entries(groupedModels).map(([provider, providerModels]) => (
        <div key={provider} className="border-b last:border-b-0 border-border">
          <div className="flex items-center justify-between px-3 py-2 bg-card/50">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">{provider}</h3>
              <span className="text-xs text-muted-foreground">
                ({providerModels.length} models)
              </span>
            </div>
            {provider !== 'Recent' && (
              <button 
                onClick={() => {
                  const modelIds = providerModels.map(m => m.id)
                  const allSelected = modelIds.every(id => activeModels.includes(id))
                  modelIds.forEach(id => onModelToggle(id))
                }}
                className="text-xs text-primary hover:underline"
              >
                {providerModels.every(m => activeModels.includes(m.id)) 
                  ? 'Deselect All' 
                  : 'Select All'
                }
              </button>
            )}
          </div>
          <div className="divide-y divide-border/50">
            {providerModels.map(model => {
              const isActive = activeModels.includes(model.id)
              const hasResults = Array.from(savedResults).some(key => 
                key.startsWith(model.id)
              )
              const inputCost = getPriceCategory(model.input_price)
              const outputCost = getPriceCategory(model.output_price)
              
              return (
                <button
                  key={model.id}
                  onClick={() => onModelToggle(model.id)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 bg-background
                    transition-colors hover:bg-muted/50 text-left
                    ${isActive ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                >
                  <div className={`w-4 h-4 rounded border flex-shrink-0
                    ${isActive ? 'bg-primary border-primary' : 'border-muted-foreground'}
                  `}>
                    {isActive && (
                      <svg viewBox="0 0 14 14" className="w-4 h-4 text-primary-foreground">
                        <path
                          fill="currentColor"
                          d="M11.4 3.8L5 10.2L2.6 7.8L1.4 9L5 12.6L12.6 5L11.4 3.8Z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-sm min-w-[140px] truncate">
                    {model.name}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs">
                    <span className={inputCost.color}>{inputCost.label}</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className={outputCost.color}>{outputCost.label}</span>
                  </span>
                  {hasResults && (
                    <span className="text-emerald-500 ml-auto">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
} 