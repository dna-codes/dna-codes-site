// One mark per product, defined once. The nav dropdown, the homepage cards and the
// waitlist checkboxes all read from here, so a product is recognisable by the same glyph
// wherever it appears rather than by whichever icon each component happened to pick.
//
// Overlay borrows the Inspect glyph from the panel's own mode tabs (OverlayModes): the
// reticle is literally what the product does, so the logo and the UI agree. Operations
// gets a hierarchy of nodes — an operating model, drawn.

export interface Product {
  key: 'operations' | 'overlay';
  name: string;
  href: string;
  /** The product's mark. Render it through ProductMark rather than bare. */
  icon: string;
  /** One line, used under the label in the nav dropdown. */
  description: string;
}

// Order matters: Operations first everywhere. It is the surface a visitor can try today,
// and the model it builds is what the Overlay reaches into.
export const PRODUCTS: Product[] = [
  {
    key: 'operations',
    name: 'Operations',
    href: '/operations',
    icon: 'tabler:sitemap',
    description: 'Turn your knowledge into a living operating model',
  },
  {
    key: 'overlay',
    name: 'Overlay',
    href: '/overlay',
    icon: 'tabler:zoom-scan',
    description: 'Operational controls inside your running app',
  },
];

export const PRODUCT = Object.fromEntries(PRODUCTS.map((p) => [p.key, p])) as Record<Product['key'], Product>;
