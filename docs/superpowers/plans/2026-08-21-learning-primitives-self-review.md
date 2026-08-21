# Phase 0.3 Learning Primitives Self-Review

**Date:** 2026-08-21  
**Branch:** `agent/learning-primitives`  
**Base:** `main` at `21709b9c658370ec3afe4e9770aebb7377df6ac0`  
**Verified implementation head before this document:** `4b5d699c7f5ed545bf240b4de697b8e69cf40d23`

## Spec coverage

Phase 0.3 implements the approved rule: **extract structure, not semantics**.

The six approved presentation/accessibility primitives are present under `components/learning/primitives/`:

1. `LabShell`
   - used by `AsyncWaterfallLab`, `EventLoopLab`, and `PromiseResolutionLab`
   - owns the named semantic outer section, generated heading id, title, description, and common lab-card presentation
   - owns no lesson state, timers, playback, model types, or test ids

2. `LabPanel`
   - used by `EventLoopLab` for generic state/output/explanation panels
   - used by `PromiseResolutionLab` for generic outcome/explanation panels
   - intentionally not forced onto the specialized Async Waterfall schedule panels
   - intentionally not used for the existing semantically distinct `Active Promise handler` section

3. `LabControls`
   - used by all three labs
   - owns only flex/wrap/trailing-content layout
   - native buttons, labels, disabled rules, event handlers, and playback behavior remain in each specialized lab

4. `ScenarioSelect`
   - used by `EventLoopLab` and `PromiseResolutionLab`
   - owns visible label/select association, string-valued options, generated id, description, and presentation
   - does not own scenario lookup, reset behavior, domain ids, or a shared scenario type

5. `ScrollableCodeRegion`
   - used by `EventLoopLab` and `PromiseResolutionLab`
   - preserves explicit accessible naming, `tabIndex={0}`, horizontal scrolling, focus treatment, and `<pre><code>` markup
   - does not replace MDX/Shiki code blocks and does not execute code

6. `LiveStatus`
   - used by all three labs
   - owns the polite live-region/status presentation only
   - stable lesson-specific `data-testid` values remain on children owned by specialized labs

An explicit barrel file exports only these primitives and their presentation prop types.

### Domain models remain unchanged

The following pure learning-model files are unchanged relative to `main`:

- `lib/learning/async-schedule.ts`
- `lib/learning/browser-event-loop.ts`
- `lib/learning/promise-resolution.ts`

They remain React-free and contain all domain semantics.

No shared state-machine, transition schema, generic runner, autoplay hook, or execution-timeline abstraction was introduced.

## Behavior preservation

### Async Waterfall

Preserved:

- default 1500ms sequential total
- default 800ms concurrent total
- default 700ms savings
- duration editing/clamping
- reset behavior
- Play/Replay behavior
- reduced-motion-safe timeline animation
- specialized timeline and timing-table rendering
- stable `sequential-total`, `concurrent-total`, and `time-saved` selectors

The lab uses only `LabShell`, `LabControls`, and `LiveStatus`; it is not forced into scenario/step semantics.

### Browser Event Loop

Preserved:

- all six scenario definitions
- deterministic transition ordering
- both valid scheduler-choice branches
- bounded starvation behavior
- rendering-opportunity semantics
- native Step/Run/Reset rules
- event-loop queue/source visualization
- stable `event-loop-status` and `event-loop-output` selectors

All Event Loop model imports and transition functions remain specialized.

### Promises

Preserved:

- all six Promise scenarios
- pending + adopting intermediate state
- return / throw / adopt semantics
- catch recovery
- finally transparency scenario
- independent branching
- native Step/Run/Reset rules
- `PromiseCard` domain rendering
- distinct `Active Promise handler` semantic section
- stable `promise-lab-status`, `promise-lab-output`, `active-promise-handler`, and `promise-node-*` selectors

All Promise resolution types and transition functions remain specialized.

## Verification evidence before self-review commit

Permanent GitHub Actions **CI #110** on exact implementation head `4b5d699c7f5ed545bf240b4de697b8e69cf40d23` completed successfully.

Verified from the closed job log:

- `pnpm install --frozen-lockfile` — PASS
- `pnpm lint` — PASS, no repository lint errors or warnings
- `pnpm typecheck` — PASS
- unit tests — **5 test files / 31 tests PASS**
  - includes `tests/learning-primitives.test.ts` with **6/6 primitive contract tests**
- `pnpm build` — PASS
- Chromium install — PASS
- `pnpm test:e2e` — **32/32 Playwright tests PASS**
- existing axe serious/critical accessibility checks remain enabled and pass as part of the Playwright suite

The primitive contract test was specifically corrected during implementation after CI revealed that the initial `.test.tsx` file was excluded by the repository's existing Vitest include pattern. The final test uses the existing `.test.ts` discovery policy and no Vitest configuration change was made.

## Accessibility regression coverage

The extraction now has direct protection for centralized semantics in addition to the existing axe suites:

- `LabShell` server-rendered contract asserts named section / visible heading relationship
- `LabPanel` server-rendered contract asserts named semantic section
- `ScenarioSelect` contract asserts label/select association and visible description
- `ScrollableCodeRegion` contract asserts named region, keyboard focusability, and pre/code markup
- `LiveStatus` contract asserts `aria-live="polite"` while preserving domain-owned content/test ids
- Event Loop browser coverage asserts lab heading/section relationship, source-region focusability, and polite status ancestry
- Promise browser coverage asserts exact scenario label, source-region focusability, and polite status ancestry
- Async Waterfall browser coverage asserts the savings result remains inside a polite live region

No axe rule was disabled or excluded.

## Diff audit

Fresh compare against `main` before adding this self-review document:

- branch status: **ahead**
- ahead by: **21 commits**
- behind by: **0 commits**
- changed files: **16**

Expected changed implementation/test files:

- `components/learning/async-waterfall-lab.tsx`
- `components/learning/event-loop-lab.tsx`
- `components/learning/promise-resolution-lab.tsx`
- `components/learning/primitives/index.ts`
- `components/learning/primitives/lab-controls.tsx`
- `components/learning/primitives/lab-panel.tsx`
- `components/learning/primitives/lab-shell.tsx`
- `components/learning/primitives/live-status.tsx`
- `components/learning/primitives/scenario-select.tsx`
- `components/learning/primitives/scrollable-code-region.tsx`
- `tests/learning-primitives.test.ts`
- `tests/e2e/async-waterfalls.spec.ts`
- `tests/e2e/browser-event-loop.spec.ts`
- `tests/e2e/promises.spec.ts`

Expected design/process files:

- `docs/superpowers/specs/2026-08-21-learning-primitives-design.md`
- `docs/superpowers/plans/2026-08-21-learning-primitives.md`
- this self-review document after commit

Confirmed absent from the diff before this document:

- `lib/learning/async-schedule.ts`
- `lib/learning/browser-event-loop.ts`
- `lib/learning/promise-resolution.ts`
- all lesson MDX files
- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/ci.yml`
- content schema files
- Vitest configuration

No dependency, hosted-service, database, analytics, or model-API change was introduced.

## Abstraction review

Each extracted component is presentation-only:

- `LabShell` standardizes an accessible outer teaching surface.
- `LabPanel` standardizes a titled content container.
- `LabControls` standardizes action-row layout without owning actions.
- `ScenarioSelect` standardizes a controlled string-valued selector without defining scenario semantics.
- `ScrollableCodeRegion` standardizes a focusable source-code region without execution/highlighting semantics.
- `LiveStatus` standardizes polite status announcements without defining statuses.

The dependency direction remains:

```text
lesson MDX
   ↓
specialized lab component
   ├──→ learning primitives (presentation only)
   └──→ pure lesson model (domain semantics only)
```

Primitives do not import `lib/learning/*`, and pure models do not import React or primitives.

### Intentionally deferred

Still deferred until future lesson evidence justifies them:

- generic scenario/state-machine runner
- generic playback/autoplay hook
- execution timeline primitive
- generic queue visualization
- Promise/node visualization
- `CodeComparison`
- quiz/challenge primitives
- benchmark visualization
- freshness badge
- source list
- Sandpack
- WebContainers

Phase 0.3 does not require extracting every candidate listed in the roadmap; it establishes the evidence-based extraction pattern and the presentation primitives proven by the first three labs.

## Known upstream/tooling warnings

Observed CI warnings that predate or are independent of PR #8:

- pnpm reports ignored build scripts for `esbuild` and `unrs-resolver`
- Vitest/Vite warns that `vitest.config.ts` uses ESM syntax while loaded as CommonJS under the future native config-loader migration
- Next.js reports that no build cache is configured in CI
- GitHub-hosted Actions report Node.js 20 deprecation for action implementations being forced onto Node.js 24
- Node tooling emits `punycode` / legacy URL parsing deprecation warnings inside dependencies/actions

None required a project configuration change for Phase 0.3.

## Final verification requirement

This document changes the branch head. Therefore the implementation is **not ready for PR handoff solely on CI #110**.

The exact final branch head containing this self-review must pass the permanent GitHub Actions workflow again. Only after that run is successful, its exact test counts are read from logs, and a final diff audit remains clean should PR #8 be retitled, updated, and marked ready for review.
