// Build-time data for the genome pages and the template page: one entry per genome in the corpus.
//
// This module imports the whole corpus, so only build-time code may import it: the genome
// pages, the template page and the share-card endpoints. Browser code loads one genome at
// a time from /genome/<key>.json.

import { GENOME_SOURCES } from '~/data/genome';
import { INDUSTRY_BY_KEY } from '~/data/industries';
import { compileGenome } from '~/utils/genome-compile';
import { genomeMap } from '~/utils/genome-map';
import { provenanceLabel } from '~/utils/genome-provenance';
import type { AuthoredGenome, CompiledGenome } from '~/utils/genome-types';

export interface GenomeEntry {
  key: AuthoredGenome['key'];
  orgName: string;
  industry: string;
  description: string;
  source: AuthoredGenome;
  compiled: CompiledGenome;
  provenanceLabel: string;
  counts: { roles: number; processes: number; rules: number; systems: number };
}

let cache: GenomeEntry[] | undefined;

/** Every genome, in corpus order. */
export function genomeEntries(): GenomeEntry[] {
  cache ??= GENOME_SOURCES.map((source) => {
    const compiled = compileGenome(source);
    return {
      key: source.key,
      orgName: source.orgName,
      industry: INDUSTRY_BY_KEY[source.key]?.name ?? source.key,
      description: source.description,
      source,
      compiled,
      provenanceLabel: provenanceLabel(source.provenance),
      counts: {
        roles: compiled.operational.domain.roles?.length ?? 0,
        processes: compiled.operational.processes?.length ?? 0,
        rules: compiled.operational.rules?.length ?? 0,
        // The cells are the systems that carry the data, as /operating-model names them.
        systems: compiled.technical.cells.length,
      },
    };
  });
  return cache;
}

export function genomeEntry(key: string): GenomeEntry | undefined {
  return genomeEntries().find((e) => e.key === key);
}

export const genomeCardInput = (e: GenomeEntry) => ({
  key: e.key,
  orgName: e.orgName,
  industry: e.industry,
  provenanceLabel: e.provenanceLabel,
  map: genomeMap(e.compiled),
});
