export const MODELS = [
  'openrouter:openai/gpt-oss-120b:nitro',
  'openrouter:openai/gpt-oss-20b:nitro',
  'openrouter:openai/gpt-4o-mini',
  'openrouter:meta-llama/llama-3.3-70b-instruct'
]

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}