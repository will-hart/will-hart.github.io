import Head from "next/head"
import * as React from "react"

export const BlogHeader = ({ title }: { title?: string }): JSX.Element => (
  <Head>
    <title>{title ? `${title} | ` : ""}willhart.io</title>
    <link rel="icon" href="/favicon.ico" />
  </Head>
)
