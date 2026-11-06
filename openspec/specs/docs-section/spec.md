# docs-section Specification

## Purpose

TBD - created by archiving change add-docs-section. Update Purpose after archive.

## Requirements

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

### Requirement: Shared docs layout with a sidebar that is the table of contents

Every docs page SHALL render through a shared docs layout that includes a persistent sidebar. The sidebar SHALL be the table of contents rather than a duplicate of it: the entry for the current page SHALL expand in place to reveal that page's anchors, so a reader never needs a second navigation surface to reach a section.

#### Scenario: Sidebar appears on every docs page

- **WHEN** a reader loads any `/docs` route
- **THEN** the sidebar MUST be present
- **AND** its links MUST navigate to the other docs pages

#### Scenario: The current page is marked and expanded

- **WHEN** a reader is on a docs page that has in-page sections
- **THEN** the sidebar entry for that page MUST be marked as current
- **AND** that entry MUST expand to list the page's section anchors

### Requirement: Deep links are anchors within a layer page

Reference content SHALL be deep-linkable by anchor within its layer page (for example `/docs/operational#person`) rather than by a per-primitive URL. Each primitive section SHALL carry a stable id derived from the primitive's name, and its heading SHALL link to that id.

#### Scenario: A primitive is addressable by anchor

- **WHEN** a reader follows a link of the form `/docs/<layer>#<primitive>`
- **THEN** the page MUST scroll to that primitive's section

#### Scenario: A heading yields its own link

- **WHEN** a reader activates a primitive's heading link
- **THEN** the address MUST become that primitive's anchor on the current layer page

### Requirement: Header navigation points at the docs

The site header SHALL link to `/docs`. The previously planned links to a separate documentation subdomain SHALL NOT be presented to readers, so that there is exactly one advertised documentation destination.

#### Scenario: Header exposes the docs

- **WHEN** a visitor views any page of the site
- **THEN** the header MUST offer a link to `/docs`

#### Scenario: No competing docs destination is advertised

- **WHEN** the site's navigation is rendered
- **THEN** no link to a separate docs subdomain MUST be presented

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

### Requirement: Build and checks remain green

`npm run build` and `npm run check` SHALL succeed with the docs section in place.

#### Scenario: Site builds with the docs section

- **WHEN** `npm run build` runs
- **THEN** it MUST complete successfully and emit every docs route

#### Scenario: Checks pass

- **WHEN** `npm run check` runs
- **THEN** type checking, linting, and formatting MUST report no errors

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
