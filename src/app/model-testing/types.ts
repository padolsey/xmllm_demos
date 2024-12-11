export type XMLLMStrategy = {
  id: 'default' | 'minimal' | 'structured' | 'assertive' | 'exemplar' | 'seed';
  name: string;
  description: string;
}

export interface ModelTestConfig {
  modelId: string;
  useHints: boolean;
  strategy: XMLLMStrategy['id'];
}

export interface TestResult {
  timestamp: number;
  config: ModelTestConfig;
  testId: string;
  rawXml: string;
  parsedJson: any;
  success: boolean | 'ongoing';
  error?: string;
  timing: {
    start: number;
    end: number;
  }
} 