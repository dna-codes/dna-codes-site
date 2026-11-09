import { ecommerce } from '~/data/genome/ecommerce.genome';

export interface TemplateRule {
  name: string;
  description: string;
}

export interface TemplateStep {
  name: string;
  role: string;
  description: string;
  /** `Verify payment` from `Order.VerifyPayment`. */
  action: string;
  /** `Order` from `Order.VerifyPayment`. */
  resource: string;
  /** Rules whose operation is this step. */
  rules: TemplateRule[];
}

export interface TemplateRole {
  name: string;
  description: string;
  parent?: string;
}

export interface OperatingModelTemplate {
  example: string;
  description: string;
  roles: TemplateRole[];
  processes: { name: string; owner: string; description: string; steps: TemplateStep[] }[];
  rules: TemplateRule[];
  systems: { name: string; description: string }[];
}

/** `OrderManager` → `Order manager`. `receive-order` → `Receive order`. */
export function label(name: string): string {
  const spaced = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** BrightBox's operating model with sample rows (order numbers, prices) left out. */
export function operatingModelTemplate(): OperatingModelTemplate {
  const genome = ecommerce;
  const rulesByOperation = new Map<string, TemplateRule[]>();
  for (const rule of genome.rules) {
    const entry = { name: label(rule.name), description: rule.description ?? '' };
    const list = rulesByOperation.get(rule.operation) ?? [];
    list.push(entry);
    rulesByOperation.set(rule.operation, list);
  }
  return {
    example: genome.orgName,
    description: genome.description,
    roles: genome.roles.map((role) => ({
      name: label(role.name),
      description: role.description ?? '',
      parent: role.parent ? label(role.parent) : undefined,
    })),
    processes: [
      {
        name: label(genome.process.name),
        owner: label(genome.process.operator),
        description: genome.process.description ?? '',
        steps: genome.process.steps.map((step) => {
          const [resource, action] = step.operation.split('.');
          return {
            name: step.title ?? label(step.id),
            role: label(step.actor),
            description: step.description ?? '',
            action: action ? label(action) : '',
            resource: resource ? label(resource) : '',
            rules: rulesByOperation.get(step.operation) ?? [],
          };
        }),
      },
    ],
    rules: genome.rules.map((rule) => ({
      name: label(rule.name),
      description: rule.description ?? '',
    })),
    systems: genome.technical.cells.map((cell) => ({
      name: label(cell.name),
      description: cell.description ?? '',
    })),
  };
}

export interface TemplateRow {
  section: string;
  name: string;
  who: string;
  what: string;
}

export const templateColumns = ['Section', 'Name', 'Who', 'What'] as const;

/** Shown on the spreadsheet's first sheet and in the JSON. Not copied onto the blank rows. */
export const templateInstructions: string[] = [
  'Fill in the Model sheet.',
  'Section is already set: Role, Process, Step, Rule, or System.',
  'Name is what you call it.',
  'Who is the role accountable for that row. Fill it on a Process and a Step. Leave it blank on a Role, a Rule, and a System.',
  'What is one sentence.',
  'Put each Step under the Process it belongs to. The Who on a Step is a Role you named.',
  'Add a row when you need another one, and keep its Section name.',
];

/** One of each row, so the columns are obvious. This is not a company to adopt. */
export const templateExample: TemplateRow[] = [
  {
    section: 'Role',
    name: 'Operations lead',
    who: '',
    what: 'Owns the work from the first step to the last.',
  },
  {
    section: 'Process',
    name: 'Fulfill an order',
    who: 'Operations lead',
    what: 'Starts when a customer pays. Ends when delivery is confirmed.',
  },
  {
    section: 'Step',
    name: 'Check the payment',
    who: 'Operations lead',
    what: 'Do not continue until the payment has cleared.',
  },
  {
    section: 'Step',
    name: 'Hand the order on',
    who: 'Operations lead',
    what: 'The next role starts from this step.',
  },
  {
    section: 'Rule',
    name: 'Payment before the handoff',
    who: '',
    what: 'No work moves on until the payment has cleared.',
  },
  {
    section: 'System',
    name: 'Order system',
    who: '',
    what: 'Holds the order and the payment state.',
  },
];

/** Empty rows with the section named, in the order a person fills them. */
export function blankTemplateRows(): TemplateRow[] {
  const line = (section: string, count: number): TemplateRow[] =>
    Array.from({ length: count }, () => ({ section, name: '', who: '', what: '' }));
  return [
    ...line('Role', 4),
    ...line('Process', 1),
    ...line('Step', 3),
    ...line('Process', 1),
    ...line('Step', 3),
    ...line('Rule', 3),
    ...line('System', 3),
  ];
}
