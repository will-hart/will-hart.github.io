import * as React from "react"

import { GetStaticProps, GetStaticPaths } from "next"
import {
  BlogPostData,
  getAllCategories,
  getPostsMatchingTag,
} from "../../utilities/postReader"
import { HomeLayout } from "../../components/HomeLayout"
import { BlogHead } from "../../components/BlogHead"
import { PostList } from "../../components/PostList"

const TagPage = ({
  tag,
  taggedPosts,
}: {
  tag: string
  taggedPosts: BlogPostData[]
}): JSX.Element => (
  <HomeLayout>
    <BlogHead title={`Posts tagged "${tag}"`} />

    <div className="hero bg-gray-700 m-0 mb-16 p-8 border-b-2 border-yellow-300">
      <h1>Posts tagged &quot;{tag}&quot;</h1>
    </div>

    <PostList posts={taggedPosts} />
  </HomeLayout>
)

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await getAllCategories()

  return Promise.resolve({
    paths: categories.map((tag) => ({ params: { tag } })),
    fallback: false,
  })
}

export const getStaticProps: GetStaticProps = async (context) => {
  const tag = context.params.tag.toString()
  const taggedPosts = await getPostsMatchingTag(tag)
  return { props: { tag, taggedPosts } }
}

export default TagPage
