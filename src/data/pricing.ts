import { WAITLIST_HREF, WAITLIST_TEXT } from '~/navigation';

// Single source of truth for the suite ladder.
//
// Two surfaces read this: the three-card strip on /overlay (answering "is this $200 or
// $20,000") and the full comparison matrix on /pricing. They must never disagree, so
// neither hard-codes a number.

export type TierKey = 'free' | 'starter' | 'team' | 'business' | 'enterprise';

export interface Tier {
  key: TierKey;
  name: string;
  /** Numeric monthly price, or null when quoted. */
  price: number | null;
  priceLabel: string;
  period: string;
  /** Who this is, in the buyer's own terms. */
  audience: string;
  /** The three or four lines that go on a card. */
  highlights: string[];
  featured?: boolean;
}

export const TIERS: Tier[] = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    audience: 'Proving it to yourself.',
    highlights: [
      '1 application, development and staging only',
      '1 editor, unlimited inspectors',
      '7 days of history',
      'No production key',
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    price: 99,
    priceLabel: '$99',
    period: 'per month',
    audience: 'One team, one product, in production.',
    highlights: [
      '1 application',
      '2 editors, 1 ratifier',
      'Production keys',
      'Access rules, release policies, conflict detection',
      '30 days of history',
    ],
  },
  {
    key: 'team',
    name: 'Team',
    price: 499,
    priceLabel: '$499',
    period: 'per month',
    audience: 'A platform team that wants the coverage number for their own product.',
    highlights: [
      '3 applications',
      '5 editors, 3 ratifiers',
      'SSO / SAML',
      'Prototype mode and your own component library',
      '90 days of history',
    ],
    featured: true,
  },
  {
    key: 'business',
    name: 'Business',
    price: 1499,
    priceLabel: '$1,499',
    period: 'per month',
    audience: 'Engineering carrying a compliance obligation.',
    highlights: [
      '10 applications',
      '20 editors, 10 ratifiers',
      'Audit export to your SIEM',
      '1 year of history, SCIM provisioning',
      'Publish to the marketplace',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: null,
    priceLabel: 'Custom',
    period: 'quoted',
    audience: 'Federation and data residency.',
    highlights: [
      'Unlimited applications and seats',
      'Self-host or VPC',
      'Rollup across organizations',
      'Ontology alignment, SLA, named contact',
    ],
  },
];

export const CARD_TIERS = TIERS.filter((t) => t.key !== 'free' && t.key !== 'enterprise');

export interface FeatureRow {
  label: string;
  /** Per tier: true (included), false (absent), or a string value. */
  values: Record<TierKey, boolean | string>;
  note?: string;
}

export interface FeatureGroup {
  label: string;
  rows: FeatureRow[];
}

const row = (
  label: string,
  free: boolean | string,
  starter: boolean | string,
  team: boolean | string,
  business: boolean | string,
  enterprise: boolean | string,
  note?: string
): FeatureRow => ({
  label,
  values: { free, starter, team, business, enterprise },
  ...(note ? { note } : {}),
});

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    label: 'Scale',
    rows: [
      row('Applications', '1, non-production', '1', '3', '10', 'Unlimited'),
      row('Editors — may write', '1', '2', '5', '20', 'Unlimited'),
      row('Ratifiers — may put a rule in force', false, '1', '3', '10', 'Unlimited'),
      row(
        'Inspectors — may read the panel',
        'Unlimited',
        'Unlimited',
        'Unlimited',
        'Unlimited',
        'Unlimited',
        'Never metered, on any plan. Asking “may I do this, and why” is the habit the product exists to create.'
      ),
      row('Production keys', false, true, true, true, true),
    ],
  },
  {
    label: 'Governance',
    rows: [
      row('Access rules and release policies', true, true, true, true, true),
      row('Conflict detection', true, true, true, true, true),
      row('Coverage reporting', true, true, true, true, true),
      row('Build manifest publishing', true, true, true, true, true),
      row('View as — ask as any seat, or as nobody', true, true, true, true, true),
    ],
  },
  {
    label: 'Audit',
    rows: [
      row('Occurrence history', '7 days', '30 days', '90 days', '1 year', 'Configurable'),
      row('Usage and activity on every control', true, true, true, true, true),
      row('Export to your SIEM or a webhook', false, false, false, true, true),
    ],
  },
  {
    label: 'Authoring',
    rows: [
      row('Prototype mode', false, false, true, true, true),
      row('Your own component library', false, false, true, true, true),
      row('MCP tool surface', true, true, true, true, true),
      row('Marketplace packs', 'Read', 'Read', 'Read', 'Read and publish', 'Read and publish'),
    ],
  },
  {
    label: 'Administration',
    rows: [
      row('SSO / SAML', false, false, true, true, true),
      row('SCIM provisioning', false, false, false, true, true),
      row('Rollup across organizations', false, false, false, false, true),
      row('Self-host or VPC', false, false, false, false, true),
      row('Support', 'Community', 'Email', '1 business day', 'Shared Slack', 'Named contact, SLA'),
    ],
  },
];

export const ADD_ONS = [
  { label: 'Extra application', price: '+$149', period: 'per month' },
  { label: 'Extra editor seat', price: '+$59', period: 'per month' },
  { label: 'Extra year of history', price: '+$99', period: 'per month' },
];

/** Where every pricing CTA goes while the product is pre-GA. */
export const PRICING_CTA = { text: WAITLIST_TEXT, href: WAITLIST_HREF };
