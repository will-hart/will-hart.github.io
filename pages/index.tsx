import * as React from "react"
import { GetStaticProps, GetStaticPaths } from "next"

import { BlogHead } from "../components/BlogHead"
import { ContentContainer } from "../components/ContentContainer"
import { HomeLayout } from "../components/HomeLayout"
import { BlogPostData, getMostRecentPosts } from "../utilities/postReader"
import { PostList } from "../components/PostList"

interface HomeProps {
  recentPosts: BlogPostData[]
}

const Home = ({ recentPosts }: HomeProps): JSX.Element => {
  return (
    <HomeLayout>
      <BlogHead title="Home" />
      <div className="bg-gray-700 h-64 mb-12 flex items-center justify-center p-12 border-b-2 border-yellow-300">
        <ContentContainer>
          <h1 className="text-yellow-500 text-4xl my-8 text-center">
            Hi, I&apos;m Will
          </h1>
          <p className="text-yellow-300 text-xl text-center">
            I&apos;m a product manager at a Med Tech company in Melbourne.
          </p>
          <p className="text-yellow-300 text-xl text-center">
            I sometimes post my coding adventures here.
          </p>
        </ContentContainer>
      </div>

      <PostList posts={recentPosts} />
    </HomeLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () =>
  Promise.resolve({
    paths: [{ params: {} }],
    fallback: false,
  })

export const getStaticProps: GetStaticProps = async () => {
  const recentPosts = await getMostRecentPosts()
  return { props: { recentPosts } }
}

export default Home
