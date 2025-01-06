import { AgentConfig, Idea, EvaluationResult } from '../../types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface EvaluationLogProps {
  history: Array<{
    iteration: number
    agent: AgentConfig
    ideaA: Idea
    ideaB: Idea
    result: EvaluationResult
  }>
  problem: string
}

export function EvaluationLog({ history, problem }: EvaluationLogProps) {
  return (
    <div className="space-y-4">
      <div className="bg-[hsl(var(--idea-bg-card))] rounded-lg">
        <div className="font-medium">Problem Statement:</div>
        <div className="text-sm text-[hsl(var(--idea-muted))]">{problem}</div>
      </div>

      <h3 className="text-sm font-medium">Evaluation History</h3>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-[hsl(var(--idea-border))] bg-[hsl(var(--idea-bg-card))] text-sm"
            >
              <div className="flex items-center justify-between text-xs text-[hsl(var(--idea-muted))] mb-2">
                <span>Iteration {entry.iteration}</span>
                <span>{entry.agent.name}</span>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-background">
                    {entry.ideaA.content}
                  </div>
                  <div className="p-2 rounded bg-background">
                    {entry.ideaB.content}
                  </div>
                </div>

                <div className={`p-2 rounded ${
                  entry.result.type === 'winner'
                    ? 'bg-primary/5 border border-primary/20'
                    : entry.result.type === 'new'
                    ? 'bg-blue-500/5 border border-blue-500/20'
                    : 'bg-red-500/5 border border-red-500/20'
                }`}>
                  <div className="font-medium">
                    {entry.result.type === 'winner' 
                      ? 'Selected Winner' 
                      : entry.result.type === 'new' 
                      ? 'New Idea'
                      : 'Veto'}
                  </div>
                  <div className="text-xs">
                    {entry.result.type === 'veto' ? 'VETOED' : entry.result.content}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {entry.result.reasoning}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 