## ADDED Requirements

### Requirement: Public product page at `/overlay`

The site SHALL serve a product page for DNA Overlay at `/overlay`, built from a hero, a set of narrative sections, and a closing call to action. The page SHALL lead with the wedge — that most controls in most products are governed by nothing, and that no team can say which ones — rather than with a feature list.

#### Scenario: The page renders

- **WHEN** the site is built
- **THEN** `/overlay` MUST render
- **AND** it MUST present the hero, the narrative sections, and a closing call to action

#### Scenario: The page leads with absence, not distance

- **WHEN** a visitor reads the page from the top
- **THEN** the opening claim MUST be about controls that are governed by nothing
- **AND** the page MUST position the Overlay as an addition to a running product rather than a replacement for an existing system

### Requirement: The panel is demonstrated in-page, stub-first

The page SHALL include an in-page walkthrough of the Overlay panel rather than only screenshots of it. The walkthrough SHALL follow the stub-first pattern already used on `/playground`: the real component signature, staged data behind it, and a visible demo-mode badge, so that nothing on the page implies a live connection to a customer's stack.

#### Scenario: A visitor sees the panel work

- **WHEN** a visitor reaches the demo in the hero
- **THEN** it MUST narrate the panel's readings step by step
- **AND** it MUST run without a request to a live stack

#### Scenario: The demo discloses that it is staged

- **WHEN** the demo is displayed
- **THEN** a demo-mode indication MUST be present

### Requirement: Inspect and Prototype are two modes of one story

The page SHALL present Inspect and Prototype as two modes of the same product, toggled in place, rather than as two products or two pages. Each mode SHALL render in the same shape as the other, so the toggle reads as a change of activity rather than a change of subject.

#### Scenario: A visitor switches modes

- **WHEN** a visitor activates the mode toggle
- **THEN** the section MUST swap between the Inspect content and the Prototype content
- **AND** both MUST be presented in the same structural shape

#### Scenario: Prototype is narrated on the same control as Inspect

- **WHEN** a visitor follows the demo through both modes
- **THEN** the Prototype steps MUST act on the same control the Inspect steps read

### Requirement: Early access, not self-serve signup

Because the product is pre-GA, the page SHALL ask for early access rather than offer self-serve signup or a public install path. The page SHALL carry an early-access form as its conversion point.

#### Scenario: The conversion point is early access

- **WHEN** a visitor reaches the foot of the page
- **THEN** an early-access form MUST be present
- **AND** no self-serve checkout or public package install path MUST be offered

### Requirement: Install and trust are answered on the page

The page SHALL explain how the Overlay is installed into a running application and what it does and does not have access to, so that a reader evaluating it does not have to ask those questions separately.

#### Scenario: A reader can find the install story

- **WHEN** a visitor reads the page
- **THEN** it MUST describe how the Overlay is installed
- **AND** it MUST address what it can see in the host application

### Requirement: Build and checks remain green

`npm run build` and `npm run check` SHALL succeed with the Overlay page in place.

#### Scenario: Site builds with the Overlay page

- **WHEN** `npm run build` runs
- **THEN** it MUST complete successfully and emit `/overlay`

#### Scenario: Checks pass

- **WHEN** `npm run check` runs
- **THEN** type checking, linting, and formatting MUST report no errors
