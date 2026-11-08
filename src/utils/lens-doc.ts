// Lens-doc helpers — extract documentation-friendly views from a DNA lens
// definition (the kind shipped in @dna-codes/dna-core under lenses/).
//
// A Lens is a named graph pattern: typed node slots (`nodes[]`), directed edges
// (`edges[]` — from/to/via a RelationshipType), and an optional human-readable
// `sentence` template with {{slot}} interpolation markers. These helpers pull
// out the parts a docs page wants to render. Mirrors schema-doc.ts, and reuses
// its `slugify()` for anchors.

import { slugify } from '~/utils/schema-doc';

export interface LensNode {
  /** Named slot identifier — present when referenced by an edge or the sentence. */
  slot?: string;
  /** ResourceType this slot holds. */
  type: string;
}

export interface LensEdge {
  /** Slot name of the source node. */
  from: string;
  /** Slot name of the target node. */
  to: string;
  /** RelationshipType name for this edge. */
  via: string;
}

/**
 * Loose structural view of a lens definition, for typing the arrays of imported
 * `*.json` lenses on the reference page. Each lens file has a slightly different
 * concrete shape (with/without edges and sentence), so this captures only the
 * fields the docs read.
 */
export interface LensDoc {
  $id?: string;
  name: string;
  nodes: LensNode[];
  edges?: LensEdge[];
  sentence?: string;
}

/** A piece of a parsed sentence template: literal text or a {{slot}} marker. */
export type SentencePart = { kind: 'text'; value: string } | { kind: 'slot'; value: string };

/**
 * Split a `sentence` template into ordered text + slot-token parts, so a
 * renderer can highlight each {{slot}} marker. Returns [] when no sentence.
 *
 *   "{{a}} holds {{b}}" -> [{slot:'a'}, {text:' holds '}, {slot:'b'}]
 */
export function parseSentence(sentence: string | undefined): SentencePart[] {
  if (!sentence) return [];
  const parts: SentencePart[] = [];
  const re = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sentence)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ kind: 'text', value: sentence.slice(lastIndex, m.index) });
    }
    parts.push({ kind: 'slot', value: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < sentence.length) {
    parts.push({ kind: 'text', value: sentence.slice(lastIndex) });
  }
  return parts;
}

/** Node slots in declaration (render) order. */
export function lensNodes(lens: LensDoc): LensNode[] {
  return lens.nodes ?? [];
}

/** Edges in declaration (render) order; [] for layer lenses. */
export function lensEdges(lens: LensDoc): LensEdge[] {
  return lens.edges ?? [];
}

/** True when the lens declares no edges — the layer-lens (grouped type list) case. */
export function isLayerLens(lens: LensDoc): boolean {
  return lensEdges(lens).length === 0;
}

/** Stable anchor id for a lens, derived from its name (e.g. "Access Control" -> "access-control"). */
export function lensAnchor(lens: LensDoc): string {
  return slugify(lens.name ?? '');
}
