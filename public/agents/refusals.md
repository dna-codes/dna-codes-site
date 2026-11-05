# Refusal codes

Every refusal from the DNA agent host has one shape, and its `code` is drawn from the closed set below.

```json
{
  "refusal": {
    "code": "…",
    "message": "…",
    "next": "…"
  }
}
```

Over HTTP the refusal is the response body. In an MCP tool result it is `structuredContent`, with `isError: true`. In a JSON-RPC error it is `error.data`.

| Code | HTTP status | What to do next |
| --- | --- | --- |
| `unauthenticated` | 401 | Follow resource_metadata in the WWW-Authenticate header to the authorization server, get a token for this resource, and retry with an Authorization: Bearer header. |
| `invalid_token` | 401 | Get a new token whose audience is exactly this endpoint, and retry. The error_description in WWW-Authenticate says why this one was refused. |
| `wrong_organization` | 403 | Call the endpoint of the organization your token names, or get a token for this organization. |
| `insufficient_scope` | 403 | Get a token carrying the scope this act requires, and retry. |
| `not_found` | 404 | Take endpoint URLs from the discovery document under https://dna.codes/agents/ rather than constructing them. |
| `method_not_allowed` | 405 | Use a method named in the Allow header. |
| `invalid_request` | 400 | Correct the request as the message describes, and retry. |
| `unsupported_protocol_version` | 400 | Initialize again and use the protocol version the server answers with. |
| `payload_too_large` | 413 | Send a smaller document, split by domain. |
| `unknown_tool` | 400 | Call tools/list and use a tool it names. |
| `internal_error` | 500 | Retry later. Nothing was changed by a request refused this way. |
| `invalid_dna` | 422 | Fix the document at each path in details.issues, check it with validate, and apply again. Nothing was written. |
| `document_not_found` | 404 | Call list to see this organization's domains and their latest versions, and ask for one that exists. |
| `version_conflict` | 409 | Another act changed the domain first. Get its current version, diff your document against it, and apply again with that version in baseVersions. |
| `idempotency_conflict` | 409 | This idempotency key was already used for a different act. Use a new key for a new act; resend the original arguments to read the original result. |
| `rule_failed` | 422 | Read the failing rule in the refusal, change the input or the resource's state so it holds, and retry. |
| `needs_approval` | 403 | Follow the approval handle in the refusal. The act completes when a person approves it; do not resend it. |
| `needs_claim` | 403 | Ask your person to claim this sandbox with the claim link returned at registration. Until then, effects that leave the platform are refused and governed acts are capped per UTC day; reads and validate still answer. |
| `proof_required` | 400 | POST {base}/register/challenge, find a solution whose SHA-256 with the challenge has the stated leading zero bits, and register again with a fresh challenge. |
| `rate_limited` | 429 | Wait the number of seconds in the Retry-After header, then try again. |
| `joining_is_governed` | 403 | Register without naming an organization to get a sandbox of your own. To join an existing organization, ask a person who governs it to add you. |
| `claim_incomplete` | 502 | The sandbox is claimed and yours, but the identity provider did not record you as its member. Send the same claim request again to finish. |
| `flow_unavailable` | 501 | This host's identity provider does not offer this flow. Use a host whose discovery document lists it. |
| `plan_limit` | 402 | This feature needs a plan that includes it. Upgrade the workspace plan, or use a host whose discovery document lists the feature as provided and entitled. |
| `allowance_exhausted` | 429 | Wait for the allowance to reset, or ask your person to raise the plan's allowance. |
| `spend_cap_reached` | 402 | Ask your person to raise the spend cap for this workspace. An agent credential cannot raise it. |

The same table as JSON: [refusals.json](https://dna.codes/agents/refusals.json).
