# willhart.io Website

This is the source (using [Zola](https://www.getzola.org/)) for my blog at
[willhart.io](https://willhart.io).

## Development

### Adding a post

1. Create a new markdown file in `content/post`
2. The naming format should be `YYYY-MM-DD_post_title.md`,
3. follow the `TOML` front matter pattern in other posts.
4. If the document requires maths formatting via KaTeX, add the following to the
   TOML at the top of the document:

```toml
[extra]
use_maths = true
```

You can also

```bash
node scripts/createPost.js
```

### Updating styles

> When making changes to styles, edit `styles/global.css` and follow the steps
> below. Don't edit `static/global.css`.

The site uses tailwind.css. To ensure optimised style files, a separate dev
process can be run which watches for style changes and builds the minimal CSS
file required in `static/style.css`.

While updating styles, in a terminal:

```bash
yarn run watch
```

When done and **before pushing any changes to github**:

```bash
yarn run build
```

This approach was inspired by [This blog
post](https://www.maybevain.com/writing/using-tailwind-css-with-zola-static-site-generator/).

## Deployment

Deployment and build is automatic on a push to github, but make sure if there
are any CSS changes to run the steps above.
