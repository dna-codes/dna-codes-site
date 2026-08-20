## ADDED Requirements

### Requirement: Public landing page at `/whats-your-dna`

The site SHALL serve a statically rendered Astro page at `/whats-your-dna` that requires no
authentication and renders successfully with no external runtime dependency. The page SHALL be
composed of three sequential acts — industry selection, lens selection, and generation — with a
sticky page header present across all three.

#### Scenario: Anonymous visitor opens the page

- **WHEN** an unauthenticated visitor navigates to `https://dna.codes/whats-your-dna`
- **THEN** the page MUST render with HTTP 200
- **AND** it MUST display, in order, the industry selector, the lens picker, and the generation
  section

#### Scenario: Page renders without a network call

- **WHEN** the page loads and the visitor completes all three acts
- **THEN** no request to an external service MUST be required to display any artifact
- **AND** every artifact MUST be derived in the browser or at build time from bundled data

### Requirement: A sticky header carries the question, then the answer

The page SHALL render its own sticky header in place of the standard site header, present from
the top of the page to the bottom. The header SHALL contain the DNA mark, a headline region, an
act indicator, and a persistent primary action.

Before an industry is selected, the headline region SHALL read **"What's your DNA?"**. After an
industry is selected, it SHALL display that industry's name together with its value proposition.
The primary action SHALL be labelled **Get Started** and SHALL be present regardless of act.

#### Scenario: Header before any selection

- **WHEN** the page is first loaded with no industry selected
- **THEN** the sticky header MUST read "What's your DNA?"
- **AND** it MUST show the DNA mark and a "Get Started" action

#### Scenario: Header after an industry is selected

- **WHEN** the visitor selects an industry
- **THEN** the sticky header MUST display that industry's name and its value proposition
- **AND** the value proposition MUST remain visible while the visitor scrolls through Acts II
  and III

#### Scenario: Only one sticky bar is present

- **WHEN** the page is viewed at any scroll position
- **THEN** the standard site header MUST NOT be rendered
- **AND** exactly one sticky bar MUST be fixed to the top of the viewport

#### Scenario: Header adapts to narrow viewports

- **WHEN** the page is viewed at a width where the industry name and value proposition cannot
  both fit
- **THEN** the industry name MUST remain visible
- **AND** the "Get Started" action MUST remain reachable without horizontal scrolling

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
- **AND** the sticky header MUST still be asking its question

#### Scenario: Selection advances the page

- **WHEN** the visitor selects an industry
- **THEN** the control MUST display that industry
- **AND** the sticky header MUST update to that industry and its value proposition
- **AND** the page MUST scroll to Act II

#### Scenario: Changing the industry re-seeds later acts

- **WHEN** the visitor returns to Act I and selects a different industry
- **THEN** the sticky header MUST update to the new industry
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

### Requirement: The page's terminal action is Create your DNA

Act III SHALL close with a primary call to action labelled **Create your DNA** that resolves to
the application entry point. The application entry point SHALL be defined by a single shared
constant, and the sticky header's **Get Started** action SHALL resolve to the same destination.
The selected industry and outputs SHALL be forwarded to that destination as query parameters.

#### Scenario: Terminal CTA routes to the app

- **WHEN** the visitor activates "Create your DNA"
- **THEN** it MUST navigate to the destination defined by the shared application-entry constant
- **AND** the selected industry and selected outputs MUST be present as query parameters

#### Scenario: Header and terminal actions agree

- **WHEN** the page is viewed
- **THEN** the sticky header's "Get Started" action and the terminal "Create your DNA" action
  MUST resolve to the same destination
- **AND** neither MUST hard-code that destination independently of the shared constant

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
- **THEN** that industry MUST be selected on the helix and reflected in the sticky header
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
- **THEN** it MUST complete successfully and emit `/whats-your-dna`

#### Scenario: Checks pass

- **WHEN** `npm run check` runs
- **THEN** astro check, ESLint, and Prettier MUST all pass

#### Scenario: The page works on mobile

- **WHEN** the page is viewed at a narrow viewport
- **THEN** all three acts MUST be usable without horizontal scrolling
- **AND** the tab strip MUST remain reachable
- **AND** every generated artifact MUST be readable or scrollable within the pane
