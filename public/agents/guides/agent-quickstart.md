# Agent quickstart

Take a fresh agent from **no credential** to a **claimed Workspace**, using only
shipped surfaces.

Also read: [Authentication](https://dna.codes/agents/auth.md) ·
[Tools](https://dna.codes/agents/docs/tools.md) ·
[Refusals](https://dna.codes/agents/refusals.md)

## 1. Register

**With a shell (preferred):**

```bash
npx @dna-codes/cli init --json        # local AGENTS.md rule (+ tries register)
npx @dna-codes/cli register --json    # live sandbox; fails if the host is down
```

`register` solves proof of work, creates a sandbox organization, writes `DNA_*`
settings without overwriting existing values, and prints the claim link and
expiry. `init` always appends the AGENTS.md rule once (also to CLAUDE.md if
present); when credentials are missing it also tries registration and still
succeeds locally if the host is unreachable (`--local` skips the network).
Agents that need a bearer should call `register --json` (or check
`registered` from `init --json`).

**Without a shell:**

1. `POST https://agents.dna.codes/register/challenge`
2. Solve the challenge (SHA-256 leading zero bits as returned).
3. `POST https://agents.dna.codes/register` with the solution.
4. Keep `credential` (bearer) and `claim` link from the response.

There is **no** MCP registration tool and **no** `dna_start`.

## 2. Connect MCP

If `init` wrote local settings, prefer:

```bash
npx @dna-codes/cli mcp
npx @dna-codes/cli status --json
```

Otherwise connect Streamable HTTP directly:

- URL: `https://agents.dna.codes/o/{org}/mcp`
- Header: `Authorization: Bearer <token>`

Example (Claude Code):

```bash
claude mcp add --transport http dna "https://agents.dna.codes/o/<org>/mcp" \
  --header "Authorization: Bearer <token>"
```

## 3. Do work with shipped tools

Closed tool set:

| Tool | Role |
| --- | --- |
| `describe` | Grammar and definition schemas |
| `list` | What exists in the org |
| `get` | Fetch a domain or behaviour |
| `validate` | Check before write |
| `apply` | Write DNA |
| `diff` | Compare to stored version |
| `set-egress-allowlist` | Post-claim egress destinations |

Typical loop: `list` → `get` → edit → `validate` → `apply`.

## 4. When you hit `needs_claim`

Unclaimed sandboxes cap governed acts per day. Reads and `validate` still work.
On `needs_claim`:

1. Do **not** invent a payment or claim API for your own credential.
2. Give your person the **claim link** from `register` / `init`.
3. After they claim, retry with the **same** bearer — the org address stays.

Other limit codes: see [Pricing and limits](./pricing-and-limits.md).

## 5. Hand off to a person

Message them the claim URL and that DNA holds the business rules for this
project. They continue with [Approving spend](./approving-spend.md).

## Done when

- MCP `tools/list` shows the seven shipped tools.
- You have applied or validated at least one document, **or** you stopped cleanly
  on `needs_claim` with the claim link delivered to a person.
