# Learning Paths and Coverage Design

**Date:** 2026-09-09  
**Status:** Approved implementation scope following PR #9  
**Extends:** `docs/superpowers/specs/2026-09-09-atlas-knowledge-model-design.md`

## 1. Purpose

PR #9 established the canonical Software Engineering Map, stable concept IDs, content types, learning depth, and content-to-concept placement. This design adds the next layer: curated learning paths and a truthful coverage experience derived from that canonical data.

The goal is to let a learner answer two questions without turning the Atlas into one mandatory curriculum:

1. *What sequence should I follow for a useful engineering goal?*
2. *Which parts of that sequence or domain already have Atlas content, and which are still uncovered?*

## 2. Scope

This PR includes:

- a canonical machine-readable learning-path artifact;
- validation of learning-path IDs, concept references, ordering, and duplicates;
- four curated initial paths aligned with the roadmap;
- pure coverage computation from the Atlas map and authored content placement;
- static, server-rendered coverage and learning-path presentation components;
- a Learning Paths documentation section;
- a Coverage start-here page;
- tests and contribution/agent guidance for path maintenance.

This PR intentionally excludes:

- user accounts or personalized progress;
- completion tracking;
- recommendations based on user history;
- automatic path generation by AI;
- an interactive graph explorer;
- path-specific copies of concept explanations;
- new paid/runtime infrastructure;
- decision-guide or architecture-walkthrough content from PR3.

## 3. Canonical learning-path data

Create `content/learning-paths.json` as the single source of truth for curated path ordering.

Version 1 shape:

```json
{
  "version": 1,
  "paths": [
    {
      "id": "modern-web-systems",
      "title": "Modern Web Systems",
      "description": "Build a systems-level mental model of the modern web.",
      "audience": "Software engineers who want to reason across browser, network, frontend, and backend boundaries.",
      "targetDepth": "reason",
      "outcomes": [
        "Trace a request from browser to application and back.",
        "Compare major frontend rendering approaches by constraints and trade-offs."
      ],
      "concepts": [
        "dns-resolution",
        "http-request-lifecycle",
        "tls-and-https"
      ]
    }
  ]
}
```

Learning paths contain ordered canonical concept IDs. They do **not** hand-maintain page URLs or duplicate lesson mappings. Recommended content is derived from authored `concepts` frontmatter.

## 4. Initial paths

Seed these four paths from the roadmap:

1. `modern-web-systems`
2. `backend-systems`
3. `cloud-architecture-for-software-engineers`
4. `ai-native-software-engineering`

Each path should contain a meaningful ordered slice of existing map concepts, including currently uncovered concepts where necessary. An uncovered step is useful information, not an error.

## 5. Validation contract

Create `lib/content/learning-paths.ts` using Zod.

Validation must enforce:

- version `1`;
- lowercase kebab-case path IDs;
- unique path IDs;
- non-empty title, description, audience, and outcomes;
- valid `targetDepth` using the existing `learningDepthSchema`;
- at least two concepts per path;
- no duplicate concept IDs within one path;
- every concept ID resolves to `content/atlas-map.json`.

The module exports parsed data and a stable lookup helper for presentation code.

## 6. Coverage model

Create `lib/content/coverage.ts` as a pure module.

Coverage is intentionally simple in this PR:

- a concept is **covered** when at least one authored page references that concept in canonical frontmatter;
- otherwise it is **uncovered**;
- domain coverage is `covered concepts / total concepts`;
- path coverage is computed with the same rule;
- one page may cover multiple concepts;
- multiple pages may cover one concept.

Coverage does not claim mastery, quality score, freshness health, or learner completion.

Presentation code should pass authored page placements into the pure coverage functions. The pure module must not depend on Fumadocs or React.

## 7. Content recommendation derivation

For each canonical concept, presentation code derives recommended content from `source.getPages()` and each page's validated `concepts` frontmatter.

This preserves a single placement source of truth:

```text
content/atlas-map.json
        +
MDX concepts[] frontmatter
        ↓
coverage + recommended content
```

`content/learning-paths.json` only owns path ordering and path-level learning intent.

## 8. Presentation architecture

Add small server-rendered components under `components/atlas/`:

- `AtlasCoverage` — domain-level coverage summary;
- `LearningPathsOverview` — lists curated paths and their current coverage;
- `LearningPath` — renders one ordered path, concept target depth, availability state, and derived content links.

These components must remain server/static friendly and introduce no `use client` boundary solely for this feature.

Use semantic HTML, visible text labels, and ordinary links. Coverage bars may use native `<progress>` with adjacent text so the meaning remains understandable without styling.

## 9. Documentation pages

Add:

- `content/docs/start-here/coverage.mdx`
- `content/docs/learning-paths/index.mdx`
- `content/docs/learning-paths/modern-web-systems.mdx`
- `content/docs/learning-paths/backend-systems.mdx`
- `content/docs/learning-paths/cloud-architecture-for-software-engineers.mdx`
- `content/docs/learning-paths/ai-native-software-engineering.mdx`
- `content/docs/learning-paths/meta.json`

The MDX pages provide orientation and embed the server-rendered components. They must not duplicate the full canonical concept explanations.

Update root/start-here navigation so learners can discover both coverage and learning paths.

All new MDX pages follow the required Atlas metadata contract. Meta/index pages may use `concepts: []`; path pages should reference only concepts they materially frame or teach in their authored prose. The path component itself does not inflate page coverage automatically.

## 10. Agent and contributor guidance

Update `AGENTS.md`, `CONTENT_GUIDE.md`, and `CONTRIBUTING.md` narrowly:

- learning paths are curated sequences, not a second concept registry;
- path concept IDs must already exist in the Atlas map;
- uncovered concepts are allowed;
- content recommendations are derived and must not be manually duplicated in path data;
- do not optimize coverage metrics by attaching incidental concept IDs to content.

## 11. Testing strategy

Follow TDD for behavior changes.

Add tests for:

- learning-path schema and lookup;
- duplicate/unknown concept rejection;
- coverage calculation using small fixtures;
- server-rendered semantic markup for coverage/path components;
- Playwright navigation and rendering for Coverage and one representative learning path;
- axe serious/critical accessibility checks on the new experience.

Existing full CI remains the final gate:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 12. Acceptance criteria

- [ ] `content/learning-paths.json` exists and is validated.
- [ ] Four initial curated paths exist.
- [ ] Path IDs are unique lowercase kebab-case.
- [ ] Duplicate path concept references fail validation.
- [ ] Unknown path concept references fail validation.
- [ ] Path data does not duplicate authored page URLs.
- [ ] Coverage is derived from canonical map + MDX concept placement.
- [ ] Domain coverage distinguishes covered from uncovered concepts.
- [ ] Path pages show ordered concepts and derived available content.
- [ ] Uncovered path concepts render honestly rather than disappearing.
- [ ] Coverage and path UI are server-rendered without a new client boundary.
- [ ] Coverage and Learning Paths are discoverable in docs navigation.
- [ ] Agent/contributor guidance matches the implementation.
- [ ] No progress tracking, user accounts, auto-generation, or PR3 content is introduced.
- [ ] Full CI passes on the PR head.
- [ ] Final whole-branch review has no blocking findings.

## 13. Autonomous iteration rule

The implementing agent must iterate until all acceptance criteria are satisfied and current-head CI is green. Any failed test or review finding requires a root-cause fix, narrow re-verification, then a fresh full CI run. Do not weaken the canonical concept contract or hide uncovered concepts to make coverage appear better.