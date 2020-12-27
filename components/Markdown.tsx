import * as React from "react"
import ReactMarkdown from "react-markdown"
import Tex from "@matejmazur/react-katex"
import math from "remark-math"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import syntaxTheme from "./syntaxTheme"

import "katex/dist/katex.min.css"

const renderers = {
  // eslint-disable-next-line react/display-name
  inlineMath: ({ value }: { value: string }): JSX.Element => (
    <Tex math={value} />
  ),
  // eslint-disable-next-line react/display-name
  math: ({ value }: { value: string }): JSX.Element => (
    <Tex block math={value} />
  ),
  // eslint-disable-next-line react/display-name
  code: ({
    language,
    value,
  }: {
    language: string
    value: string
  }): JSX.Element => {
    return (
      <SyntaxHighlighter style={syntaxTheme} language={language}>
        {value}
      </SyntaxHighlighter>
    )
  },
}

export const Markdown = ({ markdown }: { markdown: string }): JSX.Element => (
  <ReactMarkdown plugins={[math]} renderers={renderers}>
    {markdown}
  </ReactMarkdown>
)
