# lens-reference Specification

## Purpose

Defines the `/docs/lenses` reference page: a public docs surface that explains the DNA Lens metamodel concept and renders the core lens definitions (layer + subgraph/traversal), generated at build time from the lens JSON shipped in `@dna-codes/dna-core` and pulled from npm only.

## Requirements

### Requirement: Public Lenses reference page at `/docs/lenses`

The site SHALL serve an Astro-rendered page at `/docs/lenses`, inside the existing `/docs` section and using the shared `DocsLayout`, that requires no authentication and renders successfully without any external runtime.

#### Scenario: Anonymous visitor opens the page

- **WHEN** an unauthenticated visitor navigates to `https://dna.codes/docs/lenses`
- **THEN** the page MUST render with HTTP 200
- **AND** it MUST display, in order, an explanation of the Lens concept, the LensType contract, and a section per core lens

#### Scenario: Page is reachable from the docs sidebar

- **WHEN** a visitor views the `/docs` sidebar on desktop or mobile
- **THEN** a "Lenses" entry MUST be visible
- **AND** clicking it MUST navigate to `/docs/lenses`
- **AND** when the visitor is on `/docs/lenses`, the sidebar entry MUST expand to show an anchor per rendered lens

### Requirement: Lens concept and LensType contract are explained

The page SHALL explain, in hand-authored prose, that a Lens is a named graph pattern of typed node slots and directed edges that governs both a query direction (find matching subgraphs) and a command direction (assert a binding), and SHALL describe the LensType contract fields (`name`, `nodes[]`, `edges[]`, optional `sentence`).

#### Scenario: Reader learns what a Lens is

- **WHEN** a reader opens `/docs/lenses`
- **THEN** the page MUST describe the node-slot, edge, and sentence model
- **AND** it MUST state that the same Lens definition serves both query and command directions

### Requirement: Core lenses are generated from their npm-sourced definitions

The page SHALL render one section per core lens by importing the lens JSON definitions from the published npm package at build time. The page MUST NOT hand-transcribe lens nodes, edges, or sentences; field-level changes to a shipped lens MUST flow through on the next build without page edits.

#### Scenario: All shipped core lenses are present

- **WHEN** the page is built against the published lens definitions
- **THEN** every core lens that ships in the package MUST have a rendered section (the three layer lenses — operational, product, technical — and the subgraph/traversal lenses — people, access-control, execution)

#### Scenario: A lens definition changes upstream

- **WHEN** a published lens gains, loses, or renames a node slot or edge
- **AND** the docs are rebuilt against the new package version
- **THEN** the rendered section MUST reflect the change without editing the page's prose
- **AND** the source MUST resolve from the npm package, never from a local sibling checkout

### Requirement: A subgraph lens renders its sentence, node slots, and edges

For a lens that declares edges, the page SHALL render its human-readable `name`, its `sentence` template with each `{{slot}}` marker visually distinguished, a node-slot table listing each slot and its ResourceType, and an edge table listing each edge's source slot, target slot, and `via` RelationshipType.

#### Scenario: Access Control lens is rendered

- **WHEN** the page renders the `access-control` lens
- **THEN** it MUST display the sentence with the `subject`, `assignment`, `boundary`, `grant`, and `target` slots distinguished
- **AND** a node-slot table mapping each slot to its ResourceType (e.g. `subject` → `User`)
- **AND** an edge table showing each edge as source → target via RelationshipType (e.g. `subject` → `assignment` via `User_Role`)

### Requirement: A layer lens renders as a grouped type list

For a lens that declares nodes but no edges, the page SHALL render its `name` and the list of ResourceTypes it groups, without an edge table and without requiring a sentence.

#### Scenario: Operational layer lens is rendered

- **WHEN** the page renders the `operational` lens (no edges, no sentence)
- **THEN** it MUST display the lens name and the list of ResourceTypes it spans
- **AND** it MUST NOT render an empty edge table

### Requirement: Build remains green and self-contained

Importing the lens definitions for the page SHALL NOT introduce a runtime dependency into the static build — only JSON files are read at build time. `npm run build` and `npm run check` SHALL succeed.

#### Scenario: Build does not load a JS runtime for lenses

- **WHEN** `npm run build` runs
- **THEN** it MUST complete successfully
- **AND** the lenses page MUST be produced from JSON imports alone, without executing the lens package's JavaScript entry point
