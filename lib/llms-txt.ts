import { canonicalUrl } from '@/lib/seo';

export type LlmsPageInput = {
  url: string;
  data: {
    title: string;
    description: string;
    category?: string;
  };
};

export const categoryOrder: { id: string; title: string }[] = [
  { id: 'start-here', title: 'Start Here' },
  { id: 'computing-foundations', title: 'Computing Foundations' },
  { id: 'programming', title: 'Programming & Runtimes' },
  { id: 'web-platform', title: 'Web Platform' },
  { id: 'frontend-engineering', title: 'Frontend Engineering' },
  { id: 'backend-engineering', title: 'Backend Engineering' },
  { id: 'data-systems', title: 'Data Systems' },
  { id: 'software-architecture', title: 'Software Architecture' },
  { id: 'distributed-systems', title: 'Distributed Systems' },
  { id: 'cloud-infrastructure', title: 'Cloud & Infrastructure' },
  { id: 'testing-quality', title: 'Testing & Quality' },
  { id: 'delivery-operations', title: 'Delivery & Operations' },
  { id: 'security', title: 'Security' },
  { id: 'ai-native-engineering', title: 'AI-Native Engineering' },
  { id: 'engineering-judgment', title: 'Engineering Judgment' },
];

export function generateLlmsManifest(pages: LlmsPageInput[]): string {
  const pagesByCategory = new Map<string, LlmsPageInput[]>();
  for (const page of pages) {
    const cat = page.data.category || 'other';
    if (!pagesByCategory.has(cat)) {
      pagesByCategory.set(cat, []);
    }
    pagesByCategory.get(cat)!.push(page);
  }

  const lines: string[] = [
    '# Software Development Atlas',
    '',
    '> A personal learning atlas for modern software engineering, with clear lessons, practical examples, learning paths, and engineering judgment.',
    '> Localized Vietnamese markdown versions for all lessons are available by prefixing with `/vi/docs/` instead of `/docs/`.',
    '',
  ];

  const handledCategories = new Set<string>();

  for (const { id, title } of categoryOrder) {
    const categoryPages = pagesByCategory.get(id);
    if (!categoryPages || categoryPages.length === 0) continue;

    handledCategories.add(id);
    lines.push(`## ${title}`);
    for (const page of categoryPages) {
      const mdUrl = canonicalUrl(`${page.url}.md`);
      lines.push(`- [${page.data.title}](${mdUrl}): ${page.data.description}`);
    }
    lines.push('');
  }

  for (const [cat, categoryPages] of pagesByCategory.entries()) {
    if (handledCategories.has(cat)) continue;

    const fallbackTitle = cat
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    lines.push(`## ${fallbackTitle}`);
    for (const page of categoryPages) {
      const mdUrl = canonicalUrl(`${page.url}.md`);
      lines.push(`- [${page.data.title}](${mdUrl}): ${page.data.description}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}
