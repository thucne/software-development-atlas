# Atlas Visual Demonstration System Design

Date: 2026-09-09
Status: approved direction; written-spec review pending
Scope: all current and future substantive Atlas lessons

## 1. Goal

Create a durable visual system for Software Development Atlas lessons so authors and coding agents can choose the right visual medium consistently instead of treating every visual anchor as interchangeable.

The system must improve teaching quality without trading away technical precision, accessibility, localization, maintainability, or page performance.

The central rule is:

> Choose the visual medium from the learning objective, not from visual variety.

A visual is successful when it removes a specific learner misunderstanding faster or more clearly than prose alone. A visual is not successful merely because it makes the page look richer.

## 2. Why Atlas needs a visual system

Atlas already has a strong visual-cadence rule: substantive deep dives, decision guides, and architecture walkthroughs should normally contain at least three to four meaningful visual anchors. The current eight substantive lessons satisfy that expectation and use `AtlasIllustration` IDs consistently across English and Vietnamese companions.

The remaining problem is medium selection.

Many current `AtlasIllustration` definitions are technically correct but visually similar: bordered cards, arrows, comparison columns, timelines, and small charts. That style works well when the learner needs exact ordering, topology, state, or values. It is less effective when the lesson is trying to create intuition about pressure, failure, scale, ambiguity, ownership, or blast radius.

For example, bounded concurrency is not mainly a sequence of four boxes. The learner should feel that a very large amount of work is being narrowed through a finite worker pool so a downstream dependency is protected. A richer teaching illustration can communicate that system pressure more directly while the prose and labels retain the exact semantics.

The visual system therefore separates four media by teaching purpose:

1. programmatic diagrams;
2. generated/static teaching illustrations;
3. Mermaid diagrams;
4. interactive labs and explorers.

The goal is not to increase image count. The goal is to make each visual anchor earn its place.

## 3. Scope

This design applies to:

- all current and future `deep-dive` lessons;
- all current and future `decision-guide` lessons;
- all current and future `architecture-walkthrough` lessons;
- substantial concept pages when a visual anchor materially improves the mental model;
- English and Vietnamese companion lessons;
- the reusable MDX visual layer;
- lesson-authoring guidance used by humans and coding agents;
- visual regression and authoring tests where useful invariants can be machine checked.

The first migration covers the eight current substantive lessons:

### Programming / async

- `content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx`
- `content/docs/programming/async/how-the-browser-event-loop-works.mdx`
- `content/docs/programming/async/promises.mdx`

### Web platform

- `content/docs/web-platform/http-request-lifecycle.mdx`

### Engineering Judgment / decision guides

- `content/docs/engineering-judgment/decision-guides/containers-vs-serverless.mdx`
- `content/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg.mdx`
- `content/docs/engineering-judgment/decision-guides/monolith-vs-modular-monolith-vs-microservices.mdx`

### Engineering Judgment / architecture walkthrough

- `content/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout.mdx`

## 4. Non-goals

This pass must not:

- replace all current programmatic diagrams with generated images;
- create a quota requiring generated images in every lesson;
- make a generated image the only place where a technical fact is stated;
- bake required English or Vietnamese prose into image pixels;
- create separate English and Vietnamese artwork when one semantic asset can be shared;
- add runtime image generation, model APIs, hosted image services, or paid infrastructure;
- replace interactive labs when manipulation or stepping through behavior is the teaching objective;
- replace Mermaid merely for visual polish when an editable textual graph is the better maintenance boundary;
- introduce decorative stock-style artwork that does not teach a concrete concept;
- add a new visual asset registry if the existing `AtlasIllustration` semantic-ID layer can own the classification cleanly;
- make visual consistency depend on undocumented prompt folklore.

## 5. Visual-medium decision contract

### 5.1 Programmatic diagram

Use a programmatic HTML/SVG/React diagram when correctness depends on exact structure.

Preferred use cases:

- state transitions;
- exact ordering;
- event-loop scheduling;
- timing comparisons;
- protocol layering;
- dependency graphs;
- exact counts, values, labels, or thresholds;
- cache-validation paths;
- transaction/outbox boundaries;
- charts where the numeric relationship is the lesson.

Programmatic diagrams are preferred when a future text, number, state, or topology correction should be editable in code without regenerating artwork.

### 5.2 Generated/static teaching illustration

Use a generated/static teaching illustration when the primary learning objective is spatial or operational intuition rather than exact diagram semantics.

Preferred use cases:

- bottlenecks and resource pressure;
- fan-out and backpressure;
- cascading failure;
- blast radius;
- cold-start or lifecycle intuition;
- overloaded downstream dependencies;
- ambiguous distributed outcomes;
- retry storms;
- ownership and architectural boundary intuition;
- conceptual metaphors where scale or physical arrangement makes the idea memorable.

The illustration should communicate the shape of the problem immediately. Exact names, numbers, labels, and qualifying prose remain in HTML/MDX where practical.

### 5.3 Mermaid

Use Mermaid when the learner needs a structural or decision graph that benefits from remaining textual, diffable, and easy to revise.

Preferred use cases:

- decision trees;
- architecture flow overviews;
- sequence diagrams;
- state graphs that do not need bespoke presentation;
- heuristics where branch wording is part of the content.

Do not replace Mermaid with a generated image solely for visual novelty.

### 5.4 Interactive lab or explorer

Use an interactive lab/explorer only when interaction materially improves mental-model formation.

Preferred use cases:

- changing inputs and observing outcomes;
- stepping through scheduler behavior;
- comparing scenarios on one shared scale;
- making a prediction and testing it;
- exploring paths that would be cumbersome to enumerate statically.

Interaction must remain supplementary. Canonical rules and reasoning still live in authored content.

## 6. Visual anchors are not image quotas

The existing target of three to four visual anchors per substantive lesson remains useful, but the count applies to meaningful visual anchors rather than generated images.

A strong lesson might contain:

- one generated teaching illustration;
- one precise programmatic diagram;
- one Mermaid decision tree;
- one interactive lab.

Another strong lesson might contain four precise diagrams and no generated image at all.

Authors must not add generated images simply to satisfy cadence. A visual anchor should answer a teaching question that nearby prose, code, or another visual does not already answer well.

## 7. Current 31-illustration inventory and first migration

The eight current substantive lessons contain 31 `AtlasIllustration` concepts. The first migration should convert 12 of them into richer teaching illustrations and keep 19 programmatic.

### 7.1 Avoiding Sequential Async Waterfalls

Current concepts:

- `network-waterfall-vs-overlap` — keep programmatic;
- `dag-critical-path` — keep programmatic;
- `bounded-concurrency` — convert to teaching illustration.

Teaching-illustration goal for `bounded-concurrency`: show a very large queue narrowing through a five-worker gate before a finite downstream service/database. The protected downstream boundary and the difference between queued work and active work should be obvious without relying on embedded prose.

### 7.2 How the Browser Event Loop Actually Works

Current concepts:

- `event-loop-architecture` — keep programmatic;
- `microtask-checkpoint-drain` — keep programmatic;
- `browser-rendering-pipeline` — keep programmatic;
- `main-thread-starvation` — convert to teaching illustration.

Teaching-illustration goal for `main-thread-starvation`: show a continuously replenishing microtask stream occupying the main-thread path while input, rendering, and later task work accumulate behind it.

### 7.3 Promises: Resolution, Chaining, and Failure

Current concepts:

- `promise-state-machine` — keep programmatic;
- `promise-chain-outcomes` — keep programmatic;
- `promise-error-propagation` — keep programmatic;
- `promise-combinators` — keep programmatic.

No generated images are proposed. Exact Promise state, adoption, propagation, and combinator semantics are better served by deterministic diagrams.

### 7.4 HTTP Request Lifecycle

Current concepts:

- `http-request-paths` — keep programmatic;
- `http-cache-revalidation` — keep programmatic;
- `http-version-architecture` — keep programmatic;
- `request-boundary-ownership` — convert to teaching illustration.

Teaching-illustration goal for `request-boundary-ownership`: show a request moving through possible ownership boundaries such as client cache, network, CDN/intermediary, gateway/load balancer, and origin application, with the idea that earlier layers may answer and later layers may never participate.

### 7.5 Containers vs Serverless

Current concepts:

- `cold-vs-warm-start` — convert to teaching illustration;
- `packaging-vs-operating-boundary` — keep programmatic;
- `serverless-downstream-avalanche` — convert to teaching illustration;
- `tco-crossover` — keep programmatic.

`cold-vs-warm-start` should emphasize lifecycle/startup intuition rather than a generic before/after card.

`serverless-downstream-avalanche` should show rapidly expanding compute concurrency converging on a much smaller downstream connection/capacity boundary.

### 7.6 CSR vs SSR vs SSG

Current concepts:

- `rendering-strategies-timeline` — keep programmatic;
- `hydration-gap` — convert to teaching illustration;
- `isr-lifecycle` — keep programmatic;
- `hybrid-rendering-architecture` — convert to teaching illustration.

`hydration-gap` should communicate the period where useful HTML is visible but interactive behavior is not yet fully attached.

`hybrid-rendering-architecture` should show one product surface combining static/shared regions, request-rendered regions, and long-lived client-rendered regions without implying that one acronym owns the whole application.

### 7.7 Monolith vs Modular Monolith vs Microservices

Current concepts:

- `architecture-boundary-comparison` — convert to teaching illustration;
- `blast-radius-comparison` — convert to teaching illustration;
- `local-transaction-vs-saga` — keep programmatic;
- `distributed-monolith` — convert to teaching illustration.

This lesson benefits strongly from spatial intuition. The generated illustrations should make deployment boundaries, internal modularity, failure isolation, and tightly coupled cross-service dependencies visually distinct.

### 7.8 Reliable Checkout Walkthrough

Current concepts:

- `checkout-consistency-boundaries` — keep programmatic;
- `payment-ambiguity-window` — convert to teaching illustration;
- `dual-write-vs-outbox` — keep programmatic;
- `retry-storm-vs-jitter` — convert to teaching illustration.

`payment-ambiguity-window` should show a payment provider completing a charge while the response is lost before the caller learns the outcome.

`retry-storm-vs-jitter` should contrast synchronized retry waves with spread-out retries that allow a recovering dependency to absorb load.

### 7.9 Migration total

- teaching illustrations to generate: 12;
- programmatic illustrations to retain: 19;
- total current Atlas illustration concepts: 31.

This is a first-generation allocation, not a permanent ratio.

## 8. Pilot order

Generate and integrate four pilot illustrations before producing the remaining eight:

1. `bounded-concurrency`;
2. `serverless-downstream-avalanche`;
3. `hydration-gap`;
4. `payment-ambiguity-window`.

These four exercise different teaching needs:

- throughput pressure and backpressure;
- cascading infrastructure overload;
- lifecycle/timing intuition;
- ambiguous distributed outcome.

The pilot is considered successful when the same art direction and rendering contract works across all four without weakening technical accuracy or localization.

After the pilot, migrate:

5. `main-thread-starvation`;
6. `request-boundary-ownership`;
7. `cold-vs-warm-start`;
8. `hybrid-rendering-architecture`;
9. `architecture-boundary-comparison`;
10. `blast-radius-comparison`;
11. `distributed-monolith`;
12. `retry-storm-vs-jitter`.

## 9. Atlas art direction

Generated/static teaching illustrations must look like one Atlas system rather than unrelated AI images.

### 9.1 Visual language

Use a technical editorial style with these characteristics:

- dark-native, self-contained illustration canvas;
- charcoal, graphite, and deep navy base tones;
- restrained semantic accents;
- emerald/cyan for healthy or allowed flow;
- amber for pressure, delay, uncertainty, or constrained capacity;
- red only for failure or dangerous overload;
- simplified infrastructure and runtime objects;
- subtle depth or isometric perspective only when it clarifies relationships;
- strong negative space;
- a clear reading direction, usually left-to-right;
- minimal ornament;
- no stock-photo aesthetic;
- no decorative humans unless human behavior is necessary to the concept.

### 9.2 Text inside images

Generated image pixels should contain little or no meaningful language.

Do not bake into the image:

- paragraph text;
- localized labels;
- important numbers;
- exact protocol names when those names are necessary to understand the lesson;
- captions;
- legends that must be read for correctness.

Prefer visual symbols and spatial relationships in the asset, then render precise labels, values, title, caption, and explanation in HTML/MDX.

If a tiny visual marker is unavoidable, it must not carry unique technical meaning that is absent from adjacent text.

### 9.3 Theme behavior

Use one semantic illustration asset in both light and dark site themes. The illustration itself may use the dark-native Atlas canvas inside the page in both themes.

Do not create separate light/dark generated assets unless a future visual demonstrates a real accessibility problem that cannot be solved through framing or contrast.

## 10. Asset and semantic-ID contract

The existing MDX interface remains the stable authoring boundary:

```mdx
<AtlasIllustration id="bounded-concurrency" />
```

Lesson files should not need to know whether an illustration ID is rendered by:

- programmatic React/HTML/SVG; or
- a static teaching image.

The `AtlasIllustration` layer owns that rendering decision.

This preserves:

- semantic IDs across English and Vietnamese;
- future medium changes without lesson churn;
- one place for localized title/caption/accessible description;
- one place for image sizing and presentation rules.

### 10.1 Asset path convention

Static teaching images should use:

```text
public/illustrations/<domain>/<illustration-id>.webp
```

Recommended domains for the first migration:

```text
public/illustrations/
  async/
    bounded-concurrency.webp
    main-thread-starvation.webp
  http/
    request-boundary-ownership.webp
  cloud/
    cold-vs-warm-start.webp
    serverless-downstream-avalanche.webp
  rendering/
    hydration-gap.webp
    hybrid-rendering-architecture.webp
  architecture/
    architecture-boundary-comparison.webp
    blast-radius-comparison.webp
    distributed-monolith.webp
  checkout/
    payment-ambiguity-window.webp
    retry-storm-vs-jitter.webp
```

The filename must match the semantic illustration ID exactly.

### 10.2 Image dimensions and compression

Use a consistent landscape teaching canvas, targeting 16:9 for the first generation.

Recommended source/export target:

- 1600 × 900 pixels;
- WebP for repository delivery;
- visually clean compression with a target payload below roughly 300 KB where practical;
- no upscaled low-resolution source artwork.

If an illustration genuinely needs a different aspect ratio, document the reason in the implementation review rather than silently creating a new pattern.

## 11. Accessibility contract

Generated/static illustrations are supplementary teaching media, not the canonical source of truth.

Every static teaching illustration must satisfy all of the following:

1. The surrounding lesson remains technically understandable without the image.
2. The `AtlasIllustration` definition provides a concise localized accessible description of the main visual relationship.
3. Exact numbers, state names, protocol guarantees, or required labels remain available as text when they matter to reasoning.
4. The visible caption states the teaching point in authored text.
5. Color is not the only carrier of meaning.
6. The visual remains interpretable when scaled to the normal article column width.
7. Important content does not require horizontal scrolling merely because the asset was generated at a wide desktop size.
8. If the image becomes misleading after a future content correction, the illustration must be updated or reverted to a programmatic representation.

A generated image must never be used to hide content from screen-reader or text-only users.

## 12. Localization contract

English and Vietnamese companions should reuse the same semantic image asset wherever possible.

Localized content belongs in the `AtlasIllustration` definition and surrounding MDX:

- title;
- caption;
- accessible description;
- labels rendered outside the image where needed.

Do not create files such as:

```text
bounded-concurrency.en.webp
bounded-concurrency.vi.webp
```

unless a future concept truly requires localized pixels and the exception is explicitly reviewed.

The default and strongly preferred contract is one text-light asset plus localized HTML.

## 13. Prompt recipe for future illustration generation

The authoring guidance must include a stable generation recipe so later assets do not drift stylistically.

A future generated teaching illustration prompt should specify:

1. the exact learner misconception or mental model to teach;
2. the primary spatial relationship;
3. the objects or system boundaries that must appear;
4. the flow direction;
5. which conditions are healthy, constrained, ambiguous, or failed;
6. the Atlas technical-editorial art direction;
7. the requirement for minimal/no baked text;
8. the 16:9 landscape composition;
9. sufficient negative space for responsive cropping/framing;
10. any semantic details that must not be implied incorrectly.

Example structure:

```text
Create a Software Development Atlas teaching illustration for bounded concurrency.
Teaching goal: make it immediately clear that a large queue of independent jobs is intentionally narrowed through five active workers to protect a finite downstream database/API.
Composition: left-to-right 16:9 technical editorial scene. Large dense queue on the left, narrow five-lane worker gate in the center, downstream service with visibly finite capacity on the right. Queued work must look waiting rather than active. Healthy flow uses restrained emerald/cyan; pressure uses amber. Dark charcoal/navy self-contained canvas, subtle depth, minimal ornament, no people, no logos, no paragraph text, no important labels or numbers baked into pixels.
Do not imply that only five jobs exist; the limit applies to active work while the larger backlog waits.
```

Prompts should be derived from the lesson's verified semantics, not from an aesthetic description alone.

## 14. Authoring workflow for new lessons

When adding or revising a substantive lesson:

1. Identify the specific learner misunderstanding each proposed visual anchor addresses.
2. Decide whether exactness or intuition is the primary teaching need.
3. Choose programmatic diagram, teaching illustration, Mermaid, or interactive lab using the medium contract above.
4. Reuse an existing semantic illustration ID only when the concept is truly the same.
5. For a new generated/static illustration, define the semantic ID and localized textual metadata before generating the asset.
6. Keep technical labels outside the image where practical.
7. Verify that English and Vietnamese use the same concept and asset.
8. Review accessibility and responsive behavior.
9. Check that the visual does not duplicate a nearby diagram, lab, or table.
10. Run the repository's illustration/content tests before submission.

## 15. Review checklist

Every new or revised visual anchor should be reviewed with this checklist:

- [ ] **Teaching purpose:** What misunderstanding does this visual prevent?
- [ ] **Medium:** Is exact diagram, teaching illustration, Mermaid, or interaction the best medium?
- [ ] **Accuracy:** Does the visual imply anything stronger than the verified prose supports?
- [ ] **Redundancy:** Is another nearby visual already teaching the same relationship?
- [ ] **Localization:** Can English and Vietnamese reuse the same semantic asset?
- [ ] **Embedded text:** Can required labels and numbers remain outside the pixels?
- [ ] **Accessibility:** Is the teaching point available without interpreting the image alone?
- [ ] **Responsive behavior:** Is the visual understandable at normal article width without accidental overflow?
- [ ] **Durability:** Will minor terminology or numeric corrections avoid unnecessary image regeneration?
- [ ] **Consistency:** Does the asset follow the Atlas art direction rather than introducing a new visual style?

## 16. Test strategy

The existing illustration tests correctly enforce two useful invariants:

- published substantive lessons do not contain authoring placeholders;
- English and Vietnamese companions use the same `AtlasIllustration` concepts.

However, the existing test also treats three `AtlasIllustration` calls as the visual-cadence minimum. That encourages an illustration-count interpretation even though the authoring standard allows Mermaid diagrams, decision matrices, and interactive labs as meaningful visual anchors.

The implementation should revise the tests so they express the new contract.

### 16.1 Keep

Keep tests that verify:

- no illustration placeholders remain in published lessons;
- English and Vietnamese companion lessons use matching `AtlasIllustration` IDs;
- every referenced `AtlasIllustration` ID resolves to a registered definition.

### 16.2 Add

Add tests for static teaching-image definitions:

- every static teaching-image definition has an asset path;
- every static teaching-image definition has localized accessible descriptions;
- the referenced asset file exists;
- the asset uses an approved repository image extension;
- one shared asset is used across locales by default.

Add or revise visual-cadence checks to count meaningful visual anchors rather than only generated/programmatic `AtlasIllustration` calls. Eligible anchors may include:

- `AtlasIllustration`;
- Mermaid blocks;
- `DecisionMatrix`;
- interactive `*Lab` components;
- interactive `*Explorer` components.

The machine check should enforce presence, not artistic quality. Human review remains responsible for deciding whether an anchor is pedagogically useful.

### 16.3 Do not automate

Do not attempt to machine-judge:

- whether a generated image is aesthetically good;
- whether it contains too much baked text through OCR;
- whether the metaphor is memorable;
- whether the art direction is stylistically perfect.

Those are review responsibilities, not stable test invariants.

## 17. Canonical documentation updates after spec approval

After this written spec is approved, the implementation plan should update at least:

- `CONTENT_GUIDE.md` — canonical human-facing visual-medium and accessibility/localization rules;
- `.agents/skills/atlas-lesson-authoring/SKILL.md` — operational decision procedure and review checklist for coding agents;
- `tests/illustrations.test.ts` — visual-cadence and static-asset invariants;
- `components/mdx/atlas-illustration.tsx` — renderer support for static teaching illustrations while preserving semantic IDs;
- the 12 selected illustration definitions and assets during the migration phases.

`AGENTS.md` should only be changed if it currently duplicates lesson-authoring rules that would otherwise become inconsistent. Prefer one canonical policy plus concise references over repeated long guidance.

## 18. Rollout and review gates

### Phase 1: policy and renderer contract

- update authoring guidance;
- update tests;
- add the static teaching-illustration renderer path without changing lesson IDs.

### Phase 2: four-image pilot

Integrate:

- `bounded-concurrency`;
- `serverless-downstream-avalanche`;
- `hydration-gap`;
- `payment-ambiguity-window`.

Review the pilot for:

- semantic accuracy;
- art-direction consistency;
- localization reuse;
- accessibility;
- light/dark site-theme presentation;
- mobile/article-width readability;
- asset weight.

Do not generate the remaining eight until the pilot establishes a stable pattern.

### Phase 3: remaining eight images

Migrate the remaining approved teaching-illustration IDs using the same component and art direction.

### Phase 4: regression and documentation review

Run the full quality suite and verify that future-authoring docs clearly prevent these anti-patterns:

- image quotas;
- text-heavy generated assets;
- locale-specific duplicate artwork by default;
- generated images replacing exact diagrams for aesthetics alone;
- inaccessible image-only teaching;
- uncontrolled visual-style drift.

## 19. Success criteria

The visual system is successful when:

- future authors can consistently explain why a visual should be programmatic, generated/static, Mermaid, or interactive;
- generated images appear only where they materially improve intuition;
- exact technical diagrams remain easy to edit and verify;
- English and Vietnamese share semantic assets by default;
- no important technical information exists only inside image pixels;
- new generated illustrations look recognizably like one Atlas family;
- responsive rendering does not reintroduce horizontal-overflow problems;
- the first 12-image migration improves teaching quality without turning the Atlas into an image-heavy site;
- repository tests guard objective invariants without pretending to automate visual taste.
