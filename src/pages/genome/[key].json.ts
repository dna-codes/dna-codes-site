// Emits one compiled genome per industry as a static JSON file at /genome/<key>.json.
//
// This is what makes the landing page's payload honest. The page ships industry metadata only;
// when a visitor picks an industry, the browser fetches that industry's compiled DNA and nothing
// else. Six genomes in the initial bundle is precisely what the industry-genomes spec forbids.
//
// The compile runs here, at build time, against the same code the validator gates on — so what
// the browser downloads is the same document `npm run build` already proved valid.

import type { APIRoute, GetStaticPaths } from 'astro';
import { GENOME_SOURCES } from '~/data/genome';
import { compileGenome } from '~/utils/genome-compile';

export const getStaticPaths: GetStaticPaths = () => GENOME_SOURCES.map((g) => ({ params: { key: g.key } }));

export const GET: APIRoute = ({ params }) => {
  const source = GENOME_SOURCES.find((g) => g.key === params.key);
  if (!source) return new Response('Not found', { status: 404 });

  return new Response(JSON.stringify(compileGenome(source)), {
    headers: { 'Content-Type': 'application/json' },
  });
};
