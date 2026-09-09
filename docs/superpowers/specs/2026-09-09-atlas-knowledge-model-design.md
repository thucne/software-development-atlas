# Atlas Knowledge Model Design

**Date:** 2026-09-09  
**Status:** Proposed extension to the approved 2026-08-19 foundation design  
**Extends:** `docs/superpowers/specs/2026-08-19-atlas-foundation-design.md`

## 1. Purpose

Software Development Atlas already defines a domain-oriented information architecture, high-quality lesson contract, freshness model, and human/agent dual-consumption model. This design operationalizes the missing layer between those pieces: a canonical, machine-readable map of software-engineering knowledge.

The goal is to make Atlas growth coverage-driven rather than lesson-count-driven. Every substantive content item should have a deliberate place in the broader software-engineering landscape, an explicit content type, and an intended learning depth.

This design does not replace the existing foundation. It adds the knowledge-model contract required for future learning paths, coverage views, decision guides, and architecture walkthroughs.

## 2. Autonomous execution goal

An implementing agent should treat the following as the governing goal:

> Establish a canonical Software Engineering Map and extend Atlas metadata, validation, authoring guidance, agent guidance, and roadmap so that every substantive Atlas content item can be placed on stable software-engineering concepts, classified by content type, and assigned an intended learning depth. Iterate until all repository quality checks pass, all acceptance criteria in this design are satisfied, and a final self-review finds no unresolved inconsistencies, broken concept references, placeholder work, or unnecessary scope expansion.

### 2.1 Self-iteration loop

The implementation is not complete after code or documentation is written. The agent must repeat this loop until it exits cleanly:

1. Read this design, `AGENTS.md`, `CONTENT_GUIDE.md`, the current roadmap, and the files being changed.
2. Select the smallest incomplete acceptance criterion.
3. Add or update tests first when behavior or validation changes.
4. Implement the smallest change that satisfies that criterion.
5. Run the narrowest relevant test or validation command.
6. Inspect the diff for schema/content/docs drift and unintended scope.
7. Continue with the next incomplete criterion.
8. Run the full repository checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.
9. If any check fails, diagnose the root cause, fix it, and restart from the narrowest relevant validation before rerunning the full suite.
10. Perform a final self-review against this design, the existing foundation design, `CONTENT_GUIDE.md`, and `AGENTS.md`.
11. Stop only when every acceptance criterion is demonstrably satisfied and the full quality suite passes.

The agent must not silently weaken tests, make required metadata optional, delete existing checks, or expand into PR2/PR3 features merely to make completion easier.

## 3. Scope

This change establishes the knowledge-model foundation only.

It includes:

- a canonical machine-readable Software Engineering Map;
- stable domain and concept IDs;
- intended target depth for mapped concepts;
- explicit content types;
- explicit lesson learning depth;
- lesson-to-concept references;
- schema and cross-reference validation;
- migration of existing Atlas content;
- a human-readable map entry point;
- authoring and agent guidance;
- issue-template alignment;
- a coverage-oriented roadmap update.

It intentionally excludes:

- an interactive graph explorer;
- personalized progress tracking;
- user accounts;
- a coverage dashboard UI;
- automatic learning-path generation;
- new framework comparison content;
- new architecture walkthrough content;
- bulk-generated lessons;
- hosted AI inference;
- new runtime infrastructure.

## 4. Knowledge-map model

Create `content/atlas-map.json` as the canonical map artifact.

The map must remain simple, text-reviewable, machine-readable, and independent of application runtime behavior. JSON is selected so human contributors and coding agents can inspect and modify the artifact without importing TypeScript application code.

### 4.1 Required shape

Version 1 uses this conceptual shape:

```json
{
  "version": 1,
  "domains": [
    {
      "id": "web-platform",
      "title": "Web Platform",
      "question": "How does a browser communicate with and execute applications from the web?",
      "concepts": [
        {
          "id": "http",
          "title": "HTTP",
          "targetDepth": "reason"
        }
      ]
    }
  ]
}
```

The implementation may add narrowly useful descriptive fields if required by validation or rendering, but should not introduce speculative hierarchy, scoring, progress, ownership, or graph-edge systems in this PR.

### 4.2 Stable identifiers

Domain and concept IDs are stable logical identifiers, not display labels.

Requirements:

- domain IDs are unique;
- concept IDs are globally unique across the map;
- changing a display title must not require changing the ID;
- lesson references use concept IDs;
- agents must not invent ad-hoc lesson concept IDs that are absent from the canonical map.

### 4.3 Initial domains

Seed approximately 13 broad domains:

1. Computing Foundations
2. Programming & Runtimes
3. Web Platform
4. Frontend Engineering
5. Backend Engineering
6. Data Systems
7. Software Architecture
8. Distributed Systems
9. Cloud & Infrastructure
10. Testing & Quality
11. Delivery & Operations
12. Security
13. AI-Native Engineering

The map is intentionally not exhaustive. It should contain a representative first set of major concepts sufficient to guide broad curriculum growth. Empty or lightly populated future domains may be added later through deliberate changes.

## 5. Content types

Extend lesson metadata with required `contentType` using these values:

- `guide` — orientation, meta documentation, and start-here content;
- `concept` — concise mental-model content, generally suitable for a 5–10 minute read;
- `deep-dive` — rigorous long-form teaching such as the existing Event Loop lesson;
- `decision-guide` — compares alternatives and teaches selection trade-offs;
- `field-guide` — practical operational or troubleshooting guidance;
- `architecture-walkthrough` — traces a realistic system or workflow across several concepts.

Not every content type must exist in the repository after this PR. The schema and authoring contract should support them so future content can choose the smallest type that fits the learner need.

Interactive content is never implied by `deep-dive`, and lack of interaction does not make a piece lower quality.

## 6. Learning depth

Extend lesson metadata with required `learningDepth`:

- `recognize` — understand vocabulary, purpose, and basic placement;
- `reason` — explain behavior, alternatives, trade-offs, and common failure modes;
- `operate` — design, debug, validate, or operate the subject in realistic production contexts.

Learning depth is distinct from `level`.

- `level` measures prerequisite difficulty.
- `learningDepth` measures the capability a learner should have after completing the content.

The map's `targetDepth` uses the same enum and expresses the intended Atlas-wide depth for that concept, not the promise of any one lesson.

## 7. Lesson-to-concept mapping

Extend normal content frontmatter with required `concepts: string[]`.

Rules:

- substantive technical content should reference one or more canonical concept IDs;
- start-here/meta guides may use `concepts: []`;
- duplicate concept IDs within one content item are invalid;
- unknown concept IDs are invalid;
- `topics` remain loose discovery tags and are not replaced;
- `technologies` remain technology labels and are not replaced;
- `concepts` are canonical placement within the Atlas knowledge map.

## 8. Validation architecture

Create a dedicated map schema module, expected at `lib/content/atlas-map-schema.ts`, and extend the existing lesson schema in `lib/content/schema.ts`.

Validation must cover at least:

- map shape and supported version;
- valid `targetDepth` values;
- unique domain IDs;
- globally unique concept IDs;
- valid `contentType` values;
- valid `learningDepth` values;
- required `concepts` metadata;
- no duplicate concept references within one lesson;
- every lesson concept reference resolves to the canonical map.

Tests should make invalid knowledge-model states fail locally and in existing CI.

Do not add a runtime database or hosted validation service.

## 9. Initial content migration

Existing Atlas pages must be migrated so the new metadata is required immediately rather than introduced as optional debt.

Expected classification:

- start-here and Atlas meta pages: `contentType: guide`, generally `learningDepth: recognize`, `concepts: []`;
- Promises: `contentType: deep-dive`, generally `learningDepth: reason`;
- Browser Event Loop: `contentType: deep-dive`, generally `learningDepth: reason`;
- Avoiding Sequential Async Waterfalls: `contentType: deep-dive`, generally `learningDepth: reason`.

Exact concept IDs should be selected from the final canonical map and remain internally consistent with prerequisite and related-topic language.

## 10. Human-readable Software Engineering Map

Add a start-here page at `content/docs/start-here/software-engineering-map.mdx`.

The page should explain:

- why Atlas has a knowledge map;
- the relationship among domains, concepts, lessons, future learning paths, and decision content;
- that the map describes coverage rather than a mandatory linear curriculum;
- how a contributor or learner should use it.

A simple static or Mermaid overview is acceptable. Do not build an interactive graph explorer in this change.

Where practical, the page should derive or reference canonical map data rather than hand-maintaining a second exhaustive copy of the concept list.

## 11. Authoring guidance

Update `CONTENT_GUIDE.md` to define:

- content types and when to use each;
- learning depth and its distinction from difficulty;
- canonical Atlas concept placement;
- the rule that not every concept needs a deep interactive lesson;
- guidance to prefer the smallest content type that teaches the intended outcome;
- guidance for concept-vs-technology distinction.

The existing lesson anatomy remains a strong default for deep-dive content but must no longer be interpreted as a mandatory structure for every knowledge artifact.

## 12. Agent guidance

Update `AGENTS.md` so coding/content agents follow this workflow before proposing Atlas content:

1. inspect the canonical map;
2. identify existing concept IDs that the content covers;
3. add a canonical concept deliberately if the map truly lacks one;
4. choose the smallest suitable content type;
5. choose the intended learning depth;
6. prefer important uncovered concepts over redundant content;
7. preserve map/schema consistency and run knowledge-model validation.

Agents must not create lesson-only concept IDs that bypass the map.

## 13. Contribution workflow

Update the new-content GitHub issue form to capture:

- Atlas domain/concept placement;
- proposed content type;
- target learning depth;
- existing learner outcome, prerequisite, freshness, interactivity, and primary-source information.

Renaming the issue form from `New lesson` to `New Atlas content` is in scope if it improves consistency without adding unrelated workflow changes.

## 14. Roadmap alignment

Update `docs/roadmap.md` so early Atlas growth is evaluated by representative high-value coverage and graph connectivity, not only raw lesson count.

The roadmap may retain an approximate first-public-milestone content count, but should explicitly prioritize:

- coverage across core domains;
- important concept gaps;
- prerequisite connectivity;
- a balanced mix of concise and deep content;
- future learning paths;
- future decision guides and architecture walkthroughs.

Do not implement those future UI/content systems in this change.

## 15. Historical design treatment

Do not rewrite the 2026-08-19 foundation design to pretend this model existed earlier. This design is an explicit dated extension.

References in `AGENTS.md` and other project documentation should point to the current relevant design when architecture/content-model changes are being made.

## 16. Testing strategy

Follow the repository's existing Vitest and Playwright patterns.

At minimum:

- extend `tests/content-schema.test.ts` for new lesson enums and required metadata;
- add map-schema/uniqueness tests;
- add cross-reference validation tests for unknown and duplicate concept IDs;
- ensure the existing content set passes the new validation;
- preserve existing E2E behavior and accessibility checks.

No UI-specific E2E test is required solely for the map unless the new start-here page introduces behavior beyond normal Fumadocs rendering/navigation.

## 17. Quality gates

Before completion, run successfully:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

A passing subset is not sufficient for final completion.

## 18. Acceptance criteria

This design is implemented when all of the following are true:

- [ ] `content/atlas-map.json` exists and is schema validated.
- [ ] The map contains approximately 13 broad software-engineering domains.
- [ ] The initial map contains a representative set of major concepts with stable IDs.
- [ ] Domain IDs are unique and concept IDs are globally unique.
- [ ] Map concept target depth is validated.
- [ ] Normal Atlas content requires `contentType`.
- [ ] Normal Atlas content requires `learningDepth`.
- [ ] Normal Atlas content requires `concepts`.
- [ ] Invalid content-type and learning-depth values fail validation.
- [ ] Duplicate per-content concept references fail validation.
- [ ] Unknown concept references fail validation.
- [ ] Existing content is migrated to the new metadata contract.
- [ ] A human-readable Software Engineering Map page exists under Start Here.
- [ ] `CONTENT_GUIDE.md` documents the new knowledge model and content types.
- [ ] `AGENTS.md` instructs agents to use the canonical map and validate references.
- [ ] The new-content issue workflow captures map placement, type, and learning depth.
- [ ] The roadmap explicitly adopts coverage-driven growth.
- [ ] The approved 2026-08-19 foundation design remains historical rather than silently rewritten.
- [ ] No new paid/runtime infrastructure is introduced.
- [ ] No PR2/PR3 UI or bulk-content scope is pulled into this change.
- [ ] `pnpm lint` passes.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] `pnpm test:e2e` passes.
- [ ] Final diff review finds no unresolved placeholders, contradictory terminology, or duplicated source-of-truth data.

## 19. Completion rule

An agent may report this work complete only after it can provide concrete evidence that every acceptance criterion above is satisfied. If repository tooling, environment limitations, or permissions prevent a criterion from being verified, the work must be reported as incomplete with the exact blocked criterion rather than guessed successful.
