# lens-demo Specification

## Purpose

Defines the lens demo: an interactive section that renders one sample DNA document through four views (org chart, process flow, runbook, job description), auto-cycling to make the "one model, many views" thesis visible.

It ran on the homepage until that page's job became naming the two products. The thesis needs a spec on screen before it means anything, so the demo now runs on `/operations`, under the demo that produces one.

## Requirements

### Requirement: The lens demo runs on the Operations page

`/operations` SHALL include the interactive lens-demo section, positioned after the Operations demo that generates a spec and before the walkthrough that explains how one is built. The demo SHALL render entirely client-side with no backend dependency.

#### Scenario: Visitor reaches the demo on the Operations page

- **WHEN** a visitor loads `/operations` and scrolls past the interactive demo
- **THEN** the lens-demo section MUST be present
- **AND** it MUST be introduced by a heading that frames it as one spec read several ways

#### Scenario: The homepage does not carry the lens demo

- **WHEN** the homepage is viewed
- **THEN** the lens demo MUST NOT be present
- **AND** the hero MUST be followed directly by the two-product section

#### Scenario: Demo requires no network call to function

- **WHEN** the demo renders and the visitor switches views
- **THEN** all rendering MUST happen client-side from a bundled sample document
- **AND** no request to an external service MUST be required to display any view

### Requirement: One sample DNA document drives every view

The demo SHALL render all of its views from a single bundled sample operational DNA document. The same source document SHALL be the input to each lens view, so that switching views demonstrably changes only the lens, not the data.

#### Scenario: Switching views does not change the underlying data

- **WHEN** the visitor switches from one lens view to another
- **THEN** both views MUST be derived from the same sample DNA document
- **AND** the section MUST make clear that the views are different lenses over one model

### Requirement: Three simple, digestible views over the one sample

The demo SHALL present three selectable, live views over the same sample DNA, each kept deliberately simple and easy to read at a glance:

- **Org chart** — the role hierarchy (who reports to whom), rendered as a connected diagram.
- **Process flow** — how work moves through the team, rendered as a left-to-right step flow.
- **Runbook** — the same process as a numbered "who does each part" operating procedure.

Field-table rendering (as used on the docs reference page) SHALL NOT be the demo's presentation. Step/task identifiers SHALL be shown in human-readable form (e.g. `underwrite-loan` → "Underwrite loan").

#### Scenario: Org chart view renders a role hierarchy

- **WHEN** the visitor selects the Org chart view
- **THEN** the roles from the sample DNA MUST be shown as a connected reporting diagram (not a field table)

#### Scenario: Process flow view renders an ordered step flow

- **WHEN** the visitor selects the Process flow view
- **THEN** the process steps MUST be shown in order as a flow, each with its owner

#### Scenario: Runbook view renders a numbered procedure

- **WHEN** the visitor selects the Runbook view
- **THEN** the same process MUST be shown as a numbered list of steps, each with the responsible role

#### Scenario: All three views are interactive

- **WHEN** the visitor clicks any of the three tabs
- **THEN** the demo MUST switch to that view

### Requirement: Idle auto-cycle that yields to interaction and motion preferences

The demo SHALL auto-cycle through the three views while idle, dwelling roughly ten seconds on each, to signal that more than one view exists. Any visitor interaction with the view controls SHALL stop the auto-cycle. When the visitor's system requests reduced motion, the auto-cycle SHALL NOT run.

#### Scenario: Auto-cycle advances while idle

- **WHEN** the demo is visible and the visitor has not interacted with it
- **THEN** it MUST periodically advance through the Org chart, Process flow, and Runbook views

#### Scenario: Interaction stops the auto-cycle

- **WHEN** the visitor selects a view tab
- **THEN** the auto-cycle MUST stop and the demo MUST remain on the visitor's chosen view

#### Scenario: Reduced-motion is respected

- **WHEN** the visitor's environment sets `prefers-reduced-motion: reduce`
- **THEN** the auto-cycle MUST NOT run
- **AND** the demo MUST still be fully usable via the tabs

### Requirement: Section CTA routes to the waitlist

The demo section SHALL include a call-to-action framing building your own DNA as the next step. Because the demo now sits on `/operations`, that call-to-action SHALL NOT link to the page it is on.

#### Scenario: CTA does not link to its own page

- **WHEN** the visitor activates the demo section's call-to-action
- **THEN** it MUST resolve to the waitlist
- **AND** it MUST NOT navigate to the page the demo is already on

### Requirement: The primary homepage action is the waitlist

While the products are pre-GA, the waitlist is the only conversion available, so the homepage's primary (filled) actions SHALL be the waitlist rather than a link a visitor can already reach from the Products menu and the product cards. Navigation to a product SHALL be carried by secondary actions and by the product cards.

#### Scenario: Primary actions point at the waitlist

- **WHEN** the homepage is viewed
- **THEN** the hero's primary action and the closing call-to-action's primary action MUST both read "Join the waitlist"
- **AND** both MUST resolve to the waitlist form

#### Scenario: Products remain reachable without the primary button

- **WHEN** the homepage is viewed
- **THEN** both products MUST be reachable from the page without using a primary action

### Requirement: The Collect → Structure narrative lives with its product

The Collect → Structure narrative SHALL be preserved, on `/operations` below that page's own demo rather than on the homepage. The homepage's job below the hero is to name the two products, not to explain either one; the walkthrough is read by somebody who has already chosen to care about Operations.

#### Scenario: The build narrative still reads end-to-end

- **WHEN** a visitor reads `/operations` top to bottom
- **THEN** the Collect and Structure steps MUST still be present
- **AND** they MUST follow the Operations demo rather than precede it

#### Scenario: The homepage does not duplicate the walkthrough

- **WHEN** the homepage is viewed
- **THEN** the Operations walkthrough MUST NOT be present
- **AND** the section below the hero MUST instead present the two products side by side

### Requirement: Build and checks remain green

`npm run build` and `npm run check` SHALL succeed with the demo in place. The sample DNA document SHALL be valid operational DNA.

#### Scenario: Site builds with the demo

- **WHEN** `npm run build` runs
- **THEN** it MUST complete successfully and emit `/operations` with the demo

#### Scenario: Sample document is valid DNA

- **WHEN** the sample DNA document is validated against the operational schema
- **THEN** it MUST be valid
