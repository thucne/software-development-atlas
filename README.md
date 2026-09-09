# Software Development Atlas

A living, open-source knowledge system for software engineering — built for humans and coding agents.

Software Development Atlas aims to make deep software-development knowledge easy to learn, easy to reference, easy to verify, and easy to contribute to. The project spans durable fundamentals through modern AI-native and agentic engineering practices while keeping the core experience free to operate.

> **Status:** foundation phase. The project has established the canonical knowledge map, curated learning paths, derived coverage views, and first-class engineering-judgment patterns while representative cross-domain coverage continues to grow.

## Principles

- **Depth without friction.** Explain concepts rigorously, then make them fast to scan and reference.
- **Map the territory.** Grow by important software-engineering coverage and connections, not raw article count.
- **Keep gaps honest.** Uncovered concepts and learning-path steps remain visible instead of being hidden to improve metrics.
- **Teach judgment, not recipes.** Compare alternatives under explicit constraints and trace failure modes across realistic system boundaries.
- **Learn by interacting when it helps.** Prefer diagrams, runnable examples, comparisons, exercises, and visualizations where they materially improve understanding.
- **Human + agent native.** Canonical knowledge should be useful as documentation and as structured context for coding agents.
- **Freshness is visible.** Evolving and frontier material records when it was last verified and how often it should be reviewed.
- **Zero-cost core.** Running the public project must not require maintainers to provide a billable API key, payment method, or usage-based cloud service.
- **Open by default.** Content lives in Git and is reviewed through normal open-source pull requests.

## Knowledge model

`content/atlas-map.json` is the canonical Software Engineering Map. It defines broad domains and stable concept IDs independently of the current sidebar or content count.

Authored content declares:

- a `contentType` such as `concept`, `deep-dive`, `decision-guide`, `field-guide`, or `architecture-walkthrough`;
- a target `learningDepth`: `recognize`, `reason`, or `operate`;
- canonical `concepts` from the map.

This keeps difficulty, navigation, loose search tags, content format, learning outcome, and durable concept placement as separate concerns. A concept can exist before a dedicated page does, making uncovered territory explicit.

`content/learning-paths.json` defines curated concept sequences for particular learning outcomes. It stores path order and intent, not authored page URLs. Coverage and available-content links are derived from canonical MDX concept placement, so the Atlas can show both supported and currently uncovered steps without maintaining a second lesson registry.

Engineering Judgment is a docs experience built on the same canonical MDX and concept placement. Decision guides compare alternatives under explicit constraints; architecture walkthroughs trace realistic vertical slices across boundaries, failure/recovery, security, observability, and cost. No separate decision registry or scoring engine is required.

See [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for the canonical authoring standard, the [Software Engineering Map](./content/docs/start-here/software-engineering-map.mdx) for the human-readable model, [Atlas Coverage](./content/docs/start-here/coverage.mdx) for current authored support, [Learning Paths](./content/docs/learning-paths/index.mdx) for curated traversals, and [Engineering Judgment](./content/docs/engineering-judgment/index.mdx) for decision guides and architecture walkthroughs.

## Planned stack

- Next.js 16
- React
- TypeScript
- Fumadocs + MDX
- Tailwind CSS
- pnpm
- build-time/client-side search first
- Sandpack for lightweight runnable examples
- WebContainers only where a real in-browser Node.js environment materially improves a lesson
- Mermaid and custom React visualizations

The site must remain portable and must not make a paid hosted service a requirement for core reading, navigation, search, or learning flows.

## Content experience

Not every Atlas page has the same shape. A focused concept page can stay concise; a decision guide should emphasize constraints and trade-offs; an architecture walkthrough should connect boundaries and failure modes; a deep dive may use a fuller teaching pattern. Learning-path pages are orientation layers: they order canonical concepts and surface derived content without pretending the path page itself teaches every step.

A deep dive may include:

1. TL;DR
2. Mental model
3. Why it matters
4. Core explanation
5. Bad vs. better approaches
6. Interactive or runnable example when useful
7. Production considerations
8. Testing, performance, and security implications when relevant
9. Exercise or challenge
10. Agent-oriented rule/context
11. Related concepts
12. Primary sources
13. Freshness metadata

Decision guides and architecture walkthroughs use different anatomy because the learning outcome is engineering reasoning rather than exhaustive concept exposition. The reusable `DecisionMatrix` component remains a static semantic presentation primitive; the explanation stays canonical in Markdown.

## Project roadmap

The project intentionally grows through small, reviewable slices:

1. establish content, contribution, and knowledge-map standards;
2. build the documentation shell;
3. establish exceptional vertical-slice content;
4. extract reusable learning primitives from real needs;
5. grow representative coverage across the Software Engineering Map;
6. add curated learning paths and derived coverage views;
7. make decision guides and architecture walkthroughs first-class content for engineering judgment;
8. continue expanding representative cross-domain content before community-scale discovery and contribution work.

See [docs/roadmap.md](./docs/roadmap.md) for details.

## Contributing

Contributions are welcome. Please read:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)
- [AGENTS.md](./AGENTS.md) if you are using an AI coding agent

Corrections and reports of outdated material are particularly valuable.

## AI and cost policy

Software Development Atlas may integrate with AI tools, but its core experience must not depend on a maintainer-funded model API. Preferred integrations are user-owned or local: copy Markdown/context, open content in an external AI tool, export agent instructions, or run compatible models on the user's device when practical.

## Development

Requirements:

- Node.js 22
- pnpm 10

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`; the root route redirects to `/docs`.

### Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

### Content

Canonical authored pages live in `content/docs` as Markdown/MDX. The canonical concept map lives in `content/atlas-map.json`; curated learning-path order lives in `content/learning-paths.json`. Frontmatter, concept references, path references, coverage behavior, representative judgment routes, and accessibility are validated in CI/build tooling. Do not add a runtime database for ordinary Atlas content.

### Cost boundary

The core site must work without maintainer-funded model APIs, paid search, a hosted vector database, paid CMS/database infrastructure, or per-user server compute.

See [docs/deployment.md](./docs/deployment.md) for deployment and scale boundaries.

## License

MIT. See [LICENSE](./LICENSE).
