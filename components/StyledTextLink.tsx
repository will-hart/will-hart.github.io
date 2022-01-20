import * as React from "react"
import Link from "next/link"

export const StyledTextLink = ({
  href,
  children,
  size,
}: {
  href: string
  children: string | JSX.Element
  size?: "small" | "large"
}): JSX.Element => (
  <Link href={href} passHref>
    <a
      className={`${
        (size ?? "small") === "small" ? "text-xs" : "text-lg"
      } styled-link`}
    >
      {children}
    </a>
  </Link>
)
