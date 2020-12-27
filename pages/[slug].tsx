import * as React from "react"
import { GetStaticProps, GetStaticPaths } from "next"

import * as fs from "fs"
import matter from "gray-matter"

import { pageData } from "../static/posts"
import { Markdown } from "../components/Markdown"
import { BlogHead } from "../components/BlogHead"
import { TagList } from "../components/TagList"
import { HomeLayout } from "../components/HomeLayout"
import { StyledTextLink } from "../components/StyledTextLink"

interface BlogPostData {
  slug: string
  title: string
  markdown: string
  authorName: string
  publishedDateString: string
  tags?: string[]
}

const BlogPostPage = ({
  authorName,
  publishedDateString,
  tags,
  title,
  markdown,
}: BlogPostData): JSX.Element => (
  <HomeLayout>
    <BlogHead title={title} />
    <article>
      <h1 className="text-4xl mb-4 text-yellow-500">{title}</h1>
      <div className="flex justify-between">
        <span>
          by {authorName}, {publishedDateString.toUpperCase()}
        </span>
        {tags && <TagList tags={tags} />}
      </div>

      <hr className="mb-8 mt-2" />
      <Markdown markdown={markdown} />

      <div className="mt-6">
        <StyledTextLink href="/">← return home</StyledTextLink>
      </div>
      <hr className="mb-8 mt-2" />
    </article>
  </HomeLayout>
)

export const getStaticPaths: GetStaticPaths = async () =>
  Promise.resolve({
    paths: pageData.map((slug) => ({ params: { slug } })),
    fallback: false,
  })

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params.slug.toString()
  const fileContent = fs
    .readFileSync(`./static/${slug.replace(/-/g, "_")}.md`)
    .toString()
  const matterParsed = matter(fileContent)

  return Promise.resolve({
    props: {
      slug,
      title: matterParsed.data.title as string,
      markdown: matterParsed.content,
      authorName: matterParsed.data.authorName as string,
      publishedDateString: matterParsed.data.publishedDateString as string,
      tags: matterParsed.data.tags as string[],
    },
  })
}

export default BlogPostPage
