import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  oneDark,
  oneLight
} from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

type MarkdownContentProps = {
  children: string
  className?: string
}

type CodeBlockProps = {
  code: string
  language: string
  isDark: boolean
}

function CodeBlock({ code, language, isDark }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: '0.75rem',
          background: 'transparent',
          border: 'none',
          borderRadius: '0.5rem',
          fontFamily:
            '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace'
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
            border: 'none',
            outline: 'none'
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export function MarkdownContent({
  children,
  className = 'markdown'
}: MarkdownContentProps) {
  const { theme } = useTheme()

  // Determine if we should use dark theme for syntax highlighting
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className={className}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          table({ children, ...props }) {
            return (
              <div className="markdown-table-wrapper">
                <table {...props}>{children}</table>
              </div>
            )
          },
          code({
            className,
            children,
            ...props
          }: {
            className?: string
            children?: React.ReactNode
          } & React.HTMLAttributes<HTMLElement>) {
            const match = /language-(\w+)/.exec(className || '')
            const inline = !match
            const code = String(children).replace(/\n$/, '')
            return !inline ? (
              <CodeBlock
                code={code}
                language={match[1] || 'text'}
                isDark={isDark}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {children}
      </Markdown>
    </div>
  )
}
