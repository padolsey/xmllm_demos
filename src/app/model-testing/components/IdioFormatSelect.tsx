import React, { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { IDIO_FORMATS } from '../types'
import type { IdioFormat } from '../types'

interface IdioFormatSelectProps {
  value: IdioFormat['name']
  onChange: (value: IdioFormat['name']) => void
  disabled?: boolean
}

export function IdioFormatSelect({ value, onChange, disabled }: IdioFormatSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedFormat = IDIO_FORMATS.find(f => f.name === value)

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Idiomatic Format</div>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          disabled={disabled}
          className="w-full flex items-center justify-between px-3 py-2 text-sm 
                     bg-background border border-input rounded-md
                     hover:bg-accent hover:text-accent-foreground
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{selectedFormat?.name || 'Select format...'}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {open && (
          <div 
            className="absolute z-50 w-[400px] mt-2 p-1 bg-popover border rounded-md shadow-md
                       max-h-[320px] overflow-y-auto"
            style={{ 
              bottom: 'auto',
              background: 'var(--background)'
            }}
          >
            {IDIO_FORMATS.map((format) => (
              <div
                key={format.name}
                className="p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer
                          bg-background"
                onClick={() => {
                  onChange(format.name)
                  setOpen(false)
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{format.name}</div>
                    <div className="text-xs text-muted-foreground">{format.description}</div>
                  </div>
                  {value === format.name && <Check className="h-4 w-4" />}
                </div>
                <pre className="mt-2 p-2 text-xs bg-muted rounded overflow-x-auto">
                  {format.example}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 