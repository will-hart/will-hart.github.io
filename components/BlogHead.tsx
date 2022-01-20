import Head from "next/head"
import * as React from "react"
import { BlogPostData } from "../utilities/postReader"

const BlogHead = ({
  title,
  postData: data,
}: {
  title?: string
  postData?: BlogPostData
}): JSX.Element => (
  <Head>
    <title>{title ? `${title} | ` : ""}willhart.io</title>
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    {data ? (
      <meta
        name="description"
        content={`${data.summary}. Posted on willhart.io`}
      />
    ) : (
      <meta
        name="description"
        content="Hi, I'm Will! willhart.io is my blog, where I post about random coding adventures."
      />
    )}
  </Head>
)

export default BlogHead
