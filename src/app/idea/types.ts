export type AgentPersona = 
  | 'skeptic'
  | 'innovator'
  | 'pragmatist'
  | 'ethicist'
  | 'technologist'
  | 'environmentalist'
  | 'accessibility'
  | 'educator'

export interface AgentConfig {
  id: string
  persona?: AgentPersona
  active?: boolean
  name?: string
  type?: 'default' | 'custom'
}

export interface IdeaConfig {
  problem: string
  initialIdeas: Array<{
    content: string
    reasoning?: string  // Optional for manually entered ideas
  }>
  iterations: number
  pairingMethod: 'random' | 'tournament' | 'round-robin'
  allowNewIdeas: boolean
}

export type IdeaOrigin = 
  | { type: 'initial-generated'; model: string }
  | { type: 'manual' }
  | { type: 'combination'; model: string; parentIds: string[] }

export interface Idea {
  id: string
  content: string
  reasoning: string
  wins: number
  vetos: number
  model?: string
  origin: IdeaOrigin
}

export type EvaluationResult = {
  type: 'winner' | 'new' | 'veto'
  content: string
  reasoning: string
  model: string
} 