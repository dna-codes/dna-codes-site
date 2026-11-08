import { PRODUCTS } from './data/products';
import { getBlogPermalink, getPermalink } from './utils/permalinks';

// Single source of truth for the waitlist. Product pages embed the same form inline with
// their own interest pre-ticked; every other primary button on the site comes here.
export const WAITLIST_HREF = '/waitlist';
export const WAITLIST_TEXT = 'Join the waitlist';

// There was an APP_HREF here, pointing at `https://app.dna.codes` for the Playground's two
// campaign buttons. Both are gone: the app is not open, so it resolved to the waitlist, which the
// header already offers on every page. Reintroduce it the day the app opens and there is somewhere
// different to send people.

export const headerData = {
  links: [
    // Products, not Operations: the umbrella is Operations, but a nav menu is answering
    // "what do you sell", and a visitor who has not learned the umbrella yet reads a menu
    // called Operations as one product rather than the list of them. The menu holds the core
    // first, then a surface per place your software meets somebody, in the order they are
    // defined in ~/data/products and each carrying its own mark. Header.astro marks the
    // parent active whenever one of its children is the current page, so a visitor who
    // arrives deep in the site can see where they are without reading the URL. Planned
    // surfaces are filtered out of PRODUCTS upstream — a menu item is a promise you can click.
    {
      text: 'Products',
      links: PRODUCTS.map(({ name, href, icon, description }) => ({
        text: name,
        href: getPermalink(href),
        icon,
        description,
      })),
    },
    // Playground sits next to Products because it is the one place a visitor can operate the
    // thing rather than read about it — the hero's second action lands here too.
    { text: 'Playground', href: getPermalink('/playground') },
    { text: 'Pricing', href: getPermalink('/pricing') },
    // Learn gathers the things you read or work through: schema docs, the blog, and the
    // Building With AI companion. Three top-level items for "go read" crowded the bar next
    // to Products / Playground / Pricing; one menu keeps the conversion path clear.
    {
      text: 'Learn',
      links: [
        {
          text: 'Docs',
          href: getPermalink('/docs'),
          description: 'Schema reference, getting started, and how DNA maps to familiar frameworks.',
        },
        {
          text: 'Blog',
          href: getBlogPermalink(),
          description: 'Essays on the layers between intent and execution.',
        },
        {
          text: 'Building With AI',
          href: getPermalink('/building-with-ai'),
          description: 'Interactive patterns and anti-patterns for the agent stack.',
        },
      ],
    },
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
      title: 'Operations',
      links: [
        ...PRODUCTS.map(({ name, href }) => ({ text: name, href: getPermalink(href) })),
        { text: 'Playground', href: getPermalink('/playground') },
        { text: 'Pricing', href: getPermalink('/pricing') },
      ],
    },
    {
      title: 'Learn',
      links: [
        { text: 'Documentation', href: getPermalink('/docs') },
        { text: 'Getting started', href: getPermalink('/docs/getting-started') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Building With AI', href: getPermalink('/building-with-ai') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'About', href: getPermalink('/about') },
    { text: 'Contact', href: getPermalink('/contact') },
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [],
  footNote: 'Your business has a unique DNA. Time to run on it.',
};
