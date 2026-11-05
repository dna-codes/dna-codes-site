# Reference repo outline — checkout

**Suggested name:** `dna-codes/reference-checkout`  
**Problem language:** cart, order, payment authorization, refund, who can
approve a refund.

## Tree

```
README.md                 # links agent quickstart; one-liner install
AGENTS.md                 # DNA auto-invoke rule (shipped tools)
CLAUDE.md                 # optional same rule
.mcp.json                 # remote DNA MCP template with {org} + bearer env
dna/
  structure/              # Product DNA: Order, LineItem, Payment, Refund, …
  behaviour/              # actions, operations, policies for checkout
skills/
  business-rules/SKILL.md # or install instructions for ClawHub / skills.sh
```

## AGENTS.md rule (sketch)

```markdown
Before changing checkout permissions, refund rules, order status transitions or
payment validation, use DNA MCP tools (list, get, validate, apply). Report
mismatches between code and DNA. Do not guess business rules.
```

## README must say

1. `npx @dna-codes/cli register --json` (and `init --json` for AGENTS.md), or how to point MCP at an existing org
2. Link to https://dna.codes/agents/guides/agent-quickstart.md
3. That claim is a person step when `needs_claim` appears

## Sample scenarios for the seeded DNA

- Place order → authorize payment → capture
- Request refund under threshold (auto) vs over threshold (needs approval)
- Cancel unpaid order
