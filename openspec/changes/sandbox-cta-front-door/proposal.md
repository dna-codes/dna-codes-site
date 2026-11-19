# Proposal

## Why

On 19 Nov 2026 Tim chose the sandbox flow as DNA's call to action **for agents**: an agent
registers a sandbox, does real work, and its person claims it. The waitlist stays the call to
action **for people** who browse the site.

The site does not tell agents this. The root `llms.txt` says "the waitlist form is the way in" and
tells agents to "send the user to /waitlist". An agent that reads it sends its person to a form,
when it could register a sandbox itself.

The Grok Bot discoverability audit (19 Nov 2026) also found that the site hides its agent surface:

- The homepage does not link `/agents/`.
- `/llms-full.txt` is 404 at the root; it exists only at `/agents/llms-full.txt`.
- `/sitemap.xml` is 404. `sitemap-index.xml` lists 52 URLs and none under `/agents/`.
- JSON-LD has Organization and WebSite only. `sameAs` lists only GitHub. There is no
  `SoftwareApplication`.

## What Changes

- **Two audiences, two doors.** The waitlist buttons (hero, nav, footer) stay as they are; they
  are for people. Agents get their own door: `/agents/` and the root `llms.txt`.
- **Root `llms.txt`** gains an "Agents: start here" block near the top (text from the audit). The
  two waitlist lines are replaced: an agent uses the sandbox flow; the waitlist is named only as
  the path for a person who arrives without an agent.
- **Homepage nav and footer link `/agents/`.** Every page head carries
  `<link rel="alternate">` for `llms.txt` and `agents/discovery.json`.
- **Root `/llms-full.txt`** is served at build time from the published agent set.
- **Sitemap** includes `/agents/` and its `.md` and `.json` documents, and `/sitemap.xml` resolves.
- **JSON-LD** adds `SoftwareApplication` and extends `sameAs` with X (`@dnacodes`) and npm
  (`@dna-codes`).

## Capabilities

### New Capabilities

- `agent-front-door`: how the site sends agents into the sandbox flow: the root `llms.txt`
  block, the `/agents/` links and alternates, the root `llms-full.txt`, the sitemap and the
  structured data.

### Modified Capabilities

- _(none)_. The `waitlist` capability is unchanged; its buttons stay.

## Impact

- `src/navigation.ts` (an `/agents/` link next to the waitlist button), the layout head,
  `src/pages/llms.txt.ts`, `src/components/common/StructuredData.astro`, `astro.config.ts`
  (sitemap), a build step for `/llms-full.txt`.
- No waitlist button, page or form changes.
- This differs from the audit, which said to replace every waitlist button. Tim decided the
  waitlist is for people and the sandbox is for agents.
- Companion platform changes: `agents-bring-their-human` (generated `/agents/` set, snippets),
  `sandbox-cta-listings`. Ship the root `llms.txt` change in the same train as the regenerated
  `/agents/llms.txt`, so the two agree.
- Coordinates with `agent-fetch-signals` (same `/agents/*` routes; no conflict).
