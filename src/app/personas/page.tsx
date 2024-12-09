'use client'

import { useState, useRef } from 'react'
import { stream } from '@/utils/xmllm'

// Schema for political personas
const personaSchema = {
  personas: {
    persona: [{
      name: String,
      age: String,
      location: {
        city: String,
        country: String
      },
      background: {
        education: String,
        profession: String,
        economic_class: String
      },
      political_profile: {
        ideology: String,
        key_issues: {
          issue: [{
            name: String,
            stance: String
          }]
        },
        engagement_level: String
      },
      personal_traits: {
        values: String,
        communication_style: String,
        influences: String
      },
      daily_life: {
        routine: String,
        community_role: String,
        media_consumption: String
      }
    }]
  }
}

// Add this type definition after the schema
type PersonaStreamResult = {
  personas?: {
    persona: Array<{
      name: string;
      age: string;
      location: {
        city: string;
        country: string;
      };
      background: {
        education: string;
        profession: string;
        economic_class: string;
      };
      political_profile: {
        ideology: string;
        key_issues: {
          issue: Array<{
            name: string;
            stance: string;
          }>;
        };
        engagement_level: string;
      };
      personal_traits: {
        values: string;
        communication_style: string;
        influences: string;
      };
      daily_life: {
        routine: string;
        community_role: string;
        media_consumption: string;
      };
    }>;
  };
};

const systemPrompt = `You are a political anthropologist specializing in creating realistic, non-stereotypical political personas from around the world. 

For each persona, consider:

1. Personal Background
   - Create believable life circumstances
   - Avoid stereotypical associations
   - Mix unexpected elements thoughtfully

2. Political Views
   - Complex, nuanced positions
   - Show how personal experience shapes views
   - Include both local and global concerns

3. Daily Life
   - Realistic routines and community roles
   - Media consumption habits
   - Social connections and influences

4. Values & Communication
   - Personal values and their origins
   - How they engage in political discourse
   - Sources of information and trust

Generate 3-4 diverse personas that feel authentic and avoid common stereotypes. Each should feel like a real individual rather than a representative of a category.

Format as:
<personas>
  <persona>
    <name>Full Name</name>
    <age>Age</age>
    <location>
      <city>City</city>
      <country>Country</country>
    </location>
    <background>
      <education>Educational background</education>
      <profession>Current profession</profession>
      <economic_class>Economic status</economic_class>
    </background>
    <political_profile>
      <ideology>Political leanings and philosophy</ideology>
      <key_issues>
        <issue>
          <name>Issue name</name>
          <stance>Their position</stance>
        </issue>
      </key_issues>
      <engagement_level>How they engage with politics</engagement_level>
    </political_profile>
    <personal_traits>
      <values>Core personal values</values>
      <communication_style>How they discuss politics</communication_style>
      <influences>Key influences on their views</influences>
    </personal_traits>
    <daily_life>
      <routine>Daily activities</routine>
      <community_role>Role in local community</community_role>
      <media_consumption>How they get information</media_consumption>
    </daily_life>
  </persona>
</personas>`

export default function Page() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [personas, setPersonas] = useState<any[]>([])

  const generatePersonas = async () => {
    if (isGenerating) return
    
    setIsGenerating(true)
    setShowInput(false)
    setPersonas([])

    let loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const theStream = stream({
        prompt: "Generate diverse political personas from different parts of the world",
        system: systemPrompt,
        schema: personaSchema,
        temperature: 0.8,
        max_tokens: 5000,
        mode: 'state_open'
      }, {}) as AsyncIterable<PersonaStreamResult>

      for await (const chunk of theStream) {
        if (chunk?.personas?.persona) {
          setPersonas(chunk.personas.persona)
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      clearInterval(loadingInterval)
      setIsGenerating(false)
      setLoadingProgress(100)
    }
  }

  return (
    <div className="bg-background">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Political Persona Generator
          </h1>
          <p className="text-muted-foreground">
            Generate authentic political personas from around the world
          </p>
        </header>

        {/* Input Section - Fix positioning */}
        {showInput ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-full max-w-2xl space-y-6">
              <button
                onClick={generatePersonas}
                disabled={isGenerating}
                className="w-full px-8 py-3 bg-primary text-primary-foreground rounded-xl 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all 
                         duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                {isGenerating ? 'Generating...' : 'Generate Personas'}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Loading State */}
            {(isGenerating && personas.length === 0) && (
              <div className="fixed inset-0 flex flex-col items-center justify-center z-10 
                            bg-background/80 backdrop-blur-sm">
                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="mt-4 text-muted-foreground animate-pulse">
                  Generating political personas...
                </div>
              </div>
            )}

            {/* Control Button */}
            <button
              onClick={() => setShowInput(true)}
              className="fixed bottom-4 right-4 px-4 py-2 bg-primary/90 text-primary-foreground 
                       rounded-xl z-20 hover:bg-primary transition-all duration-200 
                       hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm"
            >
              Generate New Personas
            </button>

            {/* Personas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-xl p-6 shadow-lg border border-border/50 hover:border-border transition-all duration-300"
                >
                  {/* Header */}
                  <div className="mb-4 border-b border-border pb-4">
                    <h2 className="text-xl font-bold">{persona?.name || 'Loading...'}</h2>
                    <div className="text-sm text-muted-foreground">
                      {persona?.age || '...'} • {persona?.location?.city || '...'}, {persona?.location?.country || '...'}
                    </div>
                  </div>

                  {/* Background */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-primary mb-2">Background</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Education:</span>{' '}
                        {persona?.background?.education || 'Loading...'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Profession:</span>{' '}
                        {persona?.background?.profession || 'Loading...'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Economic Status:</span>{' '}
                        {persona?.background?.economic_class || 'Loading...'}
                      </p>
                    </div>
                  </div>

                  {/* Political Profile */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-primary mb-2">Political Profile</h3>
                    <p className="text-sm mb-2">{persona?.political_profile?.ideology || 'Loading...'}</p>
                    <div className="space-y-2">
                      {persona?.political_profile?.key_issues?.issue?.map((issue: any, i: number) => (
                        <div key={i} className="text-sm">
                          <span className="text-muted-foreground">{issue?.name || 'Issue'}:</span>{' '}
                          {issue?.stance || 'Loading...'}
                        </div>
                      )) || (
                        <div className="text-sm text-muted-foreground">Loading issues...</div>
                      )}
                    </div>
                  </div>

                  {/* Personal Traits */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-primary mb-2">Personal Traits</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Values:</span>{' '}
                        {persona?.personal_traits?.values || 'Loading...'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Communication:</span>{' '}
                        {persona?.personal_traits?.communication_style || 'Loading...'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Influences:</span>{' '}
                        {persona?.personal_traits?.influences || 'Loading...'}
                      </p>
                    </div>
                  </div>

                  {/* Daily Life */}
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">Daily Life</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Routine:</span>{' '}
                        {persona?.daily_life?.routine || 'Loading...'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Community Role:</span>{' '}
                        {persona?.daily_life?.community_role || 'Loading...'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Media:</span>{' '}
                        {persona?.daily_life?.media_consumption || 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 