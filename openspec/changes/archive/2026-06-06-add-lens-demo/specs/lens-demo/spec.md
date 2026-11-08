## ADDED Requirements

### Requirement: Homepage renders an interactive lens demo below the hero

The homepage SHALL include an interactive lens-demo section positioned below the message-led hero and above the closing call-to-action. The hero SHALL remain unchanged. The demo SHALL render entirely client-side with no backend dependency.

#### Scenario: Visitor reaches the demo on the homepage

- **WHEN** a visitor loads the homepage and scrolls past the hero
- **THEN** an interactive lens-demo section MUST be present
- **AND** the hero above it MUST be unchanged (message, background, and Playground/Docs actions intact)

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

### Requirement: Section CTA routes to the Playground

The demo section SHALL include a call-to-action that routes to `/playground`, framing the Playground as where a visitor builds their own DNA. The homepage's primary CTAs SHALL remain Playground and Docs; no waitlist CTA SHALL be introduced.

#### Scenario: CTA links to the Playground

- **WHEN** the visitor activates the demo section's call-to-action
- **THEN** it MUST navigate to `/playground`

#### Scenario: No waitlist CTA is added

- **WHEN** the homepage is viewed
- **THEN** the primary actions MUST remain Playground and Docs
- **AND** no "join the waitlist" call-to-action MUST be present

### Requirement: The Collect → Structure narrative is preserved

The change SHALL preserve the existing below-hero narrative spine (Collect → Structure). The demo SHALL serve as the payoff of that narrative rather than replacing the explanation of how DNA is built.

#### Scenario: The build narrative still reads end-to-end

- **WHEN** a visitor reads the below-hero section top to bottom
- **THEN** the Collect and Structure steps MUST still be present
- **AND** the lens demo MUST read as the visible payoff of those steps

### Requirement: Build and checks remain green

`npm run build` and `npm run check` SHALL succeed with the demo in place. The sample DNA document SHALL be valid operational DNA.

#### Scenario: Site builds with the demo

- **WHEN** `npm run build` runs
- **THEN** it MUST complete successfully and emit the homepage with the demo

#### Scenario: Sample document is valid DNA

- **WHEN** the sample DNA document is validated against the operational schema
- **THEN** it MUST be valid
