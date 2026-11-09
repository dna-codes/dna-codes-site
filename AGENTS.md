# AstroWind Agent Instructions

## Project Overview

AstroWind is a free, open-source website template built with **Astro v6** and **Tailwind CSS v4**. It generates a fully static site optimized for performance, SEO, and accessibility.

**Stack:** Astro v6 | Tailwind CSS v4 | TypeScript 5.9 | MDX | Sharp

## Quick Reference

| Command           | Purpose                             |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start dev server at localhost:4321  |
| `npm run build`   | Production build to `./dist/`       |
| `npm run preview` | Preview production build locally    |
| `npm run check`   | Run astro check + ESLint + Prettier |
| `npm run fix`     | Auto-fix ESLint + Prettier issues   |

**Node.js requirement:** >= 22.12.0

## Architecture

### Directory Structure

```
src/
  assets/styles/tailwind.css   # Tailwind v4 config (themes, utilities, plugins)
  components/
    common/        # Shared: Image, Metadata, Analytics, ToggleTheme
    ui/            # Primitives: Button, Headline, WidgetWrapper, ItemGrid
    widgets/       # Page sections: Hero, Features, Pricing, Header, Footer
    blog/          # Blog: SinglePost, List, Pagination, Tags
    CustomStyles.astro  # CSS variables for colors and fonts
  content.config.ts    # Content Collections schema (Astro v6 location)
  data/post/           # Blog posts (.md, .mdx)
  layouts/             # Layout.astro, PageLayout.astro, MarkdownLayout.astro
  pages/               # File-based routing
  utils/               # blog.ts, images.ts, permalinks.ts, frontmatter.ts
  config.yaml          # Site configuration (loaded as virtual module)
  navigation.ts        # Navigation structure
  types.d.ts           # TypeScript type definitions
vendor/integration/    # Custom Astro integration for config loading
```

### Path Aliases

Use `~/` to import from `src/`:

```typescript
import Image from '~/components/common/Image.astro';
import { SITE } from 'astrowind:config';
```

### Configuration System

Site config lives in `src/config.yaml` and is loaded as a Vite virtual module `astrowind:config` by the custom integration in `vendor/integration/`. Exports: `SITE`, `I18N`, `METADATA`, `APP_BLOG`, `UI`, `ANALYTICS`.

## Tailwind CSS v4

Configuration is CSS-first in `src/assets/styles/tailwind.css`:

- **Theme tokens:** `@theme { --color-primary: var(--aw-color-primary); ... }`
- **Custom utilities:** `@utility bg-page { ... }`
- **Dark mode:** Class-based via `@variant dark (&:where(.dark, .dark *))`
- **Plugins:** `@plugin "@tailwindcss/typography"`
- **Custom variant:** `@custom-variant intersect (&:not([no-intersect]))`

CSS variables for colors/fonts are defined in `src/components/CustomStyles.astro` with light/dark theme variants.

The Vite plugin `@tailwindcss/vite` is configured in `astro.config.ts` (not as an Astro integration).

### Class Merging

Components use `twMerge` from `tailwind-merge` v3 for conditional class composition.

## Content Collections

Defined in `src/content.config.ts` using the Astro v6 Content Layer API with `glob()` loader. Posts are in `src/data/post/` as `.md` or `.mdx` files.

Post frontmatter: `title` (required), `publishDate`, `updateDate`, `draft`, `excerpt`, `image`, `category`, `tags`, `author`, `coAuthor`, `series`, `metadata`.

**Every post carries `coAuthor: Claude (Anthropic)`.** These pieces are drafted with a model in
the loop, so the blog says so: the byline reads "Tim Kleier with Claude (Anthropic)" and a line
under the article explains what that means. A new post gets the field. If one is ever written
without a model, leave the field off rather than writing a disclaimer about it.

## Component Patterns

- Props extend interfaces from `~/types`
- Use `class:list` for conditional classes
- Use `twMerge()` when accepting className overrides
- Use named slots for layout composition
- Widget components accept standardized props (see `~/types`)

## Image Handling

`src/components/common/Image.astro` supports:

- Local images via `astro:assets` (optimized by Sharp)
- Remote images via Unpic CDN
- Allowed domains (for providers Unpic can't detect, processed by Sharp): `cdn.pixabay.com`

Hero images use `loading="eager"` and `fetchpriority="high"`.

## Prose Style

**Use em dashes minimally.** They are the default reach for any aside, and left unchecked
every paragraph acquires the same rhythm. Applies to everything a reader sees: blog posts,
page copy, component strings, captions.

Reach for the punctuation that names the relationship instead:

| Instead of an em dash               | Use                      |
| ----------------------------------- | ------------------------ |
| Introducing a list or restatement   | a colon                  |
| A short aside                       | commas                   |
| A second, separable thought         | a full stop              |
| A true interruption of the sentence | keep the em dash, rarely |

Not a ban, so one or two in a long piece is fine. It should be a choice, not a reflex. A
blind find-and-replace will mangle prose, since each one wants a different fix.

**Section titles are short.** A heading names the section. It does not summarize the paragraph
under it. Two or three words, punchy: "The Drift", "The Difference". A sentence in the heading
slot ("What drifts", "A BPM suite and a model are different tools") is the paragraph starting
early. Save the explanation for the first line of body copy.

A heading that exists to carry a search phrase still has to contain that phrase. Everywhere
else, name the section.

## A `<br>` needs an explicit space beside it

The HTML minifier strips whitespace either side of a `<br>`, so a responsive break written the
obvious way silently joins two sentences at the breakpoint where the break is hidden:

```astro
<!-- renders as "endpoints do.DNA says" on a phone -->…your endpoints do.<br class="hidden sm:block" />DNA says who may
call them.

<!-- correct: an entity survives minification, a space does not -->
…your endpoints do.&#32;<br class="hidden sm:block" />DNA says who may call them.
```

A break carrying an adjacent `&nbsp;` is already safe. This cost the site five run-together
sentences across three product pages before anyone opened it on a phone.

## Agent readiness

Two scorers cover how an agent reads this site. CI runs both against `dist/` after `npm run build`.
The live grades lag a deploy and are not the pull-request gate.

### is-agentic.com

The site is scored by [is-agentic.com](https://is-agentic.com/) (`npx is-agentic dna.codes`).
`npm run check:agentic` checks the signals we control against the build in `dist/`:

- **Metadata on every page:** canonical, `<html lang>`, `og:image`, `og:type`. `Metadata.astro`
  drops every Open Graph tag when the default image (`src/assets/images/default.png`, generated
  by `scripts/generate-default-og.mjs`) is missing, so don't delete it.
- **Homepage JSON-LD:** an `Organization` with name, url, logo, description and contactPoint,
  rendered by `src/components/common/StructuredData.astro`.
- **`/llms.txt`:** generated by `src/pages/llms.txt.ts` from `~/data/products` and the genomes.
  It needs a `## When to use` section, and every dna.codes link in it must exist in the build.
  When you add a product, doc page, genome, or keyword page, check that it reads right
  there, including the Search section and the "How an agent should use it today" lines.
- **Trust pages:** `/about`, `/contact` and `/privacy`, each with at least 500 characters of copy.
- **`/agents/`:** the agent documents (`llms.txt`, `llms-full.txt`, `auth.md`, `discovery.json`,
  the profile, refusal codes, schemas). They are generated in `dna-codes-platform` from the agent
  host's route table and configuration, and its `agent-documents` workflow commits them to
  `public/agents/` on each deploy of the agent host. Never edit them here; Prettier ignores them so
  they stay as generated. `llms.txt.ts` embeds their `apex-llms-section.md` as the apex's first
  section, and only when it exists. The check requires that section and every link of the agent
  `llms.txt` to resolve when `public/agents/` exists, and no `/agents/` link when it does not.
  Nothing is published there until the platform's Phase 0a gate (stable structural definitions).

### AX Check

[AX Check](https://www.ax-check.com/dna.codes) (Gauge) grades whether a coding agent can read the
site and get started. The grade is provisional and technical only. Coding sessions are separate
evidence and do not change it. `unassessed` means not measured.

`npm run check:ax` is the pull-request gate for the signal this site owns: the homepage answers
`Accept: text/markdown` with a Markdown representation of the same page.

- The build writes `dist/index.md` from the homepage HTML (`scripts/emit-homepage-markdown.mjs`).
  The page advertises it with `<link rel="alternate" type="text/markdown" href="/index.md">`.
  Every content link in the HTML has to survive in that Markdown.
- GitHub Pages serves `/index.md` as `text/markdown` and ignores `Accept` on `/`. Negotiation
  runs at Cloudflare, which already proxies the apex. The worker in
  `cloudflare/markdown-negotiation/` is routed only at `dna.codes/` so the rest of the site
  never enters it. A client that prefers `text/markdown` gets `index.md` with
  `Content-Type: text/markdown` and `Vary: Accept`. A browser, which asks for `text/html`
  first, still gets the HTML page.
- Deploy that worker with the `Markdown negotiation` workflow once `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID` are set on the repository. The token needs Workers Scripts edit and
  Workers Routes edit on the zone. The worker reads `/index.md` from GitHub Pages and, when
  that file is not on the origin yet, falls through to the HTML page. The live check stays
  red until both the worker and a site deploy that contains `index.md` are out.
- Confirm production with `curl -sI -H "Accept: text/markdown" https://dna.codes/`. The response
  should carry `content-type: text/markdown` and `vary: Accept`.

Markdown 404 bodies still need a server behavior GitHub Pages does not offer. The API, OpenAPI
and CLI checks only apply once those products exist.

### Search keywords

Measured queries live in `src/data/seo/keywords.json`, written by `npm run keywords:import`
from a CSV with the seed's header. A landing page calls `seoFor(route)` from `src/utils/seo.ts`.
A post that owns a query sets `targetKeyword` and leaves `metadata.title` unset, so the registry
supplies the search title.

Four routes own the primaries: `/sop-software`, `/operating-model`, `/business-process-software`,
and `/blog/business-process-modeling`. A secondary phrase is a heading on its page, not another
route. Business process modeling notation and business process management are headings on that
post. `/blog/business-process-management` redirects there.

The three landing pages are the header and footer menu **Use Cases**, titled SOP Software, Target
Operating Model, and Business Process Software. Each shows a visual drawn from the ecommerce genome,
in the same frame as the product demos: a running SOP, an operating-model board (roles, process,
rules, systems), and a process diagram of steps, roles, and work. The business-process page's
heading is Living Business Processes. Its search title stays the registry row.

An agent meets those pages in two places this repo owns. `/llms.txt` lists them under Search and
tells an agent when to send someone there. The homepage Markdown's "For agents" block, written by
`scripts/emit-homepage-markdown.mjs`, names the same four with a line each, because an agent that
only reads `/index.md` never opens `/llms.txt`. Change a route and update both.

`public/agents/` is generated by dna-codes-platform. Do not add these pages there.

## Search crawl

Moz crawls the live site. `npm run check:crawl` runs the same four checks against `dist/` after
`npm run build`, and CI runs it with the other dist checks. A page that fails one of these is
the same report as the crawl export.

**Canonical.** Every indexable page needs `<link rel="canonical">`. `Metadata.astro` adds it for
pages that use the layout. A file in `public/` is copied through as authored, so it does not get
one unless you write it. `/building-with-ai/` is the case that shipped without one.

**noindex.** Tag archives (`/tag/...`) are linked from every post. `src/config.yaml` sets
`apps.blog.tag.robots.index: true`. The AstroWind default is `false`, and that default is what
Moz reports as "has meta noindex" on each tag. Do not set `index: false` on a page you want in
the crawl. The only allowlisted `noindex` pages are `/decapcms/`, the admin UI, and blog list
pages after the first (`/blog/2`, and the same for a tag or category). Another page that must
stay out of the index has to be added to the allowlist in `scripts/crawl-check.mjs`, with a reason.

**Title width.** Moz flags a `<title>` wider than about 600 pixels. The check estimates that
width and can be about 20 pixels off, so keep the rendered title under 560. The site suffix is
` — DNA Codes`. When a headline plus the suffix is too wide, set `metadata.title` to a shorter
search title and `metadata.ignoreTitleTemplate: true`. The headline on the page stays the
`title` field. The posts in The Future of Programming series already do this. A page that owns a
keyword gets its search title from the registry instead. Keep that registry title inside the
same limit.

**Thin content.** Moz counts words in the HTML. It does not read `<script>`, and it does not
count words that exist only after JavaScript runs. `/building-with-ai/` is a self-contained app
whose copy lives in a script, so the crawl saw a header and an empty panel. The text version is
the `.crawl-summary` article in `public/building-with-ai/index.html`: in the body, outside the
script, clipped so the full-screen companion does not scroll. It has to stay past 250 words and
match the eras and phases in the script. Any new indexable HTML file under `public/` has the
same requirement. `public/agents/` is generated elsewhere and is not part of this check. Do not
put the only copy of the words in `<noscript>`, `hidden`, or `display:none`.

## Verification Checklist

After changes, always verify:

1. `npm run build` succeeds
2. `npm run check` passes (astro check + ESLint + Prettier)
3. `npm run check:agentic` passes (is-agentic.com signals in `dist/`)
4. `npm run check:ax` passes (homepage Markdown negotiation)
5. `npm run check:keywords` passes (keyword registry assignments against `dist/`)
6. `npm run check:crawl` passes (canonical, indexable tags, title width, thin content)
7. Visual check in browser: homepage, blog, dark mode, mobile menu
