// Homepage only. The route in wrangler.toml is `dna.codes/`, which is the path `/`.
// Every other URL stays on GitHub Pages and never enters this worker, so a bug here
// cannot take the docs, assets or agent documents down with it.
//
// fetch() from a worker does not re-enter the same worker. The Markdown sibling is a
// different path (`/index.md`), and the HTML fallthrough is the original request sent
// on to GitHub Pages.

import { negotiateMarkdown } from '../negotiate.js';

export default {
  async fetch(request) {
    try {
      return await negotiateMarkdown(request);
    } catch {
      return fetch(request);
    }
  },
};
