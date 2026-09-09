# AGENTS.md

Instructions for coding agents and automated contributors working in this repository.

## Mission

Software Development Atlas is a living, open-source knowledge system for software engineering. Optimize for correctness, depth, referenceability, accessibility, broad high-value coverage, engineering judgment, and long-term maintainability.

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
10. **Do not turn judgment content into a decision engine:** comparison matrices and walkthroughs support reasoning; they do not create a second registry, universal ranking, or mandatory architecture.

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

### Content clarity checklist

Apply the canonical **Atlas Clarity Contract** and **Atlas Teaching Contract** in `CONTENT_GUIDE.md` to new or materially revised prose. Before committing content, check that:

1. formal terms are defined before the explanation depends on them;
2. references such as “this,” “that,” “above,” or “here” still make sense when the section is retrieved by itself;
3. browser/runtime/provider/language scope is explicit when a behavior is not universal;
4. words such as “better,” “cheap,” “fast,” “strong fit,” or “usually” identify the comparison dimension or conditions that make them true;
5. code examples, output traces, diagrams, and decision matrices are treated as factual claims and executed/tested where practical;
6. TL;DRs lead with the practical model and central mistake to avoid rather than nonessential specification or provider trivia;
7. specification/API guarantees, implementation freedom, and engineering heuristics are not presented as though they were the same kind of claim;
8. topic-specific terminology that could block a working software developer is explained locally in plain language;
9. use a visible `TermBox` near the first substantive use when a difficult term would otherwise create a learning barrier;
10. do not overuse terminology boxes for ordinary working-developer vocabulary or create a wall of definitions before the concrete model;
11. **Strict language purity:** never mix languages within a single file. English lessons (`*.mdx`) must be 100% English (including placeholder prompts, headings, and micro-scenarios). Localized companion lessons (`*.vi.mdx`) must be 100% Vietnamese.

Do not solve these editorial requirements by adding a generic prose linter, readability score, banned-pronoun rule, jargon detector, or model-based judge. Automate only narrow facts that can be checked reliably; use source-backed review for editorial judgment.

### Visual pacing and lesson engagement rules

To maintain an engaging, highly scannable, and pedagogy-first learning experience without turning lessons into wall-of-text documentation:

1. **High-frequency visual cadence:** Substantive lessons (`deep-dive`, `decision-guide`, `architecture-walkthrough`) must maintain a steady rhythm of visual breaks. Target **1 visual anchor (illustration or diagram) per 1–2 conceptual sections**, with a minimum of **3–4 visual anchors per substantive lesson**.
2. **Standardized Illustration Placeholders:** When actual image assets (SVG/PNG) are not yet authored, insert an explicit placeholder blockquote using the language matching the file:
   - For English lessons (`*.mdx`):
     ```markdown
     > 🖼️ **[Illustration Placeholder: <Descriptive Title>]**  
     > *Illustration prompt:* <Detailed prompt specifying diagram layout, nodes/lanes, data flow direction, and key technical insights to draw>
     ```
   - For Vietnamese companion lessons (`*.vi.mdx`):
     ```markdown
     > 🖼️ **[Illustration Placeholder: <Tiêu đề mô tả>]**  
     > *Mô tả hình minh họa:* <Chi tiết bố cục khung hình, các khối thành phần, luồng dữ liệu và insight kỹ thuật then chốt>
     ```
   Always provide a thorough prompt matching the document language so human designers or subsequent agent tasks can draft the graphic without guessing.
3. **Mermaid for structural flows:** Use Mermaid diagrams (`mermaid` code block) for decision trees, state machines, sequence diagrams, and boundary topologies whenever static diagrams communicate system flow clearly.
4. **Real-world production micro-scenarios:** Include concrete production failure stories (e.g., cascading retry storms, phantom client cache 200s, microtask UI freezes, swallowed error state corruption) in every deep dive and decision guide. Structure them with three explicit parts matching the document language:
   - For English (`*.mdx`):
     - **Impact:** The observable symptom, latency spike, or data inconsistency.
     - **Root cause:** The mental model disconnect or flawed assumption.
     - **Correct pattern:** The robust code pattern or architecture fix.
   - For Vietnamese (`*.vi.mdx`):
     - **Hậu quả:** Triệu chứng thực tế trên production, độ trễ hoặc lỗi sai dữ liệu.
     - **Nguyên nhân cốt lõi:** Lỗ hổng trong mô hình tư duy hoặc giả định sai lầm.
     - **Cách khắc phục chuẩn:** Mẫu code chuẩn hoặc giải pháp kiến trúc khắc phục triệt để.
5. **Interactive mental-model self-checks:** Format exercises and quizzes with `<details><summary>Show the reasoning</summary>...</details>` (or `<details><summary>Xem giải thích chi tiết</summary>...</details>` in Vietnamese) so learners can pause and test their intuition before revealing the explanation.
6. **Actionable task-list checklists:** Conclude review sections and agent rules with markdown task lists (`- [ ] **<Keyword>:** ...`) rather than generic numbered questions. The site's CSS provides a hanging-indent layout for checklist items.
7. **TermBox moderation:** Restrict `<TermBox>` to genuine learning barriers (typically 2–3 per page max). Define terms near their first substantive use and never build an introductory definition wall.

## Content placement contract

Normal authored MDX must declare:

- `contentType`: `guide | concept | deep-dive | decision-guide | field-guide | architecture-walkthrough`;
- `learningDepth`: `recognize | reason | operate`;
- `concepts`: canonical IDs from `content/atlas-map.json`.

`category` remains navigation-oriented and `topics` remain flexible discovery tags. Neither replaces canonical `concepts`.

Start-here/meta guides may use `concepts: []` when they do not teach a software-engineering concept. Substantive engineering content should map only to concepts it genuinely teaches; do not inflate coverage with incidental mentions.

Not every concept requires an interactive deep dive. Prefer a focused `concept` page when that communicates the mental model adequately. Use a `decision-guide` when the learner need is choosing among alternatives, and an `architecture-walkthrough` when the learning value is in cross-component boundaries and flow.

### Bilingual / Multilingual content contract

1. **File naming convention:**
   - English (default locale): `path/to/slug.mdx` (e.g. `promises.mdx`, served at `/docs/...`).
   - Vietnamese companion: `path/to/slug.vi.mdx` (e.g. `promises.vi.mdx`, served at `/vi/docs/...`).
2. **Concept synchronization:** Localized companion files (`*.vi.mdx`) must declare the exact same canonical `concepts` list as the primary English file.
3. **No coverage double-counting:** Coverage metrics and map placement derive from the canonical English set (`source.getPages('en')`). Translations provide bilingual accessibility without duplicating knowledge nodes or inflating coverage statistics.
4. **Strict single-language purity:** No mixed languages in any file. English lessons must not contain Vietnamese placeholder prompts or section headers; Vietnamese lessons must not leave unadapted English prose.

## Engineering judgment content

Engineering Judgment is a top-level docs section, not a new data model. Keep decision guides and architecture walkthroughs as canonical MDX with normal Atlas metadata.

When authoring a `decision-guide`:

1. frame the engineering decision and constraints before discussing products or frameworks;
2. compare the alternatives using explicit criteria that can change the choice;
3. include operational/failure consequences, not only feature differences;
4. give conditional heuristics instead of naming a universal winner;
5. use `DecisionMatrix` only when a static semantic table improves scanning;
6. keep the explanatory reasoning in Markdown so the matrix never becomes the sole source of meaning.

When authoring an `architecture-walkthrough`:

1. state the scenario and important assumptions;
2. trace boundaries and data flow end-to-end;
3. use the repo's existing Mermaid support for static system flow before inventing a new diagram component;
4. make transaction/consistency boundaries explicit where relevant;
5. examine duplicate requests, timeouts, retries, redelivery, and partial failure where relevant;
6. cover security, observability, scaling/cost, and credible alternatives;
7. describe the topology as a reference shape, not a mandatory architecture.

Do not create a judgment JSON registry, scoring model, recommendation engine, or duplicated concept/page mapping unless a later approved design explicitly requires it.

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

For Engineering Judgment content and its reusable primitive, read `docs/superpowers/specs/2026-09-09-engineering-judgment-design.md`.

For content reliability and clarity changes, read `docs/superpowers/specs/2026-09-09-content-reliability-clarity-design.md`.

For Atlas-wide teaching clarity and terminology support, read `docs/superpowers/specs/2026-09-09-teaching-clarity-system-design.md`.

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

For Engineering Judgment changes, verify representative routes render, `DecisionMatrix` remains semantic/static, authored metadata is valid, and serious/critical accessibility violations are absent on representative pages.

## Pull requests

Keep changes focused and explain:

- what changed;
- why it changed;
- any user/developer impact;
- how it was validated;
- whether the change affects the zero-cost guarantee or freshness model;
- for content/knowledge-model changes, which map coverage or learning outcome it improves.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
