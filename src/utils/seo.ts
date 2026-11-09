import rows from '~/data/seo/keywords.json';

export type KeywordRole = 'primary' | 'secondary' | 'candidate' | 'to-measure' | 'skip';

export interface KeywordRow {
  id: string;
  keyword: string;
  volume: number | null;
  difficulty: number | null;
  intent: string | null;
  cluster: string;
  fit: number | null;
  role: KeywordRole;
  page: string | null;
  pageType: string | null;
  title: string | null;
  description: string | null;
  measuredAt: string | null;
  source: string | null;
  notes: string | null;
}

const keywords = rows as KeywordRow[];

/** Primary and secondary rows for a route, in registry order. */
export function keywordsFor(route: string): KeywordRow[] {
  return keywords.filter((row) => row.page === route && (row.role === 'primary' || row.role === 'secondary'));
}

/** Search title and description for the route's one primary keyword. */
export function seoFor(route: string): { title: string; description: string } {
  const primary = keywords.find((row) => row.page === route && row.role === 'primary');
  if (!primary?.title || !primary.description) {
    throw new Error(`seoFor(${route}): no primary keyword with a title and description`);
  }
  return { title: primary.title, description: primary.description };
}

/** Search title and description for a post's targetKeyword id. */
export function seoForKeyword(id: string): { title: string; description: string; page: string } {
  const primary = keywords.find((row) => row.id === id && row.role === 'primary');
  if (!primary?.title || !primary.description || !primary.page) {
    throw new Error(`seoForKeyword(${id}): not a primary keyword with a title, description, and page`);
  }
  return { title: primary.title, description: primary.description, page: primary.page };
}
