---
name: atlas-lesson-authoring
description: Use when authoring, revising, or reviewing Software Development Atlas lessons, deep-dives, decision guides, or architecture walkthroughs. Enforces deliberate visual-medium selection, meaningful visual pacing, production micro-scenarios, active mental-model checks, actionable review checklists, and TermBox moderation.
---

# Atlas Lesson Authoring & Pedagogical Quality Standard

This skill defines the operational workflow for creating or improving lessons in the **Software Development Atlas** (`software-development-atlas`). The canonical human-facing policy lives in `CONTENT_GUIDE.md`; this skill turns that policy into concrete authoring steps.

## When to Activate This Skill

Activate this skill whenever you are:

- writing a new lesson (`concept`, `deep-dive`, `decision-guide`, `field-guide`, or `architecture-walkthrough`);
- revising or materially polishing an existing lesson;
- reviewing a PR for lesson engagement, readability, visual cadence, accessibility, localization, or technical rigor.

---

## The 6 Core Pedagogical Rules

### 1. Meaningful visual cadence (target 3–4 anchors)

Long walls of prose create cognitive fatigue, but **visual anchors are not image quotas**.

For substantive lessons (`deep-dive`, `decision-guide`, `architecture-walkthrough`):

- target roughly **3–4 meaningful visual anchors**;
- aim for a visual break every **1–2 conceptual sections** where it improves comprehension;
- count programmatic illustrations, Mermaid, decision matrices, and interactive labs/explorers when they genuinely teach something;
- do not add generated/static artwork merely to hit a count.

Before proposing a visual, write down the learner misunderstanding it should prevent.

### 2. Choose the visual medium deliberately

Choose the medium from the learning objective, not from visual novelty.

- **Programmatic diagram:** use when correctness depends on exact state, ordering, timing, values, protocol layering, dependency shape, transaction boundaries, or editable labels.
- **Static teaching illustration:** use when the primary goal is spatial/operational intuition such as bottlenecks, resource pressure, fan-out, blast radius, cold-start lifecycle, ambiguous outcomes, retry storms, ownership boundaries, or cascading failure.
- **Mermaid:** use for textual, diffable decision trees, sequence diagrams, state graphs, and structural flows that benefit from easy source editing.
- **Interactive lab/explorer:** use only when changing inputs, stepping through behavior, making a prediction, or comparing scenarios materially improves the mental model.

Do not replace an exact diagram with generated artwork merely because the generated image looks richer.

#### Static teaching illustration contract

When a static teaching illustration is the right medium:

1. Keep the lesson-facing API semantic: `<AtlasIllustration id="semantic-id" />`.
2. Store the asset at `public/illustrations/<domain>/<semantic-id>.webp`.
3. Reuse one semantic asset for English and Vietnamese by default.
4. Keep title, caption, accessible description, exact labels, and important numbers in HTML/MDX where practical.
5. Put little or no meaningful prose inside image pixels.
6. Treat the asset as supplementary: the lesson must remain technically understandable without seeing it.
7. Default to a 16:9 landscape teaching canvas (normally 1600×900) and keep the image readable at normal article width.
8. Target a compressed WebP below roughly 300 KB where practical without visible teaching-quality loss.

#### Atlas art direction

Static teaching illustrations should feel like one family:

- dark-native charcoal / graphite / deep-navy canvas;
- restrained semantic accents;
- emerald/cyan for healthy or allowed flow;
- amber for pressure, delay, uncertainty, or constrained capacity;
- red only for failure or dangerous overload;
- simplified infrastructure/runtime objects;
- subtle depth or isometric perspective only when it clarifies relationships;
- strong negative space and clear reading direction;
- minimal ornament, no stock-photo look, no logos;
- no decorative humans unless human behavior is part of the concept.

#### Generation prompt recipe

A generation brief must specify:

1. the learner misconception or mental model to teach;
2. the primary spatial relationship;
3. required objects or system boundaries;
4. flow direction;
5. healthy, constrained, ambiguous, and failed conditions;
6. Atlas technical-editorial art direction;
7. minimal/no baked text;
8. 16:9 landscape composition;
9. enough negative space for responsive framing;
10. any semantic implication the image must avoid.

Example:

```text
Create a Software Development Atlas teaching illustration for bounded concurrency.
Teaching goal: make it immediately clear that a large queue of independent jobs is intentionally narrowed through five active workers to protect a finite downstream database/API.
Composition: left-to-right 16:9 technical-editorial scene. Large dense waiting queue on the left, narrow five-lane worker gate in the center, finite downstream service on the right. Queued work must look waiting rather than active. Healthy flow uses restrained emerald/cyan; pressure uses amber. Dark charcoal/navy self-contained canvas, subtle depth, minimal ornament, no people, no logos, no paragraph text, no important labels or numbers baked into pixels.
Do not imply that only five jobs exist; the limit applies to active work while the larger backlog waits.
```

Prompts come from verified lesson semantics, not from aesthetics alone.

### 3. Real-world production micro-scenarios

Bridge abstract language specifications and architecture theory to engineering stakes. Every substantive lesson should include at least one credible production scenario with explicit anchors in the file's language.

For English:

- **Impact:** observable symptom, latency spike, outage, or data inconsistency;
- **Root cause:** exact mental-model error or flawed assumption;
- **Correct pattern:** robust code/architecture correction.

For Vietnamese:

- **Hậu quả:** triệu chứng production, độ trễ, outage hoặc sai lệch dữ liệu;
- **Nguyên nhân cốt lõi:** mô hình tư duy hoặc giả định sai;
- **Cách khắc phục chuẩn:** mẫu code hoặc giải pháp kiến trúc bền vững.

Do not fabricate fake precision. If a scenario is illustrative rather than sourced from a real incident, present it as a realistic scenario rather than claiming historical fact.

### 4. Interactive mental-model self-checks (`<details>`)

Give the learner an opportunity to predict or reason before revealing the answer.

```markdown
## Exercise

Predict the outcome before opening the explanation.

<details>
<summary>Show the reasoning</summary>

- Explain the relevant state transition or dependency step-by-step.

</details>
```

Use `<summary>Xem giải thích chi tiết</summary>` in Vietnamese companion files.

### 5. Actionable task-list checklists (`- [ ]`)

Turn review advice into concrete checks rather than passive rhetorical questions.

```markdown
- [ ] **Dependency:** Does operation B genuinely require data from operation A?
- [ ] **Capacity:** Can the downstream system absorb the proposed concurrency?
- [ ] **Failure:** What happens when the remote outcome is ambiguous?
```

The repository CSS provides the checklist presentation; keep the authored items meaningful without relying on styling.

### 6. TermBox moderation (typically 2–3 per lesson)

`<TermBox>` is for genuine learning barriers, not every technical noun.

- place it near the **first substantive use** where the term is needed for reasoning;
- prefer roughly **2–3** high-value boxes on a page rather than a dictionary wall;
- do not box ordinary working-developer vocabulary such as function, array, API, database, or HTTP request unless the lesson gives the term a specialized meaning;
- keep the definition in authored MDX so raw Markdown/agent retrieval remains useful.

---

## Visual Review Checklist

For every new or materially revised visual anchor, verify:

- [ ] **Teaching purpose:** What misunderstanding does this visual prevent?
- [ ] **Medium:** Is programmatic diagram, static teaching illustration, Mermaid, or interaction the best medium?
- [ ] **Accuracy:** Does the visual imply anything stronger than verified prose supports?
- [ ] **Redundancy:** Is another nearby visual already teaching the same relationship?
- [ ] **Localization:** Can English and Vietnamese reuse the same semantic asset?
- [ ] **Embedded text:** Can required labels and numbers remain outside image pixels?
- [ ] **Accessibility:** Is the teaching point available without interpreting pixels alone?
- [ ] **Responsive behavior:** Is it understandable at normal article width without accidental overflow?
- [ ] **Durability:** Can minor terminology or numeric changes avoid unnecessary asset regeneration?
- [ ] **Consistency:** Does the visual follow the Atlas art direction rather than introducing an unrelated style?

---

## Step-by-Step Lesson Improvement Workflow

1. **Verify map concepts:** Check `content/atlas-map.json`; never invent ad-hoc concept IDs.
2. **Review frontmatter:** Confirm `contentType`, `learningDepth`, `concepts`, freshness metadata, prerequisites, and related concepts.
3. **Identify learning barriers:** List the concrete behaviors, terms, decisions, or failure modes likely to confuse a working developer.
4. **Plan visual anchors:** For each proposed anchor, state its teaching purpose and choose its medium deliberately.
5. **Pace the content:** A common substantive flow is:
   - TL;DR + concrete mental model;
   - Visual Anchor 1 — simplest useful behavior or comparison;
   - Core explanation + first high-value `TermBox`;
   - Visual Anchor 2 — deeper dependency, boundary, or lifecycle relationship;
   - Production micro-scenario — Impact / Root cause / Correct pattern;
   - Visual Anchor 3 — edge case, system pressure, or architectural consequence;
   - Exercise / quiz in `<details>`;
   - Agent rule or review checklist.
6. **Check bilingual parity:** English and Vietnamese companions use the same semantic illustration concepts; generated/static pixels are shared by default. Keep `lastVerified` identical across the pair when both are updated.
7. **Update dates when applicable:** Bump `lastVerified` for intentional re-verification or material teaching/factual changes; bump `atlasLastUpdated` in `lib/site-metadata.ts` when the docs footer should move; sync body date lines and hard-coded footer tests. Do not bump `lastVerified` for typo-only edits, and do not mass-bump every lesson because the footer moved.
8. **Run visual review:** Apply the 10-item checklist above.
9. **Run machine checks:** At minimum run the relevant illustration/content tests plus typecheck and lint; run E2E when a visual renderer or responsive layout changes.

Published substantive lessons must not contain illustration-placeholder blocks. If a draft uses a temporary placeholder, its prompt must be explicit and language-pure, and the placeholder must be replaced before publication.
