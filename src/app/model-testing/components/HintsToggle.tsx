interface HintsToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function HintsToggle({ enabled, onChange }: HintsToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`p-1 rounded-md ${enabled ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
      title="Toggle hints"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </button>
  )
} 