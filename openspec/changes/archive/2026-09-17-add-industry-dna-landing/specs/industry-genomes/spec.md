## ADDED Requirements

### Requirement: One authored genome per supported industry

Each supported industry SHALL be backed by exactly one authored genome file covering all three DNA
layers. An industry's content SHALL NOT be split across multiple authored files or authored per
output type.

The authored format SHALL be compact and human-readable: it SHALL carry names, descriptions, and
the edges between primitives, and SHALL NOT require the author to write UUIDs, schema version
strings, or any other value the compiler can derive.

#### Scenario: One authored source backs every artifact for an industry

- **WHEN** artifacts are generated for an industry across the Operations, Product, and Technology
  layers
- **THEN** all of them MUST derive from that industry's single authored genome

#### Scenario: Authoring requires no machine-generated values

- **WHEN** an author adds a primitive to a genome
- **THEN** they MUST NOT be required to supply a UUID or a schema version string

### Requirement: Genomes compile into canonical DNA documents

Each authored genome SHALL be compiled into canonical DNA documents — one Operational document,
one Product document, and one Technical document — in the exact shapes published by
`@dna-codes/dna-schemas`. The compiler SHALL assign every operational primitive a stable
identifier and the schema version currently published for that primitive type.

Compilation SHALL be deterministic: compiling the same authored genome twice SHALL produce
byte-identical documents.

#### Scenario: A genome compiles to all three layers

- **WHEN** an authored genome is compiled
- **THEN** it MUST produce an Operational document, a Product document, and a Technical document
- **AND** each MUST match the shape published by `@dna-codes/dna-schemas` for that layer

#### Scenario: Identifiers are stable across builds

- **WHEN** the same authored genome is compiled on two separate builds
- **THEN** every generated identifier MUST be identical between them

#### Scenario: Renderers read compiled output

- **WHEN** an artifact is generated
- **THEN** its view-model MUST be derived from the compiled canonical documents
- **AND** not from the authored format directly

### Requirement: Six industries are supported at launch

The corpus SHALL cover E-commerce, Health care, M&A, Security & compliance, Financial services,
and Professional services. Each industry SHALL declare a stable key, a display name, and a value
proposition stating what DNA models for that industry.

The value propositions for the two specified industries SHALL be:

- **M&A** — operational modelling and business valuation
- **E-commerce** — modelling across inventory, catalog, and fulfillment

#### Scenario: Every supported industry is complete

- **WHEN** the industry metadata is read
- **THEN** each of the six industries MUST declare a key, a display name, a value proposition, and
  a spotlight set
- **AND** each MUST have a corresponding genome file

#### Scenario: Specified value propositions are preserved

- **WHEN** the M&A and E-commerce entries are read
- **THEN** their value propositions MUST state operational modelling and business valuation, and
  modelling across inventory, catalog, and fulfillment, respectively

### Requirement: Each genome clears a minimum ontology bar

Every genome SHALL contain, at minimum:

- **Operational** — a named root domain; at least four Roles, at least one of them nested under
  another so a reporting hierarchy exists; at least one Group; at least two Person templates and
  at least three Memberships binding Person to Role; at least four Resources carrying attributes;
  at least six Operations; at least one Process with at least five ordered Steps, each Step
  resolving to a Task with an actor Role and an operation; at least three Rules; at least one
  Trigger.
- **Product** — at least four core resources, each with at least three fields; at least one API
  namespace with at least four endpoints; at least three pages covering a list view, a detail
  view, and an action, each reachable by a route.
- **Technical** — at least four cells with connections between them; at least two environments;
  at least one provider.

Primitive names SHALL be recognisable to a practitioner in that industry rather than generic
placeholders.

#### Scenario: A genome meets the operational minimum

- **WHEN** a genome is checked against the operational minimum
- **THEN** it MUST contain the required roles, hierarchy, group, person templates, memberships,
  resources, operations, process with owned ordered steps, rules, and trigger

#### Scenario: A genome meets the product and technical minimums

- **WHEN** a genome is checked against the product and technical minimums
- **THEN** it MUST contain the required core resources with fields, API namespace and endpoints,
  pages, cells with connections, environments, and provider

#### Scenario: Names are industry-recognisable

- **WHEN** a practitioner from the industry reads the genome's positions, process steps, and core
  resources
- **THEN** the names MUST describe work that industry actually does, not generic placeholders

### Requirement: Each genome is grounded in that industry's published vocabulary

Each genome SHALL declare at least two published vocabularies, standards, or frameworks that its
names are drawn from, each with a note stating what the genome takes from it. Primitive names and
field names SHALL follow those vocabularies wherever the vocabulary defines a term for the thing
being modelled.

The declared vocabularies SHALL be displayed alongside the generated artifacts.

#### Scenario: A genome declares what it is modelled on

- **WHEN** a genome is read
- **THEN** it MUST declare at least two published vocabularies
- **AND** each MUST carry a note stating what the genome takes from it

#### Scenario: Names follow the declared vocabulary

- **WHEN** a genome declares a vocabulary that defines a term for something the genome models
- **THEN** the genome MUST use that vocabulary's term rather than an invented synonym

#### Scenario: The grounding is visible to the visitor

- **WHEN** generated artifacts are displayed
- **THEN** the vocabularies that industry's genome is modelled on MUST be shown

### Requirement: No genome shares its domain vocabulary with the corpus

No resource, role, person template, group, process step, rule, cell, provider, page, or
domain-specific action name SHALL appear in three or more genomes. Generic create/read/update/
delete verbs are exempt, since sharing them carries no industry meaning.

This SHALL be enforced by the build.

#### Scenario: A generic name fails the build

- **WHEN** a name that is not a generic verb appears in three or more genomes
- **AND** `npm run build` runs
- **THEN** the build MUST fail and name the offending term and the genomes sharing it

#### Scenario: Generic verbs do not fail the build

- **WHEN** several genomes each declare a `List` or `Read` action
- **THEN** the build MUST NOT fail on that basis

### Requirement: Compiled genomes are validated against the published schemas

Every genome's compiled output SHALL validate against the DNA schemas published in
`@dna-codes/dna-schemas`. Validation SHALL run as part of the build so that a genome which cannot
compile into valid DNA fails the build rather than shipping.

#### Scenario: An invalid genome fails the build

- **WHEN** a genome names a primitive that does not exist, references a missing edge target, or
  violates a schema constraint such as a name pattern
- **AND** `npm run build` runs
- **THEN** the build MUST fail and identify the offending genome and the offending primitive

#### Scenario: Valid genomes build cleanly

- **WHEN** all genomes compile to schema-valid documents
- **AND** `npm run build` runs
- **THEN** validation MUST pass and the build MUST complete

### Requirement: Each industry declares a spotlight set

Each industry SHALL declare a spotlight set of four or five output types that arrive pre-selected,
chosen so that the industry's value proposition is self-evident from the artifacts they produce.

#### Scenario: Spotlight set is sized

- **WHEN** an industry's metadata is read
- **THEN** its spotlight set MUST name between four and five valid output ids

#### Scenario: Spotlight ids are valid

- **WHEN** an industry's spotlight set is read
- **THEN** every id in it MUST correspond to a defined output type

### Requirement: Adding an industry is a data change

Supporting an additional industry SHALL require only a new genome file and a new metadata entry.
It SHALL NOT require changes to any output renderer, to the derivation layer, or to the landing
page's markup.

#### Scenario: A seventh industry is added

- **WHEN** a valid genome file and a metadata entry for a new industry are added
- **THEN** that industry MUST appear as a selectable option
- **AND** every output type MUST be generatable for it with no renderer or page changes

### Requirement: Genomes are loaded on demand

The landing page's initial payload SHALL carry only industry metadata — keys, names, value
propositions, and spotlight sets — and SHALL NOT eagerly ship every genome. A genome SHALL be
loaded when its industry is selected.

#### Scenario: Initial load is metadata only

- **WHEN** the landing page first loads with no industry selected
- **THEN** the initial payload MUST NOT include the full resource graphs of all industries

#### Scenario: Selection loads the genome

- **WHEN** the visitor selects an industry
- **THEN** that industry's genome MUST be loaded before generation runs
- **AND** the page MUST remain responsive while it loads
