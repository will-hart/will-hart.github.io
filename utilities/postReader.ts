import * as fs from "fs"
import matter from "gray-matter"

import { pageData } from "../static/posts"

export interface BlogPostData {
  slug: string
  title: string
  subtitle?: string
  markdown: string
  authorName: string
  publishedDateString: string
  tags?: string[]
}

export const getPostsMatchingTag = async (
  tag: string
): Promise<BlogPostData[]> => {
  const posts = await Promise.all(pageData.map(postReader))
  return posts.filter((p) => p.tags && p.tags.includes(tag))
}

export const postReader = (slug: string): Promise<BlogPostData> => {
  const fileContent = fs
    .readFileSync(`./static/${slug.replace(/-/g, "_")}.md`)
    .toString()
  const matterParsed = matter(fileContent)

  const result: BlogPostData = {
    slug,
    title: matterParsed.data.title as string,
    markdown: matterParsed.content,
    authorName: matterParsed.data.authorName as string,
    publishedDateString: matterParsed.data.publishedDateString as string,
    tags: (matterParsed.data.tags || []) as string[],
  }

  const subtitle: string | undefined = matterParsed.data.subtitle as
    | string
    | undefined
  if (subtitle) {
    result.subtitle = subtitle
  }

  return Promise.resolve(result)
}
