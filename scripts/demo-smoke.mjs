// Drives the /api-operations demo in a real DOM and asserts it works.
//
// This exists because the demo shipped broken. `rowHtml` built all four verdict branches in an
// object literal before indexing one of them, so the governed branch dereferenced the governance map
// even when there was none — which is every document a visitor pastes. It threw on the first row,
// after the headline had already been assigned, leaving one spec's number above another spec's rows.
// Every static check in the repo passed: it built, `astro check` was clean, Prettier was happy, and
// the logic was unit-exercised through the same functions. Nothing that does not click a button
// could have found it.
//
//   npm run build && npm run check:demo
//
// It loads the *built* page, bundles the *built* client script to an IIFE (jsdom does not execute
// module scripts), evaluates it against that DOM, and then does what a visitor does: opens the paste
// panel, pastes a YAML spec, pastes rubbish, and goes back to a sample.
//
// Known limits, so nobody reads more into a pass than is there: jsdom is not a browser. It does not
// lay anything out, so nothing here can catch a visual defect, and `<details>` is toggled by setting
// `open` rather than by a real click on the summary. A pass means the wiring works, not that the
// panel looks right.

import { readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as esbuild from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const page = join(root, 'dist/api-operations/index.html');
const outDir = join(root, 'node_modules/.cache/dna-demo-smoke');

if (!existsSync(page)) {
  console.error('No built page at dist/api-operations/index.html — run `npm run build` first.');
  process.exit(1);
}

const require = createRequire(import.meta.url);
let JSDOM;
try {
  ({ JSDOM } = require('jsdom'));
} catch {
  console.error('jsdom is not installed. `npm install` should provide it (devDependency).');
  process.exit(1);
}

// The built client script is an ES module and jsdom will not run one, so it is re-bundled as an
// IIFE. Same code, different wrapper.
const built = readFileSync(page, 'utf8').match(/src="(\/_astro\/ApiOpsDemo[^"]+\.js)"/);
if (!built) {
  console.error('Could not find the ApiOpsDemo client script in the built page.');
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
await esbuild.build({
  entryPoints: [join(root, 'dist', built[1])],
  outfile: join(outDir, 'demo.js'),
  bundle: true,
  format: 'iife',
  logLevel: 'error',
});

const dom = new JSDOM(readFileSync(page, 'utf8'), { runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;
const $ = (id) => doc.getElementById(id);
const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '(missing)');
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

let failures = 0;
const check = (label, cond, detail = '') => {
  if (!cond) failures++;
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`);
};

// A YAML 3.1 document, because that is what people paste. Deliberately not one of the bundled
// samples: those are JSON, and are already parsed at build time.
const SPEC = `openapi: 3.1.0
info:
  title: E-commerce API
  version: 1.0.0
components:
  securitySchemes:
    BearerAuth: { type: http, scheme: bearer }
paths:
  /auth/register:
    post: { summary: Create a new user account }
  /auth/login:
    post: { summary: Login and get access token }
  /products:
    get: { summary: List all products }
  /products/{id}:
    get: { summary: Get product details }
  /cart:
    get: { summary: Get the current cart, security: [{ BearerAuth: [] }] }
  /cart/items:
    post: { summary: Add item to cart, security: [{ BearerAuth: [] }] }
  /checkout:
    post: { summary: Checkout and place order, security: [{ BearerAuth: [] }] }
  /orders:
    get: { summary: List past orders, security: [{ BearerAuth: [] }] }
  /orders/{orderId}:
    get: { summary: Get order details, security: [{ BearerAuth: [] }] }
  /addresses:
    get: { summary: Saved addresses, security: [{ BearerAuth: [] }] }
    post: { summary: Add an address, security: [{ BearerAuth: [] }] }
`;

// The same document with every security block removed, to prove the other branch of the headline.
const SPEC_NO_AUTH = SPEC.replace(/components:[\s\S]*?paths:/, 'paths:').replace(
  /, security: \[\{ BearerAuth: \[\] \}\]/g,
  ''
);

console.log('\n— server-rendered, before any script —');
check('opens as a gap report', txt($('apiops-headline')).includes('22 of 26 endpoints are governed'));
check('every endpoint is an accordion', doc.querySelectorAll('#apiops-rows details').length === 26);

window.eval(readFileSync(join(outDir, 'demo.js'), 'utf8'));

console.log('\n— the paste panel —');
check('starts hidden', $('apiops-paste').classList.contains('hidden'));
click($('apiops-paste-toggle'));
check('opens on click', !$('apiops-paste').classList.contains('hidden'));

console.log('\n— paste a YAML spec —');
$('apiops-input').value = SPEC;
click($('apiops-read'));
const head = txt($('apiops-headline'));
check('YAML is parsed and read', head.includes('11 of 11 endpoints can be named'), head);
check(
  "reads the document's own security block",
  head.includes('7 require a credential — none have operational controls'),
  head
);
const rowsHtmlNow = $('apiops-rows').innerHTML;
check('secured endpoints are marked on the row', (rowsHtmlNow.match(/>credential</g) || []).length === 7);
check('public endpoints are marked on the row', (rowsHtmlNow.match(/>public</g) || []).length === 4);
const cartRow = doc.querySelector('#apiops-rows details[data-op="GET /cart"]');
check('a secured row says credential', txt(cartRow).includes('credential'), txt(cartRow).slice(0, 60));
const productsRow = doc.querySelector('#apiops-rows details[data-op="GET /products"]');
check('an unauthenticated row says public', txt(productsRow).includes('public'), txt(productsRow).slice(0, 60));
check('title follows the pasted document', txt($('apiops-title')) === 'E-commerce API');
check('badge says there is no model', txt($('apiops-badge')) === 'No model');
check('rows are replaced', doc.querySelectorAll('#apiops-rows details').length === 11);
check('nothing is claimed to be a gap', !$('apiops-rows').innerHTML.includes('nothing governs this'));
check('no error is shown', $('apiops-error').classList.contains('hidden'));

console.log('\n— a document that declares no authentication —');
$('apiops-input').value = SPEC_NO_AUTH;
click($('apiops-read'));
check(
  'says so, which is a bigger finding',
  txt($('apiops-headline')).includes('No authentication declared, and no operational controls'),
  txt($('apiops-headline'))
);
$('apiops-input').value = SPEC;
click($('apiops-read'));

console.log('\n— view the spec —');
check('spec panel starts hidden', $('apiops-spec').classList.contains('hidden'));
check('toggle reports collapsed', $('apiops-spec-toggle').getAttribute('aria-expanded') === 'false');
click($('apiops-spec-toggle'));
check('spec panel opens', !$('apiops-spec').classList.contains('hidden'));
check('toggle reports expanded', $('apiops-spec-toggle').getAttribute('aria-expanded') === 'true');
check('shows the pasted bytes verbatim', $('apiops-spec-text').textContent.includes('/auth/register'));
check('shows YAML, not a re-serialisation', $('apiops-spec-text').textContent.trimStart().startsWith('openapi: 3.1.0'));
check('meta counts the operations', txt($('apiops-spec-meta')).startsWith('11 operations'), txt($('apiops-spec-meta')));
check('spec view is masked from replay tools', $('apiops-spec-text').hasAttribute('data-private'));

console.log('\n— privacy of the paste field —');
const input = $('apiops-input');
check('not inside a form', !input.closest('form'));
check('has no name, so cannot be serialised', !input.hasAttribute('name'));
check('spellcheck off', input.getAttribute('spellcheck') === 'false');
check('autocomplete off', input.getAttribute('autocomplete') === 'off');
check('masked from replay tools', input.hasAttribute('data-private'));
window.dispatchEvent(new window.Event('pagehide'));
check('cleared when the page is left', input.value === '');

console.log('\n— open a row —');
const first = doc.querySelector('#apiops-rows details');
first.open = true;
check('expands to the operation', txt(first).includes('Auth.Register'), txt(first).slice(0, 70));

console.log('\n— layer a DNA control onto the pasted document —');
const selects = () => [...doc.querySelectorAll('#apiops-rows [data-govern]')];
check('every ungoverned endpoint offers a rule', selects().length === 11, `${selects().length}`);
const tones = () =>
  Object.fromEntries(
    [...doc.querySelectorAll('#apiops-rows details')].map((d) => [d.dataset.op, d.getAttribute('style')])
  );
const beforeTones = tones();
check(
  'an unpasted-on document shows no row as governed',
  !Object.values(beforeTones).some((t) => t.includes('0d9488'))
);

const target = selects().find((el) => el.dataset.govern === 'Checkout.Create');
check('the row to govern is findable', !!target);
target.closest('details').open = true;
target.value = 'starter-approval';
target.dispatchEvent(new window.Event('change', { bubbles: true }));
const afterOne = txt($('apiops-headline'));
console.log('  headline:', afterOne);
check('the reading counts it', afterOne.includes('1 of 11 endpoints have controls'), afterOne);
check('the rest are "not yet", not gaps', afterOne.includes("10 still don't"), afterOne);
check('nothing on their own document is called a gap', !afterOne.toLowerCase().includes('gap'));
check('badge says the model is theirs', txt($('apiops-badge')) === 'Your model', txt($('apiops-badge')));
const governedRow = doc.querySelector('#apiops-rows details[data-op="POST /checkout"]');
check('the governed row shows its rule', txt(governedRow).includes('Requires Approval'), txt(governedRow).slice(0, 80));
check('the row stayed open across the re-render', governedRow.open);
const governedSelect = governedRow.querySelector('[data-govern]');
check('the dropdown reflects the rule in force', governedSelect.value === 'starter-approval', governedSelect.value);
check(
  'and does not still read "no control"',
  governedSelect.options[governedSelect.selectedIndex].textContent.includes('Requires Approval')
);
check('no starter rule names a business domain', !$('apiops-rows').innerHTML.includes('Financial Authority'));

// The defect this guards: applying one control used to flip every other row from teal to red,
// because "not assigned yet" and "a gap in your model" were the same state. Only the row that was
// touched may change.
const toneOf = (op) => doc.querySelector(`#apiops-rows details[data-op="${op}"]`)?.getAttribute('style');
check('the governed row turned teal', toneOf('POST /checkout').includes('0d9488'), toneOf('POST /checkout'));
const untouched = ['GET /products', 'GET /cart', 'GET /orders', 'POST /auth/login'];
check(
  'every untouched row kept its tone',
  untouched.every((op) => toneOf(op) === beforeTones[op]),
  untouched.map((op) => `${op}: ${toneOf(op) === beforeTones[op] ? 'same' : 'CHANGED'}`).join(', ')
);
check(
  'and none of them turned red',
  untouched.every((op) => !toneOf(op).includes('f43f5e'))
);

const second = selects().find((el) => el.dataset.govern === 'Order.List');
second.value = 'starter-read';
second.dispatchEvent(new window.Event('change', { bubbles: true }));
check(
  'a second control lands',
  txt($('apiops-headline')).includes('2 of 11 endpoints have controls'),
  txt($('apiops-headline'))
);

const undo = doc.querySelector('#apiops-rows [data-govern="Checkout.Create"]');
undo.value = '';
undo.dispatchEvent(new window.Event('change', { bubbles: true }));
check(
  'and can be taken back off',
  txt($('apiops-headline')).includes('1 of 11 endpoints have controls'),
  txt($('apiops-headline'))
);

console.log('\n— samples are not editable —');
click(doc.querySelector('[data-sample="payments"]'));
check('no rule pickers on a bundled sample', doc.querySelectorAll('#apiops-rows [data-govern]').length === 0);
check('sample model is unaffected', txt($('apiops-headline')).includes('22 of 26 endpoints are governed'));

console.log('\n— re-paste to continue —');
$('apiops-input').value = SPEC;
click($('apiops-read'));
check(
  'assignments reset for a new document',
  txt($('apiops-headline')).includes('11 of 11 endpoints can be named'),
  txt($('apiops-headline'))
);

console.log('\n— paste something that is not a spec —');
$('apiops-input').value = '{"name":"my-package","version":"1.0.0"}';
click($('apiops-read'));
check('says why', !$('apiops-error').classList.contains('hidden'), txt($('apiops-error')));
check('leaves the previous reading alone', txt($('apiops-headline')).includes('11 of 11'));

$('apiops-input').value = 'this is not: [a spec';
click($('apiops-read'));
check('reports unparseable input', txt($('apiops-error')).includes('neither valid JSON nor valid YAML'));

console.log('\n— back to a bundled sample —');
click(doc.querySelector('[data-sample="clinic"]'));
check('the model comes back with it', txt($('apiops-headline')).includes('17 of 24 endpoints are governed'));
check('badge returns to Demo model', txt($('apiops-badge')) === 'Demo model');
check('spec view follows the sample', $('apiops-spec-text').textContent.includes('Meridian Clinic API'));

console.log(`\n${failures === 0 ? 'demo smoke: all passed' : `demo smoke: ${failures} failure(s)`}\n`);
process.exit(failures ? 1 : 0);
