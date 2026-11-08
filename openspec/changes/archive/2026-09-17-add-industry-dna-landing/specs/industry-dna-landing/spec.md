## ADDED Requirements

### Requirement: Public Playground page at `/playground`

The site SHALL serve a statically rendered Astro page at `/playground` that requires no
authentication and renders successfully with no external runtime dependency. The page SHALL be
composed of three sequential acts — industry selection, lens selection, and generation.

#### Scenario: Anonymous visitor opens the page

- **WHEN** an unauthenticated visitor navigates to `https://dna.codes/playground`
- **THEN** the page MUST render with HTTP 200
- **AND** it MUST display, in order, the industry selector, the lens picker, and the generation
  section

#### Scenario: Page renders without a network call

- **WHEN** the page loads and the visitor completes all three acts
- **THEN** no request to an external service MUST be required to display any artifact
- **AND** every artifact MUST be derived in the browser or at build time from bundled data

#### Scenario: The campaign URL keeps working

- **WHEN** a visitor opens `https://dna.codes/whats-your-dna`, the URL the page shipped under
- **THEN** they MUST be sent to `/playground`

### Requirement: The page is reachable from the site

The Playground SHALL be linked from the site rather than reachable only by URL: from the primary
navigation on desktop and mobile, from the footer, and as the homepage hero's secondary action.

#### Scenario: Reachable from primary navigation

- **WHEN** a visitor opens the site header on desktop or the mobile menu
- **THEN** a "Playground" link MUST be visible
- **AND** clicking it MUST navigate to `/playground`

#### Scenario: Reachable from the homepage hero

- **WHEN** the homepage renders
- **THEN** the hero's secondary action MUST read "Playground" and MUST navigate to `/playground`
- **AND** the hero's primary action MUST remain the waitlist

### Requirement: The page uses the standard site header

The page SHALL render the standard site header and footer, the same ones every other page renders,
with the Playground nav entry marked as the current section. It SHALL NOT render a page-specific
header in their place.

#### Scenario: The site nav is present and marked

- **WHEN** the page is viewed at any scroll position
- **THEN** the standard site header MUST be rendered and sticky, exactly as on every other page
- **AND** the "Playground" nav entry MUST be marked as current
- **AND** exactly one sticky bar MUST be fixed to the top of the viewport

#### Scenario: The question is asked by the page, not by a bar

- **WHEN** the page is first loaded with no industry selected
- **THEN** Act I's heading MUST ask the question — "What's your dna?"

### Requirement: Act I selects an industry from one prominent control

Act I SHALL present the supported industries in a single prominent selection control, with a DNA
helix rendered behind the section as background. The control SHALL be labelled so that its purpose
is clear before it is opened, and each industry SHALL display its value proposition alongside its
name within the control.

The helix SHALL remain legible as background without reducing the contrast of the text in front
of it.

No industry SHALL be selected when the page is first loaded without state in the URL.

#### Scenario: The control is the obvious action

- **WHEN** a visitor reaches Act I
- **THEN** a single selection control MUST be presented as the primary action of the section
- **AND** it MUST indicate that a model is to be selected before it is opened

#### Scenario: Every industry is offered with its value proposition

- **WHEN** the visitor opens the control
- **THEN** every supported industry MUST be listed
- **AND** each MUST display its value proposition alongside its name

#### Scenario: Nothing is pre-selected

- **WHEN** the page is loaded with no industry in the URL
- **THEN** the control MUST show its unselected prompt

#### Scenario: Selection advances the page

- **WHEN** the visitor selects an industry
- **THEN** the control MUST display that industry
- **AND** the page MUST scroll to Act II

#### Scenario: Changing the industry re-seeds later acts

- **WHEN** the visitor returns to Act I and selects a different industry
- **THEN** the control MUST display the new industry
- **AND** the lens picker MUST reset to the new industry's spotlight selection

#### Scenario: The control is operable by keyboard

- **WHEN** the visitor operates Act I by keyboard alone
- **THEN** the control MUST be openable, navigable between industries, and selectable without a
  pointer
- **AND** dismissing it without choosing MUST return focus to the control
- **AND** its expanded state and the industry under the cursor MUST be exposed to assistive
  technology

#### Scenario: Reduced motion

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** the background helix MUST render without continuous animation
- **AND** the control MUST remain fully operable

### Requirement: Act II selects output types across the three DNA layers

Act II SHALL present selectable output types grouped into three columns corresponding to the
Operations, Product, and Technology layers. The available outputs SHALL be:

- **Operations** — Process flow, SOP / runbook, Key positions, RACI matrix, Policies & rules
- **Product** — Data model, Screen map, Example UI, API surface
- **Technology** — Architecture diagram, Environment topology, Access-control matrix

Act II SHALL be reachable only after an industry has been selected, and SHALL end with a **Go**
action that starts generation.

#### Scenario: Outputs are grouped by layer

- **WHEN** the visitor reaches Act II
- **THEN** the output types MUST be grouped under the Operations, Product, and Technology layers
- **AND** each output MUST be individually selectable and deselectable

#### Scenario: Spotlight outputs arrive pre-selected

- **WHEN** the visitor arrives at Act II after selecting an industry
- **THEN** that industry's declared spotlight outputs MUST already be selected
- **AND** the section MUST state why that set was chosen for that industry

#### Scenario: At least one output stays selected

- **WHEN** the visitor attempts to deselect the last remaining selected output
- **THEN** the selection MUST NOT drop to zero
- **AND** the interface MUST make clear that at least one output is required

#### Scenario: Go starts generation

- **WHEN** the visitor activates the "Go" action with at least one output selected
- **THEN** the page MUST scroll to Act III
- **AND** generation MUST begin for exactly the selected outputs

### Requirement: Act III generates every selected output into one tabbed pane

Act III SHALL render the generated artifacts in a single pane with one tab per selected output.
Every selected output SHALL have its tab present from the start of the run, in a visibly pending
state, and each SHALL become selectable as its artifact resolves — so the strip shows the run
building rather than appearing complete at the end.

Generation SHALL complete within approximately three seconds regardless of how many outputs were
selected, and SHALL conclude by presenting the page's terminal call to action.

#### Scenario: One tab per selected output

- **WHEN** generation runs
- **THEN** exactly one tab MUST be present for each selected output
- **AND** no tab MUST be present for an unselected output

#### Scenario: Tabs resolve one at a time

- **WHEN** the visitor watches a run with several outputs selected
- **THEN** each tab MUST start in a pending state and become selectable as its artifact resolves
- **AND** the pane MUST display the newest resolved artifact as it arrives

#### Scenario: Choosing a tab stops the pane from moving

- **WHEN** the visitor selects a tab while generation is still running
- **THEN** the pane MUST stay on the visitor's chosen tab
- **AND** later artifacts MUST still resolve into their own tabs

#### Scenario: Artifacts are derived from one genome

- **WHEN** the visitor switches between two tabs from different layers
- **THEN** both artifacts MUST be derived from the same industry genome document
- **AND** the section MUST make clear that every artifact came from that single genome

#### Scenario: The pane is operable by keyboard

- **WHEN** the visitor moves through the tab strip by keyboard
- **THEN** the resolved tabs MUST be reachable and selectable without a pointer
- **AND** the relationship between each tab and its panel MUST be exposed to assistive technology

#### Scenario: Generation is paced but bounded

- **WHEN** the visitor selects every available output and activates "Go"
- **THEN** the generation sequence MUST still complete within approximately three seconds

#### Scenario: Reduced motion collapses the sequence

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** the staggered arrival MUST NOT run
- **AND** every selected artifact MUST still be generated and reachable

### Requirement: Output renderers contain no industry-specific content

Every output renderer SHALL operate solely on a view-model derived from the genome. Renderers
SHALL NOT branch on the selected industry, and SHALL NOT contain industry-specific copy, labels,
or sample values. Any industry-specific text appearing in an artifact SHALL be traceable to a
value in that industry's genome.

#### Scenario: A renderer serves every industry unchanged

- **WHEN** the same output is generated for two different industries
- **THEN** the same renderer MUST produce both
- **AND** the difference between the two artifacts MUST come entirely from the genome data

#### Scenario: Adding an industry requires no renderer change

- **WHEN** a new industry genome and its metadata entry are added
- **THEN** every existing output MUST be generatable for it without editing any renderer

### Requirement: Generation runs behind the eventual live client signature

The page SHALL route all generation through a single typed client function whose signature takes
the genome and the selected lenses and returns the generated artifacts. In this change that
function SHALL be implemented as an in-browser derivation over bundled data. Loading and error
states SHALL be real states of that function, not decorative. A demo-mode indicator SHALL be
visible while generated artifacts are displayed, and the genome behind them SHALL be named on
screen.

#### Scenario: A single seam for live generation

- **WHEN** generation is triggered
- **THEN** it MUST go through the shared client function rather than component-local logic
- **AND** replacing that function's implementation with a network call MUST NOT require changes
  to any renderer

#### Scenario: The artifacts are disclosed as a worked example

- **WHEN** generated artifacts are displayed
- **THEN** the name of the genome they were derived from MUST be shown
- **AND** it MUST be stated that the genome is a worked example, not the visitor's own data

#### Scenario: Failure is handled visibly

- **WHEN** generation fails for a selected output
- **THEN** that output's own tab MUST show an error state
- **AND** the remaining outputs MUST still render

### Requirement: Page state is deep-linkable

The selected industry and selected outputs SHALL be reflected in the URL query string as choices
are made, without adding a history entry per keystroke of interaction. Loading the page with those
parameters SHALL restore the corresponding state. Unrecognised parameter values SHALL be ignored
rather than producing an error state.

#### Scenario: Choices are reflected in the URL

- **WHEN** the visitor selects an industry and changes the selected outputs
- **THEN** the URL MUST carry the selected industry and the selected outputs

#### Scenario: A shared link restores the configuration

- **WHEN** a visitor opens a URL carrying an industry and a set of outputs
- **THEN** that industry MUST be selected on the helix
- **AND** exactly those outputs MUST be selected in the lens picker

#### Scenario: Unknown parameters degrade gracefully

- **WHEN** the URL carries an unrecognised industry key or output id
- **THEN** the page MUST ignore the unrecognised value and render normally

### Requirement: Existing surfaces are unaffected

Adding the landing page SHALL NOT change the behaviour of the homepage, `/operations`, or the
existing lens demo. Shared modules extended by this change SHALL remain backward compatible for
their current consumers.

#### Scenario: The lens demo still works

- **WHEN** `/operations` is viewed after this change
- **THEN** the lens demo MUST behave exactly as it did before

#### Scenario: The helix utilities stay compatible

- **WHEN** the homepage and product pages render their helixes after this change
- **THEN** they MUST render as they did before, with no changes to their call sites

### Requirement: Build and checks remain green

`npm run build` and `npm run check` SHALL succeed with the landing page in place, and the page
SHALL be readable and operable on mobile viewports.

#### Scenario: Site builds with the page

- **WHEN** `npm run build` runs
- **THEN** it MUST complete successfully and emit `/playground`

#### Scenario: Checks pass

- **WHEN** `npm run check` runs
- **THEN** astro check, ESLint, and Prettier MUST all pass

#### Scenario: The page works on mobile

- **WHEN** the page is viewed at a narrow viewport
- **THEN** all three acts MUST be usable without horizontal scrolling
- **AND** the tab strip MUST remain reachable
- **AND** every generated artifact MUST be readable or scrollable within the pane
