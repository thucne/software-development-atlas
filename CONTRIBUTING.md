# Contributing to Software Development Atlas

Thank you for helping build Software Development Atlas. Contributions can be new lessons, corrections, better examples, interactive visualizations, accessibility improvements, tooling, or reports that content has become outdated.

## Before you contribute

Please read [CONTENT_GUIDE.md](./CONTENT_GUIDE.md). It defines the content contract, freshness model, source expectations, and lesson structure.

For substantial site or architecture changes, open an issue first so the direction can be agreed before implementation. Small corrections can go directly to a pull request.

## Contribution types

### New lesson

A strong lesson should:

- teach one coherent concept or closely related set of concepts;
- state prerequisites and related topics;
- distinguish fundamentals from technology-specific behavior;
- include concrete examples;
- explain trade-offs and failure modes, not only the happy path;
- prefer primary sources for claims about evolving technologies;
- declare its freshness category and verification date;
- avoid unnecessary interactivity when static explanation is clearer.

Use the **New lesson** issue form when proposing a larger topic.

### Correction

Corrections should identify the claim being changed and, when factual, provide an authoritative source. Small typo or wording fixes do not require an issue.

### Outdated content

Use the **Outdated content** issue form when a lesson was once correct but is no longer current. Include the relevant technology/version and a primary source when possible.

### Site or tooling change

Keep the project's zero-cost guarantee intact. A required dependency that introduces a billable API, payment method, usage-based service, paid search, hosted vector database, paid CMS, or paid database is out of scope for the core product.

## AI-assisted contributions

AI tools are welcome as assistants, not as authorities.

Contributors remain responsible for every submitted claim, example, citation, and code path. Do not submit large volumes of unreviewed model-generated lessons. Verify evolving technical claims against primary sources and run examples or tests where practical.

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

- the lesson or correction;
- any interactive component required specifically by that lesson;
- metadata updates;
- tests or validation updates when behavior changes.

### Pull request checklist

- [ ] I followed `CONTENT_GUIDE.md` where applicable.
- [ ] I verified factual claims, especially evolving/frontier claims.
- [ ] I preferred primary sources where available.
- [ ] Examples are minimal, correct, and production caveats are called out.
- [ ] The change does not require a maintainer-funded paid service.
- [ ] I considered keyboard and screen-reader accessibility for UI changes.
- [ ] I kept the pull request focused.

## Review philosophy

Review should optimize for correctness, clarity, durability, accessibility, and usefulness. Disagreement about wording or technique should be resolved by evidence and the needs of learners rather than personal style.
