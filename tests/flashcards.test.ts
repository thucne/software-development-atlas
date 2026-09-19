import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractFlashcards } from '@/lib/content/flashcards';

describe('Flashcards Extraction Engine', () => {
  it('extracts structured cards from English lesson (promises.mdx)', () => {
    const filePath = path.join(
      process.cwd(),
      'content/docs/programming/async/promises.mdx',
    );
    const content = readFileSync(filePath, 'utf-8');

    const deck = extractFlashcards(
      content,
      {
        title: 'Promises: Resolution, Chaining, and Failure',
        description: 'Reason about Promise states and chaining.',
        category: 'programming',
        level: 'intermediate',
        url: '/docs/programming/async/promises',
      },
      'en',
    );

    expect(deck.lessonTitle).toBe('Promises: Resolution, Chaining, and Failure');
    expect(deck.domainTitle).toBe('Programming & Runtimes');
    expect(deck.cards.length).toBe(4);

    const [ruleCard, incidentCard, pitfallCard, takeawaysCard] = deck.cards;

    // Card 1: Rule of Thumb
    expect(ruleCard.type).toBe('rule-of-thumb');
    expect(ruleCard.badge).toBe('Rule of Thumb');
    expect(ruleCard.quote).toContain('Every call to `.then()`');

    // Card 2: Incident
    expect(incidentCard.type).toBe('incident');
    expect(incidentCard.badge).toBe('Production Reality');
    expect(incidentCard.content).toContain('credit card');

    // Card 3: Fatal Pitfall
    expect(pitfallCard.type).toBe('pitfall');
    expect(pitfallCard.badge).toBe('Fatal Pitfall');
    expect(pitfallCard.title).toContain('Swallowed Errors');

    // Card 4: Takeaways
    expect(takeawaysCard.type).toBe('takeaways');
    expect(takeawaysCard.badge).toBe('60-Second Core');
    expect(takeawaysCard.bulletItems?.length).toBeGreaterThanOrEqual(3);
  });

  it('extracts structured cards with pure Vietnamese from companion lesson (promises.vi.mdx)', () => {
    const filePath = path.join(
      process.cwd(),
      'content/docs/programming/async/promises.vi.mdx',
    );
    const content = readFileSync(filePath, 'utf-8');

    const deck = extractFlashcards(
      content,
      {
        title: 'Promises: Giải quyết trạng thái, nối chuỗi và xử lý lỗi',
        description: 'Mô hình tư duy về Promise.',
        category: 'programming',
        level: 'intermediate',
        url: '/vi/docs/programming/async/promises',
      },
      'vi',
    );

    expect(deck.domainTitle).toBe('Lập trình & Runtimes');
    expect(deck.cards.length).toBe(4);

    const [ruleCard, incidentCard, pitfallCard, takeawaysCard] = deck.cards;

    expect(ruleCard.badge).toBe('Quy tắc vàng');
    expect(ruleCard.quote).toContain('Mỗi lệnh `.then()`');

    expect(incidentCard.badge).toBe('Thực tế Production');
    expect(incidentCard.content).toContain('thẻ từ chối');

    expect(pitfallCard.badge).toBe('Cạm bẫy chết người');
    expect(pitfallCard.title).toContain('Lỗi bị nuốt trọn');

    expect(takeawaysCard.badge).toBe('Tóm lược 60 giây');
    expect(takeawaysCard.bulletItems?.length).toBeGreaterThanOrEqual(3);
  });

  it('extracts cards from architecture lesson (load-balancing.mdx)', () => {
    const filePath = path.join(
      process.cwd(),
      'content/docs/cloud-infrastructure/load-balancing.mdx',
    );
    const content = readFileSync(filePath, 'utf-8');

    const deck = extractFlashcards(
      content,
      {
        title: 'Load Balancing: Layer 4 vs Layer 7 and Health Checks',
        description: 'Direct traffic across instances with appropriate routing models.',
        category: 'cloud-infrastructure',
        level: 'intermediate',
        url: '/docs/cloud-infrastructure/load-balancing',
      },
      'en',
    );

    expect(deck.cards.length).toBeGreaterThanOrEqual(3);
    expect(deck.domainTitle).toBe('Cloud & Infrastructure');
    expect(deck.cards[0].type).toBe('rule-of-thumb');
  });

  it('provides a graceful fallback card when lesson lacks TL;DR section', () => {
    const markdown = '# Custom Topic\n\nJust some simple content without TLDR.';
    const deck = extractFlashcards(
      markdown,
      {
        title: 'Custom Topic',
        description: 'Short summary of custom topic.',
        category: 'backend-engineering',
        level: 'beginner',
        url: '/docs/backend/custom',
      },
      'en',
    );

    expect(deck.cards.length).toBe(1);
    expect(deck.cards[0].type).toBe('rule-of-thumb');
    expect(deck.cards[0].title).toBe('Custom Topic');
    expect(deck.cards[0].quote).toBe('Short summary of custom topic.');
    expect(deck.domainTitle).toBe('Backend Engineering');
  });
});

