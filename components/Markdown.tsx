import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { CodeProps } from "react-markdown/lib/ast-to-react"
import syntaxTheme from "./syntaxTheme"

import "katex/dist/katex.min.css"
import Image from "next/image"
import { getShimmerDataUrl } from "../utilities/blurPlaceholder"

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
  img: function NextImage({
    src,
    alt,
  }: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >): JSX.Element {
    // images should be marked with e.g. `(size: 190x30px)` for loading to be optimised
    const re = /\(size: ([0-9]+)x([0-9]+)px\)/
    const result = (alt || "").match(re)

    if (!result) {
      // I may as well use an image tag here because I don't know anything about the image and therefore
      // next's fancy optimisation doesn't work. Ideally next would realise that the images are dynamically
      // loaded but local, but that doesn't seem to be possible yet.
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} />
    }

    const width = parseInt(result[1], 10)
    const height = parseInt(result[2], 10)

    return (
      <Image
        className="optimisedImage"
        src={src}
        width={width}
        height={height}
        blurDataURL={getShimmerDataUrl(width, height)}
        alt={alt}
        layout="responsive"
      />
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
