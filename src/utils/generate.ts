// SINGLE SWAP POINT for live generation, in the same spirit as ~/utils/dnaApi.
//
// Today `generate()` derives every artifact in the browser from the compiled genome the page
// already fetched. When the platform exposes a real generate endpoint, replace the body of
// `runDerivations()` with the network call; the exported signature — `generate`, `loadGenome`,
// `GenerateError`, and the `GenerateRequest` / `GenerateResult` types — is what the page depends
// on, so nothing else has to move.
//
// Two things are real here rather than decorative, because they are the parts most likely to be
// wrong when the call becomes a network call: per-output error isolation, and the loading state
// each artifact passes through. The pacing is theatre and is labelled as such; the content never
// is.
//
// There is no DEMO_MODE flag. There was one, exported and never imported — the disclosure that
// matters is the line under the artifacts naming the genome and saying it is not the visitor's
// data, and that is markup, not state.

import type { CompiledGenome } from '~/utils/genome-types';
import type { IndustryKey, OutputId } from '~/data/industries';
import { DERIVATIONS } from '~/utils/genome';

export class GenerateError extends Error {
  constructor(
    message: string,
    readonly output?: OutputId
  ) {
    super(message);
    this.name = 'GenerateError';
  }
}

export interface GenerateRequest {
  genome: CompiledGenome;
  lenses: OutputId[];
  /**
   * Fired as each lens resolves, carrying that lens's artifact, so the page can reveal one at a
   * time without waiting for the whole set — and without having to reach into a result it does
   * not have yet.
   */
  onProgress?: (event: { output: OutputId; index: number; total: number; artifact: GeneratedArtifact }) => void;
  /** Collapses the pacing to a single resolution. Set when the visitor asked for reduced motion. */
  instant?: boolean;
}

export interface GeneratedArtifact {
  output: OutputId;
  data?: unknown;
  error?: string;
}

export interface GenerateResult {
  genomeName: string;
  artifacts: Record<string, GeneratedArtifact>;
  count: number;
}

const genomeCache = new Map<IndustryKey, Promise<CompiledGenome>>();

/**
 * Fetch one industry's compiled genome. Cached per key for the session — a visitor who switches
 * between two industries pays for each once, and the initial page payload carries neither.
 */
export function loadGenome(key: IndustryKey): Promise<CompiledGenome> {
  const cached = genomeCache.get(key);
  if (cached) return cached;

  const p = fetch(`/genome/${key}.json`)
    .then((res) => {
      if (!res.ok) throw new GenerateError(`Could not load the ${key} genome (${res.status}).`);
      return res.json() as Promise<CompiledGenome>;
    })
    .catch((e) => {
      // Don't cache a failure — a visitor who lost their connection for a moment deserves the
      // retry to work.
      genomeCache.delete(key);
      throw e instanceof GenerateError ? e : new GenerateError('Could not load that genome.');
    });

  genomeCache.set(key, p);
  return p;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Total pacing is capped regardless of how many lenses were selected: twelve artifacts must not
 * take twice as long as six, because the visitor who ticked everything is the most interested
 * one on the page.
 */
const BUDGET_MS = 2600;
const MIN_STEP_MS = 120;
const MAX_STEP_MS = 420;

function stepDelay(total: number): number {
  return Math.max(MIN_STEP_MS, Math.min(MAX_STEP_MS, Math.floor(BUDGET_MS / Math.max(total, 1))));
}

function runDerivation(genome: CompiledGenome, output: OutputId): GeneratedArtifact {
  const derive = DERIVATIONS[output];
  if (!derive) return { output, error: 'No renderer is registered for this output.' };
  try {
    return { output, data: derive(genome) };
  } catch (e) {
    // One bad derivation must not take the other eleven with it.
    return { output, error: e instanceof Error ? e.message : 'This artifact could not be generated.' };
  }
}

export async function generate(req: GenerateRequest): Promise<GenerateResult> {
  const { genome, lenses, onProgress, instant } = req;
  if (!lenses.length) throw new GenerateError('Pick at least one thing to generate.');

  const artifacts: Record<string, GeneratedArtifact> = {};
  const delay = instant ? 0 : stepDelay(lenses.length);

  for (const [index, output] of lenses.entries()) {
    if (delay) await wait(delay);
    const artifact = runDerivation(genome, output);
    artifacts[output] = artifact;
    onProgress?.({ output, index, total: lenses.length, artifact });
  }

  return { genomeName: genome.orgName, artifacts, count: lenses.length };
}
