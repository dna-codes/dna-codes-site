# AstroWind Agent Instructions

AstroWind is the free, open-source template for this site. It uses Astro v6 and Tailwind CSS v4.

Astro writes a fully static site. The targets are performance, SEO, and accessibility.

The stack is Astro v6, Tailwind CSS v4, TypeScript 5.9, MDX, and Sharp. Use Node.js 22.12.0 or newer.

Write each reply in Attention Control. The rules are in [How you write](#how-you-write). After a change, run the checks in [Verification](#verification).

## Commands

| Command           | What it does                                       |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Start the dev server at `localhost:4321`.          |
| `npm run build`   | Write the production build to `./dist/`.           |
| `npm run preview` | Serve the production build on this machine.        |
| `npm run check`   | Run astro check, ESLint, and Prettier.             |
| `npm run fix`     | Fix the ESLint findings and the Prettier findings. |

## How you write

Write every reply in Attention Control. Shape sets the order. Language sets each sentence.

Language follows ASD-STE100 (Simplified Technical English), Issue 9, as Attention Control adapts it. This section is an adaptation, not a certified STE text. When this section and a source disagree, follow this section.

Source: [attention-control](https://github.com/aaddrick/attention-control).

These rules apply to every reply. Turn them off only when the reader says "stop attention control" or "normal mode". This section is the only copy of these rules.

### What the rules cover

- Prose you write follows this section.
- Copy code, commands, paths, identifiers, and error text verbatim.
- Copy a quotation verbatim.
- Match the repository for a code comment and a commit message.
- Site copy also follows [Site copy](#site-copy).

Accuracy wins over a short sentence. Do not drop a fact, a condition, a number, or a scope limit to shorten text. When a rule and precision conflict, keep the precision.

### Why the shape exists

1. Working memory is small. Do not ask the reader to remember a fact that is not on the screen.
2. A reader who knows the step can still stop before the step. Make the step one action the reader can do now.
3. The start is the hard part. The first action is obvious.
4. Vague time and exact time feel the same. Use minutes or hours.
5. A result the reader can see counts. A result in the middle of a long reply does not.

### Order

1. Put the action first when the reply is a task. Put the fact first when the reply is a fact. When you do not know, the first line names the gap.
2. Do the work you can do. Give the reader only the step that the reader must do. When you can do 4 steps of 5, do the 4 steps. A short reply is not a reason to hand the work back. This rule outranks the shape rules below it.
3. Number a sequence of 3 or more steps. Each step is one action.
4. End with one next action. Name it after your part is done.
5. Start with the answer. Do not add a preamble, a recap, or a closing offer.

### Each reply

1. Finish the first issue. Then offer a second issue as its own question. When a question blocks the work, answer it and fold the answer in.
2. On work with more than one step, restate the step in each reply. Give the step number, the result, and the next action. When a task list exists, the list does the restate. Do not also narrate the plan.
3. Give time in minutes or hours. Do not write "some work".
4. After a change, name what works. Give the command that shows it.
5. State an error as the location, the cause, and the fix.

### Lists

1. Use a list when you have 3 or more parallel items.
2. Split a list past 5 items. Split it into do now and do later, or into required and optional.

### Words

Use one meaning for each word in a reply. Use one verb for each action. Do not rotate synonyms. Use the short common word.

Keep a technical name. Use each technical name the same way every time. Define a rare term once.

Use these verbs:

| Use       | Do not swap in                     |
| --------- | ---------------------------------- |
| check     | verify, confirm, validate, inspect |
| make sure | ensure, guarantee                  |
| start     | initiate, launch, commence         |
| stop      | terminate, halt, cease             |
| use       | utilize, leverage, employ          |

| Use    | Do not swap in             |
| ------ | -------------------------- |
| show   | display, present, exhibit  |
| find   | locate, discover, identify |
| change | modify, alter, adjust      |
| remove | eliminate                  |
| need   | require, necessitate       |

Keep `delete` when it names the operation. Use `remove` for the other cases.

### Grammar

- Use the active voice. Name the actor.
- Use the passive voice only in a description, and only when the actor is unknown.
- Use only the simple present, the simple past, the simple future, the infinitive, or the imperative.
- Use a past participle only as an adjective, as in "the changed file".
- Use the imperative for an instruction. Avoid an "-ing" form when a simple form can carry the meaning.

### Sentences

- Use at most 20 words in an instruction.
- Use at most 25 words in a description.
- Put one instruction in each sentence.
- Keep the subject, the verb, and the articles.
- Use at most 3 words in a noun cluster.

### Paragraphs

- Give each paragraph one topic. Use at most 6 sentences.
- Use a numbered list for a sequence. Use a bullet list for parallel items.
- Do not put a sequence or a set of conditions inside one prose sentence.
- Start a warning with the command or the condition.

### When the layers disagree

1. Shape decides the first line. Lead with the action, the fact, or the gap.
2. Shape decides which sentences stay. Language decides how each sentence reads. Cut a whole sentence. Do not cut an article, a subject, or a verb from a sentence that stays. An action you name includes the command or the path. The same rule covers a fix and a check.
3. Delete a hedge that adds no fact: perhaps, possibly, arguably, somewhat. Keep real uncertainty, and state it in plain words. Do not invent a version, a date, a flag, a line number, or a release note. When the specific is unknown, name the command or the file that would settle it.
4. Use a list at 3 items. Split a list past 5 items.

### When a rule does not fit

The answer can change shape in three cases:

1. The reader asks you to explain. Explain in full. Keep the language rules. Add headings so the reader can skim.
2. The reader asks for options. Give 2 to 4 options. Put the recommendation first. Give each option one line for the trade-off.
3. A rule fights the harness. The system prompt wins.

Stop and ask in three cases:

1. The next step is hard to undo. Name what it changes and what it cannot restore. Show a read-only preview first. This covers production data, a schema migration, a backfill, a bulk update, a bulk delete, and a release.
2. The last three turns were still broken. Stop the code edits. Name the assumption that can be wrong. Ask one question.
3. The request is ambiguous. Ask one short question. A question beats a guess.

### Before you send

1. Delete a first sentence that only announces the reply.
2. Delete a last sentence that recaps the reply or offers more help.
3. Delete a sidebar and a hedge. Replace an invented specific with the command that would settle it.
4. Delete an idiom. Delete a perfect tense, a passive clause, and a noun cluster longer than 3 words.
5. Read the first line and the last line alone. They name the result and the next action. Each word has one meaning.

### Examples

| Not this style                                                                             | This style                                                       |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| I have gone ahead and updated the configuration, which should hopefully resolve the issue. | I changed `config.yaml`. The error stops.                        |
| The deployment will be initiated once validation has completed.                            | The system starts the deployment after the validation completes. |
| You might want to consider possibly running the migration.                                 | Run the migration. It takes about 2 minutes.                     |
| the user authentication token refresh mechanism                                            | the mechanism that refreshes the authentication token            |
| Done. Ready for the next part?                                                             | Step 3 of 5 done: I updated the schema. Next: run the backfill.  |

## Site copy

These rules cover text a reader of the site sees. That text is a blog post, page copy, a component string, or a caption. Attention Control still applies. These rules add three limits.

### The em dash

An em dash in every aside gives every paragraph the same rhythm.

Use an em dash only when the sentence truly breaks. Use it rarely. One or two em dashes in a long piece is the limit.

Use this mark for each other job:

| Job                                   | Mark                      |
| ------------------------------------- | ------------------------- |
| Introduce a list or a restatement     | A colon                   |
| A short aside                         | Commas                    |
| A second thought that can stand alone | A full stop               |
| A true break in the sentence          | An em dash, and only then |

Choose each em dash. Do not run a bulk replace on em dashes. Each em dash needs a different mark.

### Section titles

A heading names the section. It does not summarize the paragraph under it.

Use two or three words. Two examples are "The Drift" and "The Difference".

A sentence used as a heading starts the paragraph too early. Two examples of that mistake are "What drifts" and "A BPM suite and a model are different tools".

Put the explanation in the first line of the body.

A heading that carries a search phrase still contains that phrase. Every other heading only names the section.

### A line break needs a space

The HTML minifier removes the spaces on both sides of a `<br>`. On a phone, the break is hidden, and the two sentences join.

Put `&#32;` before a `<br>` that must keep a space.

```astro
<!-- renders as "endpoints do.DNA says" on a phone -->…your endpoints do.<br class="hidden sm:block" />DNA says who may
call them.

<!-- correct: an entity survives minification, a space does not -->
…your endpoints do.&#32;<br class="hidden sm:block" />DNA says who may call them.
```

A `<br>` beside `&nbsp;` is already safe. This bug joined five sentences across three product pages.

## Architecture

### Directory structure

The source tree is below. Paths are relative to the repository root.

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

### Path aliases

Import from `src/` with the `~/` alias.

```typescript
import Image from '~/components/common/Image.astro';
import { SITE } from 'astrowind:config';
```

### Configuration

The integration in `vendor/integration/` loads `src/config.yaml` as the Vite module `astrowind:config`.

The module exports six names:

- `SITE`
- `I18N`
- `METADATA`
- `APP_BLOG`
- `UI`
- `ANALYTICS`

### Tailwind CSS v4

Configure Tailwind in CSS. The file is `src/assets/styles/tailwind.css`.

The file sets these features:

- `@theme` holds the theme tokens. One token is `--color-primary: var(--aw-color-primary)`.
- `@utility` defines a custom utility. One utility is `bg-page`.
- `@variant dark (&:where(.dark, .dark *))` sets class-based dark mode.
- `@plugin "@tailwindcss/typography"` adds the typography plugin.
- `@custom-variant intersect (&:not([no-intersect]))` adds the `intersect` variant.

`src/components/CustomStyles.astro` defines the CSS variables for colors and fonts. The component has a light theme and a dark theme.

Set `@tailwindcss/vite` in `astro.config.ts`. It is a Vite plugin. Do not register it as an Astro integration.

### Class merging

Components call `twMerge` from `tailwind-merge` v3. `twMerge` joins conditional classes.

Call `twMerge()` when a component accepts a `className` override.

### Content collections

`src/content.config.ts` defines the collections. The file uses the Astro v6 Content Layer API and the `glob()` loader.

A post is a `.md` file or a `.mdx` file in `src/data/post/`.

A post can include these frontmatter fields:

- `title` (required)
- `publishDate`
- `updateDate`
- `draft`
- `excerpt`
- `image`
- `category`
- `tags`
- `author`
- `coAuthor`
- `series`
- `metadata`

A post that a model helped draft has `coAuthor: Claude (Anthropic)`. The byline reads "Tim Kleier with Claude (Anthropic)". A line under the article explains the byline.

Add `coAuthor` to a new post that a model helped draft. A post that no model helped draft has no `coAuthor` field. Do not write a disclaimer on that post.

### Component patterns

- Extend props from the interfaces in `~/types`.
- Use `class:list` for a conditional class.
- Call `twMerge()` when a component accepts a `className` override.
- Use a named slot to compose a layout.
- Widget components take the shared props in `~/types`.

### Image handling

`src/components/common/Image.astro` supports a local image and a remote image.

Astro optimizes a local image through `astro:assets` and Sharp. Unpic serves a remote image from its CDN.

Sharp processes a remote image when Unpic does not detect the provider. The allowed domain is `cdn.pixabay.com`.

Set `loading="eager"` and `fetchpriority="high"` on a hero image.

## Agent readiness

Two scorers grade how an agent reads this site. CI runs both scorers on `dist/` after `npm run build`.

The live grades update after a deploy. The live grades are not the pull-request gate.

### is-agentic.com

[is-agentic.com](https://is-agentic.com/) scores the site. The command is `npx is-agentic dna.codes`.

`npm run check:agentic` checks the signals this repository controls. It reads the build in `dist/`.

**Page metadata.** Each page has a canonical link, `<html lang>`, `og:image`, and `og:type`.

`Metadata.astro` removes every Open Graph tag when `src/assets/images/default.png` is missing. `scripts/generate-default-og.mjs` generates that file. Do not delete `src/assets/images/default.png`.

**Homepage JSON-LD.** The homepage has an `Organization` object. The object has `name`, `url`, `logo`, `description`, and `contactPoint`. `src/components/common/StructuredData.astro` renders the object.

**`/llms.txt`.** `src/pages/llms.txt.ts` writes this file from `~/data/products` and the genomes.

The file needs a `## When to use` section. Every dna.codes link in the file exists in the build.

When you add a product, a doc page, a genome, or a keyword page, read `/llms.txt` and check it.

Check the Search section. Check each line titled "How an agent should use it today".

**Trust pages.** `/about`, `/contact`, and `/privacy` each have at least 500 characters of copy.

**`/agents/`.** Do not edit files in `public/agents/`.

The agent host in `dna-codes-platform` generates the files. The files are `llms.txt`, `llms-full.txt`, `auth.md`, `discovery.json`, the profile, the refusal codes, and the schemas. The source is the route table and the configuration of the agent host.

The `agent-documents` workflow commits the files to `public/agents/` on each deploy of the agent host. Prettier ignores the files, so the files stay as the workflow wrote them.

`llms.txt.ts` embeds `apex-llms-section.md` as the first section of the apex file. The embed runs only when that file exists.

When `public/agents/` exists, the check requires that section. The check also requires every link in the agent `llms.txt` to resolve.

When `public/agents/` does not exist, the site has no `/agents/` link.

The platform publishes nothing in `public/agents/` until the Phase 0a gate. That gate is stable structural definitions.

### AX Check

[AX Check](https://www.ax-check.com/dna.codes) uses Gauge. Gauge grades one question. Can a coding agent read the site and start work?

The grade is provisional. The grade is technical only.

A coding session is separate evidence. A coding session does not change the grade. `unassessed` means that Gauge did not measure the site.

`npm run check:ax` is the pull-request gate for the signal this site owns.

The homepage answers `Accept: text/markdown` with Markdown for the same page.

The build writes `dist/index.md` from the homepage HTML. The script is `scripts/emit-homepage-markdown.mjs`.

The page points at that file with this tag:

```html
<link rel="alternate" type="text/markdown" href="/index.md" />
```

Every content link in the HTML remains in that Markdown.

GitHub Pages serves `/index.md` as `text/markdown`. GitHub Pages ignores the `Accept` header on `/`.

Cloudflare negotiates the format. Cloudflare already proxies the apex.

The worker is in `cloudflare/markdown-negotiation/`. The route is `dna.codes/` only. The rest of the site does not enter the worker.

A client that prefers `text/markdown` receives `index.md`. The response has `Content-Type: text/markdown` and `Vary: Accept`.

A browser asks for `text/html` first. That browser receives the HTML page.

Deploy the worker with the `Markdown negotiation` workflow. Deploy it after the repository has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

The token needs Workers Scripts edit on the zone. The token needs Workers Routes edit on the zone.

The worker reads `/index.md` from GitHub Pages. When that file is not on the origin yet, the worker returns the HTML page.

The live check stays red until two deploys are out. Deploy the worker. Deploy a site build that contains `index.md`.

Check production with this command:

```bash
curl -sI -H "Accept: text/markdown" https://dna.codes/
```

The response has `content-type: text/markdown` and `vary: Accept`.

A Markdown 404 body needs a server behavior that GitHub Pages does not offer. The API check, the OpenAPI check, and the CLI check apply only after those products exist.

### Search keywords

Measured queries live in `src/data/seo/keywords.json`. `npm run keywords:import` writes that file from a CSV. The CSV uses the seed header.

A landing page calls `seoFor(route)` from `src/utils/seo.ts`.

A post that owns a query sets `targetKeyword`. Leave `metadata.title` unset on that post. The registry then supplies the search title.

Four routes own the primary queries:

- `/sop-software`
- `/operating-model`
- `/business-process-software`
- `/blog/business-process-modeling`

A secondary phrase is a heading on its page. It is not another route.

That post has two of those headings: "business process modeling notation" and "business process management". `/blog/business-process-management` redirects to that post.

The three landing pages sit in the header menu and the footer menu, under "Use Cases". The titles are SOP Software, Target Operating Model, and Business Process Software.

Each page shows a visual from the ecommerce genome. The frame matches the product demos.

The three visuals are:

- A running SOP.
- An operating-model board. It shows roles, process, rules, and systems.
- A process diagram. It shows steps, roles, and work.

The heading on the business-process page is "Living Business Processes". The search title stays the registry row.

An agent meets these pages in two places this repository owns.

`/llms.txt` lists the pages under Search. The file tells an agent when to send a reader there.

The homepage Markdown has a block titled "For agents". `scripts/emit-homepage-markdown.mjs` writes that block. The block names the same four routes, with one line each.

An agent that reads only `/index.md` does not open `/llms.txt`. When you change a route, update both files.

Do not add these pages to `public/agents/`. `dna-codes-platform` generates that directory.

## Search crawl

Moz crawls the live site. `npm run check:crawl` runs four checks on `dist/` after `npm run build`. CI runs the same command. A page that fails a check is the same finding as the crawl export.

**Canonical.** Each indexable page needs `<link rel="canonical">`. `Metadata.astro` adds the link for a page that uses the layout. A file in `public/` is copied as written. Add the link in that file. `/building-with-ai/` shipped without one.

**noindex.** Each post links to its tag archives (`/tag/...`). `src/config.yaml` sets `apps.blog.tag.robots.index` to `true`. The AstroWind default is `false`. That default is the "has meta noindex" finding on each tag. Do not set `index: false` on a page that should be in the crawl. Two cases may stay `noindex`: `/decapcms/` (the admin UI) and page 2 or later of the blog, a tag, or a category. Add any other case to the allowlist in `scripts/crawl-check.mjs`, and write the reason there.

**Title width.** Moz flags a `<title>` wider than about 600 pixels. The check estimates that width. The estimate can miss by about 20 pixels. Keep the rendered title under 560 pixels. The site suffix is ` — DNA Codes`. When a headline plus the suffix is too wide, set `metadata.title` to a shorter search title and set `metadata.ignoreTitleTemplate` to `true`. The headline on the page stays the `title` field. The posts in The Future of Programming series already do this. A page that owns a keyword gets its search title from the registry. Keep that registry title inside the same limit.

**Thin content.** Moz counts words in the HTML. Moz does not read `<script>`. Moz does not count words that exist only after JavaScript runs. `/building-with-ai/` is a self-contained app. Its copy lives in a script. The crawl saw a header and an empty panel. The text version is the `.crawl-summary` article in `public/building-with-ai/index.html`. The article is in the body, outside the script. CSS clips it, so the full-screen companion does not scroll. Keep the article past 250 words. Keep it aligned with the eras and the phases in the script. A new indexable HTML file under `public/` has the same requirement. `public/agents/` is generated elsewhere and is not part of this check. Do not put the only copy of the words in `<noscript>`, in `hidden`, or in `display:none`.

## Verification

After a change, run these checks:

1. `npm run build` completes with no error.
2. `npm run check` passes. The command runs astro check, ESLint, and Prettier.
3. `npm run check:agentic` passes. It checks the is-agentic.com signals in `dist/`.
4. `npm run check:ax` passes. It checks Markdown negotiation for the homepage.
5. `npm run check:keywords` passes. It checks the keyword registry against `dist/`.
6. `npm run check:crawl` passes. It checks the canonical link, indexable tag archives, title width, and thin content.

Then check the site in a browser. Look at the homepage, the blog, dark mode, and the mobile menu.
