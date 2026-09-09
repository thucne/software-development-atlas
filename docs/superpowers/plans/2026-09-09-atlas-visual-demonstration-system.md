# Atlas Visual Demonstration System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved Atlas visual-system design into a durable authoring contract, asset-ready renderer, objective tests, and the first 12-image migration without changing lesson-facing semantic illustration IDs.

**Architecture:** Keep `<AtlasIllustration id="…" />` as the stable MDX API. Extend `components/mdx/atlas-illustration.tsx` with a `static-image` definition kind that owns one shared asset path plus localized title, caption, and accessible description; keep exact diagrams in their existing programmatic forms. Move the canonical medium-selection rules into `CONTENT_GUIDE.md`, keep `.agents/skills/atlas-lesson-authoring/SKILL.md` operational and concise, and make `AGENTS.md` refer to the canonical rules instead of duplicating a competing policy.

**Tech Stack:** Next.js 16, React, TypeScript, Fumadocs/MDX, Tailwind CSS, Vitest, static WebP assets under `public/illustrations/`.

**Spec:** `docs/superpowers/specs/2026-09-09-atlas-visual-demonstration-system-design.md`

## Global Constraints

- Choose the visual medium from the learning objective, not from visual variety.
- Substantive lessons target 3–4 meaningful visual anchors, not 3–4 generated images.
- Keep exact state, ordering, timing, protocol, transaction, and numeric diagrams programmatic when editability/precision is the teaching need.
- Generated/static teaching illustrations are supplementary; no important technical fact may exist only in image pixels.
- English and Vietnamese companions reuse one semantic asset by default; localized title, caption, and accessible description stay in code/MDX.
- Static teaching assets use `public/illustrations/<domain>/<illustration-id>.webp`, normally 1600×900 / 16:9, with a target payload below roughly 300 KB where practical.
- Generated teaching artwork contains little or no meaningful baked-in text.
- Keep the existing `<AtlasIllustration id="…" />` MDX API unchanged.
- Add no runtime image-generation API, hosted model dependency, paid service, or new package.
- Machine tests enforce objective invariants only; artistic quality remains a review responsibility.

---

## File Structure

- `components/mdx/atlas-illustration.tsx` — semantic illustration registry and renderer; add static-image definition support without changing MDX callers.
- `tests/illustrations.test.ts` — objective visual-cadence, bilingual parity, registry, and static-asset invariants.
- `CONTENT_GUIDE.md` — canonical human-facing visual-medium, accessibility, localization, art-direction, prompt, and review rules.
- `.agents/skills/atlas-lesson-authoring/SKILL.md` — concise operational workflow agents follow when choosing and reviewing visual anchors.
- `AGENTS.md` — remove/replace duplicated placeholder-first visual policy with a short pointer to canonical guidance and repository-level invariants.
- `public/illustrations/{async,http,cloud,rendering,architecture,checkout}/*.webp` — 12 text-light teaching assets using semantic IDs as filenames.
- Existing lesson MDX files — no semantic-ID churn; only edit if a surrounding caption/explanation must be strengthened for accessibility after an image review.

---

### Task 1: Encode the visual-system invariants in tests

**Files:**
- Modify: `tests/illustrations.test.ts`
- Read: `components/mdx/atlas-illustration.tsx`

**Interfaces:**
- Consumes: existing `<AtlasIllustration id="…" />`, Mermaid code fences, `DecisionMatrix`, `*Lab`, and `*Explorer` MDX syntax.
- Produces: tests that define visual-anchor counting and static-image asset requirements for later tasks.

- [ ] **Step 1: Replace the illustration-only cadence helper with a visual-anchor helper**

Add these helpers near `illustrationIds`:

```ts
function countVisualAnchors(source: string) {
  const atlasIllustrations = illustrationIds(source).length;
  const mermaidBlocks = [...source.matchAll(/```mermaid\b/g)].length;
  const decisionMatrices = [...source.matchAll(/<DecisionMatrix\b/g)].length;
  const labsAndExplorers = [
    ...source.matchAll(/<([A-Z][A-Za-z0-9]*(?:Lab|Explorer))\b/g),
  ].length;

  return atlasIllustrations + mermaidBlocks + decisionMatrices + labsAndExplorers;
}
```

- [ ] **Step 2: Change the bilingual test so parity and cadence are separate assertions**

Use the existing sorted-ID comparison for locale parity, but enforce `countVisualAnchors(enSource) >= 3` and `countVisualAnchors(viSource) >= 3` independently. Expected failure before implementation: none for current lessons; this protects the new interpretation without forcing image quotas.

- [ ] **Step 3: Add registry-resolution and static-image contract tests**

Read `components/mdx/atlas-illustration.tsx` as source and assert:

```ts
const illustrationSource = readFileSync(
  path.join(process.cwd(), 'components/mdx/atlas-illustration.tsx'),
  'utf8',
);

const registeredIds = [...illustrationSource.matchAll(/^\s*'([^']+)':\s*\{/gm)].map(
  (match) => match[1],
);
```

For every ID referenced by English lessons, assert `registeredIds` contains it.

For static definitions, use a narrow source-level contract until definitions are exported as data:

```ts
const staticDefinitions = [
  ...illustrationSource.matchAll(
    /'([^']+)':\s*\{\s*kind:\s*'static-image',[\s\S]*?asset:\s*'([^']+\.webp)'[\s\S]*?description:\s*t\('([^']+)',\s*'([^']+)'\)/g,
  ),
];
```

For each static definition assert:

- asset starts with `/illustrations/`;
- asset ends in `.webp`;
- English and Vietnamese descriptions are non-empty;
- `public${asset}` exists on disk.

- [ ] **Step 4: Run the focused test**

Run:

```bash
pnpm vitest run tests/illustrations.test.ts
```

Expected: PASS before static-image definitions exist, because the new static-definition loop is empty; cadence and bilingual parity must remain green.

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
- Consumes: `AtlasIllustrationId`, localized `t(en, vi)` helper, existing figure shell.
- Produces: `StaticImageDefinition` with `kind: 'static-image'`, `asset: string`, and `description: LocalizedText`; `renderDiagram` can render static image definitions while lesson MDX stays unchanged.

- [ ] **Step 1: Write a failing renderer-contract test**

Temporarily add one test that expects the source to define `type StaticImageDefinition` and include `'static-image'` in `IllustrationDefinition`. Run:

```bash
pnpm vitest run tests/illustrations.test.ts
```

Expected: FAIL because the type does not yet exist.

- [ ] **Step 2: Add the static-image definition type**

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

Extend:

```ts
type IllustrationDefinition =
  | FlowDefinition
  | CompareDefinition
  | TimelineDefinition
  | MatrixDefinition
  | ChartDefinition
  | StaticImageDefinition;
```

- [ ] **Step 3: Add the static image renderer**

Use the repository-local public asset path with a native semantic image element so no new Next image configuration is required:

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
      <img
        src={definition.asset}
        alt={localized(definition.description, locale)}
        className="block h-auto w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
```

Add to `renderDiagram`:

```ts
case 'static-image':
  return <StaticTeachingImage definition={definition} locale={locale} />;
```

The existing figure title and `figcaption` remain localized HTML outside the pixels.

- [ ] **Step 4: Run focused tests and typecheck**

Run:

```bash
pnpm vitest run tests/illustrations.test.ts
pnpm typecheck
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
- Test: `tests/illustrations.test.ts` (no behavior change required)

**Interfaces:**
- Consumes: approved design spec and existing Teaching/Clarity contracts.
- Produces: one canonical human policy, one operational agent procedure, and one concise repository pointer with no contradictory placeholder-first rules.

- [ ] **Step 1: Replace `CONTENT_GUIDE.md` visual-cadence section**

Retain the 3–4 anchor target but explicitly define four media:

```markdown
### Choose the visual medium from the learning objective

Visual anchors are not image quotas. For each visual, first name the learner misunderstanding it prevents.

- **Programmatic diagram:** exact state, ordering, timing, values, protocol layering, dependency graphs, transaction boundaries.
- **Teaching illustration:** bottlenecks, pressure, blast radius, lifecycle intuition, ambiguous outcomes, ownership boundaries, cascading failure.
- **Mermaid:** textual/diffable decision trees, sequence diagrams, state graphs, structural architecture flows.
- **Interactive lab/explorer:** changing inputs, stepping through behavior, prediction/testing, scenario exploration.

Do not replace an exact diagram with generated artwork merely for visual novelty.
```

Then add the approved Atlas art-direction summary, asset path contract, text-in-image rule, bilingual reuse rule, accessibility requirements, prompt recipe, and the 10-item visual review checklist from the design spec.

Remove the old bilingual placeholder template as the primary workflow. If placeholders are retained for draft-only authoring, label them explicitly as temporary and state that published substantive lessons must not contain them.

- [ ] **Step 2: Rewrite the first two authoring-skill rules around medium selection**

Change the skill description so it mentions visual-medium selection rather than standardized placeholders. Replace Rules 1–2 with:

```markdown
### 1. Meaningful visual cadence (target 3–4 anchors)
Target one meaningful visual anchor every 1–2 conceptual sections. The target is not a generated-image quota.

### 2. Choose the medium deliberately
For every proposed visual, write down the teaching purpose, then choose programmatic diagram, static teaching illustration, Mermaid, or interactive lab/explorer using `CONTENT_GUIDE.md`.
```

Include the static-asset naming rule, minimal baked text, one asset across locales, accessible description requirement, and the visual review checklist. Update the step-by-step workflow so “Visual Anchor 1/2/3” does not assume placeholders.

- [ ] **Step 3: Deduplicate `AGENTS.md`**

Replace the long “Standardized Illustration Placeholders” subsection with concise repository-level invariants:

```markdown
- Follow the canonical visual-medium contract in `CONTENT_GUIDE.md` and the operational workflow in `.agents/skills/atlas-lesson-authoring/SKILL.md`.
- Treat 3–4 visual anchors as a cadence target, not an image quota.
- Keep important technical facts in text; static artwork is supplementary.
- Reuse one semantic asset across English/Vietnamese by default.
- Published substantive lessons must not contain illustration placeholders.
```

Add the visual-system design spec to “Before changing architecture.”

- [ ] **Step 4: Verify there is no contradictory published-authoring policy**

Search:

```bash
rg -n "Illustration Placeholder|3–4 visual|visual anchor|static teaching|generated image" CONTENT_GUIDE.md AGENTS.md .agents/skills/atlas-lesson-authoring/SKILL.md
```

Expected: placeholder language, if any, is draft-only; all three documents agree that visual anchors are not image quotas.

- [ ] **Step 5: Run docs-adjacent tests**

Run:

```bash
pnpm vitest run tests/illustrations.test.ts tests/content-clarity.test.ts tests/authored-content.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add CONTENT_GUIDE.md AGENTS.md .agents/skills/atlas-lesson-authoring/SKILL.md
git commit -m "docs: codify Atlas visual medium guidance"
```

---

### Task 4: Generate and integrate the four-image pilot

**Files:**
- Create: `public/illustrations/async/bounded-concurrency.webp`
- Create: `public/illustrations/cloud/serverless-downstream-avalanche.webp`
- Create: `public/illustrations/rendering/hydration-gap.webp`
- Create: `public/illustrations/checkout/payment-ambiguity-window.webp`
- Modify: `components/mdx/atlas-illustration.tsx`
- Test: `tests/illustrations.test.ts`

**Interfaces:**
- Consumes: `StaticImageDefinition` from Task 2 and the prompt recipe/art direction from the spec.
- Produces: four static-image definitions using the same semantic IDs already referenced by both locales.

- [ ] **Step 1: Generate `bounded-concurrency`**

Use the approved prompt recipe with this semantic instruction:

```text
Teaching goal: a very large backlog of independent jobs is intentionally narrowed through five simultaneously active workers so a finite downstream database/API is protected. Large dense waiting queue on the left; narrow five-lane active-worker gate in the center; visibly finite downstream dependency on the right. Queued work must look waiting rather than active. Do not imply only five jobs exist. Dark charcoal/navy technical-editorial 16:9 scene; emerald/cyan healthy flow; amber pressure; no logos, no people, no paragraph text, no important labels or numbers baked into pixels.
```

Export to the exact WebP path above, target 1600×900 and <300 KB where practical.

- [ ] **Step 2: Generate the other three pilot assets**

Use these teaching goals:

```text
serverless-downstream-avalanche: rapidly expanding compute workers converge on a much smaller downstream database connection/capacity boundary; healthy autoscaling becomes dangerous downstream overload.

hydration-gap: useful server-rendered HTML is visibly present while interactive controls are not yet activated; client runtime arrives/attaches behavior later. Do not imply the page is blank before hydration.

payment-ambiguity-window: payment provider completes a charge, but the success response is lost in transit and the caller sees timeout/uncertainty; the image must communicate “remote side effect may have happened even though caller lacks confirmation.”
```

Apply the same art direction and text-light requirements.

- [ ] **Step 3: Convert the four definitions to `static-image`**

Each definition follows this exact shape:

```ts
'bounded-concurrency': {
  kind: 'static-image',
  title: t('Bounded concurrency protects downstream capacity', 'Concurrency có giới hạn bảo vệ năng lực downstream'),
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

Use equivalent localized metadata for the other three IDs.

- [ ] **Step 4: Run focused tests**

Run:

```bash
pnpm vitest run tests/illustrations.test.ts
pnpm typecheck
```

Expected: PASS; static asset existence checks now cover four definitions.

- [ ] **Step 5: Run representative E2E rendering checks**

Run:

```bash
pnpm playwright test tests/e2e/async-waterfalls.spec.ts tests/e2e/engineering-judgment.spec.ts
```

Expected: PASS with no horizontal overflow or missing image failures.

- [ ] **Step 6: Commit**

```bash
git add public/illustrations components/mdx/atlas-illustration.tsx
git commit -m "feat: add Atlas teaching illustration pilot"
```

---

### Task 5: Migrate the remaining eight teaching illustrations

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
- Consumes: the validated four-image pilot rendering/art-direction pattern.
- Produces: all 12 approved semantic IDs as static teaching images while the remaining 19 stay programmatic.

- [ ] **Step 1: Generate the remaining assets with the approved teaching goals**

Use these semantics exactly:

```text
main-thread-starvation: a self-replenishing stream of microtask work keeps occupying the main-thread progress path while user input, rendering, and later task work wait behind it.

request-boundary-ownership: a request can be satisfied at client cache, intermediary/CDN, gateway/proxy, or origin; visually emphasize that an earlier responder means later boundaries may never participate.

cold-vs-warm-start: cold path must create/initialize an execution environment before handling work; warm path reuses an existing environment. Do not imply universal provider timings.

hybrid-rendering-architecture: one product surface combines shared/static regions, request-time server-rendered regions, and long-lived client-rendered interactive regions; do not present CSR/SSR/SSG as mutually exclusive whole-app identities.

architecture-boundary-comparison: monolith, modular monolith, and microservices differ in deployment/domain boundaries; modular monolith has strong internal compartments but still one deployable; microservices have independently deployed boundaries.

blast-radius-comparison: contrast a broad shared failure boundary with deliberately isolated service failure, while still showing dependencies so isolation is not portrayed as magical end-to-end immunity.

distributed-monolith: several network-separated services remain tightly coupled through dense cross-service dependencies and coordinated change, showing network boundaries without real autonomy.

retry-storm-vs-jitter: synchronized retry waves repeatedly hammer a recovering dependency, while jitter spreads retries across time and reduces peaks. Avoid exact numeric curves inside pixels.
```

- [ ] **Step 2: Convert the eight corresponding definitions to `static-image`**

For every definition provide:

```ts
kind: 'static-image'
asset: '/illustrations/<domain>/<id>.webp'
description: t('<concise English spatial description>', '<concise Vietnamese spatial description>')
```

Keep existing localized title/caption when still accurate; revise only when the new image changes the teaching emphasis.

- [ ] **Step 3: Verify the allocation is exactly 12 static / 19 programmatic**

Add this assertion to `tests/illustrations.test.ts`:

```ts
expect(staticDefinitions).toHaveLength(12);
expect(registeredIds).toHaveLength(31);
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

### Task 6: Full regression, responsive review, and completion record

**Files:**
- Modify only if failures require corrections: `components/mdx/atlas-illustration.tsx`, visual-system docs, or affected lesson MDX.
- Optional create: `docs/superpowers/plans/2026-09-09-atlas-visual-demonstration-system-self-review.md` only if the repository's existing workflow requires a separate self-review artifact; otherwise record results in the PR body.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: passing repository checks and review evidence that the approved visual contract is implemented.

- [ ] **Step 1: Run unit/content checks**

```bash
pnpm vitest run
```

Expected: all tests PASS.

- [ ] **Step 2: Run type and lint checks**

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

- [ ] **Step 4: Verify asset and policy invariants**

```bash
find public/illustrations -type f -name '*.webp' | sort
rg -n "Illustration Placeholder|image quota|static teaching|generated/static|visual anchor" CONTENT_GUIDE.md AGENTS.md .agents/skills/atlas-lesson-authoring/SKILL.md
```

Expected:

- exactly 12 approved WebP assets;
- no published lesson placeholders;
- documentation consistently says visual anchors are not image quotas;
- one semantic asset is reused across locales.

- [ ] **Step 5: Compare branch to `main`**

```bash
git diff --check main...HEAD
git status --short
```

Expected: no whitespace errors; clean working tree after commits.

- [ ] **Step 6: Commit any regression fixes**

If corrections were required, commit them as a focused final fix commit; otherwise do not create an empty commit.

- [ ] **Step 7: Prepare the PR summary**

Document:

- canonical policy changes;
- static renderer contract;
- 12 migrated illustration IDs / 19 retained exact diagrams;
- bilingual/accessibility behavior;
- validation commands and results;
- confirmation that no paid/runtime service was introduced.
