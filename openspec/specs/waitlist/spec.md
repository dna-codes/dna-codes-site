# waitlist Specification

## Purpose

While the suite is pre-GA, the waitlist is the only conversion on the site: every primary
button resolves to it. One form serves all of it, so that a visitor who came for
Operations, a visitor who came for the Overlay, and a visitor who has not decided are all
asked the same short set of questions, and only the questions that apply to them.

## Requirements

### Requirement: One form component

The site SHALL have exactly one waitlist form component. Pages SHALL embed that component rather than reimplementing a form, and no second form component SHALL collect the same intent.

#### Scenario: Product pages embed the shared form

- **WHEN** `/overlay` or `/operations` renders its conversion section
- **THEN** it MUST embed the shared waitlist form component
- **AND** the fields, wording and submit behaviour MUST be identical to the form on `/waitlist`

### Requirement: A neutral waitlist page

The site SHALL serve a product-neutral page at `/waitlist` carrying the form. Primary actions on pages that are not a product page SHALL resolve here, so that no visitor is sent into a product's own page to find a form.

#### Scenario: Generic primary actions land on the neutral page

- **WHEN** a visitor activates a primary action on the homepage, the pricing page, or the site header
- **THEN** they MUST arrive at `/waitlist`
- **AND** nothing above the interest question MUST name a single product

#### Scenario: Product pages convert in place

- **WHEN** a visitor activates the primary action in a product page's hero
- **THEN** they MUST be taken to that page's own embedded form rather than navigated away

### Requirement: The destination is named by every control that leads to it

Wording SHALL be consistent end to end: the button a visitor clicks and the button they arrive at SHALL say the same thing, so the ask never escalates between the click and the form.

#### Scenario: Consistent wording

- **WHEN** any control that leads to or submits the form is rendered
- **THEN** it MUST read "Join the waitlist"
- **AND** it MUST NOT be worded as getting, claiming, or requesting access

### Requirement: Product interest is a multi-select, not a toggle

The form SHALL ask which parts of the suite the visitor is interested in, and SHALL allow more than one answer. The two products are surfaces on one model, so wanting both is an ordinary answer rather than an evasion, and not having decided is a real answer that SHALL be offered explicitly.

#### Scenario: More than one interest can be chosen

- **WHEN** a visitor selects both Operations and the Overlay
- **THEN** both MUST be recorded
- **AND** the submitted payload MUST carry the interest field once per selection rather than collapsing to a single value

#### Scenario: Undecided is an available answer

- **WHEN** a visitor has not decided which product fits
- **THEN** an explicit "not sure yet" option MUST be selectable
- **AND** choosing it MUST satisfy the requirement to answer

#### Scenario: An answer is required

- **WHEN** a visitor submits with no interest selected
- **THEN** the form MUST NOT submit
- **AND** it MUST show a message naming the undecided option as an acceptable answer

#### Scenario: A product page pre-answers the question

- **WHEN** the form is embedded in a product's own page
- **THEN** that product's interest MUST be selected on first render
- **AND** the visitor MUST still be able to change or add to it

### Requirement: Questions that do not apply are not asked

Fields that only make sense for one product SHALL be hidden until that product is selected, so no visitor is asked to describe something they did not come about.

#### Scenario: The stack question follows the Overlay

- **WHEN** the Overlay is not among the selected interests
- **THEN** the "what is your application built with" field MUST NOT be visible
- **AND** it MUST become visible when the Overlay is selected

#### Scenario: A hidden field submits nothing

- **WHEN** a field is hidden after the visitor has typed into it
- **THEN** its value MUST be cleared
- **AND** the submitted payload MUST NOT carry an answer the visitor can no longer see

### Requirement: Only identity is mandatory

Beyond the interest question, the form SHALL require only the fields needed to reply: name, work email, and company. Every qualifying question SHALL be optional and labelled as such.

#### Scenario: Optional fields are marked

- **WHEN** the form renders
- **THEN** each optional field's label MUST say so
- **AND** leaving every optional field blank MUST NOT prevent submission

### Requirement: The open question is preserved

The form SHALL keep one free-text question about where the visitor is starting from. It is the field that decides who replies and about what, so it SHALL be worded to invite a rough answer and SHALL work for either product.

#### Scenario: The open question is product-neutral

- **WHEN** the free-text question renders
- **THEN** its wording MUST apply to processes and to controls alike
- **AND** its help text MUST make clear that a rough or empty-handed answer is welcome

### Requirement: Honest failure

An unconfigured or failing endpoint SHALL refuse visibly rather than appear to succeed. Somebody who believes they are on a list they are not on is the worst available outcome.

#### Scenario: No endpoint configured

- **WHEN** the form is submitted while no submission endpoint is set
- **THEN** it MUST NOT show the success state
- **AND** it MUST show a message giving a working way to make contact

#### Scenario: Submission fails

- **WHEN** the submission request rejects or returns a non-OK status
- **THEN** the form MUST remain on the page with its values intact
- **AND** the submit control MUST return to its resting state so the visitor can retry

#### Scenario: Submission succeeds

- **WHEN** the submission request succeeds
- **THEN** the form MUST be replaced in place by a confirmation
- **AND** the visitor MUST NOT be navigated to the form provider's own page

### Requirement: Spam handling that costs the visitor nothing

The form SHALL carry a honeypot field rather than a challenge, so that no visitor is asked to prove anything.

#### Scenario: Honeypot is present and hidden

- **WHEN** the form renders
- **THEN** a honeypot field MUST be present and hidden from assistive technology
- **AND** no CAPTCHA or equivalent challenge MUST be shown
