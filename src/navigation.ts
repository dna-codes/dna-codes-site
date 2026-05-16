import { getPermalink, getBlogPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Docs', href: 'https://docs.dna.codes' },
    { text: 'Playground', href: 'https://app.dna.codes/playground' },
    { text: 'Blog', href: getBlogPermalink() },
  ],
  actions: [{ text: 'Login', href: 'https://app.dna.codes' }],
};

export const footerData = {
  links: [
    {
      title: 'Developers',
      links: [
        { text: 'Developer API', href: 'https://docs.dna.codes/api' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [],
  footNote: '',
};
