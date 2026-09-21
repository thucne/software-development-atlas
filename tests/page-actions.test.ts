import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createAiPageActionUrls, createAiPagePrompt } from '@/lib/page-actions';
import { canonicalUrl } from '@/lib/seo';
import { describe, expect, it } from 'vitest';

describe('AI page actions', () => {
  it('uses the public /learn canonical URL for English prompts', () => {
    const pageUrl = canonicalUrl('/docs/backend-engineering/oauth-and-oidc');

    expect(pageUrl).toBe(
      'https://thucde.dev/learn/docs/backend-engineering/oauth-and-oidc',
    );

    const prompt = createAiPagePrompt(pageUrl, 'en');
    expect(prompt).toBe(
      'Read https://thucde.dev/learn/docs/backend-engineering/oauth-and-oidc. I want to ask questions about its content.',
    );

    const actions = createAiPageActionUrls(pageUrl, 'en');

    expect(new URL(actions.chatgpt).searchParams.get('prompt')).toBe(prompt);
    expect(new URL(actions.scira).searchParams.get('q')).toBe(prompt);
    expect(new URL(actions.claude).searchParams.get('q')).toBe(prompt);
    expect(new URL(actions.cursor).searchParams.get('text')).toBe(prompt);
  });

  it('uses a Vietnamese prompt and keeps the /learn prefix for Vietnamese pages', () => {
    const pageUrl = canonicalUrl(
      '/vi/docs/backend-engineering/oauth-and-oidc',
    );
    const prompt = createAiPagePrompt(pageUrl, 'vi');

    expect(pageUrl).toBe(
      'https://thucde.dev/learn/vi/docs/backend-engineering/oauth-and-oidc',
    );
    expect(prompt).toBe(
      'Đọc https://thucde.dev/learn/vi/docs/backend-engineering/oauth-and-oidc và giúp tôi trả lời các câu hỏi về nội dung này.',
    );

    const actions = createAiPageActionUrls(pageUrl, 'vi');
    expect(new URL(actions.chatgpt).searchParams.get('prompt')).toBe(prompt);
  });

  it('keeps the branded AI provider icons from the page-actions UI', () => {
    const component = readFileSync(
      path.join(
        process.cwd(),
        'components/docs/atlas-view-options.tsx',
      ),
      'utf8',
    );

    expect(component).toContain('data-brand="Scira AI"');
    expect(component).toContain('data-brand="OpenAI"');
    expect(component).toContain('data-brand="Anthropic"');
    expect(component).toContain('data-brand="Cursor"');

    // Prevent fallback to the generic placeholder icons introduced by the
    // canonical-URL hotfix.
    expect(component).not.toContain('M4 5h16v11H9l-5 4z');
    expect(component).not.toContain('m5 3 13 8-6 2-2 6z');
  });

  it('wires every docs route template to canonical localized page actions', () => {
    const root = process.cwd();
    const en = readFileSync(
      path.join(root, 'app/docs/[[...slug]]/page.tsx'),
      'utf8',
    );
    const vi = readFileSync(
      path.join(root, 'app/vi/docs/[[...slug]]/page.tsx'),
      'utf8',
    );

    expect(en).toContain('const publicPageUrl = canonicalUrl(page.url);');
    expect(en).toContain('<AtlasViewOptions');
    expect(en).toContain('pageUrl={publicPageUrl}');
    expect(en).toContain('locale="en"');
    expect(en).not.toContain('<ViewOptionsPopover');

    expect(vi).toContain('const publicPageUrl = canonicalUrl(page.url);');
    expect(vi).toContain('<AtlasViewOptions');
    expect(vi).toContain('pageUrl={publicPageUrl}');
    expect(vi).toContain('locale="vi"');
    expect(vi).not.toContain('<ViewOptionsPopover');
  });
});
