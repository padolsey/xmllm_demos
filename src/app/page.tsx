'use client'

import Link from 'next/link'

// Main demos first, ordered by importance
const mainDemos = [
  {
    href: "/scenarios",
    title: "Scenario Playground",
    description: "Interactive examples showing different patterns for streaming structured data",
    primary: true
  },
  {
    href: "/modes",
    title: "Streaming Modes",
    description: "Compare state_open, state_closed, root_open, and root_closed modes",
    primary: true
  },
  {
    href: "/model-testing",
    title: "Model Testing Matrix",
    description: "Test and compare different LLM models across various scenarios",
    primary: true
  },
  {
    href: "/panel",
    title: "LLM Prompting Workbench",
    description: "Configure and test different LLM settings and parameters",
    primary: true
  }
]

// Example applications
const exampleDemos = [
  {
    href: "/fluid/species",
    title: "Alien Species Generator",
    description: "Watch XML stream in real-time as it builds a structured UI component",
    primary: true,
    featured: true
  },
  {
    href: "/colors",
    title: "Color Theme Generator",
    description: "Generate unique color themes with creative names and harmonious palettes"
  },
  {
    href: "/personas",
    title: "Political Personas",
    description: "Generate diverse political personas with complex backgrounds and views"
  }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with GitHub Link */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">xmllm</h1>
            <p className="text-xl text-muted-foreground">
              A JS utility for getting structured data from LLMs using XML streaming
            </p>
          </div>
          <a 
            href="https://github.com/padolsey/xmllm" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted
                     border border-border rounded-lg text-sm transition-colors"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5" 
              width="20" 
              height="20" 
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Main Demos */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Explore XMLLM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainDemos.map(demo => (
                <Link 
                  key={demo.href}
                  href={demo.href}
                  className={`p-4 rounded-lg border transition-colors duration-200
                    ${demo.primary 
                      ? 'border-primary bg-primary/10 hover:bg-primary/20' 
                      : 'border-primary/50 bg-primary/5 hover:bg-primary/10'}`}
                >
                  <h3 className="font-medium">{demo.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {demo.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Example Applications */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Example Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exampleDemos.map(demo => (
                <Link 
                  key={demo.href}
                  href={demo.href}
                  className="p-4 rounded-lg border border-border hover:border-primary/60 
                           hover:bg-muted/50 transition-colors duration-200"
                >
                  <h3 className="font-medium">{demo.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {demo.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}