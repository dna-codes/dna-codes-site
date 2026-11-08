# Spec Delta — docs-section

## MODIFIED Requirements

### Requirement: Public docs section at `/docs`

The site SHALL serve a documentation section rooted at `/docs`, inside the main site rather than on a separate subdomain. The section SHALL provide a landing page and one page per content bucket, so that a reader has a single canonical documentation URL that survives content moves.

The section SHALL consist of the following routes:

- `/docs` — landing
- `/docs/getting-started` — welcome, quickstart, walkthrough
- `/docs/operational` — Operational DNA reference (Structure and Behaviour vocabularies)
- `/docs/examples` — reference-domain examples
- `/docs/frameworks` — how DNA relates to existing modeling frameworks

Product and Technology SHALL NOT appear as live reference routes. Former `/docs/product` and `/docs/technical` URLs SHALL resolve without a silent failure (redirect or soft landing that points readers at Coming soon / Operational).

#### Scenario: Every docs route resolves

- **WHEN** the site is built
- **THEN** each of the routes listed above MUST render a page
- **AND** none of them MUST require a separate subdomain to reach

#### Scenario: Landing page orients the reader

- **WHEN** a reader loads `/docs`
- **THEN** the page MUST present a card for each live content bucket
- **AND** each card MUST link to that bucket's page

#### Scenario: Product and Technology are not live reference

- **WHEN** a reader views the docs sidebar or landing cards
- **THEN** Product and Technology MUST NOT appear as current reference destinations
- **AND** `/docs/product` and `/docs/technical` MUST NOT render as full layer reference pages

### Requirement: Hand-authored buckets carry the content schemas cannot generate

Getting Started, the landing Coming soon note, Examples framing, and Frameworks SHALL be hand-authored where the content is narrative rather than derivable from a single schema document. Examples SHALL present the platform reference domains (checkout, origination, diligence, agent-registration) with excerpts of their source. Frameworks SHALL carry the framework write-ups as canonical content on this site, so a reader is not sent to another repository to read them.

#### Scenario: Getting Started explains how to begin

- **WHEN** a reader loads `/docs/getting-started`
- **THEN** it MUST present a welcome, a quickstart, and a walkthrough oriented around Operational DNA as structure and behaviour documents

#### Scenario: Examples show real models

- **WHEN** a reader loads `/docs/examples`
- **THEN** it MUST present the core reference domains with excerpts of their DNA source

#### Scenario: Frameworks are canonical here

- **WHEN** a reader loads `/docs/frameworks`
- **THEN** it MUST carry the framework content in full
- **AND** it MUST NOT depend on the reader visiting another repository to read it

## ADDED Requirements

### Requirement: Docs landing summarizes deferred Product and Technology

The `/docs` landing page SHALL include a Coming soon section that briefly summarizes Product (what gets built from DNA) and Technology (how DNA is bound and deployed) as deferred documentation, without linking them as live reference.

#### Scenario: Coming soon is visible on the landing page

- **WHEN** a reader loads `/docs`
- **THEN** the page MUST include a Coming soon section naming Product and Technology
- **AND** that section MUST NOT deep-link into removed Product or Technical reference pages as if they were current

### Requirement: Sidebar Reference presents Operational DNA with Structure and Behaviour

The docs sidebar Reference bucket SHALL list Operational as the live layer reference. When the reader is on `/docs/operational`, the sidebar SHALL expand to show Structure and Behaviour as the vocabulary groups (or child links) inside Operational DNA — not Product or Technical as peer live layers.

#### Scenario: Operational expands to Structure and Behaviour

- **WHEN** a reader is on `/docs/operational`
- **THEN** the sidebar MUST mark Operational as current
- **AND** it MUST expand to list Structure and Behaviour section anchors (or child pages) for that Operational DNA page
