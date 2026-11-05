# The dna-agent profile, version 1

`https://dna.codes/profiles/dna-agent` names the profile; it is an identifier, not an address to fetch. Versions served: 1.

`dna-agent` fixes how an organization's DNA appears to an agent, so every organization behaves the same to any agent. It is a profile over MCP, the platform's HTTP API and A2A, and defines no transport of its own.

## Addressing

The agent host's base URL, `{base}`, is `https://agents.dna.codes`. Take it from the [discovery document](https://dna.codes/agents/discovery.json) and never construct it. An organization is addressed at `{base}/o/{org}/`, where `{org}` is its stable identifier. Claiming a sandbox does not change the address. Each organization's MCP, HTTP and A2A endpoints are their own protected resources; see [auth.md](https://dna.codes/agents/auth.md).

## Transports

MCP over Streamable HTTP at `https://agents.dna.codes/o/{org}/mcp`: one JSON-RPC message per `POST`, answered with `application/json`, with no session. Protocol versions: `2025-11-25`, `2025-06-18`, `2025-03-26`.
A2A JSON-RPC at `https://agents.dna.codes/o/{org}/a2a`: `SendMessage` with a data part `{ name, arguments }` invokes the same Action as MCP `tools/call`. Agent Card at `https://agents.dna.codes/o/{org}/a2a/agent-card`: skills are the caller's Actions.

## Tools

The tools are generic and the same for every organization. Adding an entity, attribute, relationship, domain or Action is DNA, never a new tool. The same Actions are skills on the A2A Agent Card.

- `describe`: Name the profile, this organization, the structural and behavioural definitions the tools accept, each with its kind, and the tools themselves. Given a definition, return its JSON Schema. Reads nothing stored. Call before writing permissions, approval rules, state machines or business validation yourself. Use `describe` first to learn the structural and behavioural definitions this organization accepts.
- `validate`: Check a DNA document against a definition and name every failing location as a JSON Pointer. A behaviour document is also checked against this organization's stored structure and behaviour, as if it replaced its namesake; to check documents that depend on each other, apply them with dryRun. Changes nothing. Call before writing permissions, approval rules, state machines or business validation yourself. Use `validate` to check a document without writing.
- `apply`: Write whole domain and behaviour documents as one act; a document whose dna is behaviour/v1 is behaviour. Each changed document becomes its next immutable version; an identical one is unchanged. The act is refused if any behaviour the organization would then hold, stored or applied, is invalid against the structure it would hold. The envelope carries an idempotency key (a retry with the same key replays the first result), a statement of intent, and dryRun, which decides everything and writes nothing. baseVersions makes the write conditional on each document's current version (0: not yet stored). Call before writing permissions, approval rules, state machines or business validation yourself. Use `apply` to write whole domain or behaviour documents as one governed act.
- `get`: Read a domain or a behaviour document at its latest or a named version, with the version read and the latest version. For a domain, optionally only one entity or relationship in it. For behaviour, domain names the domain it describes. Read a stored domain or behaviour document when you need its current contents.
- `list`: Summarise each of this organization's domains at its latest version: id, name, version, entity ids and relationship ids. Then each behaviour document: id, the domain it describes, name, version, Action ids and Workflow ids. Summarise this organization's domains at their latest versions before authoring.
- `diff`: Compare two stored versions of a domain or a behaviour document, or a stored version with a proposed document (what apply would change). Version 0 is empty. Without document, to defaults to the latest and from to the version before it; with document, from defaults to the latest. Compare stored versions or a stored version with a proposed document before applying.
- `set-egress-allowlist`: Replace this organization's egress allowlist. Only a person of the claimed organization may perform it; nothing leaves the platform except to these destinations. Replace the claimed organization's egress allowlist (person only).

Their schemas: [tools](https://dna.codes/agents/docs/tools.md).

## What this release covers

This release covers structure and behaviour: `attribute` is stable, `entity` is stable, `relationship` is stable, `domain` is stable, `behaviour` is stable, `action` is stable, `operation` is stable, `workflow` is stable, `condition` is stable, `policy` is stable. Every definition is stable. Behaviour is authored and read through the same tools as structure, and checked against the organization's structure. Applied behaviour Actions are derived as business tools; performing them returns next valid actions. Events are not emitted yet.

## Refusals

A refusal has one shape and a code from a closed set: [refusal codes](https://dna.codes/agents/refusals.md).

## Versioning

The profile's name carries no version. Changes within a version are additive: behaviour arrived inside version 1, and performing Actions will arrive there too. A breaking change is a new `profile_version`, served alongside its predecessor for a published deprecation period.
