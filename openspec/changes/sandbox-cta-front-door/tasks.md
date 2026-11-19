# Tasks

Write each test red first.

## 1. Tests

- [x] 1.1 Failing test: root `llms.txt` has "Agents: start here" first; the only waitlist line is the one addressed to people without an agent.
- [x] 1.2 Failing test: the homepage hero still links `/waitlist/`, and nav and footer also link `/agents/`.
- [x] 1.3 Failing test: `dist/llms-full.txt` equals `public/agents/llms-full.txt`.
- [x] 1.4 Failing test: sitemap lists `/agents/`, `/agents/llms.txt`, `/agents/auth.md`; `dist/sitemap.xml` exists.
- [x] 1.5 Failing test: homepage has both alternates and a `SoftwareApplication` with three `sameAs`.

## 2. Implementation

- [x] 2.1 `navigation.ts`: add a "For agents" `/agents/` link to nav and footer; keep the waitlist button.
- [x] 2.2 `llms.txt.ts`: insert the block (design D3); replace the two waitlist lines.
- [x] 2.3 Head alternates for `/llms.txt` and `/agents/discovery.json`.
- [x] 2.4 Build copy for `/llms-full.txt` and `/sitemap.xml`; sitemap `customPages` (D4, D5).
- [x] 2.5 `StructuredData.astro` (D6).

## 3. Release

- [ ] 3.1 Ship with the platform's regenerated `/agents/` set (`agents-bring-their-human`), so both `llms.txt` files agree.
- [ ] 3.2 After deploy: fetch `/llms.txt`, `/llms-full.txt`, `/sitemap.xml` live; all 200.
