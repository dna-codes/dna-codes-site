// Writes the blank operating-model template into public/ before `astro build` copies it.
// The spreadsheet is the thing a searcher downloads. The JSON is the same rows, in the
// shape the page calls DNA. Sample order numbers and prices never land in either file.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

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

const { operatingModelTemplate, templateRows } = await import(pathToFileURL(bundle).href);
const model = operatingModelTemplate();
const rows = templateRows(model);

const HEADERS = ['Section', 'Name', 'Who', 'What'];

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

function worksheet(table) {
  const lines = [HEADERS, ...table.map((row) => [row.section, row.name, row.who, row.what])];
  const rowsXml = lines
    .map((line, rowIndex) => {
      const cells = line
        .map((value, columnIndex) => {
          const ref = `${column(columnIndex)}${rowIndex + 1}`;
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlText(value)}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml}</sheetData></worksheet>`;
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

const sheet = worksheet(rows);
const xlsx = zipStore([
  {
    name: '[Content_Types].xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
  },
  {
    name: '_rels/.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  },
  {
    name: 'xl/workbook.xml',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Operating model" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  },
  {
    name: 'xl/_rels/workbook.xml.rels',
    data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
  },
  { name: 'xl/worksheets/sheet1.xml', data: sheet },
]);

const dna = {
  dna: 'operating-model-template',
  example: model.example,
  description: model.description,
  note: 'Structure only. Sample orders, prices, and customer names are not in this file.',
  roles: model.roles,
  processes: model.processes,
  rules: model.rules,
  systems: model.systems,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'template.csv'), csv(rows));
writeFileSync(join(outDir, 'template.json'), `${JSON.stringify(dna, null, 2)}\n`);
writeFileSync(join(outDir, 'template.xlsx'), xlsx);
console.log(`operating-model template: ${rows.length} rows`);
