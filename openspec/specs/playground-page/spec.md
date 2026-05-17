# playground-page Specification

## Purpose

TBD - created by archiving change add-playground-page. Update Purpose after archive.

## Requirements

### Requirement: Public route at `/playground`

The site SHALL serve an Astro-rendered page at `/playground` that requires no authentication and is reachable from the primary site navigation on both desktop and mobile.

#### Scenario: Anonymous visitor opens the page

- **WHEN** an unauthenticated visitor navigates to `https://dna.codes/playground`
- **THEN** the page MUST render successfully with HTTP 200
- **AND** the page MUST display an input area, a DNA output area, and an artifact output area without requiring sign-in

#### Scenario: Page is reachable from primary navigation

- **WHEN** a visitor opens the site header on desktop or the mobile menu
- **THEN** a "Playground" link MUST be visible
- **AND** clicking it MUST navigate to `/playground`

### Requirement: Transcript input

The page SHALL provide a multi-line textarea for the visitor to paste a transcript, plus an affordance to load a built-in sample transcript.

#### Scenario: Visitor pastes their own transcript

- **WHEN** a visitor pastes text into the transcript textarea
- **THEN** the text MUST be retained in the textarea
- **AND** the primary "Convert" action MUST be enabled when the textarea contains non-whitespace content

#### Scenario: Visitor has no transcript on hand

- **WHEN** a visitor clicks "Try a sample"
- **THEN** the textarea MUST be populated with a built-in sample transcript
- **AND** the conversion flow MUST run as if the visitor had pasted that text themselves

#### Scenario: Empty submission is prevented

- **WHEN** the textarea is empty or contains only whitespace
- **THEN** the "Convert" action MUST be disabled or, if clicked, MUST NOT issue any network request

### Requirement: Conversion via the `convert({ from, to })` client

The page SHALL produce its outputs exclusively by invoking a single typed client function `convert({ from, to })` exported from `src/utils/dnaApi.ts`. In v1 this client is implemented as an in-browser stub; the same function signature will later wrap `POST https://api.dna.codes/convert`. The page MUST NOT contain a second code path for conversion.

#### Scenario: Transcript-to-DNA call

- **WHEN** the visitor triggers conversion
- **THEN** the page MUST invoke `convert({ from: { type: "transcript", content: <textarea contents> }, to: { type: "dna" } })`
- **AND** the page MUST NOT issue any other conversion call until this one resolves

#### Scenario: DNA-to-artifact calls

- **WHEN** the transcript-to-DNA call succeeds
- **THEN** the page MUST invoke `convert(...)` once per artifact view, each of the form `from: { type: "dna", content: <DNA returned from the prior call> }` with `to: { type: <artifact-type> }`
- **AND** the artifact types MUST include at minimum `process-flow`, `raci`, `sop`, and `runbook`

#### Scenario: Per-artifact failure isolation

- **WHEN** one artifact call fails while others succeed
- **THEN** the successful artifact panels MUST still render their content
- **AND** the failing panel MUST show an error state with a Retry control that re-issues only that artifact's request

#### Scenario: Stub is the only conversion implementation in v1

- **WHEN** the page runs in v1
- **THEN** no network request MUST be issued to `https://api.dna.codes` or any other backend
- **AND** all conversion responses MUST originate from the in-module stub in `src/utils/dnaApi.ts`

### Requirement: DNA panel

The page SHALL display the returned DNA spec in a panel that visually matches the DNA spec card on the homepage operations section.

#### Scenario: DNA renders after conversion

- **WHEN** the transcript-to-DNA call returns successfully
- **THEN** the DNA panel MUST display the returned DNA content in a monospaced, syntax-styled block
- **AND** the panel MUST include a label identifying it as the DNA spec

### Requirement: Artifact output views

The page SHALL render at least four artifact views — Process Flow, RACI Matrix, SOP Document, and Runbook — switchable via a tab control.

#### Scenario: Visitor switches between artifact tabs

- **WHEN** the visitor clicks an artifact tab
- **THEN** the selected artifact's content MUST become visible
- **AND** the previously visible artifact MUST be hidden
- **AND** only one artifact panel MUST be visible at a time

#### Scenario: Artifact tabs are present even before conversion

- **WHEN** the page first loads
- **THEN** the artifact tabs MUST be visible in an empty/placeholder state that indicates a conversion hasn't run yet

### Requirement: Loading, empty, and error states

The page SHALL surface explicit visual states for each phase of the conversion flow so the visitor is never left wondering whether the page is working.

#### Scenario: Loading state during DNA conversion

- **WHEN** the transcript-to-DNA call is in flight
- **THEN** the DNA panel MUST show a loading indicator
- **AND** the "Convert" action MUST be disabled until the call resolves

#### Scenario: Loading state per artifact

- **WHEN** an artifact call is in flight
- **THEN** that artifact's panel MUST show a loading indicator independent of the other panels

#### Scenario: Conversion error

- **WHEN** any `convert(...)` call rejects (whether from the stub's simulated-failure path in v1 or from a real network/API error in a later phase)
- **THEN** the affected panel MUST show a human-readable error message
- **AND** the panel MUST offer a Retry control that re-issues the failed request
- **AND** raw error details MUST NOT be shown to the user (they MAY be logged to the console)

### Requirement: Mobile-first usability

The page SHALL be fully usable on mobile viewports without horizontal scroll and without controls being unreachable.

#### Scenario: Page on a 375px-wide viewport

- **WHEN** the page is rendered at 375px width
- **THEN** the Input, DNA, and Outputs regions MUST stack vertically
- **AND** the page MUST NOT introduce horizontal scrolling at the document level
- **AND** the "Convert" button MUST be reachable without horizontal scroll
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
- **THEN** a short privacy note MUST be visible near the textarea explaining that the transcript is not stored by the site
- **AND** the note MUST be accurate for v1 — i.e., it MUST NOT claim the transcript is sent to any external service while the stub is the only implementation

### Requirement: Demo-mode disclosure

While the conversion client is stubbed (v1), the page SHALL visibly indicate that outputs are sample data rather than the result of live conversion, so visitors do not mistake the demo for the production product.

#### Scenario: Demo-mode badge is visible

- **WHEN** the page is in stub mode
- **THEN** a "demo mode" (or equivalent) badge MUST be visible somewhere near the Outputs region
- **AND** the badge MUST be removed in the same change that swaps the stub for a live API call
