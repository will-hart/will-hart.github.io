# willhart.io Website

This is the source (using [Zola](https://www.getzola.org/)) for my blog at
[willhart.io](https://willhart.io).

## Adding a post

### The easy way

Run

```bash
node scripts/createPost.js
```

### The hard way

1. Create a new markdown file in `content/post`
2. The naming format should be `YYYY-MM-DD_post_title.md`,
3. follow the `TOML` front matter pattern in other posts.
4. If the document requires maths formatting via KaTeX, add the following to the
   TOML at the top of the document:

```toml
[extra]
use_maths = true
```

## Deployment

Deployment and build is automatic on a push to the `main` branch on github.
