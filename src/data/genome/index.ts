// The genome corpus, eagerly.
//
// Two things import this module and both run at build time: the JSON endpoint that emits one
// compiled document set per industry, and the validator. **The landing page must not import it**
// — six full genomes in the initial payload is exactly what the industry-genomes spec forbids.
// The page fetches /genome/<key>.json when a visitor picks an industry.

import type { AuthoredGenome } from '~/utils/genome-types';
import { ecommerce } from './ecommerce.genome';
import { healthcare } from './healthcare.genome';
import { ma } from './ma.genome';
import { security } from './security.genome';
import { financial } from './financial.genome';
import { professional } from './professional.genome';

// Order matches ~/data/industries, which is the order the helix presents them. Two orderings of
// one set is a defect.
export const GENOME_SOURCES: AuthoredGenome[] = [ecommerce, healthcare, ma, security, financial, professional];

export const GENOME_BY_KEY = Object.fromEntries(GENOME_SOURCES.map((g) => [g.key, g]));
