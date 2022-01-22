# willhart.io Website

This is the source (using [Zola](https://getzola.com)) for my blog at [willhart.io](https://willhart.io).

## Development

### Adding a post

Create a new markdown file in `content/post` and follow the `TOML` front matter pattern in other posts.

If the document requires maths formatting via KaTeX, add the following to the TOML at the top of the document:

```toml
[extra]
use_maths = true
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

Deployment is automatic
