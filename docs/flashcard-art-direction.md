# Flashcard & Social Share Card Visual Art Direction

This document establishes the canonical visual design rules and AI generation prompt system for Software Development Atlas flashcards and social share assets.

## Core Visual Philosophy

Software Development Atlas represents engineering precision, architectural rigor, and durable mental models. Visual artwork must look like **high-end developer platform schematics** rather than generic tech clip-art or cartoonish illustrations.

1. **Language-Neutral Pixels:** All text, typography, labels, and watermarks remain in DOM/SVG code. The underlying graphic asset must NEVER contain rendered letters, words, or fake text.
2. **Technical Blueprint Aesthetic:** Use dark slate canvases, subtle isometric projections, precise geometry, and glowing semantic trace paths.
3. **Domain Semantic Accents:**
   - **Programming & Runtimes:** Electric Blue (`#3b82f6`) & Cyan (`#06b6d4`)
   - **Distributed Systems:** Amber (`#f59e0b`) & Gold (`#eab308`)
   - **Data Systems:** Indigo (`#6366f1`) & Purple (`#a855f7`)
   - **Cloud & Infrastructure:** Sky Blue (`#0284c7`) & Slate
   - **Security:** Crimson/Rose (`#f43f5e`)
   - **Testing & Quality:** Emerald (`#10b981`) & Mint

---

## AI Prompt Generator Template

When generating supplementary graphic assets with Midjourney, DALL-E 3, Imagen 3, or Stable Diffusion:

### Master Prompt Formula

```text
Minimalist modern technical 3D vector illustration of [CONCEPT_SUBJECT], technical schematic blueprint style, dark slate background (#090d16), glowing [PRIMARY_ACCENT_COLOR] and [SECONDARY_ACCENT_COLOR] accents, isometric projection, clean precision geometry, high-end developer developer tool aesthetic, no text, no letters, no human faces, cinematic subtle lighting, ultra-clean edges --ar [ASPECT_RATIO] --style raw
```

### Domain Examples

#### 1. Programming (Event Loop & Promises)
```text
Minimalist modern technical 3D vector illustration of an asynchronous message queue with circular microtask ring buffer, technical schematic blueprint style, dark slate background (#090d16), glowing electric blue and cyan accents, isometric projection, clean precision geometry, high-end developer developer tool aesthetic, no text, no letters, cinematic subtle lighting --ar 16:9 --style raw
```

#### 2. Distributed Systems (Consensus & Quorum)
```text
Minimalist modern technical 3D vector illustration of a 5-node distributed cluster reaching quorum agreement across network mesh partitions, technical schematic blueprint style, dark slate background (#090d16), glowing amber and electric gold accents, isometric projection, clean precision geometry, high-end developer tool aesthetic, no text, no letters --ar 16:9 --style raw
```

#### 3. Data Systems (B-Tree Indexing & Transactions)
```text
Minimalist modern technical 3D vector illustration of an illuminated balanced B-Tree index structure pointing to partitioned data pages, technical schematic blueprint style, dark slate background (#090d16), glowing indigo and emerald accents, isometric projection, clean precision geometry, high-end developer tool aesthetic, no text, no letters --ar 16:9 --style raw
```

#### 4. Security (Zero-Trust & Threat Modeling)
```text
Minimalist modern technical 3D vector illustration of a multi-layered cryptographic security perimeter with isolated trust boundaries and encrypted key exchanges, technical schematic blueprint style, dark slate background (#090d16), glowing crimson red and titanium silver accents, isometric projection, clean precision geometry, high-end developer tool aesthetic, no text, no letters --ar 16:9 --style raw
```

---

## Aspect Ratio Guidelines

- **9:16 (1080 × 1920):** Optimized for vertical mobile viewports (Instagram Stories, TikTok, YouTube Shorts, Reels). The visual motif sits gracefully behind the central text block with ample top/bottom negative space.
- **1:1 (1080 × 1080):** Optimized for square posts (LinkedIn carousels, Instagram feed, Discord). Balanced central focal point.
- **16:9 (1200 × 675):** Optimized for horizontal feeds (Twitter/X summaries, Facebook, keynote presentation slides). Two-column breathing room.
