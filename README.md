# Software Development Atlas

A living, open-source knowledge system for software engineering — built for humans and coding agents.

Software Development Atlas aims to make deep software-development knowledge easy to learn, easy to reference, easy to verify, and easy to contribute to. The project spans fundamentals through modern AI-native and agentic engineering practices while keeping the core experience free to operate.

> **Status:** foundation phase. The first implementation milestone is a single gold-standard interactive lesson and the documentation shell required to support it.

## Principles

- **Depth without friction.** Explain concepts rigorously, then make them fast to scan and reference.
- **Learn by interacting.** Prefer diagrams, runnable examples, comparisons, exercises, and visualizations where they improve understanding.
- **Human + agent native.** Canonical knowledge should be useful as documentation and as structured context for coding agents.
- **Freshness is visible.** Evolving and frontier material records when it was last verified and how often it should be reviewed.
- **Zero-cost core.** Running the public project must not require maintainers to provide a billable API key, payment method, or usage-based cloud service.
- **Open by default.** Content lives in Git and is reviewed through normal open-source pull requests.

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

## Content model

Lessons are small enough to reference directly but deep enough to teach a production-grade mental model. A typical lesson may include:

1. TL;DR
2. Mental model
3. Why it matters
4. Core explanation
5. Bad vs. better approaches
6. Interactive or runnable example
7. Production considerations
8. Testing, performance, and security implications when relevant
9. Exercise or challenge
10. Agent-oriented rule/context
11. Related concepts
12. Primary sources
13. Freshness metadata

See [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) for the canonical authoring standard.

## Project roadmap

The project intentionally starts narrow:

1. establish the content and contribution standards;
2. build the documentation shell;
3. create one exceptional vertical-slice lesson;
4. extract reusable interactive learning primitives from real needs;
5. publish roughly 25 exceptional lessons for the first public milestone.

See [docs/roadmap.md](./docs/roadmap.md) for details.

## Contributing

Contributions are welcome. Please read:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CONTENT_GUIDE.md](./CONTENT_GUIDE.md)
- [AGENTS.md](./AGENTS.md) if you are using an AI coding agent

Corrections and reports of outdated material are particularly valuable.

## AI and cost policy

Software Development Atlas may integrate with AI tools, but its core experience must not depend on a maintainer-funded model API. Preferred integrations are user-owned or local: copy Markdown/context, open a lesson in an external AI tool, export agent instructions, or run compatible models on the user's device when practical.

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

Canonical lessons live in `content/docs` as Markdown/MDX. Frontmatter is validated during content generation/build. Do not add a runtime database for ordinary lesson content.

### Cost boundary

The core site must work without maintainer-funded model APIs, paid search, a hosted vector database, paid CMS/database infrastructure, or per-user server compute.

See [docs/deployment.md](./docs/deployment.md) for deployment and scale boundaries.

## License

MIT. See [LICENSE](./LICENSE).
