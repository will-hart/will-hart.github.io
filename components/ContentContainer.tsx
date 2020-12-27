import * as React from "react"

export const ContentContainer = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}): JSX.Element => <div className="container mx-auto my-0">{children}</div>
