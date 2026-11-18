// The share card for one genome, rendered from its compiled documents at build time. A new genome
// gets its card from its data alone; nothing here is drawn by hand.

import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { genomeCardSvg } from '~/utils/genome-card';
import { genomeEntries, genomeEntry, genomeCardInput } from '~/utils/genome-pages';

export const getStaticPaths: GetStaticPaths = () => genomeEntries().map((e) => ({ params: { key: e.key } }));

export const GET: APIRoute = async ({ params }) => {
  const entry = genomeEntry(params.key ?? '');
  if (!entry) return new Response('Not found', { status: 404 });
  const png = await sharp(Buffer.from(genomeCardSvg(genomeCardInput(entry))))
    .png({ compressionLevel: 9 })
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
