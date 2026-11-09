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
