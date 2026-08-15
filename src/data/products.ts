// One mark per product, defined once. The nav dropdown, the homepage cards and the
// waitlist checkboxes all read from here, so a product is recognisable by the same glyph
// wherever it appears rather than by whichever icon each component happened to pick.
//
// Overlay borrows the Inspect glyph from the panel's own mode tabs (OverlayModes): the
// reticle is literally what the product does, so the logo and the UI agree. Operations
// gets a hierarchy of nodes — an operating model, drawn. Agent Operations gets a robot,
// which is the one glyph a stranger parses without a caption; the more honest mark is a
// node joined to other nodes, and if the robot ever reads as toy that is where to go.

export interface Product {
  key: 'operations' | 'overlay' | 'agent-operations';
  name: string;
  href: string;
  /** The product's mark. Render it through ProductMark rather than bare. */
  icon: string;
  /** One line, used under the label in the nav dropdown. */
  description: string;
  /** The suite verb. The tagline is "Model it. Govern it. Run it." */
  verb: string;
  /** How far along it is, in the buyer's terms. Rendered as the card badge. */
  status: string;
}

// Order matters, and it is the suite order — Model, Govern, Run — because /pricing
// publishes those three as a ladder and two orderings of one set is a defect. Operations
// still leads, which is the other rule: it is the surface a visitor can try today.
export const PRODUCTS: Product[] = [
  {
    key: 'operations',
    name: 'Operations',
    href: '/operations',
    icon: 'tabler:sitemap',
    description: 'Turn your knowledge into a living operating model',
    verb: 'Model it',
    status: 'Live demo',
  },
  {
    key: 'overlay',
    name: 'Overlay',
    href: '/overlay',
    icon: 'tabler:zoom-scan',
    description: 'Operational controls inside your running app',
    verb: 'Govern it',
    status: 'Early access',
  },
  {
    key: 'agent-operations',
    name: 'Agent Operations',
    href: '/agent-operations',
    icon: 'tabler:robot',
    description: 'Your agents, under the rules you already wrote',
    verb: 'Run it',
    status: 'In build',
  },
];

export const PRODUCT = Object.fromEntries(PRODUCTS.map((p) => [p.key, p])) as Record<Product['key'], Product>;
