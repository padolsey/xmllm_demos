import { stream, simple, xmllm, configure, ClientProvider } from 'xmllm/client'
import { useErrorStore } from '@/stores/errorStore'

// Create a client provider instance
export const clientProvider = new ClientProvider(
  process.env.NODE_ENV === 'development' ?
    'http://localhost:3124/api/stream' :
    'https://xmllm-proxy.j11y.io/api/stream'
)

const genericApology = "Sorry, tricky to run an LLM demo at scale and keep up with costs."

// Configure global defaults
configure({
  defaults: {
    temperature: 0.9,
    model: [
      'openrouter:mistralai/ministral-3b',
      'togetherai:fast',
      'openai:fast',
      'claude:fast',
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
      genericFailure: `<error>UNKNOWN_FAILURE: ${genericApology}</error>`,
      rateLimitExceeded: `<error>RATE_LIMIT_EXCEEDED: ${genericApology}</error>`,
      invalidRequest: `<error>INVALID_REQUEST: ${genericApology}</error>`,
      authenticationFailed: `<error>AUTHENTICATION_FAILED: ${genericApology}</error>`,
      resourceNotFound: `<error>RESOURCE_NOT_FOUND: ${genericApology}</error>`,
      serviceUnavailable: `<error>SERVICE_UNAVAILABLE: ${genericApology}</error>`,
      networkError: `<error>NETWORK_ERROR: ${genericApology}</error>`,
      unexpectedError: `<error>UNEXPECTED_ERROR: ${genericApology}</error>`
    }
  },
  clientProvider
})

// Re-export configured utilities
export { stream, simple, xmllm }

// Export common types
export type { 
  ModelPreference,
  ClientStreamingSchemaConfig,
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
