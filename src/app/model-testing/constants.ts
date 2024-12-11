import type { XMLLMStrategy } from './types'

export const XMLLM_STRATEGIES: XMLLMStrategy[] = [
  {
    id: 'default',
    name: 'Default XMLLM',
    description: 'Original balanced strategy as previously defined'
  },
  {
    id: 'minimal',
    name: 'Minimal XML Guide',
    description: 'Bare minimum instructions focusing on XML output requirements'
  },
  {
    id: 'structured',
    name: 'Structured with Grammar Examples',
    description: 'Includes concrete examples to guide the model'
  },
  {
    id: 'assertive',
    name: 'Assertive Compliance',
    description: 'More forceful instructions emphasizing strict compliance'
  },
  {
    id: 'exemplar',
    name: 'Example-Driven Guidance',
    description: 'Shows a small example to help the model understand the schema before the real request'
  },
  {
    id: 'seed',
    name: 'Seed Assistant Response',
    description: 'Forcefully hinting at code through seeding assistant response'
  }
]

export const DEFAULT_ENABLED_MODELS = ['claude3-haiku', 'sonar-small', 'gpt-4o-mini'] as const

export const MAX_CONCURRENT_TESTS = 3 