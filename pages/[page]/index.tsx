import * as React from "react"
import { GetStaticPaths, GetStaticProps } from "next"
import dynamic from "next/dynamic"

import { ContentContainer } from "../../components/ContentContainer"
import {
  BlogPostSummary,
  getMostRecentPosts,
  getSummaryFields,
} from "../../utilities/postReader"
import { PostList } from "../../components/PostList"
import { ITEMS_PER_PAGE, NUM_PAGES } from "../../components/constants"
import { useRouter } from "next/dist/client/router"

const BlogHead = dynamic(() => import("../../components/BlogHead"))
const HomeLayout = dynamic(() => import("../../components/HomeLayout"))
const StyledTextLink = dynamic(() => import("../../components/StyledTextLink"))

interface HomeProps {
  recentPosts: BlogPostSummary[]
}

const coerceToInt = (item: string | string[]): number => {
  const page = parseInt(Array.isArray(item) ? item[0] : item, 10)
  return isNaN(page) ? 0 : page
}

const Home = ({ recentPosts }: HomeProps): JSX.Element => {
  const { query } = useRouter()
  const { page } = query
  const pageNum = coerceToInt(page)

  return (
    <HomeLayout>
      <BlogHead title="Home" />
      <div className="hero bg-gray-700 h-64 mb-12 flex items-center justify-center p-12 border-b-2 border-yellow-300">
        <ContentContainer>
          <h1 className="text-yellow-500 text-4xl m-0 mb-8 text-center">
            Hi, I&apos;m Will
          </h1>
          <p className="text-yellow-300 text-xl text-center">
            I&apos;m a Product Manager at a Med Tech company in Melbourne.
          </p>
          <p className="text-yellow-300 text-xl text-center">
            I sometimes post my coding adventures here.
          </p>
        </ContentContainer>
      </div>

      <PostList posts={recentPosts} />

      <div className="flex flex-row justify-center items-center my-3">
        {pageNum > 0 && (
          <div className="mr-4">
            <StyledTextLink href={`/${pageNum - 1}`} size="large">
              ᐊ Later posts
            </StyledTextLink>
          </div>
        )}
        {pageNum < NUM_PAGES && (
          <div className="ml-4">
            <StyledTextLink href={`/${pageNum + 1}`} size="large">
              Earlier posts ᐅ
            </StyledTextLink>
          </div>
        )}
      </div>
    </HomeLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () =>
  Promise.resolve({
    paths: Array(NUM_PAGES + 1)
      .fill(null)
      .map((_, page) => ({ params: { page: page.toString() } })),
    fallback: true,
  })

export const getStaticProps: GetStaticProps = async (context) => {
  const page = coerceToInt(context.params.page)
  const recentPosts = await getMostRecentPosts(
    ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )
  return { props: { recentPosts: recentPosts.map(getSummaryFields) } }
}

export default Home
