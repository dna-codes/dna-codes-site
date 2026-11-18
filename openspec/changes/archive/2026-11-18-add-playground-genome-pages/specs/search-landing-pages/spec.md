# Spec Delta

## ADDED Requirements

### Requirement: Operating model template page

The site SHALL serve a statically rendered public page at `/operating-model-template` that lists
every genome in the corpus as one card. Each card SHALL show the company name, industry,
description, provenance, and counts of roles, processes, rules and systems, and SHALL link to
`/playground/<key>/`. The page SHALL end on the shared waitlist form with the operations interest
pre-selected.

#### Scenario: Every genome has a card

- **WHEN** a visitor opens `/operating-model-template`
- **THEN** the page MUST return HTTP 200
- **AND** it MUST show exactly one card for each genome in the corpus

#### Scenario: A card shows its counts

- **WHEN** a card is rendered
- **THEN** its role, process, rule and system counts MUST equal the counts in that genome's
  compiled documents

#### Scenario: A card opens its genome

- **WHEN** the visitor activates a card
- **THEN** the browser MUST navigate to `/playground/<key>/` for that genome

#### Scenario: The page has its own share card

- **WHEN** the page's HTML is read
- **THEN** its `og:image` MUST point to an image generated at build time from the corpus
- **AND** the image MUST be 1200 × 628 pixels

#### Scenario: The operating model page links the template page

- **WHEN** `/operating-model` renders
- **THEN** it MUST link to `/operating-model-template` as the place to start from a filled
  operating model

### Requirement: The template page owns the operating model template keyword

`operating model template` SHALL be a primary row in the keyword registry whose page is
`/operating-model-template`, and the page SHALL take its search title and description from it.
`business operating model template` SHALL be a secondary row on the same page.

#### Scenario: The template keyword is assigned

- **WHEN** the registry is checked
- **THEN** `operating model template` MUST be a primary row with page `/operating-model-template`
- **AND** `business operating model template` MUST be a secondary row with the same page

#### Scenario: The page uses the registry

- **WHEN** `/operating-model-template` renders
- **THEN** its title and description MUST equal the primary row's search title and description

## MODIFIED Requirements

### Requirement: Landing pages are discoverable by agents and crawlers

The four landing pages (`/sop-software`, `/operating-model`, `/business-process-software` and
`/operating-model-template`) and the modeling post SHALL appear in the sitemap and in `/llms.txt`.
The four landing pages SHALL appear in the header Use Cases menu and in the site footer.

#### Scenario: An agent reads llms.txt

- **WHEN** an agent fetches `/llms.txt`
- **THEN** it MUST find a link to each of the five pages with a one-line statement of what it is for
- **AND** every one of those links MUST resolve in the build

#### Scenario: The template page is in the Use Cases menu

- **WHEN** a visitor opens the Use Cases menu or reads the footer
- **THEN** an "Operating Model Template" link MUST navigate to `/operating-model-template`
