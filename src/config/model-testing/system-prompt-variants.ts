export type SystemPromptVariant = {
  id: string;
  name: string;
  description: string;
  generateSystemPrompt: ((subSystemPrompt?: string) => string) | undefined;
};

export const SYSTEM_PROMPT_VARIANTS: SystemPromptVariant[] = [
  {
    id: 'minimal',
    name: 'Minimal XML Guide',
    description: 'Bare minimum instructions focusing on XML output requirements',
    generateSystemPrompt: (subSystemPrompt = '') => `
XML OUTPUT RULES:
You are an AI that outputs only valid XML based on given schemas. Escape XML characters in content.
Use elements over attributes unless specified. Follow schema exactly.

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`
  },
  {
    id: 'structured',
    name: 'Structured with Grammar Examples',
    description: 'Includes concrete examples for better understanding',
    generateSystemPrompt: (subSystemPrompt = '') => `
XML RESPONSE RULES:
1. Output only valid XML following the given schema
2. Example format: <name>Sarah</name> <age>25</age>
3. Use elements over attributes unless specified
4. Follow schema structure exactly

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`
  },
  {
    id: 'assertive',
    name: 'Assertive Compliance',
    description: 'More forceful instructions emphasizing strict compliance',
    generateSystemPrompt: (subSystemPrompt = '') => `
CRITICAL XML RULES:
MUST: Output only valid XML
MUST: Follow schema exactly
MUST: Escape XML chars (&lt; &gt; &amp;)
MUST: Prefer elements over attributes
MUST: Start with provided structure

${subSystemPrompt || 'You are an AI assistant and respond to the request.'}`
  },
  {
    id: 'default',
    name: 'Default XMLLM',
    description: 'Original XMLLM system prompt',
    generateSystemPrompt: undefined // This will use the default XMLLM behavior
  }
]; 