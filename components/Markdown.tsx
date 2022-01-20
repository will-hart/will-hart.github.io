import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { CodeProps } from "react-markdown/lib/ast-to-react"
import syntaxTheme from "./syntaxTheme"

import "katex/dist/katex.min.css"

const customRenderers = {
  code: function Code({
    inline,
    className,
    children,
    ...props
  }: CodeProps): JSX.Element {
    delete props["node"]

    const match = /language-(\w+)/.exec(className || "")
    return !inline && match ? (
      <SyntaxHighlighter
        style={syntaxTheme}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {children}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

const Markdown = ({ markdown }: { markdown: string }): JSX.Element => (
  <ReactMarkdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={customRenderers}
  >
    {markdown}
  </ReactMarkdown>
)

export default Markdown
