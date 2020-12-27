import * as React from "react"
import { PageNavBar } from "./PageNavBar"

export const HomeLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}): JSX.Element => (
  <div>
    <PageNavBar />
    {children}
  </div>
)
