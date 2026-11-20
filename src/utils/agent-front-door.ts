// The agent front door (openspec sandbox-cta-front-door). The site has two doors: the waitlist
// buttons are for people, and /agents/ plus the root llms.txt are for agents. An agent registers
// a sandbox, does real work, and its person claims it; the claim link is how that person signs up.
//
// No path aliases here: astro.config.ts and `node --test` both import this file.

import { existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const AGENTS_HREF = '/agents/';
export const AGENTS_TEXT = 'For agents';

export const SAME_AS = [
  'https://github.com/dna-codes',
  'https://x.com/dnacodes',
  'https://www.npmjs.com/org/dna-codes',
];

// Design D3. one-mcp-url shipped (19 Nov 2026), so step 2 names https://agents.dna.codes/mcp
// first; a registered sandbox's token is issued for the per-organization URL.
export const AGENTS_START_HERE = `## Agents: start here

The way in to DNA Codes is the sandbox flow: register a sandbox, do real work,
then your person claims it.
There is no waitlist step for agents or for the people they work for.

DNA has a native agent surface: MCP (Streamable HTTP, OAuth), HTTP and A2A at
https://agents.dna.codes.

1. Register a free sandbox (no human needed): \`npx @dna-codes/cli register --json\`
   or POST https://agents.dna.codes/register/challenge, then /register
2. Connect MCP. A client that signs in with OAuth: https://agents.dna.codes/mcp
   (your person signs in and picks a Workspace or a new sandbox). With the token
   from step 1: https://agents.dna.codes/o/{org}/mcp (Bearer)
3. Draft and validate DNA with your person in the conversation
4. Hand your person the claim link so they keep the model. Claiming is how a human signs up.
5. Optional, with your person's OK: add the DNA rule to AGENTS.md
   (https://dna.codes/agents/snippets/agents-md.md) and install the skills:
   \`npx skills add dna-codes/skills\`

- [Agent llms.txt](https://dna.codes/agents/llms.txt)
- [Full agent reference](https://dna.codes/agents/llms-full.txt)

People who arrive without an agent can join the waitlist: https://dna.codes/waitlist/
`;

// The apex section is an input to llms.txt, not a document an agent fetches on its own.
const NOT_A_DOCUMENT = new Set(['apex-llms-section.md']);
const DOCUMENT = /\.(md|json|txt)$/;

/** Sitemap URLs for the agent set in `dir` (public/agents/): /agents/ and every .md, .json and .txt file. */
export function agentDocumentUrls(dir: string, origin: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  (function walk(current: string) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const p = join(current, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (DOCUMENT.test(entry.name) && !NOT_A_DOCUMENT.has(entry.name))
        files.push(relative(dir, p).split(sep).join('/'));
    }
  })(dir);
  return [`${origin}${AGENTS_HREF}`, ...files.sort().map((file) => `${origin}${AGENTS_HREF}${file}`)];
}

/** The plan shape of public/agents/pricing.json, which dna-codes-platform generates. */
export interface AgentPricing {
  currency: string;
  plans: { name: string; freeMonthlyActions?: number; pricePerAction?: number }[];
}

/** A schema.org SoftwareApplication node. Offers come from the published agent pricing. */
export function softwareApplication(pricing: AgentPricing | undefined, origin: string) {
  const url = `${origin}${AGENTS_HREF}`;
  const plan = pricing?.plans.find((p) => p.freeMonthlyActions !== undefined && p.pricePerAction !== undefined);
  const currency = pricing?.currency.toUpperCase();
  return {
    '@type': 'SoftwareApplication',
    '@id': `${origin}/#software`,
    name: 'DNA Codes',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    url,
    sameAs: SAME_AS,
    publisher: { '@id': `${origin}/#organization` },
    offers: plan
      ? [
          {
            '@type': 'Offer',
            name: plan.name,
            price: 0,
            priceCurrency: currency,
            description: `${plan.freeMonthlyActions} actions a month free.`,
            url,
          },
          {
            '@type': 'Offer',
            name: 'Per action',
            description: `After the free ${plan.freeMonthlyActions} actions, each action costs ${plan.pricePerAction} ${currency}.`,
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: plan.pricePerAction,
              priceCurrency: currency,
              unitText: 'action',
            },
            url,
          },
        ]
      : undefined,
  };
}
