import { stream, simple, xmllm, configure, ClientProvider } from 'xmllm/client'

// Create a client provider instance
export const clientProvider = new ClientProvider(
  // 'http://localhost:3124/api/stream',
  'https://xmllm-proxy.j11y.io/api/stream'
)

// Configure global defaults
configure({
  defaults: {
    temperature: 0.9,
    model: [
      'togetherai:good',
      'togetherai:fast',
      'openai:fast',
      'claude:fast',
    ],
  },
  clientProvider
})

// Re-export configured utilities
export { stream, simple, xmllm }

// Export common types
export type { 
  ModelPreference,
  StreamOptions,
  SchemaType,
  HintType
} from 'xmllm/client'

// Helper for common streaming patterns
export function createStream<T>(config: {
  prompt: string
  schema: any
  onChunk?: (chunk: string) => void
  transform?: (data: any) => T
}) {
  return stream({
    ...config,
    onChunk: config.onChunk,
  }, {
    clientProvider
  }).map(data => config.transform ? config.transform(data) : data)
}
