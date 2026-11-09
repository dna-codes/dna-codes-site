# Add a Blog Post

## Steps

1. Create a new `.md` or `.mdx` file in `src/data/post/`
2. Add required frontmatter:

```yaml
---
publishDate: 2026-01-15T00:00:00Z
title: 'Your Post Title'
excerpt: 'Brief description of the post'
image: '~/assets/images/your-image.png'
category: 'tutorials'
tags:
  - astro
  - tailwind
author: 'Author Name'
---
```

3. Write content in Markdown (or MDX for component embedding)
4. Run `npm run build` to verify the post renders correctly

## Frontmatter Fields

| Field         | Required | Description                                    |
| ------------- | -------- | ---------------------------------------------- |
| `title`       | Yes      | Post title                                     |
| `publishDate` | No       | ISO 8601 date                                  |
| `updateDate`  | No       | ISO 8601 date                                  |
| `draft`       | No       | Set `true` to hide from listing                |
| `excerpt`     | No       | Summary for listing pages                      |
| `image`       | No       | Path to hero image (use `~/` prefix for local) |
| `category`    | No       | Single category string                         |
| `tags`        | No       | Array of tag strings                           |
| `author`      | No       | Author name                                    |
| `metadata`    | No       | Override SEO metadata                          |

## URL Pattern

Posts are available at `/blog/{slug}` where slug is derived from the filename.

## Notes

- The rendered `<title>` has to stay under about 560 pixels (Moz flags roughly 600). If the headline plus ` — DNA Codes` is wider than that, set `metadata.title` to a shorter search title and `metadata.ignoreTitleTemplate: true`. The on-page headline stays `title`. A post with `targetKeyword` takes its search title from the keyword registry instead, so shorten that row and leave `metadata.title` unset.
- Do not set `metadata.robots.index: false`. Tag archives are indexable. See AGENTS.md, "Search crawl".
- Reading time is calculated automatically via remark plugin
- Images referenced with `~/` are optimized at build time
- Use `.mdx` extension to embed Astro components in posts
