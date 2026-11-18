# Spec Delta

## ADDED Requirements

### Requirement: Act I links the picked industry to its genome page

When an industry is picked in Act I, the Playground SHALL show a link to that genome's page at
`/playground/<key>/`. The link SHALL NOT show while no industry is picked. Act II and Act III SHALL
NOT change.

#### Scenario: Picking an industry shows the link

- **WHEN** the visitor picks an industry in Act I
- **THEN** a link MUST appear under the control
- **AND** it MUST navigate to `/playground/<key>/` for that industry

#### Scenario: Changing the industry moves the link

- **WHEN** the visitor picks a different industry
- **THEN** the link MUST point to the new industry's genome page

#### Scenario: A deep link shows the link

- **WHEN** `/playground?industry=<key>` is loaded
- **THEN** the link MUST point to `/playground/<key>/`

#### Scenario: No industry, no link

- **WHEN** the page loads with no industry in the URL
- **THEN** the link MUST NOT be visible
