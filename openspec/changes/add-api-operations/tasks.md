# Tasks — add-api-operations

Ordered so the page's central claim is **measured before it is written**. §1 builds the resolver and
runs it against real public specs; what it returns decides the copy in §3. Everything after that is
provable against an artifact rather than against an estimate.

The build order inside the product itself is [`design.md`](./design.md) §4. This is the site's half
of it — §1–§2 are shared with the product and belong in this repo because the demo runs entirely in
the browser.

## 1. The resolver, and the number it produces

- [x] 1.1 Write `src/utils/openapi-resolve.ts` — parse an OpenAPI 3.x document (JSON or YAML) and
      return one record per operation: `method`, `path`, `operationId`, the resolved
      `{ resource, action }` or `null`, and which rule resolved it. Accept `x-dna.operation` as an
      explicit override that always wins over convention.
- [x] 1.2 Resolution rules, in precedence order, each one named in the output so the demo can show
      its work: explicit `x-dna` → `operationId` in a recognised shape → path + method convention
      (`POST /payments` → `Payment.Create`, `GET /customers/{id}` → `Customer.Read`) → unresolved.
      **Unresolved is a first-class result and is never guessed into a plausible name** — design §5.
- [x] 1.3 Handle the shapes real specs actually contain: `$ref` within the document, path templating,
      sub-resources (`/customers/{id}/invoices`), verbs in paths (`/payments/{id}/refund`), RPC
      routes (`/rpc/doThing`), and non-CRUD methods. Sub-resources resolve to the **last** resource
      in the path; a trailing verb segment beats the method.
- [ ] 1.4 Unit tests per resolution rule. **Still deferred** — the repo has no test runner, and
      standing one up is a change of its own. Two checks stand in: `scripts/resolve-report.mjs` over
      the nine-spec corpus (prints, asserts nothing — a human has to notice a moved number), and
      `scripts/demo-smoke.mjs`, which _does_ assert, and which caught a crash nothing else could.
- [x] 1.5 **Run it against at least ten real public specs** — Stripe, GitHub, Twilio, Slack,
      DigitalOcean, and whatever internal spec is to hand — and record the resolution rate per spec
      in a short findings note in this directory. This is the gate.
- [x] 1.6 **Decide §1 of the page from 1.5, and write the finding into `proposal.md` before writing
      any copy.** High resolution (~80%) means the page's wedge is _"your API is already most of the
      way modelled — you just never wrote down who may call it."_ Low resolution (~25%) means it is
      _"four teams named your endpoints five ways and nothing in your stack can tell you that."_
      Both are good pages. They are not the same page.
      **Answered, and it was neither:** the structural reading is high (88%) and the governed reading
      is zero, so §1 is two numbers and the gap between them. See [`findings.md`](./findings.md).

## 2. Sample specs

- [x] 2.1 Add `src/data/openapi-samples/` — three specs, following the `lens-demo-*.json` precedent:
      payments, clinic, internal ops. Small enough to read, large enough that the reading is not
      trivially countable by eye (~20–40 operations each).
- [x] 2.2 Author them so they resolve at three visibly different rates, and say which is which in the
      picker. A sample set that all scores well is a demo that cannot show the interesting case.
- [ ] 2.3 Extend `scripts/validate-genomes.mjs` or add a sibling check so a malformed sample fails
      `npm run build` rather than failing in a visitor's browser. **Not needed as specified, and
      worth knowing why:** `ApiOpsDemo` resolves `payments.json` in its frontmatter, so a malformed
      sample already fails the build there. The gap that remains is the other two, which are only
      read in the browser — a check would have to resolve all three.

## 3. `ApiOpsDemo` — the hero artifact

- [x] 3.1 Paste-first: a textarea taking a raw OpenAPI document, plus the three sample buttons.
      **URL fetch is secondary and must fail honestly** — CORS will refuse most real specs, and the
      failure message says so rather than implying the spec is bad (design §2, risk 2).
- [x] 3.2 Parse and resolve entirely client-side. No network call, no key, no account. Fail visibly
      on malformed or oversized input; cap the document size and say what the cap is.
- [x] 3.3 Render the endpoint list streaming in with each resolution and the rule that produced it,
      then the reading through `ApiCoveragePanel`.
- [x] 3.4 **Label which reading is on screen.** An anonymous visitor gets the _structural_ reading —
      how many endpoints can be named at all. The _governed_ reading requires a model and the label
      must say so. Conflating them is risk 1 and it is the one that loses a technical reader.
- [x] 3.5 `Demo mode` badge per the house stub-first pattern, in the place the real console shows the
      signed-in person.

## 4. `ApiCoveragePanel`

- [x] 4.1 One component, rendered in all three places the number appears — homepage card, §1, demo —
      so it cannot disagree with itself. Mirrors `AgentCoveragePanel`.
- [x] 4.2 The denominator moves and the copy says it moves.

## 5. The page and its sections

- [x] 5.1 `src/pages/api-operations.astro` — hero + four sections + close, alternating side to side,
      per `proposal.md`.
- [x] 5.2 `ApiOpsBind` — `POST /payments` → `Payment.Create`, the `x-dna` block, the two-word
      contract table, and the four reconciliation outcomes.
- [x] 5.3 `ApiOpsEdge` — one middleware, three calls through one rule, three outcomes, and a record
      naming the actor rather than the key. Must carry the not-a-gateway framing.
- [x] 5.4 `ApiOpsExplorer` — execute as an actor, policy evaluated before the button. **Opens by
      conceding Swagger**, because that is the objection the reader has held since the headline.
- [x] 5.5 FAQ and the waitlist close with `preselect="api-operations"`.
- [x] 5.6 No link to a `/docs` page for `x-dna` until the schema ships — see Impact.

## 6. Wiring the fourth product in

- [x] 6.1 `src/data/products.ts` — fourth entry; `key` union gains `'api-operations'`; `verb` is
      `Govern it`, shared with Overlay; `status` is `In design`; icon `tabler:api`. Extend the file's
      header comment to say why the mark was chosen, as the existing three do.
- [x] 6.2 `ProductsHighlight.astro` — heading to "Four products, one model," and resolve
      `lg:grid-cols-3` against four cards. **This needs a browser, not a decision in a document**:
      2×2 at `lg`, or 4-up at `xl` with 2×2 below. 4-up at `lg` will not hold two-sentence cards.
- [x] 6.3 `WaitlistForm.astro` — fourth interest and `preselect` union. Blurb: _"Govern the endpoints
      other software calls."_
- [x] 6.4 `src/data/pricing.ts` — an **API** feature group. **No new tier, no new price.**
- [x] 6.5 `src/pages/overlay.astro` — one teaser paragraph and one link, in `AgentOpsTeaser`'s shape:
      the same operation, governed at the button and at the endpoint.
- [x] 6.6 Confirm `navigation.ts` and `Footer` need no edit — both map over `PRODUCTS` — and check the
      four-item nav dropdown in a browser.

## 7. Verify

- [x] 7.1 `npm run build` succeeds. **Not `astro check` alone** — it never renders.
- [x] 7.2 `npm run check` passes.
- [ ] 7.3 Browser pass: `/api-operations`, homepage four-card grid, nav dropdown, `/pricing`,
      `/overlay` teaser, dark mode, mobile. **Still outstanding for anything visual** — no browser
      has been driven and nothing on this page has been _looked_ at. The 2x2 card grid in particular
      was changed on reasoning, not on sight.
      Interaction is no longer unverified: `npm run check:demo` drives the built page in jsdom and
      presses the buttons. jsdom does not lay anything out, so a pass says the wiring works and says
      nothing about how it looks.
- [x] 7.5 **Smoke-test the demo in a DOM** — `scripts/demo-smoke.mjs`, wired as `npm run check:demo`,
      run after `npm run build` because it drives the built page and the built client bundle.
      It paid for itself immediately. **The paste feature was broken and every other check passed
      it.** `rowHtml` built all four verdict branches in an object literal before indexing one, so
      the governed branch dereferenced the governance map even when there was none — which is every
      document a visitor pastes. It threw on the first row, _after_ the headline had been assigned,
      leaving one spec's number above another spec's rows and the wrong title in the chrome. The
      build was clean, `astro check` was clean, Prettier was clean, and the same functions had been
      exercised in Node. Nothing that does not press a button could have found it.
      Two fixes: the branches are lazy now, and `paint` builds every string before assigning any of
      them, so a throw can never half-update the panel again.
- [x] 7.4 Paste a real spec into the shipped demo and confirm the reading matches what the resolver
      returned in 1.5. A number that disagrees with itself between the CLI and the page is the
      defect this whole ordering exists to prevent.

## 7b. The document, and what happens to it

- [x] 7.6 **A spec view.** A third toolbar toggle shows the document being read — the bundled JSON
      for a sample, the visitor's own bytes for a paste. Capped at 120k characters, and the
      truncation notice says the _display_ was cut, not the reading, because a reader who thought
      otherwise would distrust the number above it.
- [x] 7.7 **Audit what a supplied document is exposed to.** The bundled samples are fictional and
      carry `openapi`, `info`, `paths` and nothing else — no `servers`, no `securitySchemes`, no
      examples, no hostnames — so they leak nothing. The real surface is the visitor's own paste, and
      it was audited rather than assumed: the built demo bundle contains no `fetch`, `XMLHttpRequest`,
      `sendBeacon`, `localStorage`, `sessionStorage`, `document.cookie` or `WebSocket`, so
      _"read in this browser, never uploaded"_ is literally true.
      Four hardenings, each against a named vector, all asserted in `check:demo`:
      the input is outside the page's only form and has no `name`, so it cannot ride along in the
      Formspree submission at the foot of the page (the one genuinely dangerous adjacency here);
      `spellcheck="false"`, because Chrome's enhanced spellcheck uploads field contents to Google;
      `autocomplete`/`autocapitalize`/`autocorrect` off, to keep it out of form restoration; and
      `data-private` / `data-dd-privacy="mask"` on both the input and the spec view, so that adding a
      session-replay tool later cannot silently start recording customers' API descriptions. The
      input is also cleared on `pagehide`, because browsers restore textarea values on reload and on
      back-forward navigation and an internal spec should not still be on screen on a shared machine.
      **Residual, and inherent:** whatever a visitor pastes is in their own DOM and on their own
      screen, and the spec view makes it more visible by design.

- [x] 7.8 **Read the one governance-adjacent fact an OpenAPI document actually contains.** Each
      operation's `security` (falling back to the document's, and treating an empty array as
      deliberately public) gives a real second line for a stranger's spec: _"11 of 11 endpoints can
      be named. 7 require a credential — none have operational controls."_ Each endpoint is marked
      on its own row as `credential` or `public`, because a count is a statistic and an auditor needs
      to see which ones. That is sharper than the
      _"governance unknown"_ it replaces, it is computed entirely from their own document, and it
      makes the page's argument in the reader's own numbers — a token proves who you are, not that
      you may. Where a document declares no authentication anywhere, the page says that instead,
      which is a bigger finding than a count of zero.
      **A `public` endpoint is marked but not treated as a defect.** Public rows keep the neutral row
      tint rather than the red one reserved for gaps: a product listing and a login endpoint are
      meant to be public, and a panel that flagged every one of them as alarming would be the kind of
      scanner output people learn to ignore.
- [x] 7.9 **Let a visitor layer controls onto their own document.** Opening any endpoint on a pasted
      spec offers four generic starter rules — Read Access, Write Authority, Administrative,
      Financial Authority. Binding one moves that endpoint to governed and the panel becomes a gap
      report over _their_ API, with everything unbound correctly counted as a gap. Reversible, reset
      on a new document, held in a variable and never sent. Bundled samples are not editable: their
      model is part of the sample's argument.
      Two details that matter more than they look: the starter rules are deliberately generic,
      because offering "Payment Authority" against somebody's e-commerce API asks them to adopt our
      fiction; and the row that was just governed is reopened after the re-render, because
      `innerHTML` closes every `<details>` and a visitor who binds a rule should still be looking at
      the endpoint they bound.

- [x] 7.10 **Three row tones, not two.** Reported as "changing controls turns a lot of other
      endpoints from green to red". It did: before the first assignment the governance map was
      `null`, so every row read as _unknown_ and drew teal; the moment anything was assigned the map
      went non-null and every unassigned row became a _gap_ and drew red. One constructive click
      repainted ten rows and made the screen look worse.
      The colour was the symptom. The cause was that "nothing governs this" and "this is a gap" were
      the same state, when they are only the same where a model exists to have a gap in. A bundled
      sample has one; a pasted document does not — the only controls it can have are the ones the
      visitor adds in the panel. So `uncontrolled` is now its own verdict with its own neutral tone,
      red is reserved for samples, and the headline on a visitor's own document reads
      _"1 of 11 endpoints have controls. 10 still don't."_ rather than calling them gaps.
      Teal now appears on a pasted document only where the visitor has put it. `check:demo` asserts
      that applying a control changes the touched row and nothing else.
- [x] 7.11 **The heading accent was on the wrong word.** _"Most of it is governed. Which parts
      <em>aren't</em>?"_ put the page's governed colour on the negation, contradicting the colour law
      the panel beside it follows. The accent moved to **governed**. Rose on "aren't" would also have
      been law-abiding and puts the emphasis on the question instead — worth trying if the heading
      reads too reassuring.

- [x] 7.12 **The starter rules named a business domain.** The fourth was "Financial Authority", held
      by "Finance, within a limit" — offered against a pasted e-commerce spec, where it read as a
      non-sequitur. It was the exact defect the picker's own comment claimed to avoid: guessing the
      reader's domain. Replaced with **Requires Approval**, so all four are now levels of authority
      rather than kinds of business. It also earns its place by not being role-based, since a picker
      where every option is another list of roles implies that is all a rule can be.
- [x] 7.13 **The picker did not show the rule it had applied.** No `selected` attribute, so every
      re-render rebuilt the select with the empty option first: applying a rule left the row teal and
      the detail naming the rule while the dropdown under it still read "nothing — leave it open".
      A control contradicting the thing it had just done. The empty option is now `— no control —`,
      and the option in force is marked selected. `check:demo` asserts the select's value and its
      visible label after an assignment.

## 8. Left for a person

- [ ] 8.1 **Look at it.** §7.3. The wiring is now covered by `check:demo`; what remains uncovered is
      everything visual — the 2x2 card grid, the accordion at real widths, mobile, dark mode.
- [ ] 8.2 **Re-run the corpus against a design partner's internal spec** before quoting 88%
      anywhere a customer can see it. Nine large public developer APIs are not the buyer, and an
      internal API written by four teams over five years is likely to score lower — see
      [`findings.md`](./findings.md) limits.
- [ ] 8.3 **Retake the homepage card** for API Operations once the demo can be screenshotted. It
      renders `ApiCoveragePanel` live today, which is honest but is not the demo.
