export type ModelProvider = 'openai' | 'claude' | 'togetherai' | 'google' | 'openrouter'

export interface ModelConfig {
  id: string
  name: string
  input_price?: number  // Price per 1M input tokens
  output_price?: number // Price per 1M output tokens
  config: {
    inherit: ModelProvider
    name?: string
    endpoint?: string
    key?: string
  }
}

// Helper function to categorize price (using output price for categorization)
export const getPriceCategory = (price?: number): 'cheap' | 'moderate' | 'expensive' | undefined => {
  if (!price) return undefined
  if (price <= 0.30) return 'cheap'
  if (price <= 0.80) return 'moderate'
  return 'expensive'
}

export const MODEL_CONFIGS: ModelConfig[] = [
  // All models are served via OpenRouter (the hosted demo proxy only carries an
  // OpenRouter key). A spread of families/sizes for the compliance matrix.
  {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS 120B Nitro',
    input_price: 0.04,
    output_price: 0.18,
    config: { inherit: 'openrouter', name: 'openai/gpt-oss-120b:nitro' }
  },
  {
    id: 'gpt-oss-20b',
    name: 'GPT-OSS 20B Nitro',
    input_price: 0.03,
    output_price: 0.14,
    config: { inherit: 'openrouter', name: 'openai/gpt-oss-20b:nitro' }
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    input_price: 0.15,
    output_price: 0.60,
    config: { inherit: 'openrouter', name: 'openai/gpt-4o-mini' }
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    input_price: 0.12,
    output_price: 0.30,
    config: { inherit: 'openrouter', name: 'meta-llama/llama-3.3-70b-instruct' }
  },
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    input_price: 0.02,
    output_price: 0.03,
    config: { inherit: 'openrouter', name: 'meta-llama/llama-3.1-8b-instruct' }
  },
  {
    id: 'mistral-nemo',
    name: 'Mistral Nemo',
    input_price: 0.03,
    output_price: 0.05,
    config: { inherit: 'openrouter', name: 'mistralai/mistral-nemo' }
  }
];

