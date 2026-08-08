import { getBlogPermalink, getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    // Overlay and Pricing are deliberately absent while the Overlay ships quietly —
    // both pages are live at their URLs and reachable by anyone given the link, but
    // nothing on the site points at them. Restore these two when it goes public:
    //   { text: 'Overlay', href: getPermalink('/overlay') },
    //   { text: 'Pricing', href: getPermalink('/pricing') },
    { text: 'Playground', href: getPermalink('/playground') },
    { text: 'Docs', href: getPermalink('/docs') },
    { text: 'Blog', href: getBlogPermalink() },
    // { text: 'About', href: getPermalink('/about') },
  ],
  actions: [{ text: 'Playground', href: getPermalink('/playground'), variant: 'primary' as const }],
};

export const footerData = {
  links: [
    {
      title: 'Platform',
      links: [
        // Overlay and Pricing rejoin this list when the launch goes public.
        { text: 'Playground', href: getPermalink('/playground') },
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
