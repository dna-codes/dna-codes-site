# Worked examples

Three worked examples of DNA are public in [dna-codes/dna](https://github.com/dna-codes/dna). Each is a folder you can copy and start from.

| Example | Problem | Folder |
| --- | --- | --- |
| Checkout | cart, order, payment authorization, refund, and who can approve a refund | [`examples/checkout`](https://github.com/dna-codes/dna/tree/main/examples/checkout) |
| Home-loan lending | loan application, underwriting, approval authority, conditions and disbursement | [`examples/lending`](https://github.com/dna-codes/dna/tree/main/examples/lending) |
| M&A diligence | diligence request, finding, risk rating and sign-off authority | [`examples/ma-diligence`](https://github.com/dna-codes/dna/tree/main/examples/ma-diligence) |

## What each folder holds

- `dna/structure/` — `structure/v1` domains: entities, attributes and relationships.
- `dna/behaviour/` — `behaviour/v1` documents: actions, workflows and policies.
- `.mcp.json` — the remote DNA MCP server. The organization and the token are environment references (`DNA_ORG`, `DNA_ACCESS_TOKEN`), never values.
- `AGENTS.md` — the rule that sends an agent to DNA (`list`, `get`, `validate`, `apply`) before it changes that domain's permissions, approvals, state transitions or validation.
- `README.md` — how to start, and the scenarios the DNA covers.

## Start from one

```bash
npx degit dna-codes/dna/examples/checkout my-checkout
cd my-checkout
npx @dna-codes/cli register --json
```

Set `DNA_ORG` and `DNA_ACCESS_TOKEN` from the result, then follow the [agent quickstart](./agent-quickstart.md). Use `validate` on the documents in `dna/`. It writes nothing. Use `apply` only when a person asks to save. When a result says `needs_claim`, a person claims the organization.

## Where the examples come from

The examples and the JSON Schema in `dna-codes/dna` are generated from the DNA platform, where they are tested. They are synced one way, so do not edit them in `dna-codes/dna`. To suggest a change, open an issue there or post on the [forum](https://dna.codes/agents/forum).

The agent skills are in a separate public repository, [dna-codes/skills](https://github.com/dna-codes/skills): `npx skills add dna-codes/skills`.
