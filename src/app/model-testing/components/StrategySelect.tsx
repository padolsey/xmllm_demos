import { XMLLM_STRATEGIES } from '../constants'
import type { ModelTestConfig } from '../types'

interface StrategySelectProps {
  value: ModelTestConfig['strategy']
  onChange: (value: ModelTestConfig['strategy']) => void
}

export function StrategySelect({ value, onChange }: StrategySelectProps) {
  const currentStrategy = XMLLM_STRATEGIES.find(s => s.id === value)

  return (
    <div className="">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ModelTestConfig['strategy'])}
          className="w-full p-2 pl-8 text-sm rounded-md border border-border bg-background
                    focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          title={currentStrategy?.description}
        >
          {XMLLM_STRATEGIES.map(strategy => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
} 