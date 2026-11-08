# Tasks — add-overlay-page

Reconstructed after the fact from what shipped in `feat(overlay)` (#5), `feat(overlay)` (#6), and
`fix(overlay)` (#10). Phases follow the proposal's build order.

## Phase 1: Pricing

- [x] Rewrite `/pricing` — real tiers replacing the AstroWind lorem ipsum (`price: 29`, "Etiam in libero")
- [x] Free and Enterprise as bookends around the three paid tiers
- [x] Early-access note: real prices, published so they can be circulated

## Phase 2: The `/overlay` page

- [x] `src/pages/overlay.astro` — narrated hero over `DnaHelix`
- [x] Install-and-trust section (`OverlayInstall`)
- [x] FAQ section
- [x] Closing CTA

## Phase 3: Early access

- [x] `EarlyAccessForm` component, placed at the foot of `/overlay`

## Phase 4: Homepage hooks — deferred, not part of this change

The Overlay shipped quietly: the page is reachable by link but not advertised on the homepage. The
scaffolding is in the tree, commented out, waiting on the "announce it" decision — which is a launch
call, not leftover engineering. Left out of this change's ledger so it can close; re-enabling them is
a change of its own.

- Announcement bar — component exists at `src/components/widgets/Announcement.astro`, not mounted
- Nav entry — commented out at `src/navigation.ts:8`
- `OverlayTeaser` on the homepage — imported and commented out at `src/pages/index.astro:7,72`
- Hero and closing-CTA hooks on the homepage

## Phase 5: The interactive panel

- [x] `OverlayDemo` — the interactive panel, shipped after the static page as planned

## Phase 6: Long-tail entry point — deferred, not part of this change

- Customer-facing walkthrough post. Never written; no such post in `src/data/post/`. It was the
  long-tail entry point for a launch that stayed quiet, so it waits on the same decision as Phase 4.

## Phase 7: Prototype as the page's second mode (added 2026-08-09)

- [x] `OverlayModes` — Inspect/Prototype toggle, mounted on `/overlay`
- [x] `OverlayFacets` — the Inspect facets, rendered through `OverlayModes`
- [x] `OverlayPrototype` — the Prototype narrative, rendered through `OverlayModes`
- [x] Name the entity in the operational model's effect (#10)

## Phase 8: Verify

- [x] `npm run build` succeeds
- [x] `npm run check` passes (astro check, eslint, prettier)
