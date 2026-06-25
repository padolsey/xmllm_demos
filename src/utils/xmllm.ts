import { stream, simple, xmllm, configure, ClientProvider, types } from 'xmllm/client'
import { useErrorStore } from '@/stores/errorStore'

// Create a client provider instance
export const clientProvider = new ClientProvider(
  process.env.NODE_ENV === 'development' ?
    'http://localhost:3124/api/stream' :
    'https://xmllm-proxy.j11y.io/api/stream'
)

const genericApology = "Sorry, tricky to run an LLM demo at scale and keep up with costs.";

// Configure global defaults
configure({
  // globalParser: 'idio',
  defaults: {
    temperature: 0.8,
    model: [
      'openrouter:mistralai/ministral-3b',
      'togetherai:fast',
      'openai:fast',
      'anthropic:fast',
      'togetherai:good',
    ],
    onChunk: (chunk: string) => {
      if (chunk.startsWith('<error>')) {
        const errorMessage = chunk.replace(/<\/?error>/g, '')
        const showError = useErrorStore.getState().showError
        if (showError) {
          showError(errorMessage)
        } else {
          console.error('XMLLM Error:', errorMessage)
        }
      }
    },
    errorMessages: {
      genericFailure: `<error>UNKNOWN_FAILURE: (generic) ${genericApology}</error>`,
      rateLimitExceeded: `<error>RATE_LIMIT_EXCEEDED: (rate limit) ${genericApology}</error>`,
      invalidRequest: `<error>INVALID_REQUEST: (invalid request) ${genericApology}</error>`,
      authenticationFailed: `<error>AUTHENTICATION_FAILED: (authentication) ${genericApology}</error>`,
      resourceNotFound: `<error>RESOURCE_NOT_FOUND: (resource not found) ${genericApology}</error>`,
      serviceUnavailable: `<error>SERVICE_UNAVAILABLE: (service unavailable) ${genericApology}</error>`,
      networkError: `<error>NETWORK_ERROR: (network error) ${genericApology}</error>`,
      unexpectedError: `<error>UNEXPECTED_ERROR: (unexpected error) ${genericApology}</error>`
    }
  },
  clientProvider
})

// Re-export configured utilities
export { stream, simple, xmllm, configure, types }

// Export common types
export type { 
  ModelPreference,
  ClientStreamingSchemaConfig,
  Schema,
  Hint
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
