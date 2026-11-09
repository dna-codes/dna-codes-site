# keyword-registry Specification

## Purpose

The site keeps one registry of the keywords it measures. Each page owns one primary keyword, and the build checks that the registry and the pages agree.

## Requirements

### Requirement: One registry names every measured keyword

The site SHALL keep every keyword it has measured or intends to measure in a single data file,
`src/data/seo/keywords.json`, one row per keyword. Each row SHALL carry an id, the keyword, its
volume and difficulty (or null when unmeasured), its intent, its cluster, a fit score, a role, and
where the numbers came from and when. The role SHALL be one of `primary`, `secondary`, `candidate`,
`to-measure` or `skip`.

#### Scenario: Unmeasured and rejected keywords are kept

- **WHEN** a keyword is measured and judged not worth targeting
- **THEN** its row MUST remain in the registry with role `skip` or `candidate`
- **AND** its notes MUST be able to record why

#### Scenario: A keyword is listed before it is measured

- **WHEN** a keyword is added with role `to-measure`
- **THEN** its volume and difficulty MUST be allowed to be null
- **AND** the build MUST NOT fail because of it

### Requirement: Each primary keyword is owned by exactly one page

A row with role `primary` SHALL name the page that owns it and SHALL carry that page's search
title and description. No two primary rows SHALL name the same page, and no keyword SHALL be
primary on more than one row.

#### Scenario: Two pages claim one keyword

- **WHEN** two primary rows name the same keyword, or two primary rows name the same page
- **THEN** `npm run check:keywords` MUST fail and name both rows

#### Scenario: A primary points at a page that does not exist

- **WHEN** a primary or secondary row names a route with no built page in `dist/`
- **THEN** `npm run check:keywords` MUST fail and name the row and the route

### Requirement: Pages take their search metadata from the registry

A page that targets a keyword SHALL obtain its title and description from the registry through a
single helper rather than writing them inline. A blog post SHALL name its keyword with an optional
`targetKeyword` frontmatter field holding a registry id.

#### Scenario: A page opts in

- **WHEN** a page sets its metadata from `seoFor('/sop-software')`
- **THEN** the rendered `<title>` MUST be the primary row's title with the site suffix
- **AND** the meta description MUST be the primary row's description

#### Scenario: A page opts in with no primary row

- **WHEN** a page calls `seoFor` for a route that no primary row names
- **THEN** the build MUST fail rather than fall back to other metadata

#### Scenario: A post names an unknown keyword

- **WHEN** a post's `targetKeyword` is not the id of a primary row whose page is that post's URL
- **THEN** `npm run check:keywords` MUST fail and name the post

#### Scenario: Existing posts are unaffected

- **WHEN** a post has an explicit `metadata.title` in frontmatter and no `targetKeyword`
- **THEN** its rendered title MUST be unchanged by this capability

### Requirement: Search titles and descriptions fit a search result

A primary row's title, with the site title suffix applied, SHALL be at most 60 characters. Its
description SHALL be at most 155 characters.

#### Scenario: A title is too long

- **WHEN** a primary row's title plus ` — DNA Codes` exceeds 60 characters
- **THEN** `npm run check:keywords` MUST fail and report the length

#### Scenario: A title omits its keyword

- **WHEN** a primary row's title does not contain its keyword
- **THEN** `npm run check:keywords` MUST warn
- **AND** the build MUST NOT fail on that alone

### Requirement: The registry is imported from the research sheet

The repository SHALL provide `npm run keywords:import <csv>`, which rewrites the registry from a
CSV exported from the research sheet. The import SHALL refuse a CSV whose header row does not
match the registry's columns exactly. The build SHALL NOT read the research sheet.

#### Scenario: A pivot through the sheet

- **WHEN** an author changes a keyword's role or title in the sheet, exports CSV, and runs the import
- **THEN** `src/data/seo/keywords.json` MUST reflect the change
- **AND** the change MUST be reviewable as a diff of that file

#### Scenario: A column was moved in the sheet

- **WHEN** the exported CSV's columns are missing, renamed or reordered
- **THEN** the import MUST exit non-zero without writing the registry

### Requirement: The check runs with every build

`npm run check:keywords` SHALL run as part of `npm run build` and in continuous integration
alongside the existing agent-readiness checks.

#### Scenario: A broken assignment cannot ship

- **WHEN** a pull request leaves a primary keyword pointing at a deleted page
- **THEN** CI MUST fail before the change can be deployed
