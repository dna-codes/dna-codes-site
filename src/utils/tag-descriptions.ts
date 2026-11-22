// One sentence per blog tag. It is the tag archive's meta description and the line under
// its heading. Moz flags a description under 55 characters, and most tags hold one or two
// posts, so without this line a tag page reads as a copy of the blog index.
// Keys are the tag as written in a post's frontmatter. `npm run check:crawl` fails a tag
// archive whose description is too short, so a new tag needs a line here.
export const TAG_DESCRIPTIONS: Record<string, string> = {
  abstraction:
    'The layers between intent and code: semantics, ontology, operational model and execution model, and why each one is written down.',
  'ai agents':
    'How AI agents read a business model, act inside its rules, and ask before they spend, approve or change anything that matters.',
  'api design':
    'Designing APIs that mirror the business operations behind them, so every endpoint maps to an action the business recognizes.',
  architecture:
    'Software architecture that starts from the business model: where meaning, rules and operations live, and how code inherits them.',
  bpmn: 'BPMN and its limits: what a process diagram captures, what it leaves out, and how an executable workflow model differs.',
  'business process management':
    'Business process management without the slide deck: processes written as states, operations and policies that software can run.',
  'business process modeling':
    'Business process modeling that ends in a working model, not a diagram: workflows, approvals and rules written as structured data.',
  'domain-driven design':
    'Domain-driven design ideas, such as ubiquitous language and bounded contexts, applied to the model a whole business runs on.',
  'execution model':
    'The execution model: the interfaces, endpoints and tools that expose business operations to people, software and AI agents.',
  'knowledge graphs':
    'Knowledge graphs and ontologies as a record of what a business believes exists, kept separate from how its database stores it.',
  mcp: 'Model Context Protocol in practice: giving AI agents the tools, rules and approvals of a business through one MCP server.',
  ontology:
    'Ontology for business software: the entities, relationships and meanings a company runs on, and why a schema is not enough.',
  'operational model':
    'The operational model: the formal record of how a business works, between its ontology and the software that executes it.',
  operations:
    'Business operations written down as a model: the processes, approvals and rules a team follows, in a form software can run.',
  semantics:
    'Semantics in software: getting the words of a business right first, because every layer below inherits their meaning.',
};

export const tagDescription = (tag: string, postTitles: string[] = []): string =>
  TAG_DESCRIPTIONS[tag] ??
  `Posts on ${tag} from the DNA Codes blog${postTitles.length ? `: ${postTitles.join('; ')}` : ''}.`;
