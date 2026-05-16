# dna-codes-site

Marketing site for [dna.codes](https://dna.codes) — built with [Astro](https://astro.build) as a fully static site.

## Setup

```bash
npm install
```

## Commands

```bash
# Start local dev server at http://localhost:4321
npm run dev

# Build for production (output goes to dist/)
npm run build

# Preview the production build locally
npm run preview
```

## Structure

```
src/
  components/     # Astro components (Hero, Features, AnimatedDemo, CTA)
  layouts/        # Base HTML layout
  pages/          # File-based routes (index.astro = dna.codes/)
  content/pages/  # MDX files — add a file here to add a page
public/           # Static assets (favicon, images)
```

## Adding a page

Drop an `.mdx` file in `src/content/pages/` and add a corresponding route in `src/pages/` that imports and renders it. `astro build` will include it automatically.

## Deploy

The build output in `dist/` is plain static HTML/CSS/JS — serve it from any CDN (S3 + CloudFront via `cba deploy`).
