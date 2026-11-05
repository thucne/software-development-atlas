# Full-corpus structural inventory

Run once on demand:

    pnpm audit:content

This reads the local canonical MDX tree without external APIs and writes
- .audit/content-inventory.md (human-readable report)
- .audit/content-inventory.json (machine-readable triage)

GitHub Actions also appends the report to the job summary and retains it as an artifact for 14 days. When additional substantive lessons are created, the script discovers them from contentType rather than freezing a 95-item registry.

**This is an inventory, not the 95/95 certification.** It catches missing bilingual companions and metadata mismatch, and surfaces *review cues* such as unsupported-seeming incident figures, missing source links, heading/code-diagram drift, and absolute wording. It cannot decide factual correctness, whether an example works, whether EN/VI mean the same thing, or whether a cited source supports a statement.

Complete a per-pair audit using the rubric in docs/content-quality-remediation.md, attach exact claim/source evidence and successful CI to its PR, and only then check off the related entry in GitHub issues #116 and #119–#122. Do not close the master issue merely because this scan passes.
