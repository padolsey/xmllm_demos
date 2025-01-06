import { AgentConfig, EvaluationResult, Idea } from '../types'
import { stream } from '@/utils/xmllm'
import { personaConfigs } from '../config/agents'
import { MODELS, shuffle } from './models'
export const TESTING_MODE = false

// Schema for agent responses
const agentResponseSchema = {
  response: {
    $type: String, // 'winner', 'new', or 'veto'
    content: String,
    reasoning: String
  }
} as const

// Schema for problem-based idea generation
const problemIdeasSchema = {
  ideas: {
    idea: [{
      content: String,
      reasoning: String
    }]
  }
} as const

// Generate a prompt based on agent type
function getPrompt(agent: AgentConfig, problem: string, ideaA: Idea, ideaB: Idea) {
  console.log('ideaA', ideaA)
  console.log('ideaB', ideaB)
  const basePrompt = `Given this problem:
"${problem}"

Compare these two proposed solutions:

Solution A: "${ideaA.content}"
Context for A: "${ideaA.reasoning}"

Solution B: "${ideaB.content}"
Context for B: "${ideaB.reasoning}"

Consider how well each solution addresses the core problem. You have three options:

1. Choose the better solution. Better here means: SPECIFICALLY addresses the problem, and is not bland or tepid. This may include novel or lateral thinking. It may not be obvious. And that's okay. RED-FLAGS/Anti-signals are ideas that include needless buzzwords or fanciful platitudes like "this innovated multifaceted solution is [etc. etc.]"
2. Propose a new solution that better addresses the problem
3. Veto both solutions if you believe neither adequately addresses the problem AND you don't have enough context/desire to propose a better solution

Respond with one of these formats:

<response type="winner">
  <reasoning>Provide a detailed explanation of why this solution better addresses the problem. Consider:
  - How effectively it solves the core problem
  - Its feasibility and implementation challenges
  - Potential side effects or drawbacks
  Include specific strengths of the chosen solution and weaknesses of the other.</reasoning>
  <content>Solution A</content>
</response>

OR

<response type="new">
  <reasoning>Explain why neither existing solution is adequate, then explain how your new solution better addresses the core problem. Detail:
  - How it improves upon the existing solutions
  - Why it's a more effective approach to the problem
  - How it addresses any weaknesses in the original solutions</reasoning>
  <content>
    Your new solution here...
    PLEASE AVOID solutions that are bland, obvious, generic. I.e. you should bias towards high specificity and directness to the problem.
  </content>
</response>

OR

<response type="veto">
  <reasoning>Explain specifically why both solutions are inadequate AND why you cannot propose a better solution. Consider:
  - What critical aspects of the problem are not being addressed?
  - What additional context or constraints would be needed?
  - Why is the problem scope potentially too broad or unclear?</reasoning>
  <content>VETO</content>
</response>`

  const { prompt } = personaConfigs[agent.persona || 'pragmatist']
  return `${basePrompt}\n\n${prompt}`
}

// Pair ideas using different methods
export function pairIdeas(ideas: Idea[], method: 'random' | 'tournament' | 'round-robin'): [Idea, Idea][] {
  switch (method) {
    case 'random':
      return pairRandomly(ideas)
    case 'tournament':
      return pairTournament(ideas)
    case 'round-robin':
      return pairRoundRobin(ideas)
    default:
      return pairRandomly(ideas)
  }
}

function pairRandomly(ideas: Idea[]): [Idea, Idea][] {
  const shuffled = [...ideas].sort(() => Math.random() - 0.5)
  const pairs: [Idea, Idea][] = []
  
  for (let i = 0; i < shuffled.length - 1; i += 2) {
    if (shuffled[i + 1]) {
      pairs.push([shuffled[i], shuffled[i + 1]])
    }
  }
  
  return pairs
}

function pairTournament(ideas: Idea[]): [Idea, Idea][] {
  // Sort by wins and pair adjacent ideas
  const sorted = [...ideas].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
  return pairRandomly(sorted)
}

function pairRoundRobin(ideas: Idea[]): [Idea, Idea][] {
  // For now, just return random pairs
  // TODO: Implement proper round-robin pairing
  return pairRandomly(ideas)
}

// Evaluate a pair of ideas using an agent
export async function evaluateIdeas(
  agent: AgentConfig,
  problem: string,
  ideaA: Idea,
  ideaB: Idea,
  allowNewIdeas: boolean
): Promise<EvaluationResult> {
  const selectedModels = shuffle([...MODELS]);
  try {
    const result = await stream(
      getPrompt(agent, problem, ideaA, ideaB),
      {
        schema: agentResponseSchema,
        model: selectedModels as any,
        max_tokens: 1000
      }
    ).last() as unknown as any

    console.log('result>>>>>>>', result)

    if (!result?.response) {
      throw new Error('Invalid response from API')
    }

    const response = result.response
    
    if (!allowNewIdeas && response.$type === 'new') {
      return {
        type: 'winner',
        content: Math.random() > 0.5 ? 'Idea A' : 'Idea B',
        reasoning: 'Forced winner selection (new ideas not allowed)',
        model: selectedModels[0]
      }
    }

    return {
      type: response.$type,
      content: response.content,
      reasoning: response.reasoning,
      model: selectedModels[0]
    }
  } catch (error: any) {
    // Log the specific error for debugging
    console.error('Evaluation error:', error)
    
    // Always throw to halt the simulation
    throw new Error(
      `API Error: ${error?.message}. ` +
      'Please enable testing mode or check API configuration.'
    )
  }
}

// Mock data generator for testing
export function getMockResponse(
  agent: AgentConfig,
  problem: string,
  ideaA: Idea,
  ideaB: Idea,
  allowNewIdeas: boolean
): Promise<EvaluationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (allowNewIdeas && Math.random() < 0.3) {
        resolve({
          type: 'new',
          content: `Combined idea: ${ideaA.content?.split(' ').slice(0, 2).join(' ')} meets ${ideaB.content?.split(' ').slice(-2).join(' ')}`,
          reasoning: `As a ${agent.persona}, I see that combining these ideas better addresses the problem of "${problem}" because...`,
          model: 'mock-model'
        })
      } else {
        const preferA = Math.random() < 0.5
        resolve({
          type: 'winner',
          content: preferA ? 'Solution A' : 'Solution B',
          reasoning: `As a ${agent.persona}, I believe this solution better addresses the problem of "${problem}" because...`,
          model: 'mock-model'
        })
      }
    }, 500)
  })
}

// Replace the evaluateIdeas function with this during testing
export const evaluateIdeasMock = getMockResponse

// Generate ideas from a problem statement
export async function generateIdeasFromProblem(
  problem: string, 
  testingMode = false
): Promise<Array<{ content: string, reasoning: string, model: string }>> {
  const selectedModels = shuffle([...MODELS])
  const prompt = `Generate 5 innovative and specific solutions for the following problem:
Problem: "${problem}"

For each solution:
1. Think deeply about the problem's root causes
2. Consider different angles and approaches
3. Propose a concrete, implementable solution
4. Explain why this solution would be effective

Respond with:
<ideas>
  <idea>
    <reasoning>First, explain in detail why this solution would work...</reasoning>
    <content>Then, clearly state the solution...</content>
  </idea>
  <!-- Repeat for all 5 ideas -->
</ideas>`

  const result = await stream(prompt, {
    schema: problemIdeasSchema,
    model: selectedModels as any,
    max_tokens: 1000
  }).last() as unknown as any

  if (!result?.ideas?.idea) {
    throw new Error('Failed to generate ideas')
  }

  return result.ideas.idea.map((idea: any) => ({
    ...idea,
    model: selectedModels[0] // Track which model generated this idea
  }))
}