import * as React from "react"
import { BlogHead } from "../components/BlogHead"
import { HomeLayout } from "../components/HomeLayout"

const Home = (): JSX.Element => {
  return (
    <HomeLayout>
      <BlogHead />
    </HomeLayout>
  )
}

export default Home
