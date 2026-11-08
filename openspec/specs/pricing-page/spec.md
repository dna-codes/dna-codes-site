# pricing-page Specification

## Purpose

TBD - created by archiving change add-overlay-page. Update Purpose after archive.

## Requirements

### Requirement: `/pricing` presents the real suite ladder

The pricing page SHALL present the suite's actual tiers. The AstroWind template placeholder content SHALL NOT remain, so that the page can be linked from anywhere on the site and circulated by sales without embarrassment.

#### Scenario: No template placeholder survives

- **WHEN** a visitor loads `/pricing`
- **THEN** the page MUST present the product's own tiers
- **AND** no template placeholder copy or placeholder price MUST be present

#### Scenario: Prices are stated as real and current

- **WHEN** a visitor reads the page during early access
- **THEN** the page MUST state that the published prices are the real ones

### Requirement: One ladder for the whole suite

Pricing SHALL be presented as a single ladder across the suite rather than as separate price lists per product, with Free and Enterprise as the bookends around the paid tiers.

#### Scenario: The ladder reads as one progression

- **WHEN** a visitor reads the tiers in order
- **THEN** they MUST be presented as one ladder
- **AND** Free and Enterprise MUST appear as the bookends of that ladder

### Requirement: The free tier's boundary is explained, not just stated

Where a tier's limit follows from what the platform enforces rather than from a packaging choice, the page SHALL say so. In particular, the free tier's exclusion from production keys SHALL be explained as a platform boundary.

#### Scenario: A reader can tell a real boundary from a packaging decision

- **WHEN** a visitor reads the free tier
- **THEN** the page MUST explain why production access is excluded
- **AND** it MUST attribute that boundary to the platform rather than to packaging
