# Personal agents quickstart

For OpenClaw, Hermes, and other chat-first agents that work for a person.
Install the skill, connect DNA MCP, register a sandbox, and post the claim link
in the same chat.

Also: [Agent quickstart](./agent-quickstart.md) ·
[Approving spend](./approving-spend.md)

## 1. Install the skill

When hubs are published:

```bash
# OpenClaw / ClawHub
openclaw skills install business-rules
# or: clawhub … / skills search "business rules"

# Hermes
hermes skills install <hub-id-or-SKILL.md-URL>
```

Until publish: copy
`agents/listings/clawhub-hermes/packages/business-rules/` into the client's
skills directory (`~/.openclaw/skills`, `~/.hermes/skills`, etc.).

OM-1 teaching skills (no MCP required) remain under `agents/skills/` and install
via skills.sh — see [skills-sh runbook](../listings/skills-sh/RUNBOOK.md).

## 2. Connect DNA MCP

Use the snippets in [`../listings/clawhub-hermes/mcp/`](../listings/clawhub-hermes/mcp/):

| Client | Config |
| --- | --- |
| OpenClaw | `mcp/openclaw.json5` → node `mcp.servers` |
| Hermes | `mcp/hermes.yaml` → `mcp_servers` then `/reload-mcp` |
| Agent Zero | `mcp/agent-zero.json` → External MCP Servers |
| nanobot | Same remote URL + bearer in the client's MCP settings |

URL shape: `https://agents.dna.codes/o/{org}/mcp` with
`Authorization: Bearer <token>`.

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

1. Call `list` / `get` / `validate` / `apply` as the skill describes.
2. On `needs_claim`, **post the claim URL in the chat** where your person already
   is — that is the easiest claim path for personal agents.
3. After they claim, continue with the same credential.

## 5. Spend and caps

Person sets plan, credits, and spend caps. Agents never raise
`spend_cap_reached`. See [Pricing and limits](./pricing-and-limits.md).

## Shipped tools only

`describe`, `validate`, `apply`, `get`, `list`, `diff`, `set-egress-allowlist`.
