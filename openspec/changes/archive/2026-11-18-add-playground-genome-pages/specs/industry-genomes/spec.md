# Spec Delta

## ADDED Requirements

### Requirement: Every genome declares its provenance

Each genome SHALL declare its provenance as either `fictional` or `public-sources`. A fictional
genome describes an invented company. A public-sources genome describes a real company as far as
its published sources support. The build SHALL fail when a genome declares neither.

#### Scenario: A genome without provenance fails the build

- **WHEN** a genome declares no provenance
- **AND** `npm run build` runs
- **THEN** the build MUST fail and name the genome

#### Scenario: The current corpus is fictional

- **WHEN** the six launch genomes are read
- **THEN** each MUST declare `fictional`

### Requirement: Provenance is shown wherever the genome is shown

Every page that shows a genome's company name SHALL show its provenance next to it. A fictional
genome SHALL be labelled as a fictional company. A public-sources genome SHALL be labelled as
modeled from public sources and SHALL show a notice that DNA Codes is not affiliated with the
company.

#### Scenario: A fictional genome is labelled

- **WHEN** a fictional genome's company name is shown on a genome page, a template card or a
  share card
- **THEN** a "Fictional company" label MUST be shown with it

#### Scenario: A public-sources genome carries its notice

- **WHEN** a public-sources genome's page renders
- **THEN** it MUST show that the genome is modeled from public sources
- **AND** it MUST show a notice that DNA Codes is not affiliated with the company

### Requirement: A public-sources genome cites its sources

A public-sources genome SHALL cite at least three published sources. Each source SHALL carry a
title, an `https` URL, and a note that states which parts of the genome it supports. The genome's
page SHALL list those sources. The build SHALL fail when a public-sources genome cites fewer than
three sources or a source lacks any of those fields.

#### Scenario: Too few sources fails the build

- **WHEN** a public-sources genome cites two sources
- **AND** `npm run build` runs
- **THEN** the build MUST fail and name the genome

#### Scenario: Sources are visible

- **WHEN** a public-sources genome's page renders
- **THEN** every cited source MUST be listed with its title, link and note

### Requirement: A public-sources genome names no individual

A public-sources genome SHALL model roles, groups and person templates only. It SHALL NOT name a
real individual in any name, description or attribute value.

#### Scenario: Person templates stay generic

- **WHEN** a reviewer reads a public-sources genome's person templates and memberships
- **THEN** each MUST describe a kind of person in a role
- **AND** none MUST carry a real individual's name
