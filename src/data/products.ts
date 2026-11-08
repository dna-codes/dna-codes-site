// The suite, defined once. The nav dropdown, the homepage cards, the /operations hub and
// the waitlist checkboxes all read from here, so a product is recognisable by the same
// name and the same glyph wherever it appears.
//
// The shape of the suite, in three nouns — get these right and every page writes itself:
//
//   Operations  the umbrella. Everything below is sold under it.
//   the core    Operational DNA: the living operating model. Not a surface, not optional,
//               included in every product, and the one thing you can operate today.
//   a surface   where your software meets someone — a screen, an endpoint, an agent, a
//               terminal. One product per surface, named <Surface> Operations.
//   the Overlay the inline viewer each surface ships. React panel for UI, a Swagger
//               replacement for API, MCP tools for agents. It is a noun the whole suite
//               shares, not a product you buy — which is why it stopped being one here.
//
// Operations used to be both the umbrella and a peer product in this list, which meant the
// nav had two things called Operations and neither one was the family. The core is not a
// peer: it is what the other four are surfaces on.
//
// Marks: UI Operations borrows the Inspect glyph from the panel's own mode tabs
// (OverlayModes) — the reticle is literally what it does, so the logo and the UI agree. The
// core gets a hierarchy of nodes, an operating model drawn. Agent Operations gets a robot,
// the one glyph a stranger parses without a caption; the more honest mark is a node joined
// to other nodes, and if the robot ever reads as toy that is where to go. API Operations
// gets the plug — the mark for a thing other software connects to. CLI Operations gets a
// prompt, for the same literal reason.

export type SurfaceKey = 'ui-operations' | 'api-operations' | 'agent-operations' | 'cli-operations';
export type ProductKey = 'operations' | SurfaceKey;

export interface Product {
  key: ProductKey;
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
  /** No page yet, so it is named on the hub and nowhere that would link to a 404. */
  planned?: boolean;
}

// The core. Every product includes it; it is also the only one with a demo you can run
// today, which is why /operations is both its page and the hub for the suite.
export const CORE: Product = {
  key: 'operations',
  name: 'Operational DNA',
  href: '/operations',
  icon: 'tabler:sitemap',
  description: 'The living operating model every surface runs on',
  verb: 'Model it',
  status: 'Live demo',
};

// Order is the order a team meets them: the screen, then the endpoint behind it, then the
// agent calling that endpoint, then the terminal. It is also roughly the build order, so
// the status column reads as a ladder rather than a scatter.
export const SURFACES: Product[] = [
  {
    key: 'ui-operations',
    name: 'UI Operations',
    href: '/ui-operations',
    icon: 'tabler:zoom-scan',
    description: 'Operational controls inside your running app',
    verb: 'Govern it',
    status: 'Early access',
  },
  {
    key: 'api-operations',
    name: 'API Operations',
    href: '/api-operations',
    icon: 'tabler:plug-connected',
    description: 'Who may call your endpoints, and what it records',
    verb: 'Govern it',
    status: 'In design',
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
  {
    key: 'cli-operations',
    name: 'CLI Operations',
    href: '',
    icon: 'tabler:prompt',
    description: 'The commands your team runs, governed like everything else',
    verb: 'Govern it',
    status: 'Planned',
    planned: true,
  },
];

// Everything with a page: the core, then the shipping surfaces. This is what the nav, the
// footer, the homepage grid and the pricing pillars iterate — a planned surface is named on
// the hub, where "Planned" is the whole point, and nowhere that would link to a 404.
export const PRODUCTS: Product[] = [CORE, ...SURFACES.filter((s) => !s.planned)];

export const PRODUCT = Object.fromEntries([CORE, ...SURFACES].map((p) => [p.key, p])) as Record<ProductKey, Product>;
