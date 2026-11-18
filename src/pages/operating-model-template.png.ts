// The share card for /operating-model-template: every company in the corpus, at build time.

import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { templateCardSvg } from '~/utils/genome-card';
import { genomeEntries } from '~/utils/genome-pages';

export const GET: APIRoute = async () => {
  const svg = templateCardSvg(genomeEntries().map((e) => ({ orgName: e.orgName, industry: e.industry })));
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
