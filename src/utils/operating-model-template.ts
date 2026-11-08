import { ecommerce } from '~/data/genome/ecommerce.genome';

export interface TemplateStep {
  name: string;
  role: string;
  description: string;
}

export interface OperatingModelTemplate {
  example: string;
  description: string;
  roles: { name: string; description: string }[];
  processes: { name: string; owner: string; description: string; steps: TemplateStep[] }[];
  rules: { name: string; description: string }[];
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
  return {
    example: genome.orgName,
    description: genome.description,
    roles: genome.roles.map((role) => ({
      name: label(role.name),
      description: role.description ?? '',
    })),
    processes: [
      {
        name: label(genome.process.name),
        owner: label(genome.process.operator),
        description: genome.process.description ?? '',
        steps: genome.process.steps.map((step) => ({
          name: step.title ?? label(step.id),
          role: label(step.actor),
          description: step.description ?? '',
        })),
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

export function templateRows(model: OperatingModelTemplate = operatingModelTemplate()): TemplateRow[] {
  const rows: TemplateRow[] = [];
  for (const role of model.roles) {
    rows.push({ section: 'Role', name: role.name, who: '', what: role.description });
  }
  for (const process of model.processes) {
    rows.push({ section: 'Process', name: process.name, who: process.owner, what: process.description });
    for (const step of process.steps) {
      rows.push({ section: 'Step', name: step.name, who: step.role, what: step.description });
    }
  }
  for (const rule of model.rules) {
    rows.push({ section: 'Rule', name: rule.name, who: '', what: rule.description });
  }
  for (const system of model.systems) {
    rows.push({ section: 'System', name: system.name, who: '', what: system.description });
  }
  return rows;
}
