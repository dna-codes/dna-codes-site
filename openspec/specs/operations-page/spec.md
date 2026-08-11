# operations-page Specification

## Purpose

Operations is one of the two products in the suite. This page is where a visitor sees it
work: a transcript goes in, a living operating model and its artifacts come out. The page
was called "Playground" while it looked like a sandbox; it is the product's demo, so it
lives at `/operations` and is named for the product everywhere.

## Requirements

### Requirement: Public route at `/operations`

The site SHALL serve an Astro-rendered page at `/operations` that requires no authentication and is reachable from the primary site navigation on both desktop and mobile.

#### Scenario: Anonymous visitor opens the page

- **WHEN** an unauthenticated visitor navigates to `https://dna.codes/operations`
- **THEN** the page MUST render successfully with HTTP 200
- **AND** the page MUST display an input area, a DNA output area, and an artifact output area without requiring sign-in

#### Scenario: Page is reachable from primary navigation

- **WHEN** a visitor opens the site header on desktop or the mobile menu
- **THEN** an "Operations" link MUST be visible within the "Products" menu
- **AND** clicking it MUST navigate to `/operations`

#### Scenario: The former `/playground` URL keeps working

- **WHEN** a visitor opens `https://dna.codes/playground`
- **THEN** they MUST be sent to `/operations`
- **AND** no internal link, sitemap entry, or piece of site copy MAY still point at `/playground`

### Requirement: Page composition

The page SHALL lead with the interactive demo and follow it with the Operations walkthrough, so the visitor sees the product work before being asked to read how it works.

#### Scenario: Order of sections

- **WHEN** the page renders
- **THEN** the interactive demo MUST appear first
- **AND** the lens demo (see `lens-demo`) MUST follow it, so the "one model, many views" argument has a generated spec behind it
- **AND** the Operations walkthrough (collect, compile, generate, sync) MUST appear below those
- **AND** neither the walkthrough nor the lens demo MUST also appear on the homepage

#### Scenario: The page converts in place

- **WHEN** a visitor reaches the foot of the page
- **THEN** the shared waitlist form MUST be present with Operations selected
- **AND** the visitor MUST NOT have to navigate elsewhere to join the waitlist

### Requirement: Transcript input

The page SHALL provide an editable multi-line textarea for the visitor's own transcript, plus an affordance to load a built-in sample transcript.

#### Scenario: Visitor pastes their own transcript

- **WHEN** a visitor types or pastes text into the transcript textarea
- **THEN** the text MUST be retained in the textarea
- **AND** the textarea MUST NOT be read-only

#### Scenario: Visitor has no transcript on hand

- **WHEN** a visitor selects an entry from the example selector
- **THEN** the textarea MUST be populated with that built-in sample transcript
- **AND** the conversion flow MUST run as if the visitor had pasted that text themselves

#### Scenario: Empty submission is prevented

- **WHEN** the textarea is empty or contains only whitespace and the visitor triggers conversion
- **THEN** the page MUST NOT invoke `convert(...)`
- **AND** the DNA panel MUST show a human-readable message asking for transcript text

### Requirement: Explicit conversion trigger

The page SHALL provide a visible control that runs the conversion, so a visitor who edits the transcript has an obvious way to act on it.

#### Scenario: Generate control

- **WHEN** the page renders
- **THEN** a "Generate" button MUST be visible next to the transcript input
- **AND** clicking it MUST run the conversion against the current textarea contents

#### Scenario: Keyboard trigger

- **WHEN** the visitor presses Cmd+Enter or Ctrl+Enter with focus in the textarea
- **THEN** the conversion MUST run as if the Generate button had been clicked

#### Scenario: Control reflects in-flight state

- **WHEN** a transcript-to-DNA conversion is in flight
- **THEN** the Generate button MUST be disabled and indicate that work is in progress
- **AND** it MUST return to its enabled resting state when the call resolves, whether it succeeded or failed

### Requirement: Conversion via the `convert({ from, to })` client

The page SHALL produce its outputs exclusively by invoking a single typed client function `convert({ from, to })` exported from `src/utils/dnaApi.ts`. Today this client is implemented as an in-browser stub; the same function signature will later wrap `POST https://api.dna.codes/convert`. The page MUST NOT contain a second code path for conversion.

#### Scenario: Transcript-to-DNA call

- **WHEN** the visitor triggers conversion
- **THEN** the page MUST invoke `convert({ from: { type: "transcript", content: <textarea contents> }, to: { type: "dna" } })`
- **AND** the page MUST NOT issue any other conversion call until this one resolves

#### Scenario: DNA-to-artifact calls

- **WHEN** the transcript-to-DNA call succeeds
- **THEN** the page MUST invoke `convert(...)` once per artifact view, each of the form `from: { type: "dna", content: <DNA returned from the prior call> }` with `to: { type: <artifact-type> }`
- **AND** the artifact types MUST include at minimum `process-flow`, `sop`, `agents`, and `app`

#### Scenario: Per-artifact failure isolation

- **WHEN** one artifact call fails while others succeed
- **THEN** the successful artifact panels MUST still render their content
- **AND** the failing panel MUST show an error state with a Retry control that re-issues only that artifact's request

#### Scenario: Stub is the only conversion implementation today

- **WHEN** the page runs against the stub
- **THEN** no network request MUST be issued to `https://api.dna.codes` or any other backend
- **AND** all conversion responses MUST originate from the in-module stub in `src/utils/dnaApi.ts`

### Requirement: DNA panel

The page SHALL display the returned DNA spec in a panel that visually matches the DNA spec card used elsewhere on the site.

#### Scenario: DNA renders after conversion

- **WHEN** the transcript-to-DNA call returns successfully
- **THEN** the DNA panel MUST display the returned DNA content in a monospaced, syntax-styled block
- **AND** the panel MUST include a label identifying it as the DNA spec

### Requirement: Artifact output views

The page SHALL render at least four artifact views — Process Flow, SOP, Agent Workflow, and App — switchable via a tab control.

#### Scenario: Visitor switches between artifact tabs

- **WHEN** the visitor clicks an artifact tab
- **THEN** the selected artifact's content MUST become visible
- **AND** the previously visible artifact MUST be hidden
- **AND** only one artifact panel MUST be visible at a time

#### Scenario: Disabled artifact types

- **WHEN** an artifact type is disabled in the UI (currently `raci` and `runbook`)
- **THEN** it MUST remain a valid member of the client's `ToType` union
- **AND** re-enabling it MUST require no change to `src/utils/dnaApi.ts`

### Requirement: Loading, empty, and error states

The page SHALL surface explicit visual states for each phase of the conversion flow so the visitor is never left wondering whether the page is working.

#### Scenario: First paint runs a conversion

- **WHEN** the page first loads
- **THEN** the default example MUST be loaded into the textarea and converted automatically
- **AND** the DNA and artifact panels MUST reach their ready states without any visitor action

#### Scenario: Loading state during DNA conversion

- **WHEN** the transcript-to-DNA call is in flight
- **THEN** the DNA panel MUST show a loading indicator

#### Scenario: Loading state per artifact

- **WHEN** an artifact call is in flight
- **THEN** that artifact's panel MUST show a loading indicator independent of the other panels

#### Scenario: Conversion error

- **WHEN** any `convert(...)` call rejects (whether from the stub's simulated-failure path or from a real network/API error in a later phase)
- **THEN** the affected panel MUST show a human-readable error message
- **AND** the panel MUST offer a Retry control that re-issues the failed request
- **AND** raw error details MUST NOT be shown to the user (they MAY be logged to the console)

### Requirement: Mobile-first usability

The page SHALL be fully usable on mobile viewports without horizontal scroll and without controls being unreachable.

#### Scenario: Page on a 375px-wide viewport

- **WHEN** the page is rendered at 375px width
- **THEN** the Input, DNA, and Outputs regions MUST stack vertically
- **AND** the page MUST NOT introduce horizontal scrolling at the document level
- **AND** the Generate button MUST be reachable without horizontal scroll
- **AND** the artifact tabs MUST be operable via tap (no hover-only affordances)

#### Scenario: Page on a desktop viewport

- **WHEN** the page is rendered at `md` breakpoint or wider
- **THEN** the layout MAY arrange Input/DNA and Outputs into multiple columns
- **AND** the controls and tab semantics MUST remain identical to mobile

### Requirement: Privacy posture

The page SHALL NOT persist the visitor's transcript or generated outputs in any client-side storage, and SHALL communicate this to the visitor.

#### Scenario: No client-side persistence

- **WHEN** a visitor pastes a transcript and runs a conversion
- **THEN** the page MUST NOT write the transcript or any conversion result to `localStorage`, `sessionStorage`, IndexedDB, or cookies

#### Scenario: Privacy notice is visible

- **WHEN** the visitor views the input area
- **THEN** a short privacy note MUST be visible near the textarea explaining that the transcript is not sent anywhere and not stored
- **AND** the note MUST be accurate — i.e., it MUST NOT claim the transcript is sent to any external service while the stub is the only implementation, and it MUST be revised in the same change that introduces a live API call

### Requirement: Demo-mode disclosure

While the conversion client is stubbed, the page SHALL visibly indicate that outputs are sample data rather than the result of live conversion, so visitors do not mistake the demo for the production product.

#### Scenario: Demo-mode badge is visible

- **WHEN** the page is in stub mode
- **THEN** a "demo mode" (or equivalent) badge MUST be visible somewhere near the Outputs region
- **AND** the badge MUST be removed in the same change that swaps the stub for a live API call

#### Scenario: Edited transcripts do not imply more than the stub does

- **WHEN** the transcript no longer matches a built-in example verbatim
- **THEN** the page MUST state that demo mode matches the text to the closest sample process
- **AND** the page MUST NOT imply that the visitor's own text was read or modelled
