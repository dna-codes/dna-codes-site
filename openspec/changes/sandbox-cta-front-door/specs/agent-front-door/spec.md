## ADDED Requirements

### Requirement: The root llms.txt leads agents into the sandbox flow

The root `llms.txt` SHALL contain an "Agents: start here" section before its other sections. The
section SHALL list the five sandbox-flow steps and link the agent `llms.txt` and
`llms-full.txt`. The file SHALL NOT tell an agent to send its person to the waitlist.

#### Scenario: Agent reads llms.txt

- **WHEN** an agent fetches `https://dna.codes/llms.txt`
- **THEN** the first section after the summary is "Agents: start here" and no line tells the agent to send its person to `/waitlist`

### Requirement: The agent surface is linked from every page

The site nav and footer SHALL link `/agents/`. Every page head SHALL carry
`<link rel="alternate">` entries for `/llms.txt` and `/agents/discovery.json`.

#### Scenario: Homepage links

- **WHEN** the homepage HTML is read
- **THEN** it links `/agents/` and has both alternates

### Requirement: The waitlist stays the path for people

The waitlist buttons SHALL stay. The nav and footer SHALL link `/agents/` as a separate control.
`llms.txt` SHALL name the waitlist only as the path for a person who arrives without an agent.

#### Scenario: Hero button

- **WHEN** a person clicks the homepage hero's primary button
- **THEN** they land on `/waitlist/`

#### Scenario: Agent reads the waitlist line

- **WHEN** an agent reads the root `llms.txt`
- **THEN** the sandbox flow is its instruction, and the waitlist line is addressed to people without an agent

### Requirement: The full agent reference resolves at the root

`/llms-full.txt` SHALL resolve with the same content as `/agents/llms-full.txt`.

#### Scenario: Root fetch

- **WHEN** `https://dna.codes/llms-full.txt` is fetched
- **THEN** it returns 200 and equals `/agents/llms-full.txt`

### Requirement: The sitemap lists the agent documents

The sitemap SHALL list `/agents/` and each published `.md`, `.json` and `.txt` document under it.
`/sitemap.xml` SHALL resolve.

#### Scenario: Sitemap contents

- **WHEN** the built sitemap is read
- **THEN** it contains `/agents/`, `/agents/llms.txt` and `/agents/auth.md`

### Requirement: Structured data describes the product

The site JSON-LD SHALL include a `SoftwareApplication` with offers from the pricing data, and
`sameAs` SHALL list GitHub, X and npm.

#### Scenario: JSON-LD on the homepage

- **WHEN** the homepage JSON-LD is parsed
- **THEN** it has a `SoftwareApplication` node and `sameAs` has three entries
