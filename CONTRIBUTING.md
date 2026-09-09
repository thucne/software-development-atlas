# Contributing to Software Development Atlas

Thank you for helping build Software Development Atlas. Contributions can be new content, corrections, better examples, interactive visualizations, accessibility improvements, tooling, learning-path changes, engineering-judgment guides, or reports that material has become outdated.

## Before you contribute

Please read [CONTENT_GUIDE.md](./CONTENT_GUIDE.md). It defines the content contract, canonical Atlas placement, freshness model, source expectations, content types, learning-depth model, coverage semantics, learning-path rules, and Engineering Judgment authoring standard.

For new engineering content, also inspect [`content/atlas-map.json`](./content/atlas-map.json). Reuse canonical concept IDs whenever possible instead of inventing page-local labels.

For learning-path changes, inspect [`content/learning-paths.json`](./content/learning-paths.json) and the canonical map. A path may order existing concepts, but it must not create a second concept registry or hand-maintain authored page URLs.

For substantial site or architecture changes, open an issue first so the direction can be agreed before implementation. Small corrections can go directly to a pull request.

## Contribution types

### New Atlas content

A strong proposal should:

- identify the learner need and desired outcome;
- identify the Atlas domain/concept coverage it improves;
- choose the smallest suitable content type;
- state the intended learning depth (`recognize`, `reason`, or `operate`);
- state prerequisites and related topics;
- distinguish fundamentals from technology-specific behavior;
- include concrete examples where they improve understanding;
- explain trade-offs and failure modes when the content type calls for them;
- prefer primary sources for claims about evolving technologies;
- declare freshness category and verification date;
- avoid unnecessary interactivity when static explanation is clearer.

Use the **New Atlas content** issue form when proposing a larger topic.

A concept does not need to become a deep interactive lesson to be valuable. A focused concept page, decision guide, field guide, or architecture walkthrough may be the better unit.

### Engineering Judgment content

A `decision-guide` should help a reader make a conditional engineering choice. Strong proposals should name the decision, alternatives, constraints, important comparison criteria, operational/failure consequences, and the conditions under which the recommendation changes. Do not pitch one framework, runtime, or cloud product as universally best.

An `architecture-walkthrough` should trace a realistic vertical slice across boundaries. Include the happy path, then show where state changes, partial failure, retries/redelivery, security, observability, scaling/cost, and alternatives affect the design. Treat the walkthrough as a reference shape rather than a required topology.

Use the static `DecisionMatrix` MDX primitive when a semantic comparison table improves scanning. Do not create a second decision registry, scoring model, or page mapping to drive judgment content.

### Learning-path change

Learning paths are curated sequences for explicit learner outcomes. A strong path change should:

- explain the learner outcome or gap being improved;
- use only canonical concept IDs already present in `content/atlas-map.json`;
- preserve a deliberate teaching order rather than ordering by which pages happen to exist;
- keep important uncovered concepts visible when they are necessary to the path;
- avoid adding authored page URLs or duplicated content mappings;
- avoid adding incidental concept placement to content merely to improve the displayed coverage ratio.

Available content on a path is derived from authored MDX `concepts` frontmatter. Coverage is therefore evidence of authored support, not a score to optimize.

### Correction

Corrections should identify the claim being changed and, when factual, provide an authoritative source. Small typo or wording fixes do not require an issue.

### Outdated content

Use the **Outdated content** issue form when material was once correct but is no longer current. Include the relevant technology/version and a primary source when possible.

### Site or tooling change

Keep the project's zero-cost guarantee intact. A required dependency that introduces a billable API, payment method, usage-based service, paid search, hosted vector database, paid CMS, or paid database is out of scope for the core product.

## Canonical concept IDs

`content/atlas-map.json` is the source of truth for stable domain and concept IDs.

Before adding a new ID:

1. search the existing map for an equivalent concept;
2. choose the best durable domain home;
3. use lowercase kebab-case;
4. describe the concept at a technology-independent level when possible;
5. add the map entry and validation coverage in the same focused change.

Do not create a new concept merely because a page mentions a technology. Content should map only to concepts it materially teaches or applies.

## AI-assisted contributions

AI tools are welcome as assistants, not as authorities.

Contributors remain responsible for every submitted claim, example, citation, concept placement, learning-path decision, engineering recommendation, architecture trade-off, and code path. Do not submit large volumes of unreviewed model-generated content. Verify evolving technical claims against primary sources and run examples or tests where practical.

## Sources

Prefer sources in this order:

1. standards and specifications;
2. official documentation;
3. original research papers or project repositories;
4. authoritative engineering publications;
5. secondary explanations when they add useful interpretation.

Do not copy substantial text from sources. Summarize in original language and link to the source.

## Pull requests

Keep pull requests focused. A reviewer should be able to understand what changed and why without reviewing unrelated work.

A content pull request should normally include:

- the content or correction;
- correct `contentType`, `learningDepth`, and canonical `concepts` metadata;
- any interactive component required specifically by that content;
- map changes only when a genuinely new canonical concept is needed;
- tests or validation updates when behavior changes.

A learning-path pull request should normally include the path-data change, a learner-outcome rationale, and validation updates when the path model changes. It should not duplicate page URLs that can be derived from content placement.

An Engineering Judgment pull request should make the decision or system reasoning reviewable in Markdown, keep reusable UI static unless interactivity materially improves the teaching outcome, and include representative route/accessibility coverage when it changes presentation behavior.

### Pull request checklist

- [ ] I followed `CONTENT_GUIDE.md` where applicable.
- [ ] I checked the canonical Atlas map before choosing concept IDs.
- [ ] The content type and target learning depth match the learner outcome.
- [ ] I did not attach incidental concept IDs merely to improve coverage metrics.
- [ ] Decision guidance is conditional and explains trade-offs instead of naming a universal winner.
- [ ] Architecture walkthroughs cover relevant failure/recovery, security, observability, and alternatives.
- [ ] Learning-path changes use existing concept IDs and do not duplicate authored page URLs.
- [ ] I verified factual claims, especially evolving/frontier claims.
- [ ] I preferred primary sources where available.
- [ ] Examples are minimal, correct, and production caveats are called out when relevant.
- [ ] The change does not require a maintainer-funded paid service.
- [ ] I considered keyboard and screen-reader accessibility for UI changes.
- [ ] I kept the pull request focused.

## Review philosophy

Review should optimize for correctness, clarity, durability, accessibility, useful coverage, and engineering judgment. Disagreement about wording or technique should be resolved by evidence and learner needs rather than personal style.
