import { MODEL_CONFIGS } from '@/config/model-testing/models'
import { X } from 'lucide-react'

interface CompareStrategiesDialogProps {
  onSelect: (modelId: string) => void
  onClose: () => void
}

export function CompareStrategiesDialog({ onSelect, onClose }: CompareStrategiesDialogProps) {
  const getGroupedModels = () => {
    const groups: Record<string, typeof MODEL_CONFIGS> = {}
    MODEL_CONFIGS.forEach(model => {
      const provider = model.config.inherit
      if (!groups[provider]) groups[provider] = []
      groups[provider].push(model)
    })
    return groups
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-[400px] bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Compare All Strategies</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a model to compare all strategy variations (with and without hints).
          </p>

          <div className="grid gap-2">
            {Object.entries(getGroupedModels()).map(([provider, models]) => (
              <div key={provider}>
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {provider.toUpperCase()}
                </div>
                <div className="grid gap-1">
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelect(model.id)
                        onClose()
                      }}
                      className="flex items-center justify-between p-2 text-left rounded-md
                               hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ${model.input_price?.toFixed(2)}/{model.output_price?.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 