import { PRODUCTS } from './data/products';
import { getBlogPermalink, getPermalink } from './utils/permalinks';

// Single source of truth for the waitlist. Product pages embed the same form inline with
// their own interest pre-ticked; every other primary button on the site comes here.
export const WAITLIST_HREF = '/waitlist';
export const WAITLIST_TEXT = 'Join the waitlist';

// Where "Create your DNA" and the campaign page's "Get Started" both land. One constant, so the
// two never disagree and repointing them is a one-line change: if the app is not open when a
// campaign runs, set this to `/waitlist` and both buttons follow.
//
// Only /whats-your-dna reads this. That page is campaign-only by decision — it is deliberately
// not linked from the header, the footer, or the homepage.
export const APP_HREF = 'https://app.dna.codes';

export const headerData = {
  links: [
    // Products groups the two surfaces you can actually operate, in the order they are
    // defined in ~/data/products and each carrying its own mark. Header.astro marks the
    // parent active whenever one of its children is the current page, so a visitor who
    // arrives deep in the site can see where they are without reading the URL.
    {
      text: 'Products',
      links: PRODUCTS.map(({ name, href, icon, description }) => ({
        text: name,
        href: getPermalink(href),
        icon,
        description,
      })),
    },
    { text: 'Pricing', href: getPermalink('/pricing') },
    { text: 'Docs', href: getPermalink('/docs') },
    { text: 'Blog', href: getBlogPermalink() },
    // { text: 'About', href: getPermalink('/about') },
  ],
  // The one primary button on the site is the one conversion available pre-GA. Navigating
  // to a product is what the Products menu and the homepage cards are for, so the green
  // button never spends itself on a link a visitor already has two ways to reach.
  actions: [{ text: 'Join the waitlist', href: WAITLIST_HREF, variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Platform',
      links: [
        ...PRODUCTS.map(({ name, href }) => ({ text: name, href: getPermalink(href) })),
        { text: 'Pricing', href: getPermalink('/pricing') },
      ],
    },
    {
      title: 'Developers',
      links: [
        { text: 'Documentation', href: getPermalink('/docs') },
        { text: 'Getting started', href: getPermalink('/docs/getting-started') },
        { text: 'Blog', href: getBlogPermalink() },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [],
  footNote: 'Your business has a unique DNA. Time to run on it.',
};
