// Provenance: whether a genome describes an invented company or a real one, and the bar a real
// one has to clear before it ships.
//
// Relative imports only, so `node --test` can load this file directly.

/** One published source behind a public-sources genome. */
export interface ProvenanceSource {
  title: string;
  /** Must be https. */
  url: string;
  /** Which parts of the genome this source supports. */
  supports: string;
}

/**
 * Where a genome comes from.
 *
 * - `fictional`: an invented company. Every name in it is made up.
 * - `public-sources`: a real company, modeled only as far as its published sources support. It
 *   cites at least three sources, and its page shows a not-affiliated notice.
 *
 * A public-sources genome names no real individual. Persons, memberships, descriptions and
 * attribute values describe a kind of person in a role, never a named person. The build cannot
 * check this rule, so a reviewer checks it before the genome merges.
 */
export type Provenance = { kind: 'fictional' } | { kind: 'public-sources'; sources: ProvenanceSource[] };

export const MIN_PUBLIC_SOURCES = 3;

/** Problems with a genome's provenance, as messages. Empty when it passes. */
export function checkProvenance(genome: { provenance?: Provenance }): string[] {
  const p = genome.provenance;
  if (!p) return ['declares no provenance; set `provenance: { kind: "fictional" }` or cite public sources'];
  if (p.kind === 'fictional') return [];
  if (p.kind !== 'public-sources') {
    return [`provenance kind "${(p as { kind?: string }).kind}" is not "fictional" or "public-sources"`];
  }

  const problems: string[] = [];
  const sources = p.sources ?? [];
  if (sources.length < MIN_PUBLIC_SOURCES) {
    problems.push(`a public-sources genome needs at least ${MIN_PUBLIC_SOURCES} sources, has ${sources.length}`);
  }
  sources.forEach((s, i) => {
    if (!s.title?.trim()) problems.push(`source ${i + 1} has no title`);
    if (!/^https:\/\/\S+$/.test(s.url ?? '')) problems.push(`source ${i + 1} needs an https URL`);
    if (!s.supports?.trim()) problems.push(`source ${i + 1} has no supports note`);
  });
  return problems;
}

/** The label shown next to the company name on every page and card. */
export function provenanceLabel(p: Provenance): string {
  return p.kind === 'fictional' ? 'Fictional company' : 'Modeled from public sources';
}

/** The notice a public-sources genome carries. Empty for a fictional genome. */
export function provenanceNotice(p: Provenance, orgName: string): string {
  return p.kind === 'public-sources'
    ? `DNA Codes is not affiliated with ${orgName}. This genome is modeled only from the public sources listed below.`
    : '';
}
