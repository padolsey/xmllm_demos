import { stream, simple, xmllm, configure, ClientProvider, types } from 'xmllm/client'
import { useErrorStore } from '@/stores/errorStore'

// Create a client provider instance. Proxy URL is configurable via the
// NEXT_PUBLIC_PROXY_URL build-time env var (set on the deployment); falls back
// to the Railway-hosted proxy in prod and a local proxy in dev.
export const clientProvider = new ClientProvider(
  process.env.NEXT_PUBLIC_PROXY_URL ||
  (process.env.NODE_ENV === 'development' ?
    'http://localhost:3124/api/stream' :
    'https://proxy-production-9587.up.railway.app/api/stream')
)

const genericApology = "Sorry, tricky to run an LLM demo at scale and keep up with costs.";

// Configure global defaults
configure({
  // globalParser: 'idio',
  defaults: {
    temperature: 0.8,
    // The hosted demo proxy only carries an OpenRouter key, so default to
    // OpenRouter-served models (the old mistralai/togetherai/openai/anthropic
    // list 404s or has no key on this deployment).
    model: [
      'openrouter:openai/gpt-oss-120b:nitro',
      'openrouter:openai/gpt-4o-mini',
    ],
    maxTokens: 1500,
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
