'use client'

import { useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { xmllm, stream, simple, types } from '@/utils/xmllm'
import { useTheme } from '../theme-provider'

const DEFAULT_MODEL = ['togetherai:fast', 'openrouter:mistralai/ministral-3b']

// Just store the example code strings
const tests = {
  pipeline: {
    name: 'Pipeline: State Tracking',
    description: 'Track and analyze colors as they arrive using pipelines',
    code: `const colorTracker = xmllm(({ prompt }) => [
  // Get initial response
  prompt({
    messages: [{
      role: 'user',
      content: 'List three colors'
    }],
    schema: {
      colors: { color: [String] }
    },
    model: DEFAULT_MODEL
  }),

  function*(incoming) {
    const seen = new Set();
    
    // Process incoming colors if they exist
    if (incoming?.colors?.color) {
      const newColors = incoming.colors.color
        .filter(c => !seen.has(c));
      
      newColors.forEach(c => seen.add(c));
      
      yield {
        colors: newColors,
        total: seen.size
      };
    }
  }
]);

for await (const update of colorTracker) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  },

  sequentialAnalysis: {
    name: 'Sequential: Scientist Analysis',
    description: 'Chain multiple prompts to analyze a scientist and their work',
    code: `const analysis = xmllm(({ prompt, promptClosed }) => [
  // First prompt gets a scientist
  promptClosed('Name a scientist', {
    scientist: {
      name: String,
      field: String
    }
  }, {
    model: DEFAULT_MODEL
  }),

  promptClosed((incoming) => {
    this.scientist = incoming.scientist;
    return {
      messages: [{
        role: 'user',
        content: \`What was \${incoming.scientist.name}'s biggest discovery?\`,
      }],
      schema: {
        discovery: {
          year: Number,
          description: String
        }
      },
      model: DEFAULT_MODEL
    };
  }),

  // Combine results
  ({discovery}) => {
    return {
      scientist: this.scientist,
      discovery
    };
  }
],);

for await (const update of analysis) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  },

  streamingThoughts: {
    name: 'Stream Individual Thoughts',
    description: 'Process complete thoughts one at a time as they arrive',
    code: `const storyStream = stream('Write a story with <scene>...</scene> tags', {
  model: DEFAULT_MODEL,
  mode: 'state_open',  // Shows growing state including partials
  schema: {
    scene: [String]
  }
});

for await (const update of storyStream) {
  setOutput(JSON.stringify(update, null, 2));
}`
  },

  tweetAnalysis: {
    name: 'State (Closed) Mode',
    description: 'See complete state updates',
    code: `const analysis = await stream({
  prompt: 'Analyze this tweet: "Just saw the sweetest puppy!"',
  model: DEFAULT_MODEL,
  mode: 'state_closed',  // Shows complete state at each point
  schema: {
    sentiment: String,
    topics: [String],
    insights: [{
      point: String,
      reasoning: String,
      confidence: Number
    }]
  }
}).last();

setOutput(JSON.stringify(analysis, null, 2));`
  },

  nestedSelectors: {
    name: 'Advanced XML Navigation',
    description: 'Complex selectors and attribute filtering',
    code: `const baseStream = stream(\`List books by genre:
  <shelf category="fiction">
    <book><title>___</title>
    <author>___</author></book>
  </shelf>\`, {
  model: DEFAULT_MODEL
});

// Get fiction books specifically
const fictionBooks = await baseStream
  .select('shelf[category="fiction"] > book')
  .closedOnly()
  .map(({title, author}) => ({
    title: title[0].$$text,
    author: author[0].$$text
  }))
  .all()

setOutput(JSON.stringify(fictionBooks, null, 2));`
  },

  colorAttributes: {
    name: 'Streaming Attributes',
    description: 'Streamingstructure with RGB color attributes',
    code: `const colorStream = stream(
  'List 3 colors with RGB values:\\n' +
  '<color>\\n' +
  '  <name>purple</name>\\n' +
  '  <rgb r="128" g="0" b="128"/>\\n' +
  '</color>',
  {
    model: DEFAULT_MODEL,
    schema: {
      color: [{
        name: String,
        rgb: {
          $r: Number,
          $g: Number,
          $b: Number
        }
      }]
    }
  }
);

for await (const color of colorStream) {
  setOutput(prev => prev + JSON.stringify(color, null, 2) + '\\n');
}`
  },
  multiagentic: {
    name: 'Multiagentic Solver/Orchestration',
    description: '...',
    code: `here`
  },
  arrayOperations: {
    name: 'Array Operations',
    description: 'Test array-level transformations and validation',
    code: `const arrayTest = xmllm(({ prompt }) => [
  prompt({
    messages: [{
      role: 'user',
      content: 'Generate a list of 4 numbers between 1-10 and 2 tags for categorization'
    }],
    schema: {
      numbers: types.items(
        types.number("A number between 1-10")
          .withTransform(n => {
            if (typeof n !== 'number' || isNaN(n)) return null;
            return Math.min(10, Math.max(1, n));
          })
      )
      .withTransform(arr => {
        if (!Array.isArray(arr) || arr.length < 3 || arr.length > 5) return null;
        return arr.filter(n => n !== null).sort((a, b) => a - b);
      }),
      
      tags: types.items(
        types.string("A tag name")
          .withTransform(s => {
            if (typeof s !== 'string') return null;
            return s.toLowerCase().trim();
          })
      )
      .withDefault(['general'])
      .withTransform(arr => {
        if (!Array.isArray(arr)) return ['general'];
        return [...new Set(arr.filter(t => t !== null))];
      })
    },
    model: DEFAULT_MODEL
  })
]);

for await (const update of arrayTest) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  },

  nestedItems: {
    name: 'Nested Items Structure',
    description: 'Complex nested array structures with validation',
    code: `const orgTest = xmllm(({ prompt }) => [
  prompt({
    messages: [{
      role: 'user',
      content: 'Create an organization structure with 2 departments, each with 1-2 teams and 2-3 team members'
    }],
    schema: {
      organization: {
        departments: types.items({
          name: types.string("Department name"),
          budget: types.number("Budget in USD")
            .withTransform(n => {
              if (typeof n !== 'number' || isNaN(n)) return null;
              return Math.round(n);
            }),
          teams: types.items({
            name: types.string("Team name"),
            members: types.items({
              name: types.string("Member name"),
              role: types.enum("Role", ["LEAD", "SENIOR", "JUNIOR"]),
              skills: types.items(
                types.string("Skill name")
                  .withTransform(s => {
                    if (typeof s !== 'string') return null;
                    return s.toLowerCase();
                  })
              )
            })
            .withTransform(arr => {
              // Limit to 3 members
              if (!Array.isArray(arr)) return [];
              return arr.slice(0, 3);
            })
          })
        })
      }
    },
    model: DEFAULT_MODEL
  })
]);

for await (const update of orgTest) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  },

  cdataContent: {
    name: 'CDATA Content',
    description: 'Raw content preservation with metadata',
    code: `const cdataTest = xmllm(({ prompt }) => [
  prompt({
    messages: [{
      role: 'user',
      content: 'Generate a code snippet showing a simple React component with TypeScript props interface'
    }],
    schema: {
      document: {
        metadata: {
          format: types.enum("Format", ["HTML", "MARKDOWN", "CODE"]),
          language: types.string("Programming language if format is CODE")
            .withTransform(s => {
              // Only require language for CODE format
              if (this?.format !== 'CODE') return null;
              return typeof s === 'string' ? s : null;
            })
        },
        content: types.raw("Content in specified format")
          .withTransform(content => {
            if (!content || typeof content !== 'string') return null;
            return content.trim();
          })
      }
    },
    model: DEFAULT_MODEL
  })
]);

for await (const update of cdataTest) {
  setOutput(prev => prev + JSON.stringify(update, null, 2) + '\\n');
}`
  }
};

export default function Home() {
  const { theme } = useTheme()
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string>('pipeline')
  const [editedCode, setEditedCode] = useState<string>('')

  async function runTest() {
    setLoading(true)
    setOutput('Running test...\n')

    try {
      const code = editedCode || tests[selectedTest as keyof typeof tests].code
      const fn = new Function(
        'xmllm',
        'setOutput',
        'stream',
        'simple',
        'DEFAULT_MODEL',
        'types',
        `return (async () => {
          try {
            ${code}
          } catch (error) {
            console.error('Code execution error:', error);
            setOutput(prev => prev + '\\nError: ' + error.message);
          }
        })()
      `)

      await fn(xmllm, setOutput, stream, simple, DEFAULT_MODEL, types)
    } catch (error) {
      console.error('Test error:', error)
      setOutput(prev => prev + `\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-foreground">
      <div className="max-w-[1800px] mx-auto">
        <header className="border-b border-border pb-4 mb-8">
          <h1 className="text-3xl font-bold">Scenario Playground</h1>
          <p className="text-muted-foreground mt-2">
            Select a test scenario and view the results
          </p>
        </header>

        {/* Two column layout for larger screens */}
        <div className="lg:grid lg:grid-cols-[1fr,500px] lg:gap-8">
          {/* Left column - Test controls */}
          <div className="space-y-6">
            {/* Test Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {Object.entries(tests).map(([key, test]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTest(key)
                    setOutput('')
                  }}
                  className={`p-3 rounded-lg border transition-colors text-left ${
                    selectedTest === key 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold text-sm">{test.name}</div>
                  <div className={`text-xs mt-1 ${
                    selectedTest === key 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}>
                    {test.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Test Details */}
            {selectedTest && (
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-lg">{tests[selectedTest as keyof typeof tests].name}</h2>
                    <p className="text-muted-foreground">{tests[selectedTest as keyof typeof tests].description}</p>
                  </div>
                  <button
                    onClick={runTest}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium text-sm
                      ${loading 
                        ? 'bg-primary/50 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary/90'} 
                      text-primary-foreground transition-colors`}
                  >
                    {loading ? 'Running...' : 'Run Test'}
                  </button>
                </div>

                {/* Single Code Editor Section */}
                <div className="border border-border rounded-lg">
                  <div className="p-3 border-b border-border bg-card flex justify-between items-center">
                    <h3 className="font-bold">Code</h3>
                    <button
                      onClick={() => setEditedCode('')}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="h-[500px] overflow-auto"> 
                    <CodeMirror
                      value={editedCode || tests[selectedTest as keyof typeof tests].code}
                      height="500px"
                      theme={theme === 'dark' ? oneDark : undefined}
                      extensions={[javascript({ jsx: true })]}
                      onChange={(value) => setEditedCode(value)}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        foldGutter: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        searchKeymap: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Output */}
          <div className="mt-6 lg:mt-0 lg:sticky lg:top-8 lg:h-[calc(100vh-8rem)]">
            <div className="border border-border rounded-lg h-full flex flex-col">
              <div className="p-3 border-b border-border bg-card flex items-center justify-between">
                <h2 className="font-bold">Output</h2>
                {output && (
                  <button
                    onClick={() => setOutput('')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="bg-muted p-4 font-mono text-sm whitespace-pre-wrap rounded-b-lg flex-1 overflow-y-auto">
                {output || 'Output will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
