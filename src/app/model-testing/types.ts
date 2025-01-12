export type XMLLMStrategy = {
  id: 'default' | 'minimal' | 'structured' | 'assertive' | 'exemplar' | 'seed';
  name: string;
  description: string;
}

export type ParserType = 'xml' | 'idio';
export type IdioSymbol = '@' | '$' | '%' | '⁂';

export type IdioFormat = {
  name: string;
  description: string;
  config: {
    openTagPrefix: string;
    closeTagPrefix: string;
    tagOpener: string;
    tagCloser: string;
    tagSuffix: string;
  };
  example: string;
}

export const IDIO_FORMATS: IdioFormat[] = [
  {
    name: 'Classic',
    description: 'Traditional symbol-based format',
    config: {
      openTagPrefix: '@',
      closeTagPrefix: '@',
      tagOpener: 'START(',
      tagCloser: 'END(',
      tagSuffix: ')'
    },
    example: `@START(color)Red@END(color)`
  },
  {
    name: 'Arrows',
    description: 'Arrow-based XML-like format',
    config: {
      openTagPrefix: '<<<',
      closeTagPrefix: '<<<',
      tagOpener: 'START(',
      tagCloser: 'END(',
      tagSuffix: ')>>>'
    },
    example: `<<<START(color)>>>Red<<<END(color)>>>`
  },
  {
    name: 'Brackets',
    description: 'Square bracket format',
    config: {
      openTagPrefix: '[[',
      closeTagPrefix: '[[',
      tagOpener: 'BEGIN(',
      tagCloser: 'FINISH(',
      tagSuffix: ')]]'
    },
    example: `[[BEGIN(color)]]Red[[FINISH(color)]]`
  },
  {
    name: 'Sextile',
    description: 'Sextile format',
    config: {
      openTagPrefix: '⁂',
      closeTagPrefix: '⁂',
      tagOpener: 'START(',
      tagCloser: 'END(',
      tagSuffix: ')'
    },
    example: `⁂START(color)Red⁂END(color)`
  },
  {
    name: 'Simple Dollar',
    description: 'Simple $ prefix',
    config: {
      openTagPrefix: '$',
      closeTagPrefix: '$',
      tagOpener: 'START(',
      tagCloser: 'END(',
      tagSuffix: ')'
    },
    example: `$START(color)Red$END(color)`
  },
  {
    name: 'Simple Percent',
    description: 'Simple % prefix',
    config: {
      openTagPrefix: '%',
      closeTagPrefix: '%',
      tagOpener: 'START(',
      tagCloser: 'END(',
      tagSuffix: ')'
    },
    example: `%START(color)Red%END(color)`
  }
];

export interface ModelTestConfig {
  modelId: string;
  useHints: boolean;
  strategy: XMLLMStrategy['id'];
  parser: ParserType;
  idioFormat: IdioFormat['name'];
}

export interface TestResult {
  timestamp: number;
  config: ModelTestConfig;
  testId: string;
  rawXml: string;
  parsedJson: any;
  success: boolean | 'ongoing' | string;
  error?: string;
  timing: {
    start: number;
    end: number;
  }
} 