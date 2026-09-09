# Learning Paths and Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add validated curated learning paths and a static coverage experience derived from the canonical Atlas map and authored content placement.

**Architecture:** `content/learning-paths.json` owns only ordered path intent. `lib/content/learning-paths.ts` validates it against canonical Atlas concept IDs. `lib/content/coverage.ts` remains a pure calculation layer; server-rendered Atlas components combine that with `source.getPages()` so recommended content and coverage derive from existing MDX frontmatter rather than a second registry.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 6.0.3, Zod 4.1.11, Fumadocs, Vitest 4.1.10, Playwright 1.62.1, axe-core 4.12.1, pnpm 10.15.1.

**Spec:** `docs/superpowers/specs/2026-09-09-learning-paths-coverage-design.md`

## Global Constraints

- Preserve `content/atlas-map.json` as the only canonical concept registry.
- Learning-path data must not contain authored page URLs.
- Uncovered concepts are valid and must remain visible.
- Coverage means only `has at least one authored content reference`; do not imply mastery, quality, freshness, or learner completion.
- Do not add `use client` solely for learning paths or coverage.
- Do not add accounts, progress tracking, automatic path generation, paid services, or PR3 content.
- Follow TDD for production behavior: write a failing test, observe the expected failure, then implement the minimum code.
- Final verification requires `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.

---

### Task 1: Define and validate canonical learning paths

**Files:**
- Test: `tests/learning-paths.test.ts`
- Create: `content/learning-paths.json`
- Create: `lib/content/learning-paths.ts`

**Interfaces:**
- Consumes: `atlasConceptIds` and `learningDepthSchema` from `lib/content/atlas-map.ts`.
- Produces: `learningPathsSchema`, `learningPaths`, `LearningPathDefinition`, and `getLearningPath(id: string)`.

- [ ] **Step 1: Add failing path-schema tests**

Create `tests/learning-paths.test.ts` that imports the not-yet-existing module and asserts:

```ts
import {
  getLearningPath,
  learningPaths,
  learningPathsSchema,
} from '@/lib/content/learning-paths';
import { describe, expect, it } from 'vitest';

describe('learning paths', () => {
  it('loads the four curated path ids', () => {
    expect(learningPaths.paths.map((path) => path.id)).toEqual([
      'modern-web-systems',
      'backend-systems',
      'cloud-architecture-for-software-engineers',
      'ai-native-software-engineering',
    ]);
  });

  it('looks up a path by id', () => {
    expect(getLearningPath('backend-systems').title).toBe('Backend Systems');
  });

  it('rejects duplicate concept ids inside a path', () => {
    const invalid = structuredClone(learningPaths);
    invalid.paths[0].concepts = ['dns-resolution', 'dns-resolution'];
    expect(() => learningPathsSchema.parse(invalid)).toThrow(/Duplicate Atlas concept id/);
  });

  it('rejects unknown concept ids', () => {
    const invalid = structuredClone(learningPaths);
    invalid.paths[0].concepts = ['dns-resolution', 'missing-concept'];
    expect(() => learningPathsSchema.parse(invalid)).toThrow(/Unknown Atlas concept id/);
  });
});
```

- [ ] **Step 2: Open a draft PR and verify RED in CI**

Push the test-only state through the existing branch/PR workflow. Expected: CI fails because `@/lib/content/learning-paths` does not exist.

- [ ] **Step 3: Add `content/learning-paths.json`**

Seed exactly the four roadmap paths. Each path includes `id`, `title`, `description`, `audience`, `targetDepth`, `outcomes`, and ordered canonical `concepts`. Do not include page slugs or URLs.

- [ ] **Step 4: Implement the Zod loader**

Create `lib/content/learning-paths.ts`. Validate version 1, kebab-case IDs, unique path IDs, at least one outcome, at least two concepts, valid learning depth, no duplicate concepts, and no unknown concepts. `getLearningPath` throws a clear error for unknown IDs.

- [ ] **Step 5: Run CI/narrow tests and confirm GREEN**

Expected: path tests pass; any unrelated failures are investigated before continuing.

---

### Task 2: Add pure Atlas coverage calculation

**Files:**
- Test: `tests/coverage.test.ts`
- Create: `lib/content/coverage.ts`

**Interfaces:**
- Produces:
  - `ContentPlacement = { title: string; url: string; concepts: readonly string[] }`
  - `buildConceptContentIndex(placements)`
  - `buildDomainCoverage(map, placements)`
  - `buildPathCoverage(path, placements)`

- [ ] **Step 1: Write failing coverage tests**

Use small fixture placements and assert:

```ts
const placements = [
  { title: 'Promises', url: '/docs/promises', concepts: ['promises'] },
  { title: 'Event Loop', url: '/docs/event-loop', concepts: ['browser-event-loop'] },
];
```

Tests must prove:

- one concept can resolve to multiple pages;
- covered/uncovered status comes only from placement references;
- domain counts use the canonical concept inventory;
- path steps preserve path order and expose derived content arrays;
- an uncovered path concept remains present with `content: []`.

- [ ] **Step 2: Verify RED**

Expected failure: `@/lib/content/coverage` does not exist.

- [ ] **Step 3: Implement the pure coverage helpers**

No React, Fumadocs, filesystem, or Next.js imports. Use `Map`/`Set` for repeated lookup. Preserve canonical order from the map/path inputs.

- [ ] **Step 4: Verify GREEN**

Run the coverage tests and then the unit suite.

---

### Task 3: Add server-rendered Atlas presentation components

**Files:**
- Test: `tests/atlas-presentation.test.ts`
- Create: `components/atlas/atlas-coverage.tsx`
- Create: `components/atlas/learning-path.tsx`
- Create: `components/atlas/learning-paths-overview.tsx`
- Create: `components/atlas/content-placements.ts`
- Modify: `components/mdx.tsx`

**Interfaces:**
- `getContentPlacements()` maps `source.getPages()` to the pure `ContentPlacement` shape.
- `AtlasCoverage()` renders domain coverage.
- `LearningPathsOverview()` renders all curated paths with derived path coverage.
- `LearningPath({ pathId }: { pathId: string })` renders one ordered path.

- [ ] **Step 1: Write failing server-render contract tests**

Use `renderToStaticMarkup` and assert:

- `AtlasCoverage` exposes a heading/section per domain and native `<progress>` with adjacent `covered / total` text;
- `LearningPath` preserves ordered concept labels;
- available concepts render normal docs links;
- uncovered concepts render visible `No Atlas content yet` text;
- no component requires client-only event handlers.

For deterministic tests, export small presentational render helpers/components that accept coverage data, while the default server wrappers obtain repository data.

- [ ] **Step 2: Verify RED**

Expected failure: Atlas presentation modules do not exist.

- [ ] **Step 3: Implement data adapter and server components**

Keep authored page extraction isolated in `content-placements.ts`. Do not duplicate coverage logic inside components. Use semantic `section`, ordered lists for path steps, ordinary anchors/Next links, and `<progress>`.

- [ ] **Step 4: Register MDX components**

Expose `AtlasCoverage`, `LearningPathsOverview`, and `LearningPath` from `components/mdx.tsx`.

- [ ] **Step 5: Verify GREEN**

Run presentation tests, unit tests, typecheck, and build.

---

### Task 4: Add Coverage and Learning Paths documentation

**Files:**
- Create: `content/docs/start-here/coverage.mdx`
- Modify: `content/docs/start-here/meta.json`
- Modify: `content/docs/start-here/software-engineering-map.mdx`
- Create: `content/docs/learning-paths/meta.json`
- Create: `content/docs/learning-paths/index.mdx`
- Create: `content/docs/learning-paths/modern-web-systems.mdx`
- Create: `content/docs/learning-paths/backend-systems.mdx`
- Create: `content/docs/learning-paths/cloud-architecture-for-software-engineers.mdx`
- Create: `content/docs/learning-paths/ai-native-software-engineering.mdx`
- Modify: `content/docs/meta.json`

**Interfaces:**
- Consumes registered MDX components from Task 3.
- Produces discoverable docs routes under `/docs/start-here/coverage` and `/docs/learning-paths/...`.

- [ ] **Step 1: Add failing E2E test first**

Create `tests/e2e/learning-paths.spec.ts` before these pages exist. Assert:

- `/docs/start-here/coverage` loads and shows `Atlas Coverage` plus at least `Web Platform`;
- `/docs/learning-paths/backend-systems` shows ordered path content and at least one visible uncovered state;
- navigation exposes `Learning Paths`;
- axe reports no serious/critical violations on a representative path page.

- [ ] **Step 2: Verify RED in CI**

Expected: E2E fails because the new routes do not exist.

- [ ] **Step 3: Create MDX pages and navigation metadata**

Use required Atlas frontmatter. Orientation/index pages use `guide` + `recognize` + `concepts: []`. Path pages must not claim coverage merely by embedding `LearningPath`; keep `concepts: []` unless their authored prose materially teaches a canonical concept.

- [ ] **Step 4: Link the map page to Coverage and Learning Paths**

Explain that the map is territory, coverage is current authored support, and paths are curated traversals.

- [ ] **Step 5: Verify GREEN**

Run E2E plus full unit/build checks.

---

### Task 5: Align authoring and agent contracts

**Files:**
- Modify: `CONTENT_GUIDE.md`
- Modify: `AGENTS.md`
- Modify: `CONTRIBUTING.md`
- Modify: `README.md`

**Interfaces:**
- Documents the rules implemented by Tasks 1-4.

- [ ] **Step 1: Update learning-path guidance**

Document that path data owns order/intent only, concept IDs must pre-exist in the map, uncovered steps are valid, and content recommendations are derived.

- [ ] **Step 2: Add anti-gaming guidance**

Explicitly prohibit adding incidental `concepts` references only to improve coverage numbers.

- [ ] **Step 3: Keep README concise**

Mention curated paths and derived coverage without duplicating contributor details.

- [ ] **Step 4: Run docs-related validation**

Typecheck/build/unit tests must remain green.

---

### Task 6: Final PR review and merge

**Files:**
- Modify only files required to fix review findings.

**Interfaces:**
- Produces a merged PR2 with post-merge verification.

- [ ] **Step 1: Run full CI on current head**

Require success for lint, typecheck, unit tests, build, Chromium setup, browser tests, and accessibility tests.

- [ ] **Step 2: Review `main...HEAD` against the spec**

Check for duplicate sources of truth, hidden uncovered concepts, client-JS creep, stale docs, missing validation, and accidental PR3 scope.

- [ ] **Step 3: Fix every blocking finding and rerun full CI**

Do not merge based on an earlier green SHA after a review fix.

- [ ] **Step 4: Update PR description with evidence and merge**

Merge only the verified head SHA.

- [ ] **Step 5: Verify post-merge CI on `main`**

Completion requires the merge commit's push workflow to finish successfully.