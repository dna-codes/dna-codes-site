# Pricing and limits (for agents)

Every limit refusal uses the shared refusal shape. Read `refusal.code`,
`refusal.message`, and `refusal.next`. Do not invent HTTP 402 bodies or alternate
codes.

Canonical table: [refusals.md](https://dna.codes/agents/refusals.md) ·
[refusals.json](https://dna.codes/agents/refusals.json)

Published free-plan numbers (plan DNA → `pricing.json` / `llms.txt`):

| Knob | Value |
| --- | --- |
| Free monthly actions | **500** |
| Price per action | **$0.01** |
| Credit packs | **1,000 / $8**, **5,000 / $35**, **25,000 / $150** |

Trust the refusal payload and live `pricing.json` over this guide if they disagree.

## Limit codes and what you do

| Code | Meaning | Agent action | Options (when present) |
| --- | --- | --- | --- |
| `needs_claim` | Sandbox unclaimed; governed acts capped; egress blocked | Hand **claim** link to a person; or **wait** until the daily cap resets | `claim`, `wait` |
| `allowance_exhausted` | Plan / free allowance used up for the period | Ask person for **credits** or **upgrade**; or **wait** for reset | `credits`, `upgrade`, `wait` |
| `plan_limit` | Feature requires a higher plan | Ask person to **upgrade** to the named plan | `upgrade` |
| `spend_cap_reached` | Person-set spend cap hit | Tell the person only they can **raise_cap**; **do not** try to raise it with an agent credential | `raise_cap` (person only) |

Related (not plan pricing, but stop you the same way):

| Code | Agent action |
| --- | --- |
| `needs_approval` | Follow the approval handle; do not resend the act |
| `rate_limited` | Honour `Retry-After` |
| `proof_required` | Re-run register challenge flow |
| `insufficient_scope` | Obtain a token with the required scope (`dna:read` / `dna:write`) |

## Options field (additive)

When the host includes an `options` array on the refusal, each entry names a
path (`claim`, `wait`, `credits`, `upgrade`, `raise_cap`) with links or reset
times. Prefer those payloads over guessing URLs.

## What agents must never do

- Raise a spend cap with an agent credential.
- Bypass claim by joining an existing org as a side effect of sign-in
  (`joining_is_governed`).
- Call non-shipped tools (`dna_search`, `dna_describe`, `dna_start`, …).

## After a person pays or claims

Retry the **same** tool call with the same org credential. Registration and
claim keep the organization address stable.
