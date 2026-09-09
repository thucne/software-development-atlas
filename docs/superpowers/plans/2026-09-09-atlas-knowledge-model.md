# Atlas Knowledge Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a canonical, machine-readable Software Engineering Map and make content type, learning depth, and concept placement part of the enforced Atlas content contract.

**Architecture:** Keep `category`, `topics`, and Fumadocs navigation unchanged. Add a separate canonical `content/atlas-map.json` for stable domain/concept IDs; extend lesson frontmatter with `contentType`, `learningDepth`, and `concepts`; validate both the map and every authored MDX file against the map in tests. Documentation and contribution rules become coverage-driven without adding runtime services or PR2/PR3 UI features.

**Tech Stack:** Next.js 16, TypeScript 6, Zod 4, Fumadocs MDX, Vitest, Playwright, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-09-atlas-knowledge-model-design.md`

## Global Constraints

- Preserve the zero-cost core and Git-as-source-of-truth architecture.
- `contentType`, `learningDepth`, and `concepts` are required metadata for normal content; do not weaken them to optional fields to make migration easier.
- `category` remains navigation-oriented; canonical concept placement is separate.
- `topics` remain loose tags; `concepts` are stable references into the canonical map.
- Do not add runtime databases, hosted services, paid APIs, graph explorers, progress tracking, generated learning paths, or PR2/PR3 features.
- Concept IDs and domain IDs are lowercase kebab-case and stable once published.
- Prefer machine-enforced constraints over prose-only rules.
- Existing quality commands remain authoritative: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.

---

### Task 1: Add the canonical Atlas map and typed map loader

**Files:**
- Create: `content/atlas-map.json`
- Create: `lib/content/atlas-map.ts`
- Create: `tests/atlas-map.test.ts`

**Interfaces:**
- Produces: `learningDepthSchema`, `atlasMapSchema`, `atlasMap`, `atlasConceptIds`, `AtlasMap`, and `AtlasConceptId` from `lib/content/atlas-map.ts`.
- Consumers: lesson schema and authored-content validation in later tasks.

- [ ] **Step 1: Write tests for map validity and stable identifier invariants**

Tests must assert that the canonical map parses, contains 12-13 broad software-engineering domains, has unique domain IDs, globally unique concept IDs, lowercase kebab-case IDs, and valid `targetDepth` values.

- [ ] **Step 2: Add the map schema and loader**

Use Zod. Load `content/atlas-map.json` as the single source of truth, parse it once, and export a `Set<string>` of concept IDs for reference validation.

- [ ] **Step 3: Seed the map**

Include these top-level domains: `computing-foundations`, `programming-runtimes`, `web-platform`, `frontend-engineering`, `backend-engineering`, `data-systems`, `software-architecture`, `distributed-systems`, `cloud-infrastructure`, `testing-quality`, `delivery-operations`, `security`, and `ai-native-engineering`.

Seed representative major concepts across every domain. Concepts may exist without lessons.

- [ ] **Step 4: Run the narrow unit suite**

Run: `pnpm test -- tests/atlas-map.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add canonical software engineering map`

---

### Task 2: Extend the lesson metadata contract and validate authored concept references

**Files:**
- Modify: `lib/content/schema.ts`
- Modify: `tests/content-schema.test.ts`
- Create: `tests/authored-content.test.ts`

**Interfaces:**
- Consumes: `learningDepthSchema` and `atlasConceptIds` from `lib/content/atlas-map.ts`.
- Produces: required `contentType`, `learningDepth`, and `concepts` fields on `lessonFrontmatterSchema`.

- [ ] **Step 1: Add failing schema tests**

Cover valid values and rejection of unknown `contentType`, unknown `learningDepth`, duplicate concepts, and invalid concept IDs.

- [ ] **Step 2: Extend the Zod schema**

`contentType` enum values: `guide`, `concept`, `deep-dive`, `decision-guide`, `field-guide`, `architecture-walkthrough`.

`learningDepth`: reuse the canonical `learningDepthSchema` with `recognize`, `reason`, `operate`.

`concepts`: required array of strings; allow an empty array for meta/start-here guides; reject duplicates and any ID absent from `atlasConceptIds`.

- [ ] **Step 3: Add repository-wide authored-content validation**

Create a test that recursively reads `content/docs/**/*.mdx`, extracts the YAML frontmatter block without adding a runtime dependency, and verifies every file declares `contentType`, `learningDepth`, and `concepts`. It must verify every listed concept exists in the canonical map and no content item repeats a concept ID.

The parser only needs to support the Atlas frontmatter shapes used for these three fields: scalar values plus YAML string arrays. Keep it deliberately small and test-focused; do not introduce a general YAML parser unless an existing dependency already exposes one cleanly.

- [ ] **Step 4: Run narrow tests**

Run: `pnpm test -- tests/content-schema.test.ts tests/authored-content.test.ts`
Expected before migration: authored-content test FAILS on existing pages missing required metadata.

- [ ] **Step 5: Commit schema/tests**

Commit message: `feat: enforce Atlas content placement metadata`

---

### Task 3: Migrate existing Atlas content and add the human-readable map page

**Files:**
- Modify: all current `content/docs/**/*.mdx` frontmatter
- Create: `content/docs/start-here/software-engineering-map.mdx`
- Modify: `content/docs/start-here/meta.json`

**Interfaces:**
- Consumes: canonical concept IDs from `content/atlas-map.json`.
- Produces: zero authored-content validation failures.

- [ ] **Step 1: Classify current content**

Use `guide/recognize` with `concepts: []` for start-here/meta pages. Use `deep-dive/reason` for Promises, Browser Event Loop, and Async Waterfalls. Map each deep dive only to canonical concepts it genuinely teaches.

- [ ] **Step 2: Add `Software Engineering Map` start-here page**

Explain the relationships `Map -> Domain -> Concept -> Content`, and distinguish Map, Lesson/Content, future Learning Path, and Decision Guide. Include a compact Mermaid overview of the 13 domains. Do not implement an interactive graph.

- [ ] **Step 3: Add page to start-here navigation metadata**

Place it after `how-to-use-the-atlas` and before `freshness`.

- [ ] **Step 4: Run authored-content/schema tests**

Run: `pnpm test -- tests/atlas-map.test.ts tests/content-schema.test.ts tests/authored-content.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `content: place existing lessons on the Atlas map`

---

### Task 4: Update authoring, agent, contribution, and roadmap contracts

**Files:**
- Modify: `CONTENT_GUIDE.md`
- Modify: `AGENTS.md`
- Modify: `CONTRIBUTING.md`
- Modify: `.github/ISSUE_TEMPLATE/new-lesson.yml`
- Modify: `docs/roadmap.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: canonical content types/depth/map contract.
- Produces: human and agent instructions that agree with enforced metadata.

- [ ] **Step 1: Update `CONTENT_GUIDE.md`**

Document content types, learning depth vs difficulty, Atlas placement, stable concept IDs, and the rule that not every concept warrants a deep interactive lesson.

- [ ] **Step 2: Update `AGENTS.md`**

Before new content, require agents to inspect the canonical map, choose the smallest useful content type, declare target learning depth, and reference existing concept IDs or deliberately add new canonical concepts first. Explicitly forbid inventing ad-hoc IDs in frontmatter.

- [ ] **Step 3: Update contributor workflow**

Adjust `CONTRIBUTING.md` and the new-content issue form to ask for Atlas domain/concept, content type, and target depth while preserving freshness, prerequisites, sources, and the interactivity-is-optional principle.

- [ ] **Step 4: Make roadmap coverage-driven**

Reframe Phase 0.4 around representative high-value coverage across the map rather than raw lesson count. Keep roughly 25 excellent content items as a useful milestone, not the primary success metric. Add future learning-path, decision-guide, and architecture-walkthrough phases without implementing them here.

- [ ] **Step 5: Align README terminology**

Mention the canonical map/content types/learning depth briefly without bloating the project introduction.

- [ ] **Step 6: Commit**

Commit message: `docs: make Atlas growth coverage-driven`

---

### Task 5: Full verification and spec self-review

**Files:**
- Modify only files necessary to fix findings discovered by verification.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a branch satisfying every acceptance criterion in the governing spec.

- [ ] **Step 1: Run full repository verification**

Run, independently and in this order:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Every command must exit 0.

- [ ] **Step 2: Review PR diff against the spec**

Check every acceptance criterion line-by-line. Check that no PR2/PR3 feature slipped in, metadata was not weakened, and the map remains the only canonical concept registry.

- [ ] **Step 3: Review naming and consistency**

Check docs, schema, tests, issue form, existing frontmatter, and map IDs use the same terminology and enum values.

- [ ] **Step 4: Fix every Critical/Important finding**

After each fix, rerun the narrow failing check, then rerun the full suite.

- [ ] **Step 5: Commit any review fixes**

Commit message: `fix: address Atlas knowledge model review findings`

---

### Task 6: PR readiness, final review, and merge

**Files:**
- No planned source changes; findings may require targeted fixes.

**Interfaces:**
- Consumes: green CI and reviewed PR diff.
- Produces: merged PR with documented validation evidence.

- [ ] **Step 1: Update the PR description**

Summarize architecture, migration, validation, intentional non-goals, and verification evidence.

- [ ] **Step 2: Inspect GitHub Actions for the current head SHA**

All required jobs must complete successfully. If CI fails, inspect the failed job/logs, fix the root cause, push, and repeat until green.

- [ ] **Step 3: Perform final whole-branch review**

Review `main...HEAD` for correctness, maintainability, accidental scope growth, stale docs, and missing tests. Critical/Important findings block merge.

- [ ] **Step 4: Mark PR ready and merge only after evidence is green**

Do not merge on assumed correctness or partial checks.
