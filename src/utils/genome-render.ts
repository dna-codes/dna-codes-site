// The twelve renderers: view-model → HTML.
//
// **The constraint, restated because it is the one that matters:** nothing in this file may
// branch on which industry it is rendering, and nothing in it may contain industry-specific
// copy. Every proper noun that reaches the screen came out of a genome. If a renderer ever
// needs to know it is drawing health care, the genome was missing something and *that* is what
// should change.
//
// These return HTML strings rather than being Astro components because generation happens in the
// browser, after the visitor picks an industry — there is no server round trip to render into.
// The page is static; the artifacts are not.

import type { OutputId } from '~/data/industries';
import type {
  AccessControlVm,
  ApiSurfaceVm,
  ArchitectureVm,
  DataModelVm,
  EnvironmentsVm,
  ExampleUiVm,
  KeyPositionsVm,
  PoliciesVm,
  PositionNode,
  ProcessFlowVm,
  RaciVm,
  ScreenMapVm,
  SopVm,
} from '~/utils/genome';

// --- Escaping ---------------------------------------------------------------
//
// Genome text is authored in this repo, not user input, so this is belt-and-braces rather than
// a security boundary. It stays because an apostrophe in a description should not be able to
// break a card.

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v: unknown): string => String(v ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

const when = (cond: unknown, html: string): string => (cond ? html : '');

// --- Operations -------------------------------------------------------------

function renderProcessFlow(vm: ProcessFlowVm): string {
  return `
    <div class="gx-flow">
      ${when(vm.description, `<p class="gx-lede">${esc(vm.description)}</p>`)}
      <ol class="gx-flow-steps">
        ${vm.steps
          .map(
            (s, i) => `
          <li class="gx-flow-step">
            <div class="gx-flow-index">${i + 1}</div>
            <div class="gx-flow-body">
              <div class="gx-flow-title">${esc(s.title)}</div>
              ${when(s.description, `<div class="gx-flow-desc">${esc(s.description)}</div>`)}
              <div class="gx-flow-meta"><span class="gx-owner">${esc(s.actor)}</span><code>${esc(s.operation)}</code></div>
            </div>
          </li>`
          )
          .join('')}
      </ol>
      <p class="gx-foot">Owned end to end by <strong>${esc(vm.operator)}</strong>.</p>
    </div>`;
}

function renderSop(vm: SopVm): string {
  return `
    <div class="gx-sop">
      <div class="gx-sop-head">
        <div><span class="gx-k">Purpose</span><span>${esc(vm.purpose ?? '—')}</span></div>
        <div><span class="gx-k">Owner</span><span>${esc(vm.owner)}</span></div>
        ${when(vm.trigger, `<div><span class="gx-k">Trigger</span><span>${esc(vm.trigger)}</span></div>`)}
      </div>
      <ol class="gx-sop-steps">
        ${vm.steps
          .map(
            (s) => `
          <li>
            <div class="gx-sop-title"><span class="gx-sop-n">${s.n}.</span> ${esc(s.title)}</div>
            <div class="gx-sop-instruction">${esc(s.instruction)}</div>
            <div class="gx-sop-actor">Performed by <strong>${esc(s.actor)}</strong></div>
          </li>`
          )
          .join('')}
      </ol>
    </div>`;
}

function renderPositionNode(n: PositionNode): string {
  return `
    <li class="gx-pos-node">
      <div class="gx-pos-box">
        <div class="gx-pos-name">${esc(n.name)}</div>
        ${when(n.description, `<div class="gx-pos-desc">${esc(n.description)}</div>`)}
        ${when(
          n.owns.length,
          `<div class="gx-pos-owns">${n.owns.map((o) => `<span class="gx-chip">${esc(o)}</span>`).join('')}</div>`
        )}
      </div>
      ${when(n.reports.length, `<ul class="gx-pos-children">${n.reports.map(renderPositionNode).join('')}</ul>`)}
    </li>`;
}

function renderKeyPositions(vm: KeyPositionsVm): string {
  return `
    <div class="gx-pos">
      <p class="gx-lede">${esc(vm.groupName)}</p>
      <ul class="gx-pos-tree">${vm.roots.map(renderPositionNode).join('')}</ul>
      <p class="gx-foot">Each chip is a step of the process that role owns.</p>
    </div>`;
}

function renderRaci(vm: RaciVm): string {
  const legend = { R: 'Responsible', A: 'Accountable', C: 'Consulted' };
  return `
    <div class="gx-scroll">
      <table class="gx-table gx-raci">
        <thead>
          <tr><th class="gx-sticky-col">Step</th>${vm.roles.map((r) => `<th>${esc(r)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${vm.rows
            .map(
              (row) => `
            <tr>
              <td class="gx-sticky-col">${esc(row.step)}</td>
              ${row.cells
                .map((c) =>
                  c
                    ? `<td><span class="gx-raci-mark gx-raci-${c}" title="${esc(legend[c])}">${c}</span></td>`
                    : '<td></td>'
                )
                .join('')}
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <p class="gx-foot">R responsible · A accountable · C consulted — derived from step owners, the process operator, and access rules.</p>`;
}

function renderPolicies(vm: PoliciesVm): string {
  return `
    <ul class="gx-rules">
      ${vm.rules
        .map(
          (r) => `
        <li class="gx-rule">
          <div class="gx-rule-head">
            <span class="gx-rule-name">${esc(r.name)}</span>
            <span class="gx-badge gx-badge-${esc(r.kind)}">${esc(r.kind)}</span>
          </div>
          ${when(r.description, `<p class="gx-rule-desc">${esc(r.description)}</p>`)}
          <div class="gx-rule-meta">
            <code>${esc(r.operation)}</code>
            ${when(
              r.allow.length,
              `<span class="gx-rule-allow">${r.allow.map((a) => `<span class="gx-chip">${esc(a)}</span>`).join('')}</span>`
            )}
          </div>
        </li>`
        )
        .join('')}
    </ul>`;
}

// --- Product ----------------------------------------------------------------

function renderDataModel(vm: DataModelVm): string {
  return `
    <div class="gx-entities">
      ${vm.entities
        .map(
          (e) => `
        <div class="gx-entity">
          <div class="gx-entity-head">
            <span class="gx-entity-name">${esc(e.name)}</span>
            ${when(e.actions.length, `<span class="gx-entity-actions">${e.actions.map((a) => `<code>${esc(a)}</code>`).join('')}</span>`)}
          </div>
          ${when(e.description, `<p class="gx-entity-desc">${esc(e.description)}</p>`)}
          <ul class="gx-fields">
            ${e.fields
              .map(
                (f) => `
              <li>
                <span class="gx-field-name">${esc(f.name)}</span>
                <span class="gx-field-type">${esc(f.type)}</span>
                ${when(f.required, '<span class="gx-req">required</span>')}
                ${when(f.values?.length, `<span class="gx-field-values">${(f.values ?? []).map((v) => esc(v)).join(' · ')}</span>`)}
              </li>`
              )
              .join('')}
          </ul>
        </div>`
        )
        .join('')}
    </div>`;
}

function renderScreenMap(vm: ScreenMapVm): string {
  return `
    <div class="gx-screens">
      <p class="gx-lede">Shell: <code>${esc(vm.layout)}</code></p>
      ${vm.screens
        .map(
          (s) => `
        <div class="gx-screen">
          <code class="gx-route">${esc(s.route)}</code>
          <div class="gx-screen-body">
            <div class="gx-screen-title">${esc(s.page)} ${when(s.protectedRoute, '<span class="gx-lock" title="Requires sign-in">&#128274;</span>')}</div>
            ${when(s.description, `<div class="gx-screen-desc">${esc(s.description)}</div>`)}
            <div class="gx-screen-meta">
              <span class="gx-chip">${esc(s.resource)}</span>
              ${s.blocks.map((b) => `<span class="gx-block">${esc(b)}</span>`).join('')}
            </div>
          </div>
        </div>`
        )
        .join('')}
    </div>`;
}

/** Renders the control a field's declared type implies — nothing more, nothing invented. */
function controlFor(f: ExampleUiVm['form'][number]): string {
  const disabled = f.readonly ? ' disabled' : '';
  if (f.type === 'enum') {
    return `<select class="gx-input"${disabled}>${(f.values ?? []).map((v) => `<option>${esc(v)}</option>`).join('')}</select>`;
  }
  if (f.type === 'boolean') return `<input type="checkbox" class="gx-check"${disabled} />`;
  if (f.type === 'text') return `<textarea class="gx-input" rows="2"${disabled}></textarea>`;
  const type = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text';
  return `<input type="${type}" class="gx-input"${disabled} />`;
}

function renderExampleUi(vm: ExampleUiVm): string {
  if (!vm.columns.length) return '<p class="gx-empty">This genome declares no fields for that screen.</p>';
  return `
    <div class="gx-ui">
      <div class="gx-ui-chrome">
        <span class="gx-dot"></span><span class="gx-dot"></span><span class="gx-dot"></span>
        <span class="gx-ui-title">${esc(vm.title)}</span>
        ${vm.actions.map((a) => `<span class="gx-ui-action">${esc(a)}</span>`).join('')}
      </div>
      <div class="gx-scroll">
        <table class="gx-table">
          <thead><tr>${vm.columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr></thead>
          <tbody>
            ${
              vm.rows.length
                ? vm.rows
                    .map((row) => `<tr>${vm.columns.map((c) => `<td>${esc(row[c.name] ?? '')}</td>`).join('')}</tr>`)
                    .join('')
                : `<tr><td colspan="${vm.columns.length}" class="gx-empty">No sample rows in this genome.</td></tr>`
            }
          </tbody>
        </table>
      </div>
      <div class="gx-ui-form">
        <div class="gx-ui-form-title">${esc(vm.resource)} detail</div>
        <div class="gx-form-grid">
          ${vm.form
            .map(
              (f) => `
            <label class="gx-field">
              <span class="gx-label">${esc(f.label)}${when(f.required, '<span class="gx-star">*</span>')}</span>
              ${controlFor(f)}
            </label>`
            )
            .join('')}
        </div>
      </div>
    </div>`;
}

function renderApiSurface(vm: ApiSurfaceVm): string {
  return `
    <div class="gx-api">
      <div class="gx-api-head">
        <span class="gx-api-ns">${esc(vm.namespace)}</span><code>${esc(vm.basePath)}</code>
      </div>
      ${when(vm.description, `<p class="gx-lede">${esc(vm.description)}</p>`)}
      <ul class="gx-endpoints">
        ${vm.endpoints
          .map(
            (e) => `
          <li>
            <span class="gx-method gx-method-${esc(e.method.toLowerCase())}">${esc(e.method)}</span>
            <code class="gx-path">${esc(e.path)}</code>
            <span class="gx-op">${esc(e.operation)}</span>
            ${when(e.description, `<span class="gx-endpoint-desc">${esc(e.description)}</span>`)}
          </li>`
          )
          .join('')}
      </ul>
    </div>`;
}

// --- Technology -------------------------------------------------------------

function renderArchitecture(vm: ArchitectureVm): string {
  const byName = new Map(vm.cells.map((c) => [c.name, c]));
  return `
    <div class="gx-arch">
      <div class="gx-arch-cells">
        ${vm.cells
          .map(
            (c) => `
          <div class="gx-cell gx-cell-${esc(c.kind)}">
            <div class="gx-cell-name">${esc(c.name)}</div>
            <div class="gx-cell-adapter">${esc(c.adapter)}</div>
            ${when(c.description, `<div class="gx-cell-desc">${esc(c.description)}</div>`)}
            <code class="gx-cell-dna">${esc(c.dna)}</code>
          </div>`
          )
          .join('')}
      </div>
      <ul class="gx-edges">
        ${vm.edges
          .map(
            (e) => `
          <li>
            <span class="gx-chip">${esc(e.source)}</span>
            <span class="gx-edge-arrow gx-edge-${esc(e.type)}">&rarr;</span>
            <span class="gx-chip">${esc(e.target)}</span>
            <span class="gx-edge-type">${esc(e.label ?? e.type)}</span>
          </li>`
          )
          .join('')}
      </ul>
      ${when(!byName.size, '<p class="gx-empty">No cells declared.</p>')}
    </div>`;
}

function renderEnvironments(vm: EnvironmentsVm): string {
  return `
    <div class="gx-envs">
      ${vm.environments
        .map(
          (e) => `
        <div class="gx-env">
          <div class="gx-env-name">${esc(e.name)}</div>
          ${when(e.description, `<div class="gx-env-desc">${esc(e.description)}</div>`)}
          <div class="gx-env-section"><span class="gx-k">Providers</span>
            <div>${e.providers.map((p) => `<span class="gx-chip">${esc(p.name)}<span class="gx-chip-sub">${esc(p.type)}</span></span>`).join('') || '<span class="gx-empty">none</span>'}</div>
          </div>
          <div class="gx-env-section"><span class="gx-k">Cells</span>
            <div>${e.cells.map((c) => `<span class="gx-block">${esc(c)}</span>`).join('') || '<span class="gx-empty">none</span>'}</div>
          </div>
        </div>`
        )
        .join('')}
    </div>`;
}

function renderAccessControl(vm: AccessControlVm): string {
  return `
    <div class="gx-scroll">
      <table class="gx-table gx-acl">
        <thead><tr><th class="gx-sticky-col">Operation</th>${vm.roles.map((r) => `<th>${esc(r)}</th>`).join('')}</tr></thead>
        <tbody>
          ${vm.operations
            .map(
              (o) => `
            <tr>
              <td class="gx-sticky-col"><code>${esc(o.name)}</code><span class="gx-acl-rule">${esc(o.governedBy ?? '')}</span></td>
              ${o.rows.map((allowed) => `<td>${allowed ? '<span class="gx-acl-yes">&#10003;</span>' : ''}</td>`).join('')}
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    ${when(
      vm.ungoverned.length,
      `<div class="gx-ungoverned">
        <span class="gx-k">No access rule governs</span>
        <div>${vm.ungoverned.map((o) => `<code>${esc(o)}</code>`).join('')}</div>
        <p class="gx-foot">Derived, not declared — this is the list an audit asks about.</p>
      </div>`
    )}`;
}

// --- Registry ---------------------------------------------------------------

type Renderer = (vm: never) => string;

export const RENDERERS: Record<OutputId, Renderer> = {
  'process-flow': renderProcessFlow as Renderer,
  sop: renderSop as Renderer,
  'key-positions': renderKeyPositions as Renderer,
  raci: renderRaci as Renderer,
  policies: renderPolicies as Renderer,
  'data-model': renderDataModel as Renderer,
  'screen-map': renderScreenMap as Renderer,
  'example-ui': renderExampleUi as Renderer,
  'api-surface': renderApiSurface as Renderer,
  architecture: renderArchitecture as Renderer,
  environments: renderEnvironments as Renderer,
  'access-control': renderAccessControl as Renderer,
};

export function renderArtifact(output: OutputId, data: unknown): string {
  const render = RENDERERS[output];
  if (!render) return '<p class="gx-empty">No renderer for this output.</p>';
  return render(data as never);
}
