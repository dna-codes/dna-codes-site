## ADDED Requirements

### Requirement: Public product page at `/api-operations`

The site SHALL serve a statically rendered product page for API Operations at `/api-operations`,
requiring no authentication and rendering with no external runtime dependency. The page SHALL be
composed of a hero carrying an interactive demo, four narrative sections, and a closing call to
action.

The page SHALL lead with the wedge — that most of an API is governed, that the few endpoints nothing
covers are ungoverned by omission rather than by decision, and that nothing in the customer's stack
can say which ones they are — rather than with a feature list.

#### Scenario: The page renders

- **WHEN** the site is built
- **THEN** `/api-operations` MUST render
- **AND** it MUST present the hero, four narrative sections, and a closing call to action

#### Scenario: The page leads with the gap, not with features

- **WHEN** a visitor reads the page from the top
- **THEN** the opening claim MUST be that the ungoverned endpoints cannot be identified from
  anything the customer already owns
- **AND** it MUST NOT claim that the customer's API is broadly ungoverned
- **AND** the page MUST position API Operations as an addition to a running API rather than a
  replacement for an existing gateway, framework or documentation tool

### Requirement: The reading is computed on the visitor's own specification, in the browser

The page SHALL include an interactive demo that accepts an OpenAPI 3.x document supplied by the
visitor and resolves each of its operations to a resource and an action, or reports it unresolved.
Resolution and the resulting reading SHALL be computed entirely in the browser, with no account, no
key and no request to a DNA service.

Pasting a document SHALL be the primary input. Supplying a URL MAY be offered as a secondary input,
and when a cross-origin fetch fails the demo SHALL say that the fetch was refused by the remote host
rather than implying the document is invalid.

The demo SHALL additionally offer bundled sample specifications so a visitor can see a reading
without supplying anything.

#### Scenario: A visitor pastes their own specification

- **WHEN** a visitor pastes a valid OpenAPI 3.x document into the demo
- **THEN** each operation MUST be listed with its resolved resource and action, or marked unresolved
- **AND** a coverage reading MUST be displayed
- **AND** no request to an external service MUST be required to produce it

#### Scenario: A cross-origin fetch is refused

- **WHEN** a visitor supplies a URL whose host refuses the cross-origin request
- **THEN** the demo MUST report that the remote host refused the request
- **AND** it MUST NOT report the document as malformed or unsupported

#### Scenario: Malformed or oversized input

- **WHEN** a visitor supplies input that is not a parseable OpenAPI document, or one exceeding the
  published size cap
- **THEN** the demo MUST fail visibly with a message naming the reason
- **AND** it MUST NOT display a partial or zero reading as though it were a result

### Requirement: The two readings are distinguished and never conflated

The page SHALL distinguish the **structural** reading — how many of a specification's operations can
be resolved to a resource and an action at all — from the **governed** reading — how many resolved
operations are governed by something in a customer's model.

The demo's default state SHALL be a **gap report against a bundled sample model**: a majority of
endpoints governed, a minority not, and the ungoverned ones identified by name. The ungoverned
endpoints in each sample SHALL be operations with real consequence rather than incidental reads.

Where no model is available — which is every document a visitor supplies — the demo SHALL report the
structural reading and SHALL state that governance is **unknown**. It SHALL NOT report governance as
zero, which would assert something about the visitor's estate that has not been checked.

Every endpoint that is not governed SHALL be counted in the gap figure, including endpoints that
could not be named, so that the governed figure and the gap figure sum to the total.

#### Scenario: A visitor opens the page

- **WHEN** the demo loads its default sample
- **THEN** it MUST show most endpoints governed and a minority as gaps
- **AND** each gap MUST be individually identifiable in the list rather than only counted
- **AND** the governed count plus the gap count MUST equal the total
- **AND** both figures MUST appear on a single line, as one statement rather than two findings

#### Scenario: A visitor supplies their own document

- **WHEN** a visitor pastes a specification the page holds no model for
- **THEN** governance MUST be reported as unknown
- **AND** it MUST NOT be reported as zero or as a gap count

#### Scenario: One number, one component

- **WHEN** the coverage reading appears in more than one place across the site
- **THEN** every occurrence MUST be rendered by the same component
- **AND** no two occurrences MUST be able to display different figures for the same input

### Requirement: Unresolved operations are reported, never guessed

The resolver SHALL treat "unresolved" as a first-class result. Where an operation's method, path and
`operationId` do not resolve to a resource and an action under a published rule, the resolver SHALL
report it unresolved and SHALL NOT infer a plausible name.

An explicit `x-dna.operation` value SHALL take precedence over every convention-based rule.

The demo SHALL show which rule resolved each operation.

#### Scenario: A specification uses RPC-style routes

- **WHEN** a document contains operations whose paths do not encode a resource and an action
- **THEN** those operations MUST be reported unresolved
- **AND** no resource or action name MUST be invented for them

#### Scenario: An operation declares `x-dna`

- **WHEN** an operation carries an `x-dna.operation` value
- **THEN** that value MUST be used
- **AND** it MUST override any resource and action the path convention would have produced

### Requirement: The visuals use the idiom of existing API documentation tools

Every operation rendered on the page SHALL be drawn in the visual idiom a developer already reads an
API in: the conventional HTTP method colour palette, method pills, and the tinted left-barred
operation block used by Swagger UI and comparable tools.

Where the page shows DNA information attached to an operation, it SHALL be rendered as a **section of
that operation**, alongside sections such as Parameters and Responses, rather than as a layer drawn
over or beside the operation.

Where the page shows an operation being executed, the policy evaluation SHALL appear **before** the
execute control.

The palette and row chrome SHALL come from a single shared module used by both the server-rendered
components and the browser renderer.

#### Scenario: Gaps are findable without reading every row

- **WHEN** a reading contains gaps
- **THEN** gap rows MUST be visually distinct from governed rows
- **AND** groups containing a gap MUST be ordered before groups that contain none

#### Scenario: A developer recognises the rows

- **WHEN** a visitor views any operation on the page
- **THEN** the method MUST be rendered with the conventional colour for that method
- **AND** the operation MUST be rendered in the familiar tinted, left-barred block

#### Scenario: DNA is a section, not an overlay

- **WHEN** the page shows DNA information for an operation
- **THEN** it MUST appear as a section within that operation's detail
- **AND** it MUST NOT be drawn as a panel layered over documentation chrome

#### Scenario: Evaluation precedes execution

- **WHEN** the page shows an operation that can be executed as an actor
- **THEN** the policy evaluation MUST be rendered above the execute control

### Requirement: Every endpoint expands to what governs it

Each endpoint in the list SHALL be expandable in place, and expanding it SHALL reveal the operation
it performs together with what governs that operation — the rule, who holds it, its scope, and what
is recorded — or, where nothing governs it, what the absence means.

An endpoint that could not be named SHALL, on expansion, state why it could not be named and show
the declaration that would settle it.

The panel SHALL NOT render controls that appear interactive but are not.

#### Scenario: A reader opens an endpoint

- **WHEN** a visitor activates an endpoint row
- **THEN** it MUST expand in place
- **AND** it MUST show the operation and the rule governing it, or state that nothing does

#### Scenario: A reader opens an unnamed endpoint

- **WHEN** a visitor expands an endpoint that could not be named
- **THEN** it MUST state the reason it could not be resolved
- **AND** it MUST show the declaration that would resolve it

#### Scenario: Nothing decorative looks clickable

- **WHEN** the panel is rendered
- **THEN** every element styled as interactive MUST respond to activation

### Requirement: A supplied document is read for what authentication it declares

Where a visitor supplies a document, the page SHALL report how many of its operations require a
credential, read from each operation's `security` and from the document's where the operation is
silent. An operation declaring an empty `security` SHALL be treated as deliberately public rather
than as inheriting the document's requirement.

The report SHALL distinguish authentication from authority: requiring a credential SHALL NOT be
presented as being governed. Where a document declares no authentication anywhere, the page SHALL
say that instead of reporting a count of zero.

Each endpoint SHALL be individually marked as requiring a credential or as public, so that a reader
can see which is which without opening anything and without counting.

#### Scenario: A document declares authentication on some operations

- **WHEN** a visitor supplies a document whose operations carry `security`
- **THEN** the page MUST report how many require a credential
- **AND** each endpoint MUST be marked as requiring a credential or as public
- **AND** it MUST state that those endpoints have no operational controls

#### Scenario: A document declares no authentication

- **WHEN** a supplied document declares no security scheme anywhere
- **THEN** the page MUST say so rather than reporting that zero operations are secured

### Requirement: A visitor can put controls on their own document

Where a visitor supplies a document, each endpoint SHALL offer a way to bind it to a rule, and doing
so SHALL move that endpoint to governed and recompute the reading. The assignment SHALL be reversible.

An endpoint on a supplied document that carries no control SHALL be presented as **uncontrolled**,
not as a gap, whether or not the visitor has bound anything yet. A gap is a finding against a model;
the page has not seen the visitor's model, so it SHALL NOT assert one.

Binding a control SHALL change the presentation of that endpoint only. No other endpoint's
presentation SHALL change as a result.

Assignments SHALL be held in the browser only, SHALL NOT be transmitted or stored, and SHALL be
discarded when a different document is supplied.

Bundled samples carry their own model and SHALL NOT be editable.

#### Scenario: A visitor governs one of their endpoints

- **WHEN** a visitor binds an endpoint to a rule
- **THEN** that endpoint MUST show as governed by that rule
- **AND** no other endpoint MUST change appearance
- **AND** the remainder MUST be described as not yet controlled rather than as gaps
- **AND** the endpoint MUST remain expanded after the reading is recomputed

#### Scenario: A visitor changes their mind

- **WHEN** a visitor removes a binding
- **THEN** the endpoint MUST return to being a gap
- **AND** the reading MUST recompute

#### Scenario: A new document is supplied

- **WHEN** a visitor supplies a different document
- **THEN** every prior binding MUST be discarded

### Requirement: The document being read can be viewed

The demo SHALL provide a way to view the document it is currently reading, showing a bundled sample
as its own source and a supplied document as the visitor's own bytes rather than a re-serialisation
of them.

The view SHALL be capped in length, and where it is truncated it SHALL state that only the display
was truncated and that the whole document was read.

#### Scenario: A visitor checks what is being read

- **WHEN** a visitor opens the spec view
- **THEN** it MUST show the document currently loaded
- **AND** for a supplied document it MUST show what the visitor supplied, unmodified

### Requirement: A supplied document does not leave the browser

A document supplied by a visitor SHALL be parsed and rendered entirely in the browser. The page SHALL
NOT transmit it, store it, or make it recoverable after the visitor leaves.

The input SHALL NOT be part of any form on the page and SHALL NOT carry a `name`, so that it cannot
be serialised into a submission to a third party. Browser spellchecking SHALL be disabled on it,
since some browsers upload the contents of form fields to a remote service. The input and the spec
view SHALL carry the attributes session-replay and analytics tools honour for masking, so that
introducing such a tool later cannot silently begin recording visitors' API descriptions.

#### Scenario: A visitor pastes an internal specification

- **WHEN** a visitor supplies a document
- **THEN** no network request carrying it MUST be made
- **AND** it MUST NOT be written to storage that survives the page

#### Scenario: The visitor leaves the page

- **WHEN** the page is hidden or unloaded
- **THEN** the supplied document MUST be cleared from the input

#### Scenario: The visitor submits the waitlist form

- **WHEN** a visitor submits the form at the foot of the page
- **THEN** the supplied document MUST NOT be included in that submission

### Requirement: The page concedes Swagger UI explicitly

The page SHALL state that Swagger UI is not replaced and that DNA does not render chrome onto it.
The section describing the explorer SHALL open by conceding documentation tooling before describing
what the explorer adds, which is the evaluation of a policy against a chosen actor prior to
execution.

The page SHALL NOT describe the product as a gateway, a proxy, or anything that sits in the
customer's request path.

#### Scenario: A reader arrives expecting a Swagger skin

- **WHEN** a visitor reads the section covering the explorer
- **THEN** the section MUST first state that Swagger UI is kept
- **AND** it MUST distinguish documentation from operation rather than claiming a better documentation
  tool

#### Scenario: A reader assesses this against a gateway

- **WHEN** a visitor reads the section covering enforcement
- **THEN** the page MUST state that the decision is reached at the host's own edge
- **AND** it MUST NOT claim to sit in the request path

### Requirement: The product is published as a fourth product without a fourth pricing tier

API Operations SHALL be published as a fourth entry in the site's product list, carrying the verb
**Govern it**, shared with Overlay, and a status of **In design**. The navigation, the footer, the
homepage product grid and the waitlist interest list SHALL all derive from that single product
definition.

The pricing ladder SHALL remain three paid rungs. `src/data/pricing.ts` SHALL gain feature rows for
the API surface and SHALL NOT gain a tier or a price.

#### Scenario: The product appears everywhere products appear

- **WHEN** the site is built
- **THEN** API Operations MUST appear in the header product menu, the footer platform list, the
  homepage product grid, and the waitlist interest options
- **AND** every one of those MUST derive its label, path and mark from the shared product definition

#### Scenario: Pricing is unchanged in shape

- **WHEN** a visitor opens `/pricing`
- **THEN** the number of paid tiers MUST be unchanged
- **AND** API capabilities MUST appear as rows within the existing comparison

### Requirement: The waitlist accepts interest in API Operations

The waitlist form SHALL offer API Operations as a selectable interest, and the instance embedded at
the foot of `/api-operations` SHALL have that interest pre-selected.

#### Scenario: A visitor signs up from the product page

- **WHEN** a visitor reaches the form at the foot of `/api-operations`
- **THEN** the API Operations interest MUST already be selected
- **AND** the visitor MUST still be able to select other interests

### Requirement: No documentation is linked before it exists

The page SHALL NOT link to a documentation page for the `x-dna` extension until that extension is
published in the schema package and rendered under `/docs`.

#### Scenario: The page describes `x-dna` before the schema ships

- **WHEN** the page describes the `x-dna` block
- **THEN** it MAY show the block inline
- **AND** it MUST NOT link to a `/docs` route that does not resolve
