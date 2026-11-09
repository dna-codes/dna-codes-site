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

Each landing page SHALL end on the shared waitlist form component, with the interest that
matches the page pre-selected. No new form component SHALL be introduced. The modeling post SHALL
link to `/business-process-software` rather than embed a second form.

#### Scenario: Conversion section

- **WHEN** a visitor reaches the end of `/sop-software`, `/operating-model` or
  `/business-process-software`
- **THEN** the shared waitlist form MUST be present
- **AND** its fields and submit behaviour MUST be identical to `/waitlist`

### Requirement: The BPM page does not claim DNA is a BPM engine

`/business-process-software` SHALL describe DNA as modeling processes as data that other systems
read, and SHALL NOT state or imply that DNA executes long-running workflows on its own engine. It
SHALL name at least one situation where a BPM suite is the better choice.

#### Scenario: Consistency with the agent description

- **WHEN** `/business-process-software` and `/llms.txt` are both read
- **THEN** neither MUST contradict the other on whether DNA is a BPM engine

### Requirement: Folded keywords stay on the page that owns their phrase

The site SHALL NOT give `sop software for small business`, `how to build an operating model`,
`business process modeling notation` or `business process management` its own page. Each SHALL
be a secondary row on the page named below, and that page SHALL use the phrase as a heading.
`operating model template` is skipped: the site does not offer a template download.

| Keyword                            | Page                              |
| ---------------------------------- | --------------------------------- |
| sop software for small business    | `/sop-software`                   |
| how to build an operating model    | `/operating-model`                |
| business process modeling notation | `/blog/business-process-modeling` |
| business process management        | `/blog/business-process-modeling` |

#### Scenario: A folded keyword is still assigned

- **WHEN** the registry is checked
- **THEN** each keyword in the table MUST be a secondary row whose `page` is the page in that row
- **AND** the rendered page MUST contain a heading with that phrase

### Requirement: One post covers business process modeling

The site SHALL publish `/blog/business-process-modeling`, owning `business process modeling`.
Its title SHALL be "Business Process Modeling with DNA". The post SHALL link to
`/business-process-software` and `/docs/frameworks`. The site SHALL NOT publish a separate post
for business process management, for business process modeling notation, for SOP software for
small business, or for how to build an operating model. `/blog/business-process-management`
SHALL redirect to `/blog/business-process-modeling`.

#### Scenario: The modeling post carries the argument

- **WHEN** `/blog/business-process-modeling` renders
- **THEN** its `<title>` MUST contain "business process modeling"
- **AND** a heading MUST contain "business process modeling notation"
- **AND** a heading MUST contain "business process management"
- **AND** the post MUST link to `/business-process-software` and `/docs/frameworks`

### Requirement: Landing pages are discoverable by agents and crawlers

The three landing pages and the modeling post SHALL appear in the sitemap and in `/llms.txt`. The
three landing pages SHALL appear in the header Use Cases menu and in the site footer.

#### Scenario: An agent reads llms.txt

- **WHEN** an agent fetches `/llms.txt`
- **THEN** it MUST find a link to each of the four pages with a one-line statement of what it is for
- **AND** every one of those links MUST resolve in the build
