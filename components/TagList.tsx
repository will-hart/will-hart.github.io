import * as React from "react"
import { StyledTextLink } from "./StyledTextLink"

export const TagList = ({ tags }: { tags: string[] }): JSX.Element => (
  <div>
    <span className="mr-4">See also:</span>
    {tags.map((tag) => (
      <span key={`tag__${tag}`} className="mr-2">
        <StyledTextLink href={`/tag/${tag}`}>
          {tag.toUpperCase()}
        </StyledTextLink>
      </span>
    ))}
  </div>
)
