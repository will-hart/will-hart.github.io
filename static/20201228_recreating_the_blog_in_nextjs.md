---
title: Recreating the blog in NextJS
summary: Its that time again when I rewrite my blog, but this time its statically generated using NextJS
tags:
  - random
  - projects
authorName: Will Hart
publishedDateString: 28 Dec 2020
---

Well this [isn't the first post of this kind](/switched-to-ghost), but once
again its that time of year when I look at the blog and decide its time to
migrate to a different blog host. The current Ghost blog has been fine but costs
$5/month to host. Backups and updates are pretty annoying and the whole thing is
a very manual process.

> Also I've currently forgotten my admin password for Ghost :| As the server
> didn't have an email configuration, I can't reset the password and so I can't
> post anything new even if I had the inclination!

I've been using [NextJS](https://nextjs.org/) a lot recently (for work and side
projects) and really like the file based routing and ability to choose between
static, server or client rendered pages. Furthermore automated deploy pipelines
like those supported by NextJS really make life easy. Deployment is just a matter of `git push`. 

Spurred by these advantages I decided to open source the blog and make a
statically generated site using NextJS. The main way this works is by keeping an
array of post URLs, then loading in markdown files based on these URLs to display. Markdown files use YAML frontmatter to store configuration (author, date, titles, summaries and so on). 

Static generation is enabled in NextJS by specifying the URLs to generate (if
the URLs contain dymanic segments like slugs or IDs) and also specifying a
function that generates the props on the server. For the blog post pages this
looks like this:

```typescript
/**
 * Get a list of post slugs to statically generate. Here 
 * pageData contains all the URL slugs. Its hard coded which
 * isn't ideal, but its not a big burden to keep the list 
 * up to date. It's also easy to filter once the corresponding
 * posts are loaded in - for instance to only return posts with
 * a particular tag. As its statically generated, at build time,
 * performance isn't all that important.
 */
export const getStaticPaths: GetStaticPaths = async () =>
  Promise.resolve({
    paths: pageData.map((slug) => ({ params: { slug } })),
    fallback: false,
  })

/**
 * This loads the data for each post - it reads the post slug from the
 * parameters and uses the postReader helper to load in the file from
 * disk. The gray-matter YAML parser extracts the front matter and 
 * a react-markdown component renders the markdown to file.
 * 
 * Each blog post is statically generated and preloaded when it enters
 * the viewport.
 */
export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params.slug.toString()
  const post = await postReader(slug)
  return { props: { ...post } }
}
```

The home page, category/tags pages and individual post pages are all statically
generated at build time. On the down side, I had to write my own blog template
and migrate all the posts by hand :(

> The repo is at
[https://github.com/will-hart/willhart.io](https://github.com/will-hart/willhart.io).
I don't really think it will spur me to write more posts, but at least when I do
decide to write something it's as easy as writing a Markdown document and
committing to git.
