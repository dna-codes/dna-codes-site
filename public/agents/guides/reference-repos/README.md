# Public reference repos (outlines)

Each domain gets a **public** GitHub repo an agent can clone and use immediately.
This directory holds outlines and file checklists; live repos are created by ops.

| Domain | Outline | Suggested repo |
| --- | --- | --- |
| Checkout / commerce | [`checkout.md`](./checkout.md) | `dna-codes/reference-checkout` |
| Home-loan lending | [`home-loan-lending.md`](./home-loan-lending.md) | `dna-codes/reference-lending` |
| M&A diligence | [`ma-diligence.md`](./ma-diligence.md) | `dna-codes/reference-ma-diligence` |

## Required contents (every repo)

- DNA documents (structure + behaviour) for the domain sample
- MCP configuration (`.mcp.json` / client snippets) pointing at DNA remote MCP
- Skills: at least `business-rules` instructions, plus
  `npx skills add dna-codes/skills` (`dna-operational`, `dna-sync`) + connection notes
- `AGENTS.md` with the short auto-invoke rule (shipped tool names only)
- `README.md` linking [Agent quickstart](../agent-quickstart.md)

## Remaining ops steps

- [ ] Create the three public repos from these outlines
- [ ] Seed DNA + MCP config + AGENTS.md
- [ ] Link from `https://dna.codes/agents/` and Context7 docs repo
