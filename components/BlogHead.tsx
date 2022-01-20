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

    {/* 
        This is cloudflare analytics. It doesn't track users or use cookies and is privacy focused.
        I'm actually just curious if anybody is even looking at this little website! 
    */}
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "310f93cab66a42c5a328f246cc053025"}'
    ></script>
  </Head>
)

export default BlogHead
