'use client'

import { useState } from 'react'
import { IdeaConfig } from '../types'
import { Beaker, FlaskConical, Sparkles } from 'lucide-react'

interface IdeaConfigSectionProps {
  config: IdeaConfig
  setConfig: (config: IdeaConfig) => void
  disabled?: boolean
}

export default function IdeaConfigSection({
  config,
  setConfig,
  disabled
}: IdeaConfigSectionProps) {
  const [inputValue, setInputValue] = useState('')
  const [reasoningInput, setReasoningInput] = useState('')
  const [showReasoning, setShowReasoning] = useState(false)

  const handleAddIdea = () => {
    if (inputValue.trim()) {
      setConfig({
        ...config,
        initialIdeas: [...config.initialIdeas, {
          content: inputValue.trim(),
          reasoning: reasoningInput.trim() || 'Manually entered idea'
        }]
      })
      setInputValue('')
      setReasoningInput('')
      setShowReasoning(false)
    }
  }

  const handleRemoveIdea = (index: number) => {
    setConfig({
      ...config,
      initialIdeas: config.initialIdeas.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg">Generated Solutions</h2>

      <div className="space-y-2">
        {config.initialIdeas.map((idea, index) => (
          <div key={index} className="relative group">
            <div className="p-3 bg-[hsl(var(--idea-bg))] rounded-lg border border-[hsl(var(--idea-border))]">
              <div className="flex items-start gap-2">
                <span className="flex-1 text-sm">{idea.content}</span>
                <button
                  onClick={() => handleRemoveIdea(index)}
                  disabled={disabled}
                  className="opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  ×
                </button>
              </div>
              {idea.reasoning && (
                <div className="text-xs opacity-70 mt-1 pl-4 border-l border-[hsl(var(--idea-border))]">
                  {idea.reasoning}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground mb-2 font-mono flex items-center gap-2">
          <Beaker className="w-4 h-4" />
          Add Custom Solution:
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (showReasoning) {
                    handleAddIdea()
                  } else {
                    setShowReasoning(true)
                  }
                }
              }}
              disabled={disabled}
              placeholder="Enter custom solution..."
              className="flex-1 px-3 py-2 bg-background rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {!showReasoning ? (
              <button
                onClick={() => setShowReasoning(true)}
                disabled={disabled || !inputValue.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Next
              </button>
            ) : (
              <button
                onClick={handleAddIdea}
                disabled={disabled || !inputValue.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            )}
          </div>

          {showReasoning && (
            <div className="space-y-2">
              <textarea
                value={reasoningInput}
                onChange={e => setReasoningInput(e.target.value)}
                placeholder="Document your reasoning (optional)..."
                className="w-full px-3 py-2 bg-background rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 