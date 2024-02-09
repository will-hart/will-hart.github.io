# willhart.io Website

This is the source (using [Zola](https://www.getzola.org/)) for my blog at [willhart.io](https://willhart.io).

## Development

### Adding a post

1. Create a new markdown file in `content/post`
2. The naming format should be `YYYY-MM-DD_post_title.md`,
3. follow the `TOML` front matter pattern in other posts.
4. If the document requires maths formatting via KaTeX, add the following to the TOML at the top of the document:

```toml
[extra]
use_maths = true
```

You can also

```bash
node scripts/createPost.js
```

### Updating styles

> When making changes to styles, edit `styles/global.css` and follow the steps below

The site uses tailwind.css. To ensure optimised style files, a separate dev process can be run which watches for style changes and builds the minimal CSS file required in `static/style.css`.

While updating styles, in a terminal:

```bash
yarn run watch
```

When done and **before pushing any changes to github**:

```bash
yarn run build
```

This approach was inspired by [This blog post](https://www.maybevain.com/writing/using-tailwind-css-with-zola-static-site-generator/).

> Note that sometimes running this locally I get parcel errors. Usually if I run the command a few times it fixes itself ¯\_(ツ)_/¯. Maybe related [github issue](https://github.com/parcel-bundler/parcel/issues/7578)

## Deployment

Deployment is automatic on a push to github.
