# schema-driven-reference Specification

## Purpose

TBD - created by archiving change add-docs-section. Update Purpose after archive.

## Requirements

### Requirement: Reference content is generated from the published schemas

The Operational DNA reference page — `/docs/operational` — SHALL render from the core DNA definition schemas for its two vocabularies, structure/v1 and behaviour/v1, imported at build time. Field tables, descriptions, and in-schema examples SHALL NOT be hand-authored, so that reference content cannot drift from the schemas it documents.

Structure and Behaviour SHALL appear as groups inside Operational DNA, not as separate top-level layers. The set of primitives in each group SHALL be derived from the schema definitions (and their stability ledger entries) for that vocabulary, not from a hand-curated list that can omit a newly added definition.

Generation SHALL live in the page components (or a thin loader they call) rather than a separate checked-in markdown tree.

#### Scenario: A layer page renders from schemas

- **WHEN** `/docs/operational` is built
- **THEN** its primitive sections MUST be derived from the imported structure and behaviour JSON Schemas
- **AND** no primitive's fields MUST be hand-written in the page

#### Scenario: A schema change reaches the docs without editing them

- **WHEN** a definition's schema changes its description, fields, or examples
- **AND** the site is rebuilt against those schemas
- **THEN** that primitive's rendered section MUST reflect the change with no edit to the page

#### Scenario: A new definition appears without a page edit

- **WHEN** a new definition is added under the structure or behaviour vocabulary and recorded in the stability ledger the docs read
- **AND** the site is rebuilt
- **THEN** that definition MUST appear under the corresponding Structure or Behaviour group on `/docs/operational` without adding a hand-maintained import for it alone

### Requirement: Schemas resolve from the published package

Schema imports SHALL resolve through a build-time alias that points at the core schema definitions the platform publishes (structure and behaviour), so the docs build does not depend on inventing a parallel copy of those schemas inside this repository. A sibling checkout MAY supply those definitions during local development; production MUST still resolve without requiring an unpublished path outside the configured alias or package.

#### Scenario: Build does not require a sibling repository

- **WHEN** the site is built from a clean checkout with dependencies (and any configured schema package or vendored export) installed
- **THEN** every structure and behaviour definition import used by the Operational reference MUST resolve
- **AND** the reference MUST NOT read the legacy operational Person/Resource/Process tree or the product / technical schema trees as its source of truth

### Requirement: Each primitive renders as a uniform section

Every primitive SHALL render through one shared section component, so that all Structure and Behaviour primitives on the Operational page present the same way. A primitive's section SHALL include:

- its name as a linkable heading, with a stability indicator
- its lead description, taken from the schema
- a table of its fields
- an example, when the schema or the linked corpus provides one
- links to related primitives, when given

#### Scenario: A primitive section carries its parts

- **WHEN** a primitive with fields, an example, and related links is rendered
- **THEN** the section MUST show the heading with its stability indicator, the lead description, the fields table, the example, and the related links

#### Scenario: Optional parts are omitted rather than empty

- **WHEN** a primitive's schema provides no example and no corpus excerpt is attached
- **THEN** the section MUST omit the example block rather than render an empty one

### Requirement: Stability is visible and explained

Each primitive SHALL display its stability level from its vocabulary's stability ledger, and the Operational reference page SHALL explain what the levels mean, so a reader can tell settled primitives from moving ones without leaving the page.

#### Scenario: A reader can interpret a stability indicator

- **WHEN** a reader loads `/docs/operational`
- **THEN** each primitive MUST show a stability indicator sourced from the stability ledger
- **AND** the page MUST include a legend explaining the levels

### Requirement: Primitives are grouped within a layer

The Operational DNA reference page SHALL group its primitives into Structure and Behaviour — the two vocabularies inside Operational DNA — rather than presenting one unexplained flat list or the legacy People / Structures / Activities groups.

#### Scenario: Operational primitives are grouped

- **WHEN** a reader loads `/docs/operational`
- **THEN** primitives MUST be presented under Structure and Behaviour groups
- **AND** Structure MUST include Domain, Entity, Attribute, and Relationship
- **AND** Behaviour MUST include Behaviour, Action, Operation, Workflow, Condition, and Policy

#### Scenario: Behaviour primitives are complete

- **WHEN** a reader loads the Behaviour group on `/docs/operational`
- **THEN** Behaviour, Action, Operation, Workflow, Condition, and Policy MUST each appear as a documented primitive

### Requirement: Examples prefer the reference-domain corpus

When the docs show an applied example of a definition, they SHALL prefer an excerpt from a platform reference-domain version (checkout, origination, diligence, or agent-registration) over an invented sample that is not in the corpus.

#### Scenario: Example page cites corpus domains

- **WHEN** a reader loads `/docs/examples`
- **THEN** the domains presented MUST be drawn from the core reference-domain set
- **AND** excerpts MUST be identifiable as coming from those domain documents
