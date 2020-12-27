import * as React from "react"
import { GetStaticProps, GetStaticPaths } from "next"

import { pageData } from "../static/posts"
import { Markdown } from "../components/Markdown"
import { BlogHead } from "../components/BlogHead"
import { TagList } from "../components/TagList"
import { HomeLayout } from "../components/HomeLayout"
import { StyledTextLink } from "../components/StyledTextLink"
import { BlogPostData, postReader } from "../utilities/postReader"

const BlogPostPage = ({
  authorName,
  publishedDateString,
  subtitle,
  tags,
  title,
  markdown,
}: BlogPostData): JSX.Element => (
  <HomeLayout>
    <BlogHead title={title} />
    <article>
      <h1 className="text-4xl mb-4 text-yellow-500">{title}</h1>
      {subtitle && <h2 className="text-lg mb-4">{subtitle}</h2>}
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
  const post = await postReader(slug)
  return { props: { ...post } }
}

export default BlogPostPage
