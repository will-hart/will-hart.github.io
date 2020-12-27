import * as React from "react"
import { ContentContainer } from "./ContentContainer"
import { PageNavBar } from "./PageNavBar"

export const HomeLayout = ({
  children,
}: {
  children: JSX.Element | JSX.Element[]
}): JSX.Element => (
  <div>
    <PageNavBar />
    <ContentContainer>{children}</ContentContainer>
  </div>
)
