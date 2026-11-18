// Role selection on a rendered genome map (see renderGenomeMap in ./genome-render).
//
// Roles are <button>s, so pointer, Tab, Enter and Space need no code here. Selecting a role sets
// data-active on the role and on every step, rule and resource in its reach, read from the
// root's data-reach JSON. Selecting the same role again, or pressing Escape, clears it. CSS draws
// the highlight and drops the transitions under prefers-reduced-motion.

interface Reach {
  steps: string[];
  rules: string[];
  resources: string[];
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function mountGenomeMap(root: HTMLElement): void {
  if (root.dataset.mounted) return;
  root.dataset.mounted = '';

  let reach: Record<string, Reach> = {};
  try {
    reach = JSON.parse(root.dataset.reach ?? '{}');
  } catch {
    return;
  }
  const status = root.querySelector<HTMLElement>('[data-genome-map-status]');
  let selected: string | null = null;

  const clear = () => {
    for (const el of root.querySelectorAll('[data-active]')) el.removeAttribute('data-active');
    for (const b of root.querySelectorAll('button[data-role]')) b.setAttribute('aria-pressed', 'false');
    root.removeAttribute('data-selected');
    selected = null;
    if (status) status.textContent = '';
  };

  const select = (role: string) => {
    clear();
    const r = reach[role];
    if (!r) return;
    selected = role;
    root.setAttribute('data-selected', '');
    const mark = (attr: string, values: string[]) => {
      for (const v of values) {
        for (const el of root.querySelectorAll(`[${attr}="${CSS.escape(v)}"]`)) el.setAttribute('data-active', '');
      }
    };
    mark('data-role', [role]);
    mark('data-step', r.steps);
    mark('data-rule', r.rules);
    mark('data-resource', r.resources);
    for (const b of root.querySelectorAll(`button[data-role="${CSS.escape(role)}"]`)) {
      b.setAttribute('aria-pressed', 'true');
    }
    if (status) {
      const label = root.querySelector(`button[data-role="${CSS.escape(role)}"]`)?.textContent ?? role;
      status.textContent = `${label}: ${plural(r.steps.length, 'step', 'steps')}, ${plural(
        r.rules.length,
        'rule allows it',
        'rules allow it'
      )}, ${plural(r.resources.length, 'resource', 'resources')}. Press Escape to clear.`;
    }
  };

  root.addEventListener('click', (e) => {
    const button = (e.target as Element).closest<HTMLButtonElement>('button[data-role]');
    if (!button || !root.contains(button)) return;
    const role = button.dataset.role ?? '';
    if (selected === role) clear();
    else select(role);
  });

  const onKey = (e: KeyboardEvent) => {
    // The hero replaces its map when the visitor switches company. A detached map lets go.
    if (!root.isConnected) {
      document.removeEventListener('keydown', onKey);
      return;
    }
    if (e.key === 'Escape' && selected) clear();
  };
  document.addEventListener('keydown', onKey);
}

export function mountGenomeMaps(scope: ParentNode = document): void {
  for (const el of scope.querySelectorAll<HTMLElement>('[data-genome-map]')) mountGenomeMap(el);
}
