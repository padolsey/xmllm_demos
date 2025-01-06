'use client'

import { useState } from 'react'
import ConfigPanel from './components/ConfigPanel'
import ResultsPanel from './components/ResultsPanel'
import { AgentConfig, IdeaConfig, Idea, AgentPersona } from './types'
import { 
  pairIdeas, 
  evaluateIdeas, 
  evaluateIdeasMock, 
  generateIdeasFromProblem,
  TESTING_MODE
} from './utils/simulation'
import { personaConfigs } from './config/agents'
import PQueue from 'p-queue'
import { EvaluationResult } from './types'

const EVALUATION_DELAY = 100

export default function IdeaPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [problemStatement, setProblemStatement] = useState('')
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(
    Object.keys(personaConfigs).map(persona => ({
      id: crypto.randomUUID(),
      persona: persona as AgentPersona,
      active: persona === 'pragmatist' // Only pragmatist starts active
    }))
  )
  const [ideaConfig, setIdeaConfig] = useState<IdeaConfig>({
    problem: '',
    initialIdeas: [],
    iterations: 10,
    pairingMethod: 'random',
    allowNewIdeas: true
  })

  // Add state for tracking ideas and results
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [currentIteration, setCurrentIteration] = useState(0)
  const [evaluationHistory, setEvaluationHistory] = useState<Array<{
    iteration: number
    agent: AgentConfig
    ideaA: Idea
    ideaB: Idea
    result: EvaluationResult
  }>>([])

  const [isGenerating, setIsGenerating] = useState(false)

  const handleReset = () => {
    setAgentConfigs(Object.keys(personaConfigs).map(persona => ({
      id: crypto.randomUUID(),
      persona: persona as AgentPersona,
      active: persona === 'pragmatist'
    })))
    setIdeaConfig({
      problem: '',
      initialIdeas: [],
      iterations: 10,
      pairingMethod: 'random',
      allowNewIdeas: true
    })
    setProblemStatement('')
  }

  const handleStartSimulation = async () => {
    if (!ideaConfig.problem) {
      alert('Please enter a problem statement first')
      return
    }
    if (ideaConfig.initialIdeas.length < 2) {
      alert('Please add at least 2 initial ideas')
      return
    }

    setIsRunning(true)
    setCurrentIteration(0)
    setEvaluationHistory([])

    const initialIdeas: Idea[] = ideaConfig.initialIdeas.map((idea: { 
      content: string; 
      reasoning?: string;
      model?: string;
    }, index: number) => ({
      id: `initial-${index}`,
      content: idea.content,
      reasoning: idea.reasoning || '',
      wins: 0,
      vetos: 0,
      origin: {
        type: 'initial-generated' as const,
        model: idea.model || 'unknown'
      }
    }))
    setIdeas(initialIdeas)

    let currentIdeas = initialIdeas
    const evaluate = TESTING_MODE ? evaluateIdeasMock : evaluateIdeas
    const queue = new PQueue({ concurrency: 5 })

    try {
      for (let i = 0; i < ideaConfig.iterations; i++) {
        setCurrentIteration(i + 1)
        const pairs = pairIdeas(currentIdeas, ideaConfig.pairingMethod)
        
        // Create all evaluation tasks for this iteration
        const evaluationTasks = agentConfigs
          .filter(agent => agent.active) // Only use active agents
          .flatMap(agent =>
            pairs.map(([ideaA, ideaB]) => async () => {
              const result = await evaluate(
                agent,
                ideaConfig.problem,
                ideaA,
                ideaB,
                ideaConfig.allowNewIdeas
              )

              // Ensure result has all required properties
              const evaluationResult: EvaluationResult = {
                type: result.type,
                content: result.content,
                reasoning: result.reasoning,
                model: result.model || 'unknown'
              }

              // Use a reducer function to handle state updates
              const update = {
                type: 'EVALUATION_RESULT' as const,
                payload: {
                  iteration: i + 1,
                  agent,
                  ideaA,
                  ideaB,
                  result: evaluationResult
                }
              }
              
              // Queue state update
              setEvaluationHistory(prev => [...prev, update.payload])

              if (result.type === 'winner') {
                const winner = result.content === 'Solution A' ? ideaA : ideaB
                currentIdeas = currentIdeas.map(idea =>
                  idea.id === winner.id
                    ? { ...idea, wins: idea.wins + 1 }
                    : idea
                )
              } else if (result.type === 'new') {
                const newIdea: Idea = {
                  id: `generated-${Date.now()}-${Math.random()}`,
                  content: result.content,
                  reasoning: result.reasoning,
                  wins: 0,
                  vetos: 0,
                  origin: {
                    type: 'combination',
                    model: result.model,
                    parentIds: [ideaA.id, ideaB.id]
                  }
                }
                currentIdeas = [...currentIdeas, newIdea]
              } else if (result.type === 'veto') {
                currentIdeas = currentIdeas.map(idea =>
                  (idea.id === ideaA.id || idea.id === ideaB.id)
                    ? { ...idea, wins: Math.max(0, idea.wins - 0.5) }
                    : idea
                )
                
                currentIdeas = currentIdeas.map(idea =>
                  (idea.id === ideaA.id || idea.id === ideaB.id)
                    ? { ...idea, vetos: (idea.vetos || 0) + 1 }
                    : idea
                )
              }
              
              setIdeas([...currentIdeas])
            })
          )

        // Run all tasks for this iteration with bounded concurrency
        await Promise.all(
          evaluationTasks.map(task => queue.add(task))
        )
      }
    } catch (error) {
      console.error('Simulation error:', error)
      alert('Simulation stopped due to error: ' + (error as Error).message)
      setIdeas(initialIdeas)
      setEvaluationHistory([])
      setCurrentIteration(0)
    } finally {
      setIsRunning(false)
    }
  }

  const handleStopSimulation = () => {
    setIsRunning(false)
  }

  const handleGenerateFromProblem = async () => {
    try {
      setIsGenerating(true)
      setIdeaConfig((prev: IdeaConfig) => ({ ...prev, initialIdeas: [] }))
      
      const problemIdeas = await generateIdeasFromProblem(problemStatement, TESTING_MODE)
      setIdeaConfig((prev: IdeaConfig) => ({
        ...prev,
        problem: problemStatement,
        initialIdeas: problemIdeas.map(idea => ({
          content: idea.content,
          reasoning: idea.reasoning,
          vetos: 0,
          origin: { 
            type: 'initial-generated' as const,
            model: idea.model 
          }
        }))
      }))
    } catch (error) {
      alert((error as Error).message)
      console.error('Failed to generate ideas:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="idea-app bg-[hsl(var(--idea-bg))] text-[hsl(var(--idea-text))] p-8">
      <div className="grid grid-cols-[400px,1fr] gap-8">
        <ConfigPanel
          agentConfigs={agentConfigs}
          setAgentConfigs={setAgentConfigs}
          ideaConfig={ideaConfig}
          setIdeaConfig={setIdeaConfig}
          isRunning={isRunning}
          onStart={handleStartSimulation}
          onStop={handleStopSimulation}
          testingMode={TESTING_MODE}
          problemStatement={problemStatement}
          setProblemStatement={setProblemStatement}
          handleGenerateFromProblem={handleGenerateFromProblem}
          disabled={isRunning}
          isGenerating={isGenerating}
        />
        <ResultsPanel 
          isRunning={isRunning}
          currentIteration={currentIteration}
          totalIterations={ideaConfig.iterations}
          ideas={ideas}
          evaluationHistory={evaluationHistory}
          problem={ideaConfig.problem}
        />
      </div>
    </div>
  )
} 