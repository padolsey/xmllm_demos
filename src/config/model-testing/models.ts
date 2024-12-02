export type ModelProvider = 'openai' | 'claude' | 'togetherai' | 'google' | 'perplexityai'

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
  // Anthropic Models
  {
    id: 'claude3-haiku',
    name: 'Claude 3 Haiku',
    input_price: 0.25, // Price per 1M input tokens
    output_price: 1.25, // Price per 1M output tokens
    config: {
      inherit: 'claude',
      name: 'claude-3-haiku-20240307'
    }
  },
  {
    id: 'claude3-sonnet',
    name: 'Claude 3 Sonnet',
    input_price: 3.00, // Price per 1M input tokens
    output_price: 15.00, // Price per 1M output tokens
    config: {
      inherit: 'claude',
      name: 'claude-3-sonnet-20240229'
    }
  },
  {
    id: 'claude3-opus',
    name: 'Claude 3.5 Sonnet',
    input_price: 15.00, // Price per 1M input tokens
    output_price: 75.00, // Price per 1M output tokens
    config: {
      inherit: 'claude',
      name: 'claude-3-5-sonnet-20240620'
    }
  },

  // OpenAI Models
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    input_price: 0.15, // Price per 1M input tokens
    output_price: 0.60, // Price per 1M output tokens
    config: {
      inherit: 'openai',
      name: 'gpt-4o-mini'
    }
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    input_price: 5.00, // Price per 1M input tokens
    output_price: 10.00, // Price per 1M output tokens
    config: {
      inherit: 'openai',
      name: 'gpt-4o'
    }
  },

  // Together AI Models - Cheap ($0.30 or less)
  {
    id: 'typhoon-8b',
    name: 'Typhoon 1.5 8B',
    input_price: 0.18,
    output_price: 0.18,
    config: {
      inherit: 'togetherai',
      name: 'scb10x/scb10x-llama3-typhoon-v1-5-8b-instruct'
    }
  },
  {
    id: 'qwen-7b-turbo',
    name: 'Qwen 2.5 7B Turbo',
    input_price: 0.20,
    output_price: 0.20,
    config: {
      inherit: 'togetherai',
      name: 'Qwen/Qwen2.5-7B-Instruct-Turbo'
    }
  },
  {
    id: 'llama3-8b',
    name: 'Llama 3.1 8B',
    input_price: 0.18,
    output_price: 0.18,
    config: {
      inherit: 'togetherai',
      name: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'
    }
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    input_price: 0.20,
    output_price: 0.20,
    config: {
      inherit: 'togetherai',
      name: 'mistralai/Mistral-7B-Instruct-v0.1'
    }
  },
  {
    id: 'llama2-7b',
    name: 'LLaMA-2 7B Chat',
    input_price: 0.20,
    output_price: 0.20,
    config: {
      inherit: 'togetherai',
      name: 'meta-llama/Llama-2-7b-chat-hf'
    }
  },
  {
    id: 'solar-11b',
    name: 'SOLAR 11B',
    input_price: 0.30,
    output_price: 0.30,
    config: {
      inherit: 'togetherai',
      name: 'upstage/SOLAR-10.7B-Instruct-v1.0'
    }
  },

  // Together AI Models - Moderate ($0.31-$0.80)
  {
    id: 'nous-mixtral',
    name: 'Nous Hermes 2 Mixtral',
    input_price: 0.60,
    output_price: 0.60,
    config: {
      inherit: 'togetherai',
      name: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
    }
  },
  {
    id: 'codellama-34b',
    name: 'Code Llama 34B',
    input_price: 0.78,
    output_price: 0.78,
    config: {
      inherit: 'togetherai',
      name: 'codellama/CodeLlama-34b-Instruct-hf'
    }
  },
  {
    id: 'qwen-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    input_price: 0.80,
    output_price: 0.80,
    config: {
      inherit: 'togetherai',
      name: 'Qwen/Qwen2.5-Coder-32B-Instruct'
    }
  },

  // Together AI Models - Expensive (>$0.80)
  {
    id: 'llama3-70b',
    name: 'Llama 3.1 70B',
    input_price: 0.88,
    output_price: 0.88,
    config: {
      inherit: 'togetherai',
      name: 'meta-llama/Meta-Llama-3.1-70B-Instruct'
    }
  },
  {
    id: 'qwen-72b-turbo',
    name: 'Qwen 2.5 72B Turbo',
    input_price: 1.20,
    output_price: 1.20,
    config: {
      inherit: 'togetherai',
      name: 'Qwen/Qwen2.5-72B-Instruct-Turbo'
    }
  },
  {
    id: 'qwq-32b',
    name: 'Qwen QwQ 32B',
    input_price: 1.20,
    output_price: 1.20,
    config: {
      inherit: 'togetherai',
      name: 'Qwen/QwQ-32B-Preview'
    }
  },

  // Perplexity AI Models
  {
    id: 'sonar-small',
    name: 'Llama 3.1 Sonar Small',
    input_price: 0.20,
    output_price: 0.20,
    config: {
      inherit: 'perplexityai',
      name: 'llama-3.1-sonar-small-128k-chat'
    }
  },
  {
    id: 'sonar-large',
    name: 'Llama 3.1 Sonar Large',
    input_price: 1.00,
    output_price: 1.00,
    config: {
      inherit: 'perplexityai',
      name: 'llama-3.1-sonar-large-128k-chat'
    }
  }
];

