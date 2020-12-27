import * as React from "react"
import { GetStaticProps, GetStaticPaths } from "next"

import { pageData } from "../static/posts"
import { Markdown } from "../components/Markdown"
import { BlogHead } from "../components/BlogHead"
import { TagList } from "../components/TagList"
import { HomeLayout } from "../components/HomeLayout"
import { StyledTextLink } from "../components/StyledTextLink"
import { BlogPostData, postReader } from "../utilities/postReader"
import { ContentContainer } from "../components/ContentContainer"

const BlogPostPage = (postData: BlogPostData): JSX.Element => {
  const {
    authorName,
    publishedDateString,
    subtitle,
    tags,
    title,
    markdown,
  } = postData

  return (
    <HomeLayout>
      <BlogHead title={title} postData={postData} />
      <div className="hero bg-gray-700 m-0 mb-16 p-8 border-b-2 border-yellow-300">
        <ContentContainer>
          <h1 className="text-4xl mx-0 text-yellow-300 mt-4 mb-12">{title}</h1>
          {subtitle && <h2 className="text-lg mb-4">{subtitle}</h2>}
          <div className="flex flex-col justify-between">
            <span>
              by {authorName}, {publishedDateString.toUpperCase()}
            </span>
            {tags && <TagList tags={tags} />}
            <span className="mt-6">
              <StyledTextLink href="/">ᐊ RETURN HOME</StyledTextLink>
            </span>
          </div>
        </ContentContainer>
      </div>

      <article>
        <Markdown markdown={markdown} />
      </article>
    </HomeLayout>
  )
}

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
