import { getBlogPermalink, getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    // Overlay leads: it is the only entry a stranger can evaluate in sixty seconds.
    { text: 'Overlay', href: getPermalink('/overlay') },
    { text: 'Playground', href: getPermalink('/playground') },
    { text: 'Docs', href: getPermalink('/docs') },
    { text: 'Pricing', href: getPermalink('/pricing') },
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
        { text: 'Overlay', href: getPermalink('/overlay') },
        { text: 'Pricing', href: getPermalink('/pricing') },
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
