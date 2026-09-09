# Atlas Visual Demonstration System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Atlas visual-system policy, an asset-ready static teaching-image renderer, objective tests, and the approved 12-image migration without changing lesson-facing semantic illustration IDs.

**Architecture:** Keep `<AtlasIllustration id="…" />` as the stable MDX API. Extend the typed illustration registry with a `static-image` definition that owns one shared asset path plus localized title, caption, and accessible description; render it through `next/image` while exact diagrams keep their existing programmatic renderers. Put canonical medium-selection rules in `CONTENT_GUIDE.md`, keep the authoring skill operational, and make `AGENTS.md` point to those rules instead of duplicating a placeholder-first policy.

**Tech Stack:** Next.js 16, React, TypeScript, Fumadocs/MDX, Tailwind CSS, Vitest, Playwright, repository-local WebP assets.

**Spec:** `docs/superpowers/specs/2026-09-09-atlas-visual-demonstration-system-design.md`

## Global Constraints

- Choose the visual medium from the learning objective, not from visual variety.
- Substantive lessons target 3–4 meaningful visual anchors, not 3–4 generated images.
- Keep exact state, ordering, timing, protocol, transaction, and numeric diagrams programmatic when precision/editability is the teaching need.
- Static teaching illustrations are supplementary; no important technical fact may exist only in image pixels.
- English and Vietnamese reuse one semantic asset by default; localized title, caption, and accessible description stay in code/MDX.
- Assets use `public/illustrations/<domain>/<illustration-id>.webp`, normally 1600×900 / 16:9, targeting <300 KB where practical.
- Generated teaching artwork contains little or no meaningful baked-in text.
- Keep the existing `<AtlasIllustration id="…" />` MDX API unchanged.
- Add no runtime image-generation API, paid service, hosted dependency, or new package.
- Machine tests enforce objective invariants only; artistic quality remains a review responsibility.

---

### Task 1: Encode the visual-system invariants in tests

**Files:**
- Modify: `tests/illustrations.test.ts`
- Modify later interface: `components/mdx/atlas-illustration.tsx`

**Interfaces:**
- Consumes: lesson MDX syntax and exported `atlasIllustrationDefinitions` from Task 2.
- Produces: visual-anchor cadence, bilingual parity, registry resolution, and static-asset invariants.

- [ ] **Step 1: Add meaningful visual-anchor counting**

Add:

```ts
function countVisualAnchors(source: string) {
  return (
    illustrationIds(source).length +
    [...source.matchAll(/```mermaid\b/g)].length +
    [...source.matchAll(/<DecisionMatrix\b/g)].length +
    [...source.matchAll(/<([A-Z][A-Za-z0-9]*(?:Lab|Explorer))\b/g)].length
  );
}
```

Split the current companion test into:

- English/Vietnamese `AtlasIllustration` ID parity;
- at least three meaningful visual anchors in each locale.

- [ ] **Step 2: Add a temporary failing renderer-contract test**

Before Task 2 implementation, import the module and assert the named export exists:

```ts
import { atlasIllustrationDefinitions } from '@/components/mdx/atlas-illustration';

test('illustration definitions are exported for objective validation', () => {
  expect(atlasIllustrationDefinitions).toBeDefined();
});
```

Run:

```bash
pnpm vitest run tests/illustrations.test.ts
```

Expected: FAIL because the registry is not exported yet.

- [ ] **Step 3: After Task 2, validate registry and assets through typed data**

Use:

```ts
for (const basePath of lessonPairs) {
  for (const id of illustrationIds(readLesson(basePath, 'en'))) {
    expect(atlasIllustrationDefinitions[id]).toBeDefined();
  }
}

const staticDefinitions = Object.entries(atlasIllustrationDefinitions).filter(
  ([, definition]) => definition.kind === 'static-image',
);

for (const [id, definition] of staticDefinitions) {
  if (definition.kind !== 'static-image') continue;
  expect(definition.asset).toMatch(/^\/illustrations\/.+\.webp$/);
  expect(definition.description.en.trim()).not.toBe('');
  expect(definition.description.vi.trim()).not.toBe('');
  expect(existsSync(path.join(process.cwd(), 'public', definition.asset))).toBe(true);
  expect(definition.asset).toContain(`/${id}.webp`);
}
```

Import `existsSync` from `node:fs` alongside `readFileSync`.

- [ ] **Step 4: Run focused tests**

```bash
pnpm vitest run tests/illustrations.test.ts
```

Expected after Task 2: PASS while there are no static definitions; later asset tasks make the static loop substantive.

- [ ] **Step 5: Commit**

```bash
git add tests/illustrations.test.ts
git commit -m "test: define Atlas visual system invariants"
```

---

### Task 2: Add the static teaching-image renderer contract

**Files:**
- Modify: `components/mdx/atlas-illustration.tsx`
- Test: `tests/illustrations.test.ts`

**Interfaces:**
- Produces: exported `atlasIllustrationDefinitions`, `StaticImageDefinition`, and a `static-image` renderer; consumes no new package.

- [ ] **Step 1: Add `next/image` and the typed definition**

At the top:

```ts
import Image from 'next/image';
import type { ReactNode } from 'react';
```

Add:

```ts
type StaticImageDefinition = {
  kind: 'static-image';
  title: LocalizedText;
  caption: LocalizedText;
  description: LocalizedText;
  asset: `/illustrations/${string}.webp`;
};
```

Extend `IllustrationDefinition` with `StaticImageDefinition`.

- [ ] **Step 2: Export the actual registry**

Rename:

```ts
const definitions: Record<AtlasIllustrationId, IllustrationDefinition>
```

to:

```ts
export const atlasIllustrationDefinitions: Record<
  AtlasIllustrationId,
  IllustrationDefinition
> = {
```

Update `AtlasIllustration` to read `atlasIllustrationDefinitions[id]`.

- [ ] **Step 3: Render static assets through `next/image`**

Add:

```tsx
function StaticTeachingImage({
  definition,
  locale,
}: {
  definition: StaticImageDefinition;
  locale: Locale;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-fd-border bg-[#111827]">
      <Image
        src={definition.asset}
        alt={localized(definition.description, locale)}
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 900px"
        className="block h-auto w-full object-contain"
      />
    </div>
  );
}
```

Add `case 'static-image'` to `renderDiagram`.

- [ ] **Step 4: Run focused validation**

```bash
pnpm vitest run tests/illustrations.test.ts
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/mdx/atlas-illustration.tsx tests/illustrations.test.ts
git commit -m "feat: support static Atlas teaching illustrations"
```

---

### Task 3: Make the visual policy canonical and future-proof

**Files:**
- Modify: `CONTENT_GUIDE.md`
- Modify: `.agents/skills/atlas-lesson-authoring/SKILL.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Produces: canonical human policy, concise operational agent workflow, and one repository-level pointer without contradictory placeholder-first guidance.

- [ ] **Step 1: Replace the canonical visual-cadence section**

`CONTENT_GUIDE.md` must state:

```markdown
### Choose the visual medium from the learning objective

Visual anchors are not image quotas. For each proposed visual, first name the learner misunderstanding it prevents.

- **Programmatic diagram:** exact state, ordering, timing, values, protocol layering, dependency graphs, transaction boundaries.
- **Teaching illustration:** bottlenecks, pressure, blast radius, lifecycle intuition, ambiguous outcomes, ownership boundaries, cascading failure.
- **Mermaid:** textual/diffable decision trees, sequence diagrams, state graphs, structural architecture flows.
- **Interactive lab/explorer:** changing inputs, stepping through behavior, prediction/testing, scenario exploration.

Do not replace an exact diagram with generated artwork merely for visual novelty.
```

Also add the approved art-direction summary, `public/illustrations/<domain>/<id>.webp` convention, minimal baked-text rule, shared bilingual asset rule, accessibility contract, stable prompt recipe, and 10-item visual review checklist from the design spec.

If draft placeholders remain documented, label them draft-only and explicitly ban them from published substantive lessons.

- [ ] **Step 2: Rewrite the authoring skill's first two rules**

Use:

```markdown
### 1. Meaningful visual cadence (target 3–4 anchors)
Target one meaningful visual anchor every 1–2 conceptual sections. The target is not a generated-image quota.

### 2. Choose the medium deliberately
For every proposed visual, write down the teaching purpose, then choose programmatic diagram, static teaching illustration, Mermaid, or interactive lab/explorer using `CONTENT_GUIDE.md`.
```

Add asset naming, minimal baked text, shared locale asset, accessible description, and the visual review checklist. Change the lesson-improvement workflow so Visual Anchors 1–3 do not assume placeholders.

- [ ] **Step 3: Deduplicate `AGENTS.md`**

Replace the placeholder-first visual subsection with these repository-level invariants:

```markdown
- Follow the canonical visual-medium contract in `CONTENT_GUIDE.md` and the operational workflow in `.agents/skills/atlas-lesson-authoring/SKILL.md`.
- Treat 3–4 visual anchors as a cadence target, not an image quota.
- Keep important technical facts in text; static artwork is supplementary.
- Reuse one semantic asset across English/Vietnamese by default.
- Published substantive lessons must not contain illustration placeholders.
```

Add the approved visual-system spec to “Before changing architecture.”

- [ ] **Step 4: Verify consistency**

```bash
rg -n "Illustration Placeholder|visual anchor|image quota|static teaching|generated image" CONTENT_GUIDE.md AGENTS.md .agents/skills/atlas-lesson-authoring/SKILL.md
pnpm vitest run tests/illustrations.test.ts tests/content-clarity.test.ts tests/authored-content.test.ts
```

Expected: placeholder language is draft-only if present; all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add CONTENT_GUIDE.md AGENTS.md .agents/skills/atlas-lesson-authoring/SKILL.md
git commit -m "docs: codify Atlas visual medium guidance"
```

---

### Task 4: Integrate the four-image pilot

**Files:**
- Create: `public/illustrations/async/bounded-concurrency.webp`
- Create: `public/illustrations/cloud/serverless-downstream-avalanche.webp`
- Create: `public/illustrations/rendering/hydration-gap.webp`
- Create: `public/illustrations/checkout/payment-ambiguity-window.webp`
- Modify: `components/mdx/atlas-illustration.tsx`

**Interfaces:**
- Consumes: `static-image` contract from Task 2.
- Produces: four existing semantic IDs backed by one shared image asset each.

- [ ] **Step 1: Generate the four assets using the approved semantics**

Use the spec's Atlas art direction and these teaching goals:

```text
bounded-concurrency: a very large waiting backlog narrows through five simultaneously active worker lanes before a finite downstream service; queued work is visibly waiting, not active.

serverless-downstream-avalanche: rapidly expanding compute workers converge on a much smaller downstream database connection/capacity boundary; successful autoscaling becomes dangerous downstream overload.

hydration-gap: useful server-rendered HTML is already visible while interactive controls are not yet activated; the client runtime later attaches behavior. Do not imply a blank page before hydration.

payment-ambiguity-window: a payment provider completes a charge, but the success response is lost in transit and the caller sees timeout/uncertainty; remote side effect may have happened without caller confirmation.
```

All four: dark charcoal/navy technical-editorial 16:9, restrained emerald/cyan/amber/red semantics, no logos/people, little or no baked text, 1600×900 WebP target.

- [ ] **Step 2: Convert each registry entry to `static-image`**

Use this shape for all four:

```ts
'bounded-concurrency': {
  kind: 'static-image',
  title: t(
    'Bounded concurrency protects downstream capacity',
    'Concurrency có giới hạn bảo vệ năng lực downstream',
  ),
  caption: t(
    'A large backlog can wait while only a fixed number of jobs actively consume downstream capacity.',
    'Một backlog lớn có thể chờ trong khi chỉ một số lượng job cố định đang chủ động sử dụng năng lực downstream.',
  ),
  description: t(
    'A large queue narrows through five active worker lanes before reaching a finite downstream service, showing that queued jobs wait while active concurrency stays bounded.',
    'Một hàng đợi lớn thu hẹp qua năm lane worker đang hoạt động trước khi đến một dịch vụ downstream có năng lực hữu hạn, cho thấy job trong queue chờ trong khi concurrency đang hoạt động vẫn được giới hạn.',
  ),
  asset: '/illustrations/async/bounded-concurrency.webp',
},
```

The other three use equivalent concise localized spatial descriptions and their exact asset paths.

- [ ] **Step 3: Validate pilot**

```bash
pnpm vitest run tests/illustrations.test.ts
pnpm typecheck
pnpm lint
pnpm playwright test tests/e2e/async-waterfalls.spec.ts tests/e2e/engineering-judgment.spec.ts
```

Expected: PASS; no missing assets or horizontal-overflow regressions.

- [ ] **Step 4: Commit**

```bash
git add public/illustrations components/mdx/atlas-illustration.tsx
git commit -m "feat: add Atlas teaching illustration pilot"
```

---

### Task 5: Migrate the remaining eight approved teaching illustrations

**Files:**
- Create: `public/illustrations/async/main-thread-starvation.webp`
- Create: `public/illustrations/http/request-boundary-ownership.webp`
- Create: `public/illustrations/cloud/cold-vs-warm-start.webp`
- Create: `public/illustrations/rendering/hybrid-rendering-architecture.webp`
- Create: `public/illustrations/architecture/architecture-boundary-comparison.webp`
- Create: `public/illustrations/architecture/blast-radius-comparison.webp`
- Create: `public/illustrations/architecture/distributed-monolith.webp`
- Create: `public/illustrations/checkout/retry-storm-vs-jitter.webp`
- Modify: `components/mdx/atlas-illustration.tsx`
- Test: `tests/illustrations.test.ts`

**Interfaces:**
- Produces: exactly 12 static teaching-image definitions total and 19 retained programmatic definitions.

- [ ] **Step 1: Generate assets with these verified teaching goals**

```text
main-thread-starvation: self-replenishing microtask work occupies the main-thread progress path while user input, rendering, and later task work wait.
request-boundary-ownership: client cache, intermediary/CDN, gateway/proxy, or origin can answer; an earlier responder means later boundaries may never participate.
cold-vs-warm-start: cold path creates/initializes an execution environment before handling work; warm path reuses an existing environment; no universal provider timings.
hybrid-rendering-architecture: one product surface combines static/shared, request-time server-rendered, and long-lived client-rendered regions; CSR/SSR/SSG are not mutually exclusive whole-app identities.
architecture-boundary-comparison: monolith, modular monolith, and microservices differ in deployment/domain boundaries; modular monolith has internal compartments but one deployable, microservices have independently deployed boundaries.
blast-radius-comparison: contrast broad shared failure scope with deliberately isolated service failure while still showing dependencies; isolation is not magical end-to-end immunity.
distributed-monolith: network-separated services remain tightly coupled through dense cross-service dependencies and coordinated change.
retry-storm-vs-jitter: synchronized retry waves repeatedly hammer a recovering dependency while jitter spreads retries across time and reduces peaks; avoid exact numeric curves inside pixels.
```

- [ ] **Step 2: Convert the eight registry definitions**

Every entry must contain:

```ts
kind: 'static-image',
asset: '/illustrations/<domain>/<id>.webp',
description: t('<English spatial description>', '<Vietnamese spatial description>'),
```

Keep/revise localized title and caption only as needed for semantic accuracy.

- [ ] **Step 3: Assert the approved allocation**

Add:

```ts
expect(staticDefinitions).toHaveLength(12);
expect(Object.keys(atlasIllustrationDefinitions)).toHaveLength(31);
```

Run:

```bash
pnpm vitest run tests/illustrations.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add public/illustrations components/mdx/atlas-illustration.tsx tests/illustrations.test.ts
git commit -m "feat: complete Atlas teaching illustration migration"
```

---

### Task 6: Full regression and completion review

**Files:**
- Modify only where checks reveal a real defect.

**Interfaces:**
- Produces: verified implementation evidence and a clean branch ready for PR/review.

- [ ] **Step 1: Run the full unit/content suite**

```bash
pnpm vitest run
```

Expected: PASS.

- [ ] **Step 2: Run typecheck and lint**

```bash
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 3: Run representative E2E suites**

```bash
pnpm playwright test tests/e2e/async-waterfalls.spec.ts tests/e2e/browser-event-loop.spec.ts tests/e2e/http-request-lifecycle.spec.ts tests/e2e/engineering-judgment.spec.ts tests/e2e/lesson-rendering-audit.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Verify assets and policy**

```bash
find public/illustrations -type f -name '*.webp' | sort
rg -n "Illustration Placeholder|image quota|static teaching|generated image|visual anchor" CONTENT_GUIDE.md AGENTS.md .agents/skills/atlas-lesson-authoring/SKILL.md
git diff --check main...HEAD
```

Expected: exactly 12 approved WebP assets; published lessons contain no placeholders; docs agree visual anchors are not image quotas; no whitespace errors.

- [ ] **Step 5: Commit only real regression fixes**

If validation required corrections, make a focused fix commit. Do not create an empty completion commit.

- [ ] **Step 6: Prepare final review summary**

Record canonical policy changes, renderer contract, 12 static / 19 programmatic allocation, bilingual/accessibility behavior, validation results, and confirmation that no paid/runtime service was introduced.
