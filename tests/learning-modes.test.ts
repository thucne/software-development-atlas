import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractLessonModeData } from '@/lib/content/extract-lesson-modes';

describe('extractLessonModeData', () => {
  it('extracts mode data from relational-data-model.mdx (EN)', () => {
    const filePath = path.join(
      process.cwd(),
      'content/docs/data-systems/relational-data-model.mdx'
    );
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = extractLessonModeData(raw, 'en');

    expect(data.title).toBeTruthy();
    expect(data.ruleOfThumb).toBeTruthy();
    expect(data.ruleOfThumb).toContain('database');
    expect(data.takeaways.length).toBeGreaterThanOrEqual(4);
    expect(data.fatalPitfall).toBeTruthy();
    expect(data.diagrams.length).toBeGreaterThanOrEqual(1);
    expect(data.practiceChallenges.length).toBeGreaterThanOrEqual(1);
  });

  it('extracts mode data from relational-data-model.vi.mdx (VI)', () => {
    const filePath = path.join(
      process.cwd(),
      'content/docs/data-systems/relational-data-model.vi.mdx'
    );
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = extractLessonModeData(raw, 'vi');

    expect(data.title).toBeTruthy();
    expect(data.ruleOfThumb).toBeTruthy();
    expect(data.takeaways.length).toBeGreaterThanOrEqual(4);
    expect(data.fatalPitfall).toBeTruthy();
    expect(data.diagrams.length).toBeGreaterThanOrEqual(1);
    expect(data.practiceChallenges.length).toBeGreaterThanOrEqual(1);
  });

  it('detects interactive labs when present', () => {
    const filePath = path.join(
      process.cwd(),
      'content/docs/programming/async/how-the-browser-event-loop-works.mdx'
    );
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = extractLessonModeData(raw, 'en');

    expect(data.interactiveLab).toBe('EventLoopLab');
  });

  it('handles pages without mode metadata gracefully', () => {
    const raw = `---
title: Simple Guide
---

# Simple Guide

Just a normal guide without TL;DR.`;
    const data = extractLessonModeData(raw, 'en');

    expect(data.title).toBe('Simple Guide');
    expect(data.ruleOfThumb).toBeUndefined();
    expect(data.takeaways).toEqual([]);
    expect(data.diagrams).toEqual([]);
    expect(data.practiceChallenges).toEqual([]);
  });
});
