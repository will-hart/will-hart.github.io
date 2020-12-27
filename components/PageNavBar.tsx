import * as React from "react"
import { StyledTextLink } from "./StyledTextLink"

export const PageNavBar = (): JSX.Element => (
  <div className="sticky top-0 p-3 bg-gray-800 z-10">
    <div className="flex justify-between items-center">
      <span>
        <span className="mr-4">
          <StyledTextLink href="/tag/projects">PROJECTS</StyledTextLink>
        </span>
        <span className="mr-4">
          <StyledTextLink href="/tag/tutorials">TUTORIALS</StyledTextLink>
        </span>
        <span className="mr-4">
          <StyledTextLink href="/tag/gamedev">GAME DEV</StyledTextLink>
        </span>
        <span className="mr-4">
          <StyledTextLink href="/tag/electronics">ELECTRONICS</StyledTextLink>
        </span>
        <span className="mr-4">
          <StyledTextLink href="/tag/random">RANDOM</StyledTextLink>
        </span>
      </span>
      <StyledTextLink href="/">willhart.io</StyledTextLink>
    </div>
  </div>
)
