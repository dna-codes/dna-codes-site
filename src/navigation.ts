import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Playground', href: getPermalink('/playground') },
    // { text: 'Platform', href: getPermalink('/') },
    // { text: 'Pricing', href: getPermalink('/pricing') },
    // { text: 'About', href: getPermalink('/about') },
    // { text: 'Docs', href: 'https://docs.dna.codes' },
    // { text: 'Blog', href: getBlogPermalink() },
  ],
  actions: [
    // { text: 'Sign in', href: 'https://app.dna.codes', variant: 'tertiary' as const },
    // { text: 'Get started', href: 'https://app.dna.codes', variant: 'primary' as const },
    { text: 'Join the waitlist', href: '#waitlist-form', variant: 'primary' as const },
  ],
};

export const footerData = {
  links: [
    // {
    //   title: 'Platform',
    //   links: [
    //     { text: 'Pricing', href: getPermalink('/pricing') },
    //     { text: 'Playground', href: 'https://app.dna.codes/playground' },
    //   ],
    // },
    // {
    //   title: 'Developers',
    //   links: [
    //     { text: 'Documentation', href: 'https://docs.dna.codes' },
    //     { text: 'API Reference', href: 'https://docs.dna.codes/api' },
    //   ],
    // },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [],
  footNote: 'Your business has a unique DNA. Time to run on it.',
};
