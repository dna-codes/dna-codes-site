import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  site: 'https://dna.codes',
  output: 'static',

  // Posts moved from /%slug% to /blog/%slug% (see src/config.yaml). These two
  // were already published at the root, so the old URLs are kept alive. GitHub
  // Pages can't serve real 301s — for a static build Astro emits a meta-refresh
  // page with a canonical link, which is the standard substitute.
  redirects: {
    '/operational-dna-processes-like-source-code': '/blog/operational-dna-processes-like-source-code',
    '/why-sops-go-out-of-date': '/blog/why-sops-go-out-of-date',
    // /playground is a real page again — the industry genome generator, which shipped
    // first as a campaign-only page at /whats-your-dna. Campaign links to the old URL
    // keep working. (The name previously pointed at /operations, back when the
    // Operations demo was called the Playground; that redirect is retired with it.)
    '/whats-your-dna': '/playground',
    // The Overlay stopped being a product and became the viewer every surface ships, so the
    // product that owns the React panel is now UI Operations — named for its surface, like
    // its three siblings. The old URL is public (the announcement bar, the homepage teaser
    // and anything anyone has bookmarked), so it keeps resolving.
    '/overlay': '/ui-operations',
  },

  integrations: [
    sitemap(),
    mdx(),
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
        logos: ['google-drive', 'notion', 'confluence', 'dropbox', 'slack', 'airtable', 'jira', 'asana', 'monday'],
        'simple-icons': ['linear', 'slack', 'notion', 'confluence', 'googledocs', 'gmail', 'zoom'],
        mdi: ['microsoft-sharepoint'],
        ri: ['notion-fill'],
        devicon: ['slack'],
      },
    }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),

    astrowind({
      config: './src/config.yaml',
    }),
  ],

  image: {
    // Astro's default Sharp service handles local images.
    //
    // Most remote CDN images (Unsplash, Cloudinary, Imgix…) are routed by
    // src/components/common/Image.astro through `unpic`, which rewrites the
    // URL with CDN-side query parameters and serves it straight from the
    // provider — Astro never downloads it, so they don't need to be listed.
    //
    // `domains` only matters for remote URLs that fall through to Astro's
    // native <Image /> (i.e. providers Unpic can't detect, like Pixabay).
    // Listed entries are authorized to be processed by Sharp.
    domains: ['cdn.pixabay.com'],
  },

  // Astro 7 defaults to Sätteri, its native Markdown pipeline, which has its own
  // mdast/hast plugin ecosystem and does not run remark/rehype plugins. Both of
  // ours are remark/rehype, so keep rendering through unified.
  markdown: {
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
        // Resolves via the @dna-codes/dna-schemas package published to npm.
        '~schemas': path.resolve(__dirname, 'node_modules/@dna-codes/dna-schemas'),
        // Lens definitions ship in @dna-codes/dna-core under lenses/ (JSON only —
        // the page imports these files; dna-core's JS runtime is never loaded).
        '~lenses': path.resolve(__dirname, 'node_modules/@dna-codes/dna-core/lenses'),
      },
    },
  },
});
