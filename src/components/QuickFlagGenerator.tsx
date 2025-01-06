'use client'

import { useState } from 'react'
import { stream } from '@/utils/xmllm'
import { Schema } from 'xmllm/client'

const MAX_CHARS = 30

interface FlagData {
  name: string
  colors: {
    color: Array<{
      hex: string
      name: string
      meaning: string
    }>
  }
  symbol: {
    path: string
    description: string
  }
  motto: string
}

interface FlagResponse {
  flag: FlagData
}

const normalizeSvgPath = (path: string): string | null => {
  try {
    // Basic validation - must start with M and end with Z
    if (!path?.trim().startsWith('M') || !path?.trim().endsWith('Z')) {
      return null;
    }
    
    // Remove any newlines and extra spaces
    return path.replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

const generateTriangles = (colors: Array<{ hex: string }>) => {
  return colors.map((color, i) => {
    const width = 300 / colors.length; // Divide the flag width by number of colors
    const x = i * width;
    const points = `${x},0 ${x + width},0 ${x + width / 2},200`;
    return {
      points,
      color: color.hex,
      opacity: .6
    };
  });
};

export function QuickFlagGenerator() {
  const [prompt, setPrompt] = useState('')
  const [flag, setFlag] = useState<FlagData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [rawXml, setRawXml] = useState('')
  const [currentJson, setCurrentJson] = useState<any>(null)

  const generateFlag = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    setFlag(null)
    setRawXml('')
    setCurrentJson(null)

    try {
      const flagStream = stream({
        system: `You are a flag designer. You are given a prompt and you must create a unique flag for it. 
When creating the SVG path for the symbol:
- Use a 300x200 coordinate space
- Start path with 'M' and end with 'Z'
- Interesting colors only (think rainbow!)
- Keep paths simple and centered around coordinates 150,100
- Use absolute coordinates (uppercase M, L, etc.)
- Example good path: "M 100,100 L 200,100 L 150,50 Z"
Give the flag name first in your response.`,
        prompt: `Create a unique flag for: ${prompt}`,
        schema: {
          flag: {
            name: String,
            colors: {
              color: [{
                hex: 'e.g. #ff0000',
                name: 'a fun color name - not boring - NOT BLACK OR WHITE',
                meaning: String
              }],
            },
            symbol: {
              path: String,
              description: String
            },
            motto: String
          }
        } as unknown as Schema,
        temperature: 0.7,
        max_tokens: 500,
        model: ['openrouter:mistralai/ministral-3b', 'togetherai:fast', 'anthropic:fast', 'openai:fast'],
        onChunk: (chunk: string) => {
          setRawXml(prev => prev + chunk)
        }
      })

      for await (const chunk of flagStream) {
        if (((chunk as unknown) as FlagResponse)?.flag) {
          setFlag(((chunk as unknown) as FlagResponse).flag)
          setCurrentJson(chunk)
        }
      }
    } catch (error) {
      console.error('Flag generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateFlag()
    }
  }

  if (flag?.colors?.color?.length) {
    flag.colors.color = flag.colors.color.filter(Boolean);
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-muted p-6 rounded-xl">
      {/* Input Area */}
      <div className="relative mb-4 max-w-md mx-auto">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder="A flag for..."
          maxLength={MAX_CHARS}
          disabled={isGenerating}
          className="w-full px-4 py-2 rounded-lg border bg-background/80
                   focus:outline-none focus:ring-2 focus:ring-primary/50
                   disabled:opacity-50"
        />
        <div className="absolute right-2 top-2 text-xs text-muted-foreground">
          {prompt.length}/{MAX_CHARS}
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Raw XML Stream */}
        <div className="border rounded-lg p-4 bg-background/80">
          <h3 className="text-sm font-medium mb-2">Incoming XML</h3>
          <pre className="text-xs whitespace-pre-wrap bg-muted/50 rounded p-2 h-[300px] overflow-auto
                          font-['GeistMono',_'Monaco',_'IBM_Plex_Mono',_'Consolas',_monospace]">
            {rawXml || (
              <div className="text-muted-foreground/70 h-full flex flex-col items-center justify-center gap-2">
                <div className="text-center">
                  <div className="mb-2 text-sm">Waiting for XML stream...</div>
                  <div className="text-xs opacity-70">
                    {'<flag>'}
                    <br />
                    {'  <name>Your flag name...</name>'}
                    <br />
                    {'  <colors>...'}
                    <br />
                    {'</flag>'}
                  </div>
                </div>
              </div>
            )}
          </pre>
        </div>

        {/* JSON Representation */}
        <div className="border rounded-lg p-4 bg-background/80">
          <h3 className="text-sm font-medium mb-2">Parsed JSON</h3>
          <pre className="text-xs whitespace-pre-wrap bg-muted/50 rounded p-2 h-[300px] overflow-auto
                          font-['GeistMono',_'Monaco',_'IBM_Plex_Mono',_'Consolas',_monospace]">
            {currentJson ? JSON.stringify(currentJson, null, 2) : (
              <div className="text-muted-foreground/70 h-full flex flex-col items-center justify-center gap-2">
                <div className="text-center">
                  <div className="mb-2 text-sm">Waiting for parsed data...</div>
                  <div className="text-xs opacity-70">
                    {'{'}
                    <br />
                    {'  "flag": {'}
                    <br />
                    {'    "name": "...",'}
                    <br />
                    {'    "colors": [...]'}
                    <br />
                    {'  }'}
                    <br />
                    {'}'}
                  </div>
                </div>
              </div>
            )}
          </pre>
        </div>

        {/* Flag Display */}
        <div className="border rounded-lg p-4 bg-background/80">
          <h3 className="text-sm font-medium mb-2">Live Preview</h3>
          <div className="space-y-3">
            {/* Flag name at top */}
            {flag?.name && (
              <h3 className="font-semibold text-lg animate-[fadeIn_0.5s_ease-out]">
                {flag.name}
              </h3>
            )}
            
            {/* Flag visualization */}
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden border">
              {isGenerating ? (
                <div className="absolute inset-0">
                  {/* Shimmer background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted 
                                animate-[shimmer_2s_infinite]" />
                  
                  {/* Loading text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-muted-foreground/80 text-sm mb-2">
                      {flag?.name ? (
                        <span className="animate-[fadeIn_0.5s_ease-out]">{flag.name}</span>
                      ) : (
                        <span className="animate-pulse">Designing flag...</span>
                      )}
                    </div>
                    {/* Loading spinner */}
                    <div className="h-4 w-4 border-2 border-primary/30 border-t-primary 
                                  rounded-full animate-spin" />
                  </div>
                </div>
              ) : flag ? (
                <>
                  {/* Replace the gradient background with triangular patterns */}
                  <div 
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      background: flag.colors?.color?.length > 0
                        ? `linear-gradient(135deg, 
                            ${flag.colors.color[0].hex} 0%, 
                            ${flag.colors.color[0].hex} 35%, 
                            ${flag.colors.color.map((c, i) => 
                              `${c.hex} ${35 + (i * 30)}%, ${c.hex} ${35 + ((i + 1) * 30)}%`
                            ).join(', ')}
                          )`
                        : undefined
                    }}
                  >
                    <svg 
                      viewBox="0 0 300 200" 
                      className="absolute inset-0 w-full h-full"
                    >
                      {flag.colors?.color && generateTriangles(flag.colors.color).map((triangle, i) => (
                        <polygon
                          key={i}
                          points={triangle.points}
                          fill={triangle.color}
                          opacity={triangle.opacity}
                        />
                      ))}
                    </svg>
                  </div>
                  
                  {/* Symbol */}
                  {flag?.symbol?.path && (
                    <svg 
                      viewBox="0 0 300 200" 
                      className="absolute inset-0 w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Optional background for better visibility */}
                      <rect 
                        x="0" y="0" width="300" height="200" 
                        fill="none" 
                      />
                      
                      {/* Center and scale the path */}
                      <g transform="translate(30, 20) scale(0.8)">
                        {(normalizedPath => 
                          normalizedPath ? (
                            <>
                              <path
                                d={normalizedPath}
                                fill="none"
                                stroke="rgba(0,0,0,0.1)"
                                strokeWidth="9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="animate-[draw_2s_ease-out_forwards]"
                                style={{
                                  strokeDasharray: 1000,
                                  strokeDashoffset: 1000
                                }}
                              />
                              <path
                                d={normalizedPath}
                                fill="none"
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="animate-[draw_2s_ease-out_forwards]"
                                style={{
                                  strokeDasharray: 1000,
                                  strokeDashoffset: 1000
                                }}
                              />
                            </>
                          ) : (
                            <circle 
                              cx="150" cy="100" r="50" 
                              fill="none" 
                              stroke="rgba(255,255,255,0.8)" 
                              strokeWidth="3"
                            />
                          )
                        )(normalizeSvgPath(flag.symbol.path))}
                      </g>
                    </svg>
                  )}

                  {/* Motto */}
                  {flag.motto && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-left
                                  max-h-[80%] flex flex-col justify-center
                                  text-xl md:text-2xl font-semibold tracking-wide">
                      {flag.motto.split(' ').map((word, i) => (
                        <strong 
                          key={i}
                          className="text-white mix-blend-overlay leading-tight"
                          style={{
                            fontSize: `clamp(1rem, ${Math.min(
                              24 / Math.max(flag.motto.split(' ').length, 1),
                              400 / Math.max(flag.motto.length, 1)
                            )}px, 2rem)`,
                            textShadow: `
                              0 1px 5px rgba(0,0,0,0.3)
                            `
                          }}
                        >
                          {word}
                        </strong>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <div className="mb-2">Enter a prompt to generate a flag</div>
                    <div className="text-xs text-slate-400">Try e.g. "space pirates"</div>
                  </div>
                </div>
              )}
            </div>

            {/* Colors and description below flag but within preview box */}
            {flag && (
              <div className="space-y-2 text-sm animate-[fadeIn_0.5s_ease-out]">
                <div className="flex flex-wrap gap-2">
                  {flag?.colors?.color.map((color, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {flag?.symbol?.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}