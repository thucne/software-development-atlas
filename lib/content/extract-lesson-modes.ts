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
  scenario: string;
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

  const withoutFm = rawContent.replace(/^---[\s\S]*?---\n*/, '');
  const preHeading = withoutFm.split(/\n##\s+/)[0];
  const beforeFirstH2 = preHeading.replace(/^#\s+[^\n]+\n+/, '').trim();

  if (beforeFirstH2.length > 50) {
    const paras = beforeFirstH2.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
    story = paras[0] || '';
    if (paras.length > 1) {
      rootCause = paras.slice(1).join('\n\n');
    }
  } else if (tldrSection) {
    const preThumb = tldrSection.match(
      /##\s+(?:TL;DR|Tóm tắt[^\n]*)\n+([\s\S]*?)(?=\n+>\s*💡)/i,
    );
    if (preThumb && preThumb[1].trim()) {
      const paras = preThumb[1].trim().split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      story = paras[0] || '';
      if (paras.length > 1) {
        rootCause = paras.slice(1).join('\n\n');
      }
    }
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

  // 6. Diagrams (Mermaid, AtlasIllustration, DecisionMatrix)
  const diagrams: LessonDiagram[] = [];
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  let mMatch: RegExpExecArray | null;
  let idx = 1;
  while ((mMatch = mermaidRegex.exec(rawContent)) !== null) {
    const precedingText = rawContent.slice(0, mMatch.index);
    const lastHeading = precedingText.match(/(?:^|\n)#{2,4}\s+([^\n]+)[^\n]*$/);
    diagrams.push({
      id: `mermaid-${idx}`,
      title: lastHeading
        ? lastHeading[1].trim()
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
    const lastHeading = precedingText.match(/(?:^|\n)#{2,4}\s+([^\n]+)[^\n]*$/);
    diagrams.push({
      id: `illustration-${illIdx}`,
      title: lastHeading
        ? lastHeading[1].trim()
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
    const lastH = precedingText.match(/(?:^|\n)#{2,4}\s+([^\n]+)[^\n]*$/);
    const lastP = precedingText
      .trim()
      .split(/\n\n+/)
      .pop()
      ?.replace(/^#{1,4}\s+[^\n]+\n+/, '')
      .trim() || '';

    practiceChallenges.push({
      id: `challenge-${cIdx}`,
      title: lastH
        ? lastH[1].trim()
        : isVi
          ? `Thử thách tư duy ${cIdx}`
          : `Self-Check Challenge ${cIdx}`,
      scenario:
        lastP ||
        (isVi
          ? 'Phân tích tình huống kỹ thuật và dự đoán hành vi hệ thống:'
          : 'Analyze the technical scenario and predict system behavior:'),
      reasoning: dMatch[2].trim(),
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
    const lastH = precedingText.match(/(?:^|\n)#{2,4}\s+([^\n]+)[^\n]*$/);
    practiceChallenges.push({
      id: `challenge-${cIdx}`,
      title: lastH
        ? lastH[1].trim()
        : isVi
          ? `Sự cố thực tế ${cIdx}`
          : `Production Outage ${cIdx}`,
      scenario: isVi
        ? `**Hậu quả:** ${sMatch[1].trim()}\n\n**Nguyên nhân cốt lõi:** ${sMatch[2].trim()}`
        : `**Impact:** ${sMatch[1].trim()}\n\n**Root cause:** ${sMatch[2].trim()}`,
      reasoning: isVi
        ? `**Cách khắc phục chuẩn:** ${sMatch[3].trim()}`
        : `**Correct pattern:** ${sMatch[3].trim()}`,
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
