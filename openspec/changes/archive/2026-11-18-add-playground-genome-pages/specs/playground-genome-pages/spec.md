# Spec Delta

## Purpose

Gives every company genome in the corpus a static page inside the Playground that a person can
explore, ask questions of, share and copy as a starting template, and that a search engine can
read.

## ADDED Requirements

### Requirement: One page per genome at `/playground/<key>/`

The site SHALL serve a statically rendered page at `/playground/<key>/` for each genome in the
corpus. The page SHALL show the company name, industry, description, provenance, and the
vocabularies the genome is modeled on. Its content SHALL be readable with JavaScript disabled.

#### Scenario: Each genome has a page

- **WHEN** `npm run build` runs
- **THEN** it MUST emit `/playground/<key>/index.html` for every genome in the corpus

#### Scenario: The page reads without JavaScript

- **WHEN** a genome page is loaded with JavaScript disabled
- **THEN** the genome map, the questions and every artifact MUST be present in the HTML

#### Scenario: The JSON endpoint is unchanged

- **WHEN** a client requests `/genome/<key>.json` after this change
- **THEN** it MUST receive the same compiled document set it received before this change

#### Scenario: The Playground itself is unchanged

- **WHEN** a visitor opens `/playground`
- **THEN** its acts MUST work as before this change

### Requirement: Genome map

Each genome page SHALL show a genome map: the roles in their reporting hierarchy, each process as
an ordered rail that names the role on each step, the resources, and each rule placed on the step
whose operation it governs. Every element on the map SHALL come from the compiled genome.

#### Scenario: The map is complete

- **WHEN** a genome page renders
- **THEN** the map MUST show every role, every process step, every resource and every rule in
  that genome

#### Scenario: A rule sits on its step

- **WHEN** a rule governs an operation that a process step performs
- **THEN** the map MUST show that rule on that step

### Requirement: The genome map is explorable

When JavaScript runs, selecting a role on the map SHALL highlight the steps that role performs,
the rules that allow it, and the resources those steps act on. Selecting the role again, or
pressing Escape, SHALL clear the highlight. Selection SHALL work by pointer and by keyboard.

#### Scenario: Selecting a role shows its reach

- **WHEN** the visitor selects a role on the map
- **THEN** every step whose actor is that role MUST be highlighted
- **AND** every rule that allows that role MUST be highlighted
- **AND** every resource those steps act on MUST be highlighted

#### Scenario: Keyboard operation

- **WHEN** the visitor uses the keyboard alone
- **THEN** each role MUST be reachable by Tab and selectable by Enter or Space
- **AND** Escape MUST clear the selection

#### Scenario: Reduced motion

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** highlighting MUST apply without animated transitions

### Requirement: Questions the genome answers

Each genome page SHALL show three questions, each answered from the compiled genome alone: who
may perform a chosen operation, what stalls when a chosen role is out, and who touches a chosen
resource. Each question SHALL name its subject from the genome, and the visitor SHALL be able to
change that subject.

#### Scenario: Who may perform an operation

- **WHEN** the question names an operation
- **THEN** the answer MUST list every role that an access rule allows for that operation
- **AND** it MUST say so when no rule governs the operation

#### Scenario: What stalls when a role is out

- **WHEN** the question names a role
- **THEN** the answer MUST list every process step whose actor is that role
- **AND** every process that role operates

#### Scenario: Who touches a resource

- **WHEN** the question names a resource
- **THEN** the answer MUST list every role that performs a step acting on that resource
- **AND** every role that an access rule allows on an operation of that resource

#### Scenario: The visitor changes the subject

- **WHEN** JavaScript runs and the visitor picks a different subject for a question
- **THEN** the answer MUST update without a network request

#### Scenario: Default subjects are stable

- **WHEN** a genome page is built twice from the same genome
- **THEN** each question MUST name the same default subject both times

### Requirement: Every Playground artifact appears on the genome page

Each genome page SHALL show every output type that the Playground can generate, rendered at build
time from the same derivations and renderers the Playground uses, grouped by DNA layer.

#### Scenario: Artifacts match the Playground

- **WHEN** an artifact on a genome page is compared with the same artifact generated for that
  genome in `/playground`
- **THEN** the two MUST show the same content

#### Scenario: A link opens the Playground

- **WHEN** the visitor follows the page's Playground link
- **THEN** `/playground` MUST open with that genome's industry already selected

### Requirement: Renderers stay generic

No genome page, map, question, template card or share card SHALL branch on which genome it renders
or carry genome-specific copy. Adding a genome to the corpus SHALL add its page, its template card
and its share card with no change to any page, component or renderer.

#### Scenario: A new genome appears everywhere

- **WHEN** a valid genome and its industry metadata are added
- **AND** `npm run build` runs
- **THEN** `/playground/<key>/` and its share card MUST be emitted
- **AND** `/operating-model-template` MUST show its card

### Requirement: Share cards

Each genome page SHALL declare its own Open Graph and Twitter image. The image SHALL be generated
at build time from the compiled genome and SHALL show the company name, the industry, the
provenance and a reduced genome map.

#### Scenario: A genome page carries its card

- **WHEN** a genome page's HTML is read
- **THEN** its `og:image` and `twitter:image` MUST point to an image emitted for that genome
- **AND** the image MUST be 1200 × 628 pixels, the size of the site's other cards

#### Scenario: Cards are reproducible

- **WHEN** the same genome is built twice
- **THEN** its share card MUST be generated from the compiled genome both times, with no
  hand-drawn input

### Requirement: The "make yours" close

Each genome page SHALL end with three ways to start from the genome: a download of its compiled
documents as JSON, a copyable prompt that starts an agent from this genome through the DNA MCP
server, and the shared waitlist form with the operations interest selected.

#### Scenario: Download the template

- **WHEN** the visitor follows the download link
- **THEN** the browser MUST receive `/genome/<key>.json`

#### Scenario: Copy the agent prompt

- **WHEN** the visitor copies the agent prompt
- **THEN** the prompt MUST name the genome's JSON URL and the DNA MCP server URL
- **AND** the prompt MUST tell the agent to draft in conversation and save only when asked

#### Scenario: The waitlist form is the shared one

- **WHEN** the close renders
- **THEN** it MUST use the shared waitlist form component with the operations interest
  pre-selected

### Requirement: Genome pages are reachable

Every genome page SHALL be linked from `/operating-model-template` and from Act I of `/playground`
once its industry is picked. Every genome page SHALL appear in the sitemap and in `/llms.txt`.
This change SHALL NOT add a top-level header link or change the homepage.

#### Scenario: Listed for crawlers and agents

- **WHEN** the sitemap and `/llms.txt` are read after a build
- **THEN** each MUST list every `/playground/<key>/` page

#### Scenario: The homepage is unchanged

- **WHEN** the homepage renders after this change
- **THEN** its hero MUST show the helix and the same title, subtitle and actions as before this
  change

### Requirement: Genome pages build and work on mobile

`npm run build` and `npm run check` SHALL succeed with the genome pages in place. Every genome page
and `/operating-model-template` SHALL be usable at a narrow viewport without horizontal page
scrolling.

#### Scenario: Narrow viewport

- **WHEN** a genome page is viewed at 375 pixels wide
- **THEN** the page MUST NOT scroll horizontally
- **AND** the map and wide artifacts MUST scroll inside their own frames
