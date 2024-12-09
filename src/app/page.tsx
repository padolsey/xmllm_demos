import Link from 'next/link'
import { Markdown } from '@/components/Markdown'
import { loadMarkdown } from '@/utils/loadMarkdown'

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

export async function generateMetadata() {
  return {
    title: 'xmllm playground & demos'
  }
}

export default async function Home() {
  const readmeContent = await loadMarkdown('readme.md')

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Description */}
        <div className="mb-12 text-center">
          <p className="text-xl text-muted-foreground">
            A JS utility for getting structured data from LLMs using XML and HTML parsing: it is forgiving of LLM's mistakes, fully streaming, and works alongside the best nature of LLMs: creating diverse free-prose. It uses a high-compliance prompting techniques with exemplar XML scaffolds, hints and flexible CSS selection to ensure data is located and reflected back to you.
          </p>
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
            <h2 className="text-xl font-semibold mb-4">Streaming Examples:  AI→UI Hydration</h2>
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

        {/* Readme Section */}
        <section className="mt-16 pt-16 border-t border-border relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 px-3 py-1 
                       bg-background text-xs text-muted-foreground border border-border rounded-full">
            README
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {readmeContent ? (
              <Markdown>{readmeContent}</Markdown>
            ) : (
              <p className="text-muted-foreground">Failed to load README content</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}