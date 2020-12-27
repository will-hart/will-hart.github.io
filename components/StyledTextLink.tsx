import * as React from "react"
import Link from "next/link"

export const StyledTextLink = ({
  href,
  children,
}: {
  href: string
  children: string | JSX.Element
}): JSX.Element => (
  <Link href={href}>
    <a className="styled-link">{children}</a>
  </Link>
)
