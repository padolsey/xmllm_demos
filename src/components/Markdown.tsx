'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useTheme } from '@/app/theme-provider'

export function Markdown({ children }: { children: string }) {
  const { theme } = useTheme()

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
              style={theme === 'dark' ? oneDark : undefined}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        }) as any
      }}
    >
      {children}
    </ReactMarkdown>
  )
} 