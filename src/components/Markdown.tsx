'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, atomDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useTheme } from '@/app/theme-provider'
import { useState } from 'react'

export function Markdown({ children }: { children: string }) {
  const { theme } = useTheme()
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  return (
    <ReactMarkdown
      components={{
        code: (({ inline, className, children, ...props }: { 
          inline?: boolean;
          className?: string;
          children: React.ReactNode;
          [key: string]: any;
        }) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              style={theme === 'dark' ? atomDark : oneLight}
              language={match[1]}
              PreTag="div"
              customStyle={{
                fontSize: '1rem',
                borderRadius: '6px',
                padding: '1em',
                margin: '0.5em 0'
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        }) as any,
        img: ({ src, alt }) => {
          if (!src) return null
          
          const isLoaded = loadedImages.has(src)
          
          return (
            <span className="block my-4">
              {!isLoaded ? (
                <button
                  onClick={() => setLoadedImages(prev => new Set([...prev, src]))}
                  className="w-full h-32 bg-muted/50 rounded-lg border border-border/50
                           flex items-center justify-center gap-2 
                           hover:bg-muted/70 transition-colors"
                >
                  <svg 
                    className="w-5 h-5 text-muted-foreground" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    Click to load image{alt ? `: ${alt}` : ''}
                  </span>
                </button>
              ) : (
                <img 
                  src={src} 
                  alt={alt || ''} 
                  className="rounded-lg border border-border/50"
                  loading="lazy"
                />
              )}
            </span>
          )
        }
      }}
    >
      {children}
    </ReactMarkdown>
  )
} 