# AGENTS.md

Instructions for coding agents and automated contributors working in this repository.

## Mission

Software Development Atlas is a living, open-source knowledge system for software engineering. Optimize for correctness, depth, referenceability, accessibility, and long-term maintainability.

## Hard constraints

1. **Zero-cost core:** do not introduce a required maintainer-funded API, payment method, or usage-based cloud service.
2. **Git is the content source of truth:** do not introduce a required CMS or database for authored lessons without an approved architecture change.
3. **Human and agent readability:** essential lesson content must remain meaningful as text/Markdown.
4. **Freshness is explicit:** evolving and frontier claims must carry verification metadata and should rely on primary sources.
5. **Accessibility is required:** interactive UI must be keyboard usable and should expose semantic/non-visual alternatives where practical.
6. **Do not bulk-generate content:** quality and verification are more important than lesson count.

## Planned implementation direction

Until superseded by an approved design change:

- Next.js 16
- React
- TypeScript
- Fumadocs + MDX
- Tailwind CSS
- pnpm
- build-time/client-side search first
- Sandpack for lightweight runnable examples
- WebContainers only for lessons that benefit from an actual in-browser Node.js environment

Do not add paid search, hosted embeddings, a hosted vector database, or a server-side model API as a requirement for core functionality.

## Before changing content

Read `CONTENT_GUIDE.md`.

For factual changes:

- determine whether the claim is evergreen, evolving, or frontier;
- verify evolving/frontier behavior against primary sources;
- preserve or update `lastVerified` intentionally;
- do not update verification dates for unrelated wording changes.

## Before changing architecture

Read `docs/superpowers/specs/2026-08-19-atlas-foundation-design.md` and the current roadmap. Significant architectural changes should begin with an issue/design discussion rather than an implementation-first pull request.

## Implementation behavior

- Prefer small, focused modules with clear boundaries.
- Avoid speculative abstractions. Extract reusable learning primitives after a real lesson demonstrates the need.
- Keep static/build-time behavior as the default; add runtime infrastructure only when there is a demonstrated product requirement.
- Keep the site portable across hosts where reasonable.
- Minimize client JavaScript on normal reading pages.
- Do not make JavaScript-heavy interactive features block access to the lesson text.

## Validation expectations

When implementation exists, run the repository-defined format, type-check, test, content-validation, accessibility, and build commands relevant to the change. Do not claim success without running available checks.

For examples that can execute, prefer automated verification over visual inspection alone.

## Pull requests

Keep changes focused and explain:

- what changed;
- why it changed;
- any user/developer impact;
- how it was validated;
- whether the change affects the zero-cost guarantee or freshness model.
