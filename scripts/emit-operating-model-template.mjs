// Writes the blank operating-model template into public/ before `astro build` copies it.
// The spreadsheet is the thing a searcher downloads. The first sheet explains the columns
// and shows one example of each row. The Model sheet, the CSV, and the JSON are empty rows
// with the section already named. The filled company on the page stays out of these files.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import prettier from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/operating-model');
const bundle = join(root, 'node_modules/.cache/operating-model-template.mjs');

await esbuild.build({
  entryPoints: [join(root, 'src/utils/operating-model-template.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: bundle,
  alias: { '~': join(root, 'src') },
});

const { blankTemplateRows, templateColumns, templateExample, templateInstructions } = await import(
  pathToFileURL(bundle).href
);
const rows = blankTemplateRows();

const HEADERS = [...templateColumns];
const BANNED = ['BrightBox', 'Order manager', 'Warehouse lead', 'Merchandising manager'];

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function csv(table) {
  return [HEADERS, ...table.map((row) => [row.section, row.name, row.who, row.what])]
    .map((line) => line.map(csvCell).join(','))
    .join('\n')
    .concat('\n');
}

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function column(index) {
  let n = index + 1;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

function xmlText(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function cellsOf(line, rowIndex) {
  return line
    .map((value, columnIndex) => {
      if (value === '') return '';
      const ref = `${column(columnIndex)}${rowIndex + 1}`;
      return `<c r="${ref}" t="inlineStr"><is><t>${xmlText(value)}</t></is></c>`;
    })
    .join('');
}

function worksheet(lines, { freeze = false, mergeThrough = 0 } = {}) {
  const rowsXml = lines.map((line, rowIndex) => `<row r="${rowIndex + 1}">${cellsOf(line, rowIndex)}</row>`).join('');
  const view = freeze
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : '';
  const cols = `<cols><col min="1" max="1" width="16" customWidth="1"/><col min="2" max="2" width="28" customWidth="1"/><col min="3" max="3" width="22" customWidth="1"/><col min="4" max="4" width="78" customWidth="1"/></cols>`;
  const merges =
    mergeThrough > 0
      ? `<mergeCells count="${mergeThrough}">${Array.from({ length: mergeThrough }, (_, index) => `<mergeCell ref="A${index + 1}:D${index + 1}"/>`).join('')}</mergeCells>`
      : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${view}${cols}<sheetData>${rowsXml}</sheetData>${merges}</worksheet>`;
}

function zipStore(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = Buffer.from(file.data);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(Buffer.concat([local, name, data]));
    centrals.push(Buffer.concat([central, name]));
    offset += local.length + name.length + data.length;
  }
  const centralDir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDir, end]);
}

const readMe = [
  ...templateInstructions.map((line) => [line, '', '', '']),
  ['', '', '', ''],
  ['An example, so the columns are obvious. This is not your company.', '', '', ''],
  HEADERS,
  ...templateExample.map((row) => [row.section, row.name, row.who, row.what]),
];
const modelSheet = [HEADERS, ...rows.map((row) => [row.section, row.name, row.who, row.what])];
const xlsx = zipStore([
  {
    name: '[Content_Types].xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
  },
  {
    name: '_rels/.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  },
  {
    name: 'xl/workbook.xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Read me" sheetId="1" r:id="rId1"/><sheet name="Model" sheetId="2" r:id="rId2"/></sheets></workbook>`,
  },
  {
    name: 'xl/_rels/workbook.xml.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>`,
  },
  { name: 'xl/worksheets/sheet1.xml', data: worksheet(readMe, { mergeThrough: templateInstructions.length + 2 }) },
  { name: 'xl/worksheets/sheet2.xml', data: worksheet(modelSheet, { freeze: true }) },
]);

const dna = {
  name: 'A Runnable Target Operating Model',
  instructions: templateInstructions,
  columns: HEADERS,
  example: templateExample,
  rows,
};

const csvText = csv(rows);
const jsonPath = join(outDir, 'template.json');
const prettierConfig = (await prettier.resolveConfig(jsonPath)) ?? {};
const jsonText = await prettier.format(JSON.stringify(dna), { ...prettierConfig, filepath: jsonPath });
const packed = `${csvText}\n${jsonText}\n${readMe.flat().join('\n')}`;
for (const word of BANNED) {
  if (packed.includes(word)) throw new Error(`template still contains the example company: ${word}`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'template.csv'), csvText);
writeFileSync(jsonPath, jsonText);
writeFileSync(join(outDir, 'template.xlsx'), xlsx);
console.log(`operating-model template: ${rows.length} blank rows`);
