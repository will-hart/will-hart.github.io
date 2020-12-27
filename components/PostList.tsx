import Link from "next/link"
import * as React from "react"

import { BlogPostData } from "../utilities/postReader"

interface PostListProps {
  posts: BlogPostData[]
}

const PostListItem = ({ post }: { post: BlogPostData }): JSX.Element => (
  <div className="flex flex-col w-1/4 m-4 box-border bg-gray-700">
    <div className="flex flex-col p-4">
      <h2 className="text-lg font-bold h-16">{post.title}</h2>
      <p className="text-md text-gray-400 h-24 my-2">{post.summary}</p>
    </div>

    <Link href={post.slug}>
      <div className="bg-yellow-300 hover:bg-yellow-200 cursor-pointer text-darkbg p-2 flex justify-between">
        <a className="text-darkbg">Read More</a>

        <span>→</span>
      </div>
    </Link>
  </div>
)

export const PostList = ({ posts }: PostListProps): JSX.Element => (
  <div className="flex flex-wrap justify-center">
    {posts.map((post, idx) => (
      <PostListItem key={`post_preview_${idx}`} post={post} />
    ))}
  </div>
)
