import type { IdioSymbol } from '../types'

interface IdioSymbolSelectProps {
  value: IdioSymbol
  onChange: (value: IdioSymbol) => void
  disabled?: boolean
}

export function IdioSymbolSelect({ value, onChange, disabled }: IdioSymbolSelectProps) {
  const symbols: IdioSymbol[] = ['⁂', '$', '%']
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as IdioSymbol)}
      disabled={disabled}
      className={`px-1 py-0.5 text-xs rounded-md border border-border bg-background
                focus:border-primary focus:ring-1 focus:ring-primary
                disabled:opacity-50 disabled:cursor-not-allowed
                ${disabled ? 'text-muted-foreground' : 'text-violet-500'}`}
      title="Select Idio symbol"
    >
      {symbols.map(symbol => (
        <option key={symbol} value={symbol}>
          {symbol}
        </option>
      ))}
    </select>
  )
} 