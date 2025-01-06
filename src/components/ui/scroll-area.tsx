export function ScrollArea({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`overflow-auto ${className || ''}`}>
      {children}
    </div>
  )
} 