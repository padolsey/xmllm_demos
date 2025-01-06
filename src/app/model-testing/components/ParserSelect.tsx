import type { ModelTestConfig, ParserType, IdioSymbol } from '../types'

interface ParserSelectProps {
  parser: ParserType
  idioSymbol: IdioSymbol
  onChange: (updates: { parser: ParserType; idioSymbol?: IdioSymbol }) => void
}

export function ParserSelect({ parser, idioSymbol, onChange }: ParserSelectProps) {
  const options = [
    { value: 'xml', label: 'XML' },
    { value: 'idio-⁂', label: 'Idio | ⁂' },
    { value: 'idio-$', label: 'Idio | $' },
    { value: 'idio-%', label: 'Idio | %' }
  ]
  
  const currentValue = parser === 'xml' ? 'xml' : `idio-${idioSymbol}`
  
  return (
    <select
      value={currentValue}
      onChange={(e) => {
        const [parser, symbol] = e.target.value.split('-') as [ParserType, IdioSymbol?]
        onChange({ 
          parser,
          idioSymbol: symbol
        })
      }}
      className={`px-2 py-1 text-xs rounded-md border border-border bg-background
                focus:border-primary focus:ring-1 focus:ring-primary
                ${parser === 'idio' ? 'text-violet-500' : 'text-muted-foreground'}`}
      title="Select parser type and symbol"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
} 