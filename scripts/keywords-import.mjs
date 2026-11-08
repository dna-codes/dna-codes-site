// Rewrites src/data/seo/keywords.json from a CSV exported from the DNA Keyword Targets sheet.
// The site never reads the sheet. The pull-request diff of the JSON is the review.
//
// Usage: node scripts/keywords-import.mjs <file.csv>

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const COLUMNS = [
  'id',
  'keyword',
  'volume',
  'difficulty',
  'intent',
  'cluster',
  'fit',
  'role',
  'page',
  'page_type',
  'title',
  'description',
  'measured_at',
  'source',
  'notes',
];

const NUMERIC = new Set(['volume', 'difficulty', 'fit']);

const CAMEL = {
  page_type: 'pageType',
  measured_at: 'measuredAt',
};

/**
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
  const source = text.replace(/^\uFEFF/, '');
  /** @type {string[][]} */
  const rows = [];
  /** @type {string[]} */
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      if (!(row.length === 1 && row[0] === '')) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/**
 * @param {string} csv
 * @returns {Record<string, string | number | null>[]}
 */
export function rowsFromCsv(csv) {
  const table = parseCsv(csv);
  const header = table[0];
  if (!header || header.join(',') !== COLUMNS.join(',')) {
    throw new Error(
      `keywords-import: header must be exactly:\n${COLUMNS.join(',')}\nGot:\n${header?.join(',') ?? '(empty file)'}`
    );
  }

  return table.slice(1).map((cells, index) => {
    if (cells.length !== COLUMNS.length) {
      throw new Error(`keywords-import: row ${index + 2} has ${cells.length} columns, expected ${COLUMNS.length}`);
    }
    /** @type {Record<string, string | number | null>} */
    const row = {};
    COLUMNS.forEach((column, i) => {
      const key = CAMEL[column] ?? column;
      const raw = cells[i].trim();
      if (raw === '') {
        row[key] = null;
        return;
      }
      if (NUMERIC.has(column)) {
        const value = Number(raw);
        if (!Number.isFinite(value)) {
          throw new Error(`keywords-import: row ${index + 2} column ${column} is not a number (${raw})`);
        }
        row[key] = value;
        return;
      }
      row[key] = raw;
    });
    if (!row.id || !row.keyword || !row.cluster || !row.role) {
      throw new Error(`keywords-import: row ${index + 2} is missing id, keyword, cluster, or role`);
    }
    return row;
  });
}

/**
 * @param {Record<string, string | number | null>[]} rows
 */
export function sortRows(rows) {
  return [...rows].sort((a, b) => {
    const cluster = String(a.cluster).localeCompare(String(b.cluster));
    if (cluster !== 0) return cluster;
    const left = typeof a.volume === 'number' ? a.volume : Number.NEGATIVE_INFINITY;
    const right = typeof b.volume === 'number' ? b.volume : Number.NEGATIVE_INFINITY;
    return right - left;
  });
}

/**
 * @param {string} csvPath
 * @param {string} [outPath]
 */
export function importKeywords(csvPath, outPath = resolve(root, 'src/data/seo/keywords.json')) {
  const rows = sortRows(rowsFromCsv(readFileSync(csvPath, 'utf8')));
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`);
  return rows.length;
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/keywords-import.mjs <file.csv>');
    process.exit(1);
  }
  try {
    const count = importKeywords(resolve(file));
    console.log(`keywords-import: wrote ${count} rows to src/data/seo/keywords.json`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
