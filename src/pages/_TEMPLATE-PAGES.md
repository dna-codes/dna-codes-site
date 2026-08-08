# Disconnected template pages

These are the AstroWind starter's demo pages. They still carry placeholder copy
(lorem ipsum, stock Unsplash images, "Stellar Pricing for Every Journey") and were
never linked from `navigation.ts`, but they _were_ being built and published as live
routes — reachable by anyone who guessed the URL, and indexable via the sitemap.

They are kept as reference for layouts and widget usage we may want later.

## What is disconnected

| File              | Route it used to serve                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `_about.astro`    | `/about`                                                                                                                                   |
| `_services.astro` | `/services`                                                                                                                                |
| `_contact.astro`  | `/contact`                                                                                                                                 |
| `_homes/*`        | `/homes/saas`, `/homes/startup`, `/homes/mobile-app`, `/homes/personal`                                                                    |
| `_landing/*`      | `/landing/sales`, `/landing/product`, `/landing/pre-launch`, `/landing/click-through`, `/landing/lead-generation`, `/landing/subscription` |

## How the disconnection works

Astro excludes any file or directory under `src/pages/` whose name starts with `_`
from routing. Nothing was edited and nothing was deleted — only renamed — so the
pages still typecheck and still import their layouts and widgets normally.

## Re-enabling one

Drop the underscore, and rewrite the copy before it ships:

```bash
git mv src/pages/_about.astro src/pages/about.astro
```

Then add it to `src/navigation.ts` if it should be reachable from the nav.
