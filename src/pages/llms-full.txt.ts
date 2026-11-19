// /llms-full.txt at the root: the full agent reference that dna-codes-platform publishes to
// public/agents/llms-full.txt. GitHub Pages has no rewrites, so the build writes a copy here.
// One source, so the two cannot drift. Without the agent set there is no root copy either.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIRoute } from 'astro';

const source = join(process.cwd(), 'public/agents/llms-full.txt');

export const GET: APIRoute = () =>
  existsSync(source)
    ? new Response(readFileSync(source, 'utf8'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    : new Response('Not found', { status: 404 });
