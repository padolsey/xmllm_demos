import { stream, simple, xmllm, configure, ClientProvider } from 'xmllm/client'
import { useErrorStore } from '@/stores/errorStore'

// Create a client provider instance
export const clientProvider = new ClientProvider(
  process.env.NODE_ENV === 'development' ?
    'http://localhost:3124/api/stream' :
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
      genericFailure: "<error>GENERIC_FAILURE</error>",
      rateLimitExceeded: "<error>RATE_LIMIT_EXCEEDED</error>",
      invalidRequest: "<error>INVALID_REQUEST</error>",
      authenticationFailed: "<error>AUTHENTICATION_FAILED</error>",
      resourceNotFound: "<error>RESOURCE_NOT_FOUND</error>",
      serviceUnavailable: "<error>SERVICE_UNAVAILABLE</error>",
      networkError: "<error>NETWORK_ERROR</error>",
      unexpectedError: "<error>UNEXPECTED_ERROR</error>"
    }
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
