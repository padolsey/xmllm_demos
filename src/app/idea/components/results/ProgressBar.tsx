interface ProgressBarProps {
  current: number
  total: number
  isRunning: boolean
}

export function ProgressBar({ current, total, isRunning }: ProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="h-2 bg-[hsl(var(--idea-border))] rounded-full overflow-hidden relative">
        {isRunning && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--idea-accent))/20] to-transparent animate-scan" />
        )}
        
        <div
          className={`h-full bg-[hsl(var(--idea-accent))] transition-all duration-300 relative ${
            isRunning ? 'opacity-100' : 'opacity-70'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {isRunning && (
        <div className="font-mono text-xs text-[hsl(var(--idea-accent))] animate-pulse text-center">
          Processing iteration {current} of {total}
        </div>
      )}
    </div>
  )
} 