## ADDED Requirements

### Requirement: Reference content is generated from the published schemas

The three layer reference pages — `/docs/operational`, `/docs/product`, `/docs/technical` — SHALL render from the `@dna-codes/dna-schemas` JSON Schemas imported at build time. Field tables, descriptions, and examples SHALL NOT be hand-authored, so that reference content cannot drift from the schemas it documents.

Generation SHALL live in the page components themselves — each layer page imports its own schemas — rather than in a separate pre-build step.

#### Scenario: A layer page renders from schemas

- **WHEN** `/docs/operational`, `/docs/product`, or `/docs/technical` is built
- **THEN** its primitive sections MUST be derived from the imported JSON Schemas
- **AND** no primitive's fields MUST be hand-written in the page

#### Scenario: A schema change reaches the docs without editing them

- **WHEN** a primitive's schema changes its description, fields, or examples
- **AND** the site is rebuilt
- **THEN** that primitive's rendered section MUST reflect the change with no edit to the page

### Requirement: Schemas resolve from the published package

Schema imports SHALL resolve through a `~schemas` alias that points at the published `@dna-codes/dna-schemas` package, so the build does not depend on a sibling checkout of the `dna` repository being present on disk.

#### Scenario: Build does not require a sibling repository

- **WHEN** the site is built from a clean checkout with dependencies installed
- **THEN** every schema import MUST resolve
- **AND** no path outside this repository's `node_modules` MUST be required

### Requirement: Each primitive renders as a uniform section

Every primitive SHALL render through one shared section component, so that all primitives on all three layer pages present the same way. A primitive's section SHALL include:

- its name as a linkable heading, with a stability indicator
- its lead description, taken from the schema
- a table of its fields
- an example, when the schema provides one
- links to related primitives, when given

#### Scenario: A primitive section carries its parts

- **WHEN** a primitive with fields, an example, and related links is rendered
- **THEN** the section MUST show the heading with its stability indicator, the lead description, the fields table, the example, and the related links

#### Scenario: Optional parts are omitted rather than empty

- **WHEN** a primitive's schema provides no example
- **THEN** the section MUST omit the example block rather than render an empty one

### Requirement: Stability is visible and explained

Each primitive SHALL display its stability level, and each layer page SHALL explain what the levels mean, so a reader can tell settled primitives from moving ones without leaving the page.

#### Scenario: A reader can interpret a stability indicator

- **WHEN** a reader loads a layer reference page
- **THEN** each primitive MUST show a stability indicator
- **AND** the page MUST include a legend explaining the levels

### Requirement: Primitives are grouped within a layer

Each layer page SHALL group its primitives into the layer's own categories rather than presenting one flat list, so that the reference reads in the same shape as the layer it documents.

#### Scenario: Operational primitives are grouped

- **WHEN** a reader loads `/docs/operational`
- **THEN** its primitives MUST be presented in labelled groups
