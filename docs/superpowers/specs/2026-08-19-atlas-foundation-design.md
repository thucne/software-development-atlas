# Software Development Atlas Foundation Design

**Date:** 2026-08-19  
**Status:** Approved foundation direction; review this written specification before implementation planning.

## 1. Purpose

Software Development Atlas is an open-source knowledge system for software engineering from fundamentals through modern AI-native and agentic development.

It is not intended to be another chronological blog, link directory, or collection of shallow tutorials. The product should combine the depth of a strong textbook, the referenceability of framework documentation, and the feedback loops of an interactive learning environment.

The same canonical knowledge should serve two audiences:

1. **Humans** who want to learn, debug, compare approaches, or quickly reference a concept.
2. **Coding agents** that need concise, structured, verifiable engineering guidance.

## 2. Product goals

### 2.1 Depth without friction

A reader should be able to skim a lesson in seconds for a rule or example, or spend significantly longer building a rigorous mental model.

### 2.2 Interactive where it improves understanding

Lessons may include runnable code, visual execution timelines, state diagrams, benchmarks, quizzes, architecture diagrams, and other learning primitives. Interactivity is a teaching tool, not a requirement for every page.

### 2.3 Excellent reference experience

The documentation shell should support the normal expectations of high-quality framework/library documentation: hierarchical navigation, table of contents, previous/next links, full-text search, stable anchors, responsive design, code highlighting, theme support, and an "Edit this page on GitHub" action.

### 2.4 Open contribution

Content lives in the repository, uses reviewable text formats, and is changed through GitHub pull requests. Contributors should not need access to a proprietary CMS.

### 2.5 Visible freshness

The site must distinguish durable fundamentals from fast-moving guidance. Readers and maintainers should be able to see when evolving material was last intentionally verified.

### 2.6 Human + agent native

Canonical lessons must remain useful when represented as Markdown. Agent-oriented outputs can include raw Markdown, `llms.txt`, `SKILL.md`, `AGENTS.md`, or rule collections, but these should derive from canonical knowledge where practical.

## 3. Non-goals for the initial product

The first public milestone will not require:

- user accounts or authentication;
- a comments database;
- a custom CMS;
- certificates or course completion credentials;
- social-network functionality;
- a hosted vector database;
- maintainer-funded generative-AI APIs;
- hosted arbitrary-code execution;
- paid search infrastructure;
- a mobile application;
- large-scale automatic generation of lessons.

These can only be reconsidered after a concrete need exists and the zero-cost principle remains protected.

## 4. Zero-cost guarantee

The core public application must not require maintainers to provide a billable API key, payment method, or usage-based cloud service.

Core means at minimum:

- reading all lessons;
- site navigation;
- table of contents and previous/next navigation;
- search;
- code rendering;
- diagrams and essential visualizations;
- contribution links;
- agent-readable textual exports that are part of the normal build.

Paid model APIs, hosted embeddings, paid search, paid CMS/database products, and other usage-based services must not be required dependencies for the core experience.

AI integrations should preferentially be user-owned or local: copy lesson/context as Markdown, open a page in external AI tooling, export agent instructions, or run compatible models on the user's device when practical.

Hosting should be designed so the application can run on a free tier and remain portable. Static/build-time work is preferred over request-time infrastructure.

## 5. Information architecture

The long-term knowledge map is domain-oriented rather than framework-only. Initial top-level areas may include:

- Start Here
- Computer Science Foundations
- Programming Fundamentals
- Languages
- Web Platform
- Frontend Engineering
- Backend Engineering
- APIs & Networking
- Databases & Data
- Operating Systems
- Distributed Systems
- Software Architecture
- Testing & Quality
- Performance
- Security
- DevOps & Infrastructure
- Cloud & Serverless
- Observability
- Developer Tooling
- Mobile
- Desktop
- Data Engineering
- Machine Learning
- AI Engineering
- Agentic Software Engineering
- Open Source
- Engineering Leadership
- System Design
- Reference

The hierarchy is a navigation aid, not the only discovery mechanism. Lessons also carry topics, technologies, prerequisites, related concepts, difficulty, and freshness metadata.

## 6. Canonical content model

Git-tracked MDX is the initial canonical authoring format.

A normal lesson carries typed frontmatter including:

- `title`
- `description`
- `category`
- `level`: `beginner | intermediate | advanced`
- `status`: `evergreen | evolving | frontier`
- `lastVerified`
- `reviewAfterDays`
- `topics`
- `prerequisites`
- `related`
- `technologies`

The implementation must validate required metadata in CI/build tooling before the first public content release.

### 6.1 Freshness model

- **Evergreen:** slow-changing fundamentals. Default review target: 365 days.
- **Evolving:** frameworks, libraries, databases, infrastructure, and current engineering practice. Default review target: 180 days.
- **Frontier:** fast-moving AI, coding-agent, protocol, and model-driven workflows. Default review target: 90 days.

`lastVerified` records an intentional correctness review, not merely the last edit.

## 7. Lesson experience

The default lesson anatomy is:

1. TL;DR
2. Mental model
3. Why this matters
4. Core explanation
5. Bad / better approaches when applicable
6. Interactive or runnable example when useful
7. Production considerations
8. Testing, performance, and security implications when relevant
9. Exercise or challenge
10. Agent rule/context when appropriate
11. Related concepts
12. Primary sources
13. Freshness information

The textual content must contain the essential explanation even when an interactive visualization is present.

## 8. Interactive learning architecture

Interactive learning primitives should be React components embedded through MDX.

Potential primitives include:

- `CodeComparison`
- `ExecutionTimeline`
- `Playground`
- `Quiz`
- `Challenge`
- `Benchmark`
- `TradeoffMatrix`
- `MentalModel`
- `AgentRule`
- `FreshnessBadge`

These names are illustrative, not an API commitment. The project must first build one gold-standard lesson, then extract components based on observed repetition. This prevents a speculative component framework from becoming a maintenance burden.

Sandpack is the preferred first option for lightweight JavaScript/TypeScript/React examples. WebContainers should be introduced only when a lesson materially benefits from a real in-browser Node.js environment, terminal, package installation, or dev server.

No core lesson should require the project to provision per-user server compute.

## 9. Application architecture

### 9.1 Initial stack

- Next.js 16
- React
- TypeScript
- Fumadocs Core/UI/MDX
- Tailwind CSS
- pnpm

Fumadocs is the documentation architecture layer. Geistdocs may be used as a product/design reference, but the project should not make a beta template its irreversible architectural boundary.

### 9.2 Search

Search starts as build-time/client-side indexing over canonical content. The product should avoid external search infrastructure until repository scale or measured UX demonstrates that local search is insufficient.

### 9.3 Diagrams and code

Use Mermaid for diagrams that are naturally expressed as graphs/sequences and custom React visualizations for teaching interactions that Mermaid cannot provide. Code highlighting should be integrated with the documentation stack.

### 9.4 Deployment

Vercel's free tier is a convenient initial deployment target, but hosting is not an architectural dependency. The application should remain reasonably portable to static or alternative free hosting when framework features permit.

## 10. AI and agent architecture

The product is AI-native without being AI-dependent.

Core AI-era features should require no model inference from project-owned infrastructure:

- raw/clean Markdown representation;
- copy lesson as context;
- copy agent rule/context;
- `llms.txt` or equivalent aggregate machine-readable output;
- optional `SKILL.md` / `AGENTS.md`-style generated representations;
- links/actions that let users bring content into AI tools they already use.

A project-hosted "Ask AI" experience is explicitly not part of the initial core architecture because it would introduce an ongoing model-inference dependency. It may be evaluated later only if it can preserve the zero-cost guarantee or is separately funded and strictly optional.

## 11. Contribution and governance model

GitHub issues and pull requests are the collaboration surface.

The repository includes:

- contribution guidance;
- a content guide;
- agent instructions;
- structured issue forms for new lessons, corrections, and outdated content;
- a pull-request checklist.

Future CI should validate content schema, build correctness, broken links, executable examples where possible, accessibility, and freshness signals.

Primary sources are preferred for evolving technical claims. AI-assisted contributions are allowed, but contributors remain responsible for correctness and verification; bulk unreviewed AI-generated lessons are not acceptable.

## 12. Accessibility

Accessibility is a product requirement, not polish.

The documentation shell and learning components must support keyboard navigation, semantic structure, visible focus states, sufficient contrast, and screen-reader understandable labeling. Interactive visualizations should expose an equivalent textual or semantic representation where practical.

Automated accessibility checks should be added once the site scaffold exists, while recognizing that automated tooling does not replace manual review.

## 13. Performance principles

Normal reading pages should minimize client JavaScript. Prefer Server Components/static output for content and isolate interactive components to the sections that need them.

Do not load heavy playground runtimes globally. Sandpack/WebContainers should be lazy-loaded on lessons that use them.

The baseline reading and search experience must remain fast on ordinary mobile hardware and connections.

## 14. Security and privacy principles

The core site should not require user accounts or collect sensitive personal data.

Interactive examples must not expose project secrets or credentials. Arbitrary server-side execution is out of scope for the initial architecture. Browser execution should be sandboxed according to the chosen runtime's supported security model.

External AI integrations must make it clear when content is being handed to a third-party tool; the project should not silently send lesson or user data to model providers.

## 15. First vertical slice

The first implemented lesson should demonstrate the full product quality bar before the repository scales content production.

Recommended topic: **Avoiding sequential async waterfalls**.

It should exercise:

- documentation navigation;
- code highlighting;
- a mental model;
- bad vs. better code;
- an execution timeline visualization;
- a runnable example if it adds teaching value;
- an exercise;
- an agent-oriented rule;
- related links;
- primary sources;
- freshness metadata;
- Edit on GitHub.

Only after this vertical slice should repeated UI patterns be extracted into a general learning-component library.

## 16. Initial milestone

The first meaningful public milestone targets roughly 25 exceptional lessons across:

- engineering/computer-science foundations;
- JavaScript/TypeScript;
- React/web engineering;
- backend/distributed systems;
- AI-era engineering.

Quality, verification, and discoverability take precedence over lesson count.

## 17. Acceptance criteria for the foundation

The foundation is ready for implementation planning when:

- the mission and non-goals are explicit;
- the zero-cost guarantee is explicit;
- the canonical content model and freshness model are defined;
- the human/agent dual-consumption principle is defined;
- the initial stack is selected;
- the first vertical slice is selected;
- contribution and content standards are present;
- the roadmap separates foundation, scaffold, vertical slice, reusable primitives, and initial content expansion;
- there are no unresolved placeholders required to begin the docs-shell implementation.

This specification satisfies those criteria and is the source design for the first implementation plan once reviewed.
