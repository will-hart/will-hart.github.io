import Link from "next/link"
import * as React from "react"

import { BlogPostSummary } from "../utilities/postReader"

interface PostListProps {
  posts: BlogPostSummary[]
}

const PostListItem = ({ post }: { post: BlogPostSummary }): JSX.Element => (
  <div className="flex flex-col w-full lg:w-1/3 xl:w-1/4 m-4 box-border bg-gray-700">
    <div className="flex flex-col p-4">
      <Link href={`/${post.slug}`}>
        <a className="text-lg font-bold text-white">
          <h2 className="text-lg font-bold lg:h-16">{post.title}</h2>
        </a>
      </Link>
      <p className="text-md text-gray-400 lg:h-24 my-2">{post.summary}</p>
    </div>

    <Link href={`/${post.slug}`}>
      <div className="hero hover:bg-yellow-300 border-t-2 border-yellow-300 cursor-pointer text-yellow-300 hover:text-darkbg p-2 flex justify-between transition-colors duration-500">
        <a className="text-current no-underline hover:no-underline">
          Read More
        </a>

        <span>ᐅ</span>
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
