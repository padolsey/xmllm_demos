'use client'

import { useState } from 'react'
import { stream } from '@/utils/xmllm'
import { useError } from '@/contexts/ErrorContext'
import { ColorThemeCard } from '@/components/ColorThemeCard'
import { colorThemeSchema } from '@/config/schemas/colorTheme'
import type { ColorTheme } from '@/components/ColorThemeCard'

const systemPrompt = `You are a creative color theorist and theme designer who creates unique, evocative color palettes. 
Each theme should have:

1. A creative, memorable name that captures the mood (e.g. "Whispered Dawn", "Digital Jungle", "Cosmic Melancholy")
2. A primary color that anchors the theme
3. Three complementary colors that work harmoniously
4. A short poetic description of the mood/feeling
5. Three suggested use cases or contexts
6. A season or time of day it best represents
7. A texture or pattern suggestion that complements the colors

Create themes that tell a story and evoke specific emotions or environments.`

export default function ColorsPage() {
  const { showError } = useError()
  const [isGenerating, setIsGenerating] = useState(false)
  const [themes, setThemes] = useState<ColorTheme[]>([])
  const [loadingProgress, setLoadingProgress] = useState(0)

  const generateThemes = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    setThemes([])

    let loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const theStream = stream({
        prompt: "Generate 4 unique and creative color themes",
        system: systemPrompt,
        schema: colorThemeSchema,
        temperature: 0.9,
        max_tokens: 2000,
        mode: 'state_open'
      }, {}) as AsyncIterable<{themes?: {theme: ColorTheme[]}}>

      for await (const chunk of theStream) {
        if (chunk?.themes?.theme) {
          setThemes(chunk.themes.theme)
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      showError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      clearInterval(loadingInterval)
      setIsGenerating(false)
      setLoadingProgress(100)
    }
  }

  return (
    <div className="bg-zinc-100 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl font-bold uppercase tracking-tight mb-4
                       [text-shadow:4px_4px_0_#000] text-white
                       relative z-10">
            Color Theme Generator
          </h1>
          <div className="absolute inset-0 bg-black -rotate-1 -z-10" />
          <p className="text-lg max-w-2xl mx-auto mt-8 bg-black text-white p-4
                     rotate-[0.5deg]">
            Generate unique color themes with attitude. 
            <br />
            <span className="opacity-70">
              Each theme tells its own story.
            </span>
          </p>
        </div>

        {/* Generate Button */}
        <div className="mb-16 text-center">
          <button
            onClick={generateThemes}
            disabled={isGenerating}
            className="px-8 py-3 bg-black text-white uppercase tracking-widest
                     hover:rotate-1 active:-rotate-1 transition-transform
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border-4 border-dashed hover:border-solid"
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE THEMES'}
          </button>
        </div>

        {/* Loading Progress */}
        {isGenerating && themes.length === 0 && (
          <div className="max-w-md mx-auto mb-16">
            <div className="h-4 bg-black">
              <div 
                className="h-full bg-white transition-all duration-300 ease-out
                         relative overflow-hidden"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,.1)_50%,transparent_75%,transparent_100%)] 
                             bg-[length:20px_20px] animate-[move_1s_linear_infinite]" />
              </div>
            </div>
            <p className="text-center font-mono mt-4 animate-pulse uppercase">
              Crafting color harmonies...
            </p>
          </div>
        )}

        {/* Themes Grid */}
        <div className="grid grid-cols-1 gap-16">
          {themes.map((theme, index) => (
            <ColorThemeCard 
              key={index} 
              theme={theme}
              delay={index * 200}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 