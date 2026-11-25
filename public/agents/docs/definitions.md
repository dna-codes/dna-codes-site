# Definitions

DNA is structural and behavioural definitions. A stable definition is promised to agents and its JSON Schema is published; an experimental one may still change.

The human-readable companion for structure and behaviour is https://dna.codes/docs/operational. Published schemas and the `describe` tool remain authoritative.

## Structure

What a business is made of: domains, their entities and attributes, and the relationships between them.

### `attribute` (stable)

`https://dna.codes/schemas/structure/attribute/v1`, schema: [schemas/structure/attribute/v1.json](https://dna.codes/agents/schemas/structure/attribute/v1.json)

One fact an entity can hold. Money is two attributes, an amount and a currency, never one attribute with a unit folded in. A confidentiality tier is an enum. A deadline is a datetime. A state attribute names the states an entity can be in; movement between those states is behavior and is not part of this schema. A reference names the entity it points at. An enum lists its values.

### `entity` (stable)

`https://dna.codes/schemas/structure/entity/v1`, schema: [schemas/structure/entity/v1.json](https://dna.codes/agents/schemas/structure/entity/v1.json)

A kind of thing a domain knows about. It owns its attributes and its named instances. A shopper, a borrower, and an advisor are instances of person. A merchant, a processor, a lender, a buyer, a target, and an advisory firm are instances of organization. They are not separate entities, and they are not domains. A connection that carries data of its own, such as a cart line, a loan condition, a citation, or a membership, is an entity too. Actions this entity can take are behavior and are not part of this schema.

### `relationship` (stable)

`https://dna.codes/schemas/structure/relationship/v1`, schema: [schemas/structure/relationship/v1.json](https://dna.codes/agents/schemas/structure/relationship/v1.json)

A named edge between two entities, read as from, name, to. A relationship has no attributes of its own. When the connection carries data of its own — a cart line's variant and quantity, a loan condition's wording, a citation's page, a membership's role — that connection is an entity, and relationships join it to the things it connects. Two relationships may join the same pair: an order ships to an address and is billed to an address. The edge is the fact. The optional attribute names the reference attribute that stores the edge, on one end, pointing at the other.

### `domain` (stable)

`https://dna.codes/schemas/structure/domain/v1`, schema: [schemas/structure/domain/v1.json](https://dna.codes/agents/schemas/structure/domain/v1.json)

A vocabulary: the entities and relationships of one subject, versioned together. uses names other domains whose entities this one may refer to. It names a vocabulary, never an organization. Three firms in one deal share a parties vocabulary and differ by instances of organization. A domain is not a tenant and not a database. Actions, rules, effects, and workflows are not part of this schema.

## Behaviour

What a business does: Actions on entities, the Operations that perform them, Workflows over them, and the Conditions and Policies that govern them. A behaviour document describes one domain.

### `behaviour` (stable)

`https://dna.codes/schemas/behaviour/behaviour/v1`, schema: [schemas/behaviour/behaviour/v1.json](https://dna.codes/agents/schemas/behaviour/behaviour/v1.json)

What a business does with the structure one domain describes: its Actions, the Operations that say who performs them on what, the workflows that sequence those Operations, the policies that decide them, and the defaults for what no policy governs. It names its domain and never changes it, so a business can be modelled structure first and given behaviour later. A set holds at most one behaviour document per domain. Its home is its domain: its policies and defaults target the domain or an entity in it.

### `action` (stable)

`https://dna.codes/schemas/behaviour/action/v1`, schema: [schemas/behaviour/action/v1.json](https://dna.codes/agents/schemas/behaviour/action/v1.json)

One capability of one entity: what it takes, what it returns, whether it changes anything, whether it reaches outside DNA, and the state change it makes, if any. An Action is complete enough to be a tool, so every surface that calls it (an agent, a person, an HTTP client, a test) is derived from it and none is written by hand. Its input and output fields are attributes, never states. A read-only Action has no transition.

### `operation` (stable)

`https://dna.codes/schemas/behaviour/operation/v1`, schema: [schemas/behaviour/operation/v1.json](https://dna.codes/agents/schemas/behaviour/operation/v1.json)

One Action, performed by one actor on one target. It inherits the Action's contract. A workflow is written over Operations, so the same Action can appear in it twice with different performers.

### `workflow` (stable)

`https://dna.codes/schemas/behaviour/workflow/v1`, schema: [schemas/behaviour/workflow/v1.json](https://dna.codes/agents/schemas/behaviour/workflow/v1.json)

A state machine over Operations. A run starts in initial. In each state, its Operations may run any number of times; only a transition moves the run, when the Operation it names completes or fails, optionally guarded by a value in that Operation's output or by the final state a sub-workflow ended in. A final state ends the run and has no transitions.

### `condition` (stable)

`https://dna.codes/schemas/behaviour/condition/v1`, schema: [schemas/behaviour/condition/v1.json](https://dna.codes/agents/schemas/behaviour/condition/v1.json)

A test a policy applies: one predicate, a group, or a relation, or these composed with allOf, anyOf and not. A predicate reads a path off one subject and compares it with a literal value or with a reference to another path. The grammar is closed. It has no expressions, scripts or queries, and nothing in it names a business. target is the record acted on, actor is who is acting, context is the time and environment supplied to the evaluator, and input is the arguments the Action was called with. A group names a reusable condition over a principal, kept in the organization access document. A relation holds when a structure relationship connects two values.

### `policy` (stable)

`https://dna.codes/schemas/behaviour/policy/v1`, schema: [schemas/behaviour/policy/v1.json](https://dna.codes/agents/schemas/behaviour/policy/v1.json)

A decision about the actions it names at its target: allow, deny, route the work to another performer, or require someone else's approval, when its condition holds or always when it has none. A rule on an Action's input is a policy whose condition reads input, so permissions and business rules are written in one grammar. A policy applies to every request at or under its target, wherever it is written. Combination: every applicable policy contributes, at any target, and the most restrictive decision wins, in the order deny, then require_approval, then allow. A narrower allow removes neither a wider deny nor a wider approval requirement; an exception is written on the policy it relaxes, as a not in its condition. route allows the act and adds an obligation naming the performer: where more than one route applies, the route at the deepest target is taken, then the higher priority. Approvals required by more than one policy accumulate. Where no policy governs a request, the effective default decides.

### `access` (stable)

`https://dna.codes/schemas/behaviour/access/v1`, schema: [schemas/behaviour/access/v1.json](https://dna.codes/agents/schemas/behaviour/access/v1.json)

Who may do what at one home, the organization or one workspace: its policies and its defaults, and at the organization its groups. An organization holds one organization access document, and each of its workspaces one workspace access document beside its structure and behaviour documents. Neither names a domain. A domain's own policies and defaults are written in its behaviour document. A policy lives in the document whose home contains its target, and its target cannot reach outside that home. Groups are defined in the organization access document alone: a workspace or a domain cannot define one.
