'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">XMLLM Demos</h1>
        
        <div className="space-y-4">
          <Link 
            href="/scenarios"
            className="block p-4 rounded-lg border border-border hover:border-primary/60"
          >
            <h2 className="font-medium">Scenario Playground</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Interactive examples showing different patterns for streaming structured data
            </p>
          </Link>

          <Link 
            href="/modes"
            className="block p-4 rounded-lg border border-border hover:border-primary/60"
          >
            <h2 className="font-medium">Streaming Modes</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Compare state_open, state_closed, root_open, and root_closed modes
            </p>
          </Link>

          <Link 
            href="/fluid"
            className="block p-4 rounded-lg border border-border hover:border-primary/60"
          >
            <h2 className="font-medium">Fluid UI Updates</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Examples of UI components updating from streaming responses
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}