## ADDED Requirements

### Requirement: Landing pages for the measured commercial clusters

The site SHALL serve statically rendered public pages at `/sop-software`, `/operating-model` and
`/business-process-software`. Each SHALL own one primary keyword in the registry
(`sop software`, `target operating model`, `business process management software`) and take its
search title and description from it.

#### Scenario: Anonymous visitor arrives from search

- **WHEN** an unauthenticated visitor opens any of the three routes
- **THEN** the page MUST render with HTTP 200 and no external runtime dependency
- **AND** its `<title>` and meta description MUST match its primary registry row

#### Scenario: The first screen answers the search

- **WHEN** a landing page renders
- **THEN** its first heading MUST address the problem named by its primary keyword
- **AND** the page MUST NOT require the visitor to already know what DNA is to understand that heading

### Requirement: Landing pages teach with a real worked example

Each landing page SHALL show at least one artifact derived from a validated genome under
`src/data/genome/`, the same way `/playground` derives its artifacts, rather than illustrative copy
alone.

#### Scenario: The example is real

- **WHEN** a landing page shows an SOP, process, operating model or rule
- **THEN** it MUST be derived at build time from a genome that passes `npm run check:genomes`

### Requirement: Landing pages convert through the shared waitlist form

Each landing page and the template page SHALL end on the shared waitlist form component, with the
interest that matches the page pre-selected. No new form component SHALL be introduced.

#### Scenario: Conversion section

- **WHEN** a visitor reaches the end of `/sop-software`, `/operating-model`,
  `/operating-model/template` or `/business-process-software`
- **THEN** the shared waitlist form MUST be present
- **AND** its fields and submit behaviour MUST be identical to `/waitlist`

### Requirement: The BPM page does not claim DNA is a BPM engine

`/business-process-software` SHALL describe DNA as modeling processes as data that other systems
read, and SHALL NOT state or imply that DNA executes long-running workflows on its own engine. It
SHALL name at least one situation where a BPM suite is the better choice.

#### Scenario: Consistency with the agent description

- **WHEN** `/business-process-software` and `/llms.txt` are both read
- **THEN** neither MUST contradict the other on whether DNA is a BPM engine

### Requirement: An ungated operating model template

The site SHALL serve `/operating-model/template`, owning the `operating model template` keyword,
with a blank operating model template generated at build time from a genome. The template SHALL be
downloadable without submitting any form, as a spreadsheet and as DNA JSON.

#### Scenario: Download without a gate

- **WHEN** a visitor or crawler opens `/operating-model/template`
- **THEN** links to the spreadsheet and JSON downloads MUST be present in the HTML
- **AND** following them MUST NOT require an email address or any form submission

#### Scenario: The template is usable on its own

- **WHEN** the spreadsheet download is opened
- **THEN** it MUST contain labelled sections for roles, processes and steps, rules and systems
- **AND** it MUST NOT contain internal ids or schema field names a reader would not recognise

### Requirement: Landing pages are discoverable by agents and crawlers

The three landing pages and the template SHALL appear in the sitemap, in `/llms.txt`, and in the
site footer.

#### Scenario: An agent reads llms.txt

- **WHEN** an agent fetches `/llms.txt`
- **THEN** it MUST find a link to each of the four pages with a one-line statement of what it is for
- **AND** every one of those links MUST resolve in the build
