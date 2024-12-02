export interface TestResult {
  timestamp: number
  modelId: string
  testId: string
  rawXml: string
  parsedJson: any
  success: boolean | 'ongoing'
  error?: string
  timing: {
    start: number
    end: number
  }
} 