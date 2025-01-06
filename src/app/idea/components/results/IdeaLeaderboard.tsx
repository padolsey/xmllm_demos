import { useState } from 'react'
import { Idea, IdeaOrigin } from '../../types'
import { Trophy } from 'lucide-react'

interface IdeaLeaderboardProps {
  ideas: Idea[]
}

export function IdeaLeaderboard({ ideas }: IdeaLeaderboardProps) {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const sortedIdeas = [...ideas].sort((a, b) => b.wins - a.wins)

  function getOriginLabel(origin: IdeaOrigin): string {
    switch (origin.type) {
      case 'initial-generated':
        return `AI Generated (${origin.model})`
      case 'manual':
        return 'Manually Added'
      case 'combination':
        return `Combined Solution (${origin.model})`
    }
  }

  function getParentIdeas(parentIds: string[]): Idea[] {
    return ideas.filter(idea => parentIds.includes(idea.id))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Trophy className="w-4 h-4" />
        Top Ideas
      </h3>

      <div className="space-y-2">
        {sortedIdeas.map((idea, index) => (
          <div key={idea.id}>
            <div
              className={`p-3 rounded-lg border ${
                index === 0
                  ? 'bg-[hsl(var(--idea-bg-card))] border-[hsl(var(--idea-accent))] shadow-[0_2px_10px_hsl(var(--idea-accent)/20)]'
                  : 'bg-[hsl(var(--idea-bg-card))] border-[hsl(var(--idea-border))]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium">{idea.content}</div>
                  <div className="text-xs text-muted-foreground mt-1 mb-2">
                    {idea.reasoning}
                  </div>
                  <div className="text-xs text-[hsl(var(--idea-muted))]">
                    {getOriginLabel(idea.origin)}
                    {idea.origin.type === 'combination' && (
                      <button 
                        onClick={() => setSelectedParentId(selectedParentId === idea.id ? null : idea.id)}
                        className="ml-2 underline"
                      >
                        {selectedParentId === idea.id ? 'Hide Parents' : 'View Parents'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium whitespace-nowrap">
                  {idea.wins} win{idea.wins !== 1 ? 's' : ''}
                  {idea.vetos && idea.vetos > 0 && (
                    <span className="text-red-500 ml-2">
                      ({idea.vetos} veto{idea.vetos !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Show parent ideas if selected */}
            {selectedParentId === idea.id && idea.origin.type === 'combination' && (
              <div className="mt-2 ml-4 space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Parent Ideas:</div>
                {getParentIdeas(idea.origin.parentIds).map(parent => (
                  <div key={parent.id} className="p-2 rounded bg-muted/50 text-sm">
                    {parent.content}
                    <div className="text-xs text-muted-foreground mt-1">
                      {getOriginLabel(parent.origin)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 