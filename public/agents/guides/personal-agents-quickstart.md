# Personal agents quickstart

For OpenClaw, Hermes, and other chat-first agents that work for a person.
Install the skill, connect DNA MCP, register a sandbox, and post the claim link
in the same chat.

Also: [Agent quickstart](./agent-quickstart.md) ·
[Approving spend](./approving-spend.md)

## 1. Install the skill

Personal-agent skill hubs are not published on this host yet. Do not fetch a
path under `/agents/listings/`. Register and connect with the CLI below.

## 2. Connect DNA MCP

URL shape: `https://agents.dna.codes/functions/v1/dna/o/{org}/mcp` with
`Authorization: Bearer <token>`.

After you register, `npx @dna-codes/cli mcp --client generic --json` prints
that URL and the bearer for the client's MCP settings.

## 3. Register if you have no org yet

```bash
npx @dna-codes/cli register --json               # live sandbox (preferred when you need a bearer)
npx @dna-codes/cli init --json                   # AGENTS.md rule; tries register if needed
npx @dna-codes/cli mcp --client generic --json   # URL + bearer for MCP config
```

Or HTTP `register/challenge` → `register`. Put the returned token into the MCP
header. **Do not** look for a `dna_start` tool. A person in the same chat can
also run `npx @dna-codes/cli status` to see the claim link without re-registering.

## 4. Work, then claim in-chat

1. Call `list` / `get` / `validate` / `apply` as the [agent quickstart](./agent-quickstart.md) describes.
2. On `needs_claim`, **post the claim URL in the chat** where your person already
   is — that is the easiest claim path for personal agents.
3. After they claim, continue with the same credential.

## 5. Spend and caps

Person sets plan, credits, and spend caps. Agents never raise
`spend_cap_reached`. See [Pricing and limits](./pricing-and-limits.md).

## Shipped tools only

`describe`, `validate`, `apply`, `get`, `list`, `diff`, `set-egress-allowlist`.
