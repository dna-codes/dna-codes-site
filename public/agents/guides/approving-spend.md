# Approving spend (for people)

Your coding or personal agent created a DNA sandbox and may have sent you a
**claim link**. This page is for you — agents cannot complete these steps with
their own credentials.

## Claim the sandbox

1. Open the claim link the agent sent (from `npx @dna-codes/cli register` /
   `init`), or run `npx @dna-codes/cli status` in the project directory to
   reprint a stored claim URL.
2. Sign in with the identity provider the host names.
3. Confirm the claim. The sandbox becomes a production Workspace and stops
   expiring; the agent's existing bearer continues to work for that org.

After claim, you can wire a coding agent yourself with
`npx @dna-codes/cli mcp` (uses the same local `DNA_*` settings).

Until claim: governed acts are capped per day, and nothing leaves the platform
except as the host documents for unclaimed sandboxes.

## Choose a plan or credits

- **Plans** set monthly action allowance and which features are included.
  Free plan: **500** actions / month.
- **Credit packs** top up when `allowance_exhausted` appears: **1k / $8**,
  **5k / $35**, **25k / $150** (also **$0.01** per action list price).
- Published prices live in `pricing.json` and the pricing section of `llms.txt`
  on the agent document host — those numbers match enforcement. Use the claim /
  billing UI for Checkout links.

## Set a spend cap

Set a Workspace spend cap in the console / billing UI so agents cannot run past
a ceiling you chose.

- Only a **person** can raise the cap.
- When the host returns `spend_cap_reached`, raise the cap yourself (or wait);
  telling the agent to “increase the budget” will fail.

## Invoices and receipts

Find invoices in the Workspace billing section after claim (Stripe Customer
Portal or the host's billing page, depending on deployment). Agents do not
receive card details and should not ask you to paste secrets into chat.

## Optional: model key (OpenRouter)

On claim or via `dna init --model-key openrouter`, connect your OpenRouter
account (OAuth PKCE). Platform model calls then bill to **your** OpenRouter
credits. Without a connected key, model-backed platform calls are refused
(`MODEL_COST_POLICY` = key required).

## If the agent is stuck

| Agent says | You do |
| --- | --- |
| `needs_claim` | Open the claim link |
| `allowance_exhausted` | Buy credits or upgrade plan |
| `plan_limit` | Upgrade to the plan that includes the feature |
| `spend_cap_reached` | Raise the spend cap |
| `needs_approval` | Approve the pending act in the approval UI |
