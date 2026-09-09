# AGENTS.md

Instructions for coding agents and automated contributors working in this repository.

## Mission

Software Development Atlas is a living, open-source knowledge system for software engineering. Optimize for correctness, depth, referenceability, accessibility, broad high-value coverage, and long-term maintainability.

## Hard constraints

1. **Zero-cost core:** do not introduce a required maintainer-funded API, payment method, or usage-based cloud service.
2. **Git is the content source of truth:** do not introduce a required CMS or database for authored content without an approved architecture change.
3. **Canonical map is the concept source of truth:** `content/atlas-map.json` owns stable domain/concept IDs. Do not create a second concept registry.
4. **Human and agent readability:** essential content must remain meaningful as text/Markdown.
5. **Freshness is explicit:** evolving and frontier claims must carry verification metadata and should rely on primary sources.
6. **Accessibility is required:** interactive UI must be keyboard usable and should expose semantic/non-visual alternatives where practical.
7. **Do not bulk-generate content:** quality, coverage value, and verification are more important than page count.
8. **Do not weaken metadata validation:** required placement metadata must stay required; fix authored content rather than making the schema optional.
9. **Do not game coverage:** never add incidental concept references merely to increase a domain or learning-path coverage count.

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

Read `CONTENT_GUIDE.md` and inspect `content/atlas-map.json`.

For a new content item:

1. identify the canonical concepts it teaches or applies;
2. choose the smallest useful `contentType`;
3. declare the intended `learningDepth`;
4. reference existing canonical concept IDs whenever possible;
5. if a genuinely new concept is needed, add it deliberately to the appropriate map domain before using the ID in frontmatter;
6. never invent an ad-hoc concept ID only to make one page compile;
7. prefer filling important uncovered territory or strengthening useful connections over duplicating an existing explanation.

For factual changes:

- determine whether the claim is evergreen, evolving, or frontier;
- verify evolving/frontier behavior against primary sources;
- preserve or update `lastVerified` intentionally;
- do not update verification dates for unrelated wording changes.

## Content placement contract

Normal authored MDX must declare:

- `contentType`: `guide | concept | deep-dive | decision-guide | field-guide | architecture-walkthrough`;
- `learningDepth`: `recognize | reason | operate`;
- `concepts`: canonical IDs from `content/atlas-map.json`.

`category` remains navigation-oriented and `topics` remain flexible discovery tags. Neither replaces canonical `concepts`.

Start-here/meta guides may use `concepts: []` when they do not teach a software-engineering concept. Substantive engineering content should map only to concepts it genuinely teaches; do not inflate coverage with incidental mentions.

Not every concept requires an interactive deep dive. Prefer a focused `concept` page when that communicates the mental model adequately. Use a `decision-guide` when the learner need is choosing among alternatives, and an `architecture-walkthrough` when the learning value is in cross-component boundaries and flow.

## Learning paths and coverage

`content/learning-paths.json` is the canonical source for curated path **order and learning intent only**. It is not a concept registry and must not duplicate authored page URLs.

When changing a learning path:

1. use only concept IDs that already exist in `content/atlas-map.json`;
2. preserve deliberate ordering around learner outcomes rather than current page availability;
3. allow important uncovered concepts to remain in the path;
4. do not add or remove concepts merely to make the displayed coverage percentage look better;
5. let available content links derive from validated MDX `concepts` frontmatter;
6. run learning-path, coverage, build, and E2E validation.

Atlas coverage currently means only that at least one substantive authored page references a canonical concept. It does not mean learner mastery, content quality, freshness health, or importance.

## Before changing architecture

Read `docs/superpowers/specs/2026-08-19-atlas-foundation-design.md`, the current roadmap, and any later approved design that governs the area being changed.

For the knowledge model, read `docs/superpowers/specs/2026-09-09-atlas-knowledge-model-design.md`.

For learning paths and coverage, read `docs/superpowers/specs/2026-09-09-learning-paths-coverage-design.md`.

Significant architectural changes should begin with an issue/design discussion rather than an implementation-first pull request.

## Implementation behavior

- Prefer small, focused modules with clear boundaries.
- Avoid speculative abstractions. Extract reusable learning primitives after real content demonstrates the need.
- Keep static/build-time behavior as the default; add runtime infrastructure only when there is a demonstrated product requirement.
- Keep the site portable across hosts where reasonable.
- Minimize client JavaScript on normal reading pages.
- Do not make JavaScript-heavy interactive features block access to the content text.
- If a rule can be enforced reliably by schema, tests, types, linting, or CI, prefer that machine-checkable guardrail over prose alone.

## Validation expectations

Run the repository-defined format/lint, type-check, tests, content validation, accessibility checks, and build commands relevant to the change. Do not claim success without running available checks.

For examples that can execute, prefer automated verification over visual inspection alone.

For changes to the Atlas map or placement metadata, verify at minimum that:

- domain IDs are unique;
- concept IDs are globally unique;
- IDs use lowercase kebab-case;
- all authored concept references resolve to the canonical map;
- no authored content repeats a concept ID.

For learning-path changes, verify at minimum that:

- path IDs are unique lowercase kebab-case;
- every path concept resolves to the canonical map;
- a path does not repeat a concept ID;
- uncovered concepts remain visible;
- content recommendations are derived rather than hand-maintained.

## Pull requests

Keep changes focused and explain:

- what changed;
- why it changed;
- any user/developer impact;
- how it was validated;
- whether the change affects the zero-cost guarantee or freshness model;
- for content/knowledge-model changes, which map coverage or learning outcome it improves.
