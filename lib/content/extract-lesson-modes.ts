export interface LessonTakeaway {
  highlight: string;
  description: string;
}

export interface LessonDiagram {
  id: string;
  title: string;
  code?: string;
  type: 'mermaid' | 'illustration' | 'decision-matrix';
  illustrationId?: string;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  setup?: string;
  scenario: string;
  impact?: string;
  rootCause?: string;
  correctPattern?: string;
  reasoning: string;
  type: 'micro-scenario' | 'self-check';
}

export interface LessonModeData {
  title: string;
  incidentHook?: {
    story: string;
    rootCause?: string;
  };
  ruleOfThumb?: string;
  takeaways: LessonTakeaway[];
  fatalPitfall?: string;
  diagrams: LessonDiagram[];
  practiceChallenges: PracticeChallenge[];
  interactiveLab?: 'EventLoopLab' | 'PromiseResolutionLab' | 'AsyncWaterfallLab' | 'HttpRequestPathExplorer';
}

/**
 * Strips markdown blockquote markers (> ), headings, and raw bullet points.
 */
function sanitizeProse(text: string): string {
  return text
    .replace(/^>\s*/gm, '')
    .replace(/^#{1,6}\s+[^\n]*\n*/gm, '')
    .trim();
}

/**
 * Parses raw MDX lesson content and extracts structured data for
 * Flash Brief, Visual Showcase, and Practice Challenges.
 */
export function extractLessonModeData(
  rawContent: string,
  locale: 'en' | 'vi' = 'en',
): LessonModeData {
  const isVi = locale === 'vi';

  // 1. Title: check frontmatter first, then top # heading
  const fmTitleMatch = rawContent.match(/^title:\s*(?:"([^"]+)"|'([^']+)'|([^\n]+))$/m);
  let title = fmTitleMatch
    ? (fmTitleMatch[1] || fmTitleMatch[2] || fmTitleMatch[3]).trim()
    : '';
  if (!title) {
    const titleMatch = rawContent.match(/^#\s+([^\n]+)$/m);
    title = titleMatch ? titleMatch[1].trim() : '';
  }

  // 2. Rule of Thumb
  const thumbMatch = rawContent.match(
    />\s*💡\s*\*\*(?:Rule of thumb|Quy tắc bỏ túi):\*\*\s*([^\n]+(?:\n>[^\n]+)*)/i,
  );
  const ruleOfThumb = thumbMatch
    ? thumbMatch[1].replace(/\n>\s*/g, ' ').trim()
    : undefined;

  // 3. TL;DR section
  const tldrMatch = rawContent.match(
    /##\s+(?:TL;DR|Tóm tắt[^\n]*)[\s\S]*?(?=\n##\s+|$)/i,
  );
  const tldrSection = tldrMatch ? tldrMatch[0] : '';

  // 4. Incident Hook Story & Root cause
  let story = '';
  let rootCause = '';

  const bodyWithoutFm = rawContent.replace(/^---[\s\S]*?---\s*/, '').trim();

  // Case A: Story between top # title and first ## heading (typically ## TL;DR)
  const introMatch = bodyWithoutFm.match(/^#\s+[^\n]+\n+([\s\S]*?)(?=\n##\s+|$)/);
  if (introMatch && introMatch[1].trim().length > 30) {
    const cleanIntro = sanitizeProse(introMatch[1].trim());
    const paras = cleanIntro.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    if (paras.length > 0) {
      story = paras[0];
      if (paras.length > 1) {
        rootCause = paras.slice(1).join('\n\n');
      }
    }
  }

  // Case B: Story inside ## TL;DR before > 💡 Rule of thumb
  if (!story && tldrSection) {
    const preThumbMatch = tldrSection.match(
      /##\s+(?:TL;DR|Tóm tắt[^\n]*)\n+([\s\S]*?)(?=\n+>\s*💡|$)/i,
    );
    if (preThumbMatch && preThumbMatch[1].trim().length > 20) {
      const cleanIntro = sanitizeProse(preThumbMatch[1].trim());
      const paras = cleanIntro.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      if (paras.length > 0) {
        story = paras[0];
        if (paras.length > 1) {
          rootCause = paras.slice(1).join('\n\n');
        }
      }
    }
  }

  // Safety filter: ensure rootCause doesn't leak rule of thumb or bullet lists
  if (rootCause) {
    rootCause = rootCause
      .split(/\n>\s*💡/)[0]
      .split(/\n-\s+\*\*/)[0]
      .trim();
  }

  // 5. Takeaways & Fatal Pitfall
  const takeaways: LessonTakeaway[] = [];
  let fatalPitfall: string | undefined = undefined;

  if (tldrSection) {
    const lines = tldrSection.split('\n');
    let currentItem: LessonTakeaway | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const itemMatch = line.match(/^-\s+\*\*([^*]+)\*\*[:\s]*(.*)$/);
      if (itemMatch) {
        if (currentItem) {
          const hl = currentItem.highlight.toLowerCase();
          if (hl.includes('fatal pitfall') || hl.includes('cạm bẫy chết người')) {
            fatalPitfall = currentItem.description;
          } else {
            takeaways.push(currentItem);
          }
        }
        currentItem = {
          highlight: itemMatch[1].trim(),
          description: itemMatch[2].trim(),
        };
      } else if (currentItem && line && !line.startsWith('-') && !line.startsWith('>')) {
        currentItem.description += ' ' + line;
      }
    }
    if (currentItem) {
      const hl = currentItem.highlight.toLowerCase();
      if (hl.includes('fatal pitfall') || hl.includes('cạm bẫy chết người')) {
        fatalPitfall = currentItem.description;
      } else {
        takeaways.push(currentItem);
      }
    }
  }

  // Clean fatal pitfall
  if (fatalPitfall) {
    fatalPitfall = fatalPitfall.replace(/^[:\s*]+/, '').trim();
  }

  // 6. Diagrams (Mermaid, AtlasIllustration, DecisionMatrix)
  const diagrams: LessonDiagram[] = [];
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  let mMatch: RegExpExecArray | null;
  let idx = 1;
  while ((mMatch = mermaidRegex.exec(rawContent)) !== null) {
    const precedingText = rawContent.slice(0, mMatch.index);
    const headings = [...precedingText.matchAll(/(?:^|\n)#{2,4}\s+([^\n]+)/g)];
    const lastH = headings.pop();
    diagrams.push({
      id: `mermaid-${idx}`,
      title: lastH
        ? lastH[1].trim()
        : isVi
          ? `Sơ đồ kiến trúc ${idx}`
          : `Architecture Diagram ${idx}`,
      code: mMatch[1].trim(),
      type: 'mermaid',
    });
    idx++;
  }

  const illustrationRegex = /<AtlasIllustration\s+id=["']([^"']+)["'][^>]*\/>/g;
  let illMatch: RegExpExecArray | null;
  let illIdx = 1;
  while ((illMatch = illustrationRegex.exec(rawContent)) !== null) {
    const precedingText = rawContent.slice(0, illMatch.index);
    const headings = [...precedingText.matchAll(/(?:^|\n)#{2,4}\s+([^\n]+)/g)];
    const lastH = headings.pop();
    diagrams.push({
      id: `illustration-${illIdx}`,
      title: lastH
        ? lastH[1].trim()
        : isVi
          ? `Minh họa trực quan ${illIdx}`
          : `Visual Illustration ${illIdx}`,
      illustrationId: illMatch[1],
      type: 'illustration',
    });
    illIdx++;
  }

  // 7. Practice Challenges (Self-Checks & Micro-Scenarios)
  const practiceChallenges: PracticeChallenge[] = [];
  const detailsRegex = /<details>\s*<summary>([^<]+)<\/summary>([\s\S]*?)<\/details>/g;
  let dMatch: RegExpExecArray | null;
  let cIdx = 1;
  while ((dMatch = detailsRegex.exec(rawContent)) !== null) {
    const precedingText = rawContent.slice(0, dMatch.index);
    const headings = [...precedingText.matchAll(/(?:^|\n)#{2,4}\s+([^\n]+)/g)];
    const lastH = headings.pop();
    const rawTitle = lastH ? lastH[1].trim() : '';
    let cleanTitle = rawTitle
      .replace(/^(?:Self-check|Tự kiểm tra|Thử thách tư duy|Câu hỏi tự kiểm tra)[:\s-]*/i, '')
      .trim();
    if (!cleanTitle) {
      cleanTitle = isVi ? `Thử thách #${cIdx}` : `Challenge #${cIdx}`;
    }

    const precedingParas = precedingText
      .trim()
      .split(/\n\n+/)
      .map((p) => p.replace(/^#{1,4}\s+[^\n]+\n+/, '').trim())
      .filter(Boolean);

    const lastP = precedingParas.pop() || '';
    const cleanScenario = sanitizeProse(lastP);
    const cleanReasoning = sanitizeProse(dMatch[2].trim());

    practiceChallenges.push({
      id: `challenge-${cIdx}`,
      title: cleanTitle,
      scenario:
        cleanScenario ||
        (isVi
          ? 'Phân tích tình huống kỹ thuật và dự đoán hành vi hệ thống:'
          : 'Analyze the technical scenario and predict system behavior:'),
      reasoning: cleanReasoning,
      type: 'self-check',
    });
    cIdx++;
  }

  // Production Failure Micro-Scenarios
  const scenarioRegex = isVi
    ? /\*\*Hậu quả:\*\*\s*([^\n]+)[\s\S]*?\*\*Nguyên nhân cốt lõi:\*\*\s*([^\n]+)[\s\S]*?\*\*Cách khắc phục chuẩn:\*\*\s*([^\n]+)/g
    : /\*\*Impact:\*\*\s*([^\n]+)[\s\S]*?\*\*Root cause:\*\*\s*([^\n]+)[\s\S]*?\*\*Correct pattern:\*\*\s*([^\n]+)/g;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = scenarioRegex.exec(rawContent)) !== null) {
    const precedingText = rawContent.slice(0, sMatch.index);
    const headings = [...precedingText.matchAll(/(?:^|\n)#{2,4}\s+([^\n]+)/g)];
    const lastH = headings.pop();
    const rawTitle = lastH ? lastH[1].trim() : '';
    let cleanTitle = rawTitle
      .replace(/^(?:Production failure|Production outage|Sự cố thực tế|Sự cố sản xuất|Sự cố)[:\s-]*/i, '')
      .trim();
    if (!cleanTitle) {
      cleanTitle = isVi ? `Sự cố #${cIdx}` : `Outage #${cIdx}`;
    }

    const precedingParas = precedingText
      .trim()
      .split(/\n\n+/)
      .map((p) => p.replace(/^#{1,4}\s+[^\n]+\n+/, '').trim())
      .filter(Boolean);

    const setup = sanitizeProse(precedingParas.pop() || '');
    const impact = sMatch[1].trim();
    const scRootCause = sMatch[2].trim();
    const correctPattern = sMatch[3].trim();

    practiceChallenges.push({
      id: `challenge-${cIdx}`,
      title: cleanTitle,
      setup: setup || undefined,
      impact,
      rootCause: scRootCause,
      correctPattern,
      scenario: isVi
        ? `**Hậu quả:** ${impact}\n\n**Nguyên nhân cốt lõi:** ${scRootCause}`
        : `**Impact:** ${impact}\n\n**Root cause:** ${scRootCause}`,
      reasoning: isVi
        ? `**Cách khắc phục chuẩn:** ${correctPattern}`
        : `**Correct pattern:** ${correctPattern}`,
      type: 'micro-scenario',
    });
    cIdx++;
  }

  // 8. Interactive Lab detection
  let interactiveLab: LessonModeData['interactiveLab'] = undefined;
  if (rawContent.includes('<EventLoopLab')) interactiveLab = 'EventLoopLab';
  else if (rawContent.includes('<PromiseResolutionLab')) interactiveLab = 'PromiseResolutionLab';
  else if (rawContent.includes('<AsyncWaterfallLab')) interactiveLab = 'AsyncWaterfallLab';
  else if (rawContent.includes('<HttpRequestPathExplorer')) interactiveLab = 'HttpRequestPathExplorer';

  return {
    title,
    incidentHook: story ? { story, rootCause } : undefined,
    ruleOfThumb,
    takeaways,
    fatalPitfall,
    diagrams,
    practiceChallenges,
    interactiveLab,
  };
}
