import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';

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
  },

  integrations: [
    sitemap({
      // Shipping the Overlay launch quietly. These pages are live and reachable by
      // anyone given the link, but they are not advertised to crawlers. Remove the
      // filter (and the `robots` metadata on both pages) when it goes public.
      filter: (page) => !/\/(overlay|pricing)\/?$/.test(page),
    }),
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

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin],
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
