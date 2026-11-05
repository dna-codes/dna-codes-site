# OpenRouter cookbook example — outline

**Status:** outline for submission to OpenRouter's cookbook. Implementation and
PR are ops/dev follow-up; this file is the content contract.

## Goal

Show a developer running an OpenRouter Agent SDK agent that:

1. Loads DNA tools through `@openrouter/mcp` against the DNA remote MCP server.
2. Starts with **no** DNA credential, registers a sandbox, and obtains a claim
   link.
3. Uses only shipped tools (`describe`, `list`, `get`, `validate`, `apply`, …).

## Prerequisites

- OpenRouter API key
- Node.js current LTS
- Network access to `https://agents.dna.codes`

## Example shape (pseudocode)

```ts
import { /* Agent SDK entry points per current OpenRouter docs */ } from "@openrouter/sdk";
import { /* MCP helper */ } from "@openrouter/mcp";

// 1. Register sandbox (CLI subprocess or HTTP register/challenge → register)
//    Capture: org id, bearer token, claimUrl

// 2. Attach remote MCP
const dnaMcp = {
  type: "http", // streamable-http
  url: `https://agents.dna.codes/functions/v1/dna/o/${org}/mcp`,
  headers: { Authorization: `Bearer ${token}` },
};

// 3. Run agent with DNA tools; first call: describe or list
// 4. Print claimUrl for the human when needs_claim appears
```

Exact import names follow the live `@openrouter/mcp` docs at submit time.

## Attribution (platform calls)

When **DNA's** platform model calls go through OpenRouter, send:

- `HTTP-Referer: https://dna.codes`
- `X-OpenRouter-Title: DNA`
- At most two recognized `X-OpenRouter-Categories` (e.g. `programming-app`)

Cookbook sample agents using the developer's own key should still identify the
app in OpenRouter headers per OpenRouter app-attribution guidance.

## Checklist for the cookbook PR

- [ ] Repo or gist with runnable example
- [ ] README links [Agent quickstart](./agent-quickstart.md) and auth.md
- [ ] No `dna_search` / `dna_describe` / `dna_start`
- [ ] Demonstrates claim-link handoff on `needs_claim`
- [ ] Submit / open PR against Works with OpenRouter + cookbook process
