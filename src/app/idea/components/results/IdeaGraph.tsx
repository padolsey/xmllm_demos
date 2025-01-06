'use client'

import { Idea, EvaluationResult, AgentConfig } from '../../types'
import { Activity, GitBranch, GitMerge } from 'lucide-react'

interface IdeaGraphProps {
  ideas: Idea[]
  evaluationHistory: Array<{
    iteration: number
    agent: AgentConfig
    ideaA: Idea
    ideaB: Idea
    result: EvaluationResult
  }>
}

export function IdeaGraph({ ideas, evaluationHistory }: IdeaGraphProps) {
  // Group ideas by origin type for visualization
  const initialIdeas = ideas.filter(i => i.origin.type === 'initial-generated')
  const generatedIdeas = ideas.filter(i => i.origin.type === 'combination')

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Idea Evolution
      </h3>
      
      <div className="h-[300px] border border-border rounded-lg p-4 bg-card overflow-auto p-4 bg-[hsl(var(--idea-bg))] rounded-lg space-y-2">
        {ideas.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No ideas to visualize yet
          </div>
        ) : (
          <div className="space-y-6">
            {/* Initial Ideas Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GitBranch className="w-4 h-4" />
                Initial Ideas ({initialIdeas.length})
              </div>
              <div className="grid grid-cols-3 gap-2">
                {initialIdeas.map((idea, i) => (
                  <div 
                    key={idea.id}
                    className="p-2 text-xs bg-background rounded border border-border"
                  >
                    <div className="font-medium truncate">
                      {idea.content}
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {idea.wins} wins
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Ideas Section */}
            {generatedIdeas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GitMerge className="w-4 h-4" />
                  Combined Ideas ({generatedIdeas.length})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {generatedIdeas.map((idea) => (
                    <div 
                      key={idea.id}
                      className={`p-2 text-xs rounded border
                        ${idea.wins > 2 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-background border-border'
                        }`}
                    >
                      <div className="font-medium truncate">
                        {idea.content}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground">
                          {idea.wins} wins
                        </span>
                        {idea.origin.type === 'combination' && (
                          <button 
                            className="text-primary hover:underline"
                            title="View parent ideas"
                          >
                            Parents
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evolution Stats */}
            <div className="text-xs text-muted-foreground border-t border-border pt-4">
              <div className="flex justify-between">
                <span>Success Rate: {Math.round((generatedIdeas.filter(i => i.wins > 0).length / generatedIdeas.length) * 100)}%</span>
                <span>Average Wins: {(ideas.reduce((acc, i) => acc + i.wins, 0) / ideas.length).toFixed(1)}</span>
                <span>Top Score: {Math.max(...ideas.map(i => i.wins))}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 