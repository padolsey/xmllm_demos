'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'

export function Switch({
  checked,
  onCheckedChange,
  disabled
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full 
        transition-colors duration-200 ease-in-out items-center
        ${checked ? 'bg-primary' : 'bg-muted'} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <SwitchPrimitives.Thumb
        className={`
          block h-4 w-4 rounded-full bg-background shadow-lg 
          transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-4' : 'translate-x-1'}
        `}
      />
    </SwitchPrimitives.Root>
  )
} 