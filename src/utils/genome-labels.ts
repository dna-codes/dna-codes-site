// Display labels for genome names. Relative imports only, so `node --test` can load this file and
// every module that builds on it.

const split = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');

/** `receive-order` → `Receive order`. Used wherever a kebab id has to face a human. */
export function humanize(id: string): string {
  const s = id.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Sentence case, for things that read as a phrase: field names and rule names.
 * `enterpriseValue` → `Enterprise value`. `PaymentClearsBeforeStockMoves` → `Payment clears
 * before stock moves`, which is the sentence the rule is.
 */
export function labelFor(name: string): string {
  const spaced = split(name);
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/**
 * Title case, for proper nouns: roles, groups, entities, pages. `ManagingPartner` →
 * `Managing Partner`. A job title in sentence case reads like a typo, and these are the strings
 * a visitor scans first.
 */
export function titleFor(name: string): string {
  return split(name)
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
