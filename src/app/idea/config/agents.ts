import { AgentPersona } from '../types'

export interface PersonaConfig {
  title: string
  description: string
  prompt: string
}

export const personaConfigs: Record<AgentPersona, PersonaConfig> = {
  skeptic: {
    title: 'Skeptical Analyst',
    description: 'Questions assumptions and identifies potential flaws',
    prompt: 'As a skeptical analyst, carefully examine potential weaknesses and challenge assumptions in the ideas.'
  },
  innovator: {
    title: 'Innovation Specialist',
    description: 'Focuses on novel and creative approaches',
    prompt: 'As an innovation specialist, look for opportunities to introduce creative and unconventional solutions.'
  },
  pragmatist: {
    title: 'Practical Implementer',
    description: 'Evaluates feasibility and practical considerations',
    prompt: 'As a practical implementer, focus on real-world feasibility and implementation challenges.'
  },
  ethicist: {
    title: 'Ethics Advocate',
    description: 'Considers moral and societal implications',
    prompt: 'As an ethics advocate, evaluate the moral implications and societal impact of these ideas.'
  },
  technologist: {
    title: 'Technology Expert',
    description: 'Focuses on technical possibilities and limitations',
    prompt: 'As a technology expert, consider the technical feasibility and potential technological solutions.'
  },
  environmentalist: {
    title: 'Sustainability Advocate',
    description: 'Evaluates environmental impact and sustainability',
    prompt: 'As a sustainability advocate, consider environmental impact and long-term sustainability.'
  },
  accessibility: {
    title: 'Accessibility Specialist',
    description: 'Ensures solutions work for everyone',
    prompt: 'As an accessibility specialist, evaluate how these ideas work for people with different abilities and needs.'
  },
  educator: {
    title: 'Education Expert',
    description: 'Focuses on learning and knowledge transfer',
    prompt: 'As an education expert, consider how these ideas facilitate learning and knowledge sharing.'
  }
} 