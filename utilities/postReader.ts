import * as fs from "fs"
import matter from "gray-matter"
import { ITEMS_PER_PAGE } from "../components/constants"

import { pageData } from "../static/posts"

export interface BlogPostData {
  slug: string
  title: string
  summary?: string
  subtitle?: string
  markdown: string
  authorName: string
  publishedDateString: string
  tags?: string[]
}

export type BlogPostSummary = Pick<BlogPostData, "slug" | "title" | "summary">

export const getPostsMatchingTag = async (
  tag: string
): Promise<BlogPostData[]> => {
  const posts = await Promise.all(pageData.map(postReader))
  return posts.filter((p) => p.tags && p.tags.includes(tag))
}

export const getMostRecentPosts = async (
  numberToRetrieve = ITEMS_PER_PAGE,
  offset = 0
): Promise<BlogPostData[]> => {
  return Promise.all(
    pageData.slice(offset, offset + numberToRetrieve).map(postReader)
  )
}

export const getSummaryFields = (post: BlogPostData): BlogPostSummary => {
  const { slug, title, summary } = post
  return { slug, title, summary }
}

/**
 * An ultra inefficient way to get a set of categories from all posts.
 * Used to statically generate category pages for all the posts
 */
export const getAllCategories = async (): Promise<string[]> => {
  const posts = await Promise.all(pageData.map(postReader))
  const tags = posts.reduce((t, post) => {
    ;(post.tags || []).forEach((tag) => t.add(tag))
    return t
  }, new Set<string>())

  return Array.from(tags)
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

  const summary: string | undefined = matterParsed.data.summary as
    | string
    | undefined
  if (summary) {
    result.summary = summary
  }

  return Promise.resolve(result)
}
