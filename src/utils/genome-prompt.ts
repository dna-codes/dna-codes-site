// The "make yours" prompt on each genome page: a visitor pastes it into an agent that has the DNA
// MCP server connected, and the agent starts from this genome. Relative imports only, so
// `node --test` can load this file.
//
// It tells the agent to draft in conversation and to call `apply` only when the visitor asks,
// which is the default the DNA MCP server itself states.

/** The DNA MCP host, as the agent documents in public/agents/ publish it. */
export const DNA_MCP_HOST = 'https://agents.dna.codes';
export const SITE_ORIGIN = 'https://dna.codes';

export function agentPrompt(genome: { key: string; orgName: string }, origin = SITE_ORIGIN): string {
  const json = `${origin}/genome/${genome.key}.json`;
  return [
    `Use the DNA MCP server (${DNA_MCP_HOST}) to help me model how my company works.`,
    `Start from the ${genome.orgName} genome at ${json}. It is an example company, not mine.`,
    `Read its roles, process steps, rules and resources, then ask me how my company differs.`,
    `Draft my company's operating model in this conversation, as structure/v1 and behaviour/v1 documents, and use \`validate\` on each draft.`,
    `Do not save anything: call \`apply\` only when I ask you to save.`,
  ].join('\n');
}
