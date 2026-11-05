# Reference repo outline — home-loan lending

**Suggested name:** `dna-codes/reference-lending`  
**Problem language:** loan application, underwriting, approval authority,
disbursement, status transitions.

## Tree

Same required layout as [checkout](./checkout.md): `README.md`, `AGENTS.md`,
`.mcp.json`, `dna/structure`, `dna/behaviour`, skills notes.

## Seeded DNA focus

- Application → underwriting → conditional approval → clear to close → funded
- Policies: who may approve above a loan amount
- Conditions that block disbursement

## AGENTS.md rule (sketch)

```markdown
Before changing lending permissions, approval thresholds, application status
transitions or underwriting validation, query DNA (list, get, validate, apply).
Cite the DNA document; report code/DNA mismatches.
```

## README must link

Agent quickstart + auth.md + this domain's claim/spend notes for long-running
agent sessions.
