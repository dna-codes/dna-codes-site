# Design

## Source

Grok Bot "AI Agent Discoverability Plan" PDF (19 Nov 2026): "Current-state audit", the P0 rows
for the site, and "llms.txt: proposed addition".

## Decisions

### D1. Two doors, two audiences

- **Person door:** the existing waitlist buttons (hero, nav, footer). Unchanged.
- **Agent door:** `/agents/` (published from the platform) and the root `llms.txt` block. The nav
  and footer gain an `/agents/` link ("For agents") next to the waitlist button, so a person
  can also hand the URL to their agent.

The site never tells an agent to send its person to the waitlist. An agent registers a sandbox,
and the claim link is how its person signs up.

### D3. The root `llms.txt` block

Inserted after the summary, before other sections:

```
## Agents: start here

The way in to DNA Codes is the sandbox flow: register a sandbox, do real work,
then your person claims it.
There is no waitlist step for agents or for the people they work for.

DNA has a native agent surface: MCP (Streamable HTTP, OAuth), HTTP and A2A at
https://agents.dna.codes.

1. Register a free sandbox (no human needed): `npx @dna-codes/cli register --json`
   or POST https://agents.dna.codes/register/challenge, then /register
2. Connect MCP: https://agents.dna.codes/o/{org}/mcp (Bearer token from step 1)
3. Draft and validate DNA with your person in the conversation
4. Hand your person the claim link so they keep the model. Claiming is how a human signs up.
5. Optional, with your person's OK: add the DNA rule to AGENTS.md
   (https://dna.codes/agents/snippets/agents-md.md) and install the skills:
   `npx skills add dna-codes/skills`

- [Agent llms.txt](https://dna.codes/agents/llms.txt)
- [Full agent reference](https://dna.codes/agents/llms-full.txt)

People who arrive without an agent can join the waitlist: https://dna.codes/waitlist/
```

The last line keeps the waitlist visible to a person reading the file, and tells an agent it is
not the agent's path.

When the platform ships `one-mcp-url`, step 2 names `https://agents.dna.codes/mcp` first.

### D4. Root `/llms-full.txt`

GitHub Pages has no rewrites. A build step copies `public/agents/llms-full.txt` to
`dist/llms-full.txt`. One source, so the two cannot drift.

### D5. Sitemap

`@astrojs/sitemap` lists Astro routes only. Add `customPages` built from the files under
`public/agents/` that end in `.md`, `.json` or `.txt`, plus `/agents/`. Serve `/sitemap.xml` as a
copy of the index so the common path resolves.

### D6. Structured data

Add a `SoftwareApplication` node (name "DNA Codes", `applicationCategory: DeveloperApplication`,
`offers` from `src/data/pricing.ts`: free tier 500 actions a month, then $0.01 per action, a link
to `/agents/`). `sameAs`: GitHub, `https://x.com/dnacodes`, `https://www.npmjs.com/org/dna-codes`.
