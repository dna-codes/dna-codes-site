// The six industries offered on /whats-your-dna, and the twelve outputs any of them can
// generate.
//
// This module is the landing page's initial payload — keys, names, value propositions and
// spotlight sets, and nothing else. The genomes themselves are large and load on selection
// (see ~/utils/genome), so a visitor who never picks an industry never downloads one.
//
// A seventh industry is an entry here plus a genome file. If adding one requires touching a
// renderer, the renderer has industry knowledge in it that belongs in the genome instead.

export type IndustryKey = 'ecommerce' | 'healthcare' | 'ma' | 'security' | 'financial' | 'professional';

export type LayerKey = 'operations' | 'product' | 'technology';

export type OutputId =
  // Operations
  | 'process-flow'
  | 'sop'
  | 'key-positions'
  | 'raci'
  | 'policies'
  // Product
  | 'data-model'
  | 'screen-map'
  | 'example-ui'
  | 'api-surface'
  // Technology
  | 'architecture'
  | 'environments'
  | 'access-control';

export interface OutputType {
  id: OutputId;
  label: string;
  layer: LayerKey;
  /** One line, shown under the label in the picker. Says what comes out, not why it matters. */
  description: string;
  icon: string;
}

export interface Layer {
  key: LayerKey;
  label: string;
  /** The layer's job, in the buyer's terms rather than the schema's. */
  blurb: string;
  icon: string;
}

export const LAYERS: Layer[] = [
  {
    key: 'operations',
    label: 'Operations',
    blurb: 'How the work actually runs — who owns what, in what order, under which rules.',
    icon: 'tabler:sitemap',
  },
  {
    key: 'product',
    label: 'Product',
    blurb: 'What gets built on top of it — the data, the screens, the API.',
    icon: 'tabler:layout-grid',
  },
  {
    key: 'technology',
    label: 'Technology',
    blurb: 'Where it runs and who can reach it.',
    icon: 'tabler:server-cog',
  },
];

// Order within a layer is the order they appear in the picker, and it is deliberate: the
// output that reads fastest goes first, because the first card generated is the one that has
// to land.
export const OUTPUTS: OutputType[] = [
  {
    id: 'process-flow',
    label: 'Process flow',
    layer: 'operations',
    description: 'The end-to-end sequence, each step with its owner.',
    icon: 'tabler:route',
  },
  {
    id: 'sop',
    label: 'SOP / runbook',
    layer: 'operations',
    description: 'The same process as a numbered operating procedure.',
    icon: 'tabler:list-numbers',
  },
  {
    id: 'key-positions',
    label: 'Key positions',
    layer: 'operations',
    description: 'The roles this operation needs and who reports to whom.',
    icon: 'tabler:hierarchy-2',
  },
  {
    id: 'raci',
    label: 'RACI matrix',
    layer: 'operations',
    description: 'Every step against every role — responsible, accountable, consulted.',
    icon: 'tabler:table',
  },
  {
    id: 'policies',
    label: 'Policies & rules',
    layer: 'operations',
    description: 'The constraints that govern each operation, stated as rules.',
    icon: 'tabler:gavel',
  },
  {
    id: 'data-model',
    label: 'Data model',
    layer: 'product',
    description: 'The entities, their fields, and how they relate.',
    icon: 'tabler:schema',
  },
  {
    id: 'screen-map',
    label: 'Screen map',
    layer: 'product',
    description: 'Every route and the page it resolves to.',
    icon: 'tabler:map-2',
  },
  {
    id: 'example-ui',
    label: 'Example UI',
    layer: 'product',
    description: 'A working admin table and detail form, built from the fields.',
    icon: 'tabler:app-window',
  },
  {
    id: 'api-surface',
    label: 'API surface',
    layer: 'product',
    description: 'The endpoints, grouped by namespace, with their operations.',
    icon: 'tabler:api',
  },
  {
    id: 'architecture',
    label: 'Architecture diagram',
    layer: 'technology',
    description: 'The cells this runs on and what talks to what.',
    icon: 'tabler:topology-star-3',
  },
  {
    id: 'environments',
    label: 'Environment topology',
    layer: 'technology',
    description: 'Dev, staging, and production, with the providers behind each.',
    icon: 'tabler:stack-2',
  },
  {
    id: 'access-control',
    label: 'Access-control matrix',
    layer: 'technology',
    description: 'Which role may perform which operation, derived not declared.',
    icon: 'tabler:lock-access',
  },
];

export const OUTPUT_BY_ID = Object.fromEntries(OUTPUTS.map((o) => [o.id, o])) as Record<OutputId, OutputType>;

export const outputsForLayer = (layer: LayerKey): OutputType[] => OUTPUTS.filter((o) => o.layer === layer);

export interface Industry {
  key: IndustryKey;
  name: string;
  /**
   * What DNA models for this industry — not a benefit claim. This is the line that sits in the
   * sticky header for the rest of the visit, so it has to survive being read fifty times.
   */
  valueProp: string;
  /** Four or five outputs, pre-selected, chosen to make the value proposition self-evident. */
  spotlight: OutputId[];
  /** Short label for the helix chip, where horizontal room is scarce. */
  chip: string;
}

// M&A and E-commerce carry the value propositions given in the brief, verbatim. The other four
// are drafted to the same rule — name the things DNA holds, not the outcome it promises.
export const INDUSTRIES: Industry[] = [
  {
    key: 'ecommerce',
    name: 'E-commerce',
    chip: 'E-commerce',
    valueProp: 'Modeling across inventory, catalog, and fulfillment',
    spotlight: ['process-flow', 'data-model', 'example-ui', 'architecture'],
  },
  {
    key: 'healthcare',
    name: 'Health care',
    chip: 'Health care',
    valueProp: 'Care pathways, staffing, and the rules that bind them',
    spotlight: ['process-flow', 'key-positions', 'policies', 'access-control'],
  },
  {
    key: 'ma',
    name: 'M&A',
    chip: 'M&A',
    valueProp: 'Operational modeling and business valuation',
    spotlight: ['process-flow', 'key-positions', 'policies', 'data-model'],
  },
  {
    key: 'security',
    name: 'Security & compliance',
    chip: 'Security & compliance',
    valueProp: 'Controls mapped to the operations they actually govern',
    spotlight: ['policies', 'access-control', 'raci', 'sop', 'architecture'],
  },
  {
    key: 'financial',
    name: 'Financial services',
    chip: 'Financial services',
    valueProp: 'Products, approvals, and the authority behind each one',
    spotlight: ['process-flow', 'policies', 'access-control', 'data-model'],
  },
  {
    key: 'professional',
    name: 'Professional services',
    chip: 'Professional services',
    valueProp: 'Engagements, delivery teams, and the work they own',
    spotlight: ['process-flow', 'raci', 'key-positions', 'sop'],
  },
];

export const INDUSTRY_BY_KEY = Object.fromEntries(INDUSTRIES.map((i) => [i.key, i])) as Record<IndustryKey, Industry>;

export const isIndustryKey = (v: string | null | undefined): v is IndustryKey =>
  !!v && INDUSTRIES.some((i) => i.key === v);

export const isOutputId = (v: string): v is OutputId => OUTPUTS.some((o) => o.id === v);
