export interface FlashcardBullet {
  label: string;
  text: string;
}

export interface Flashcard {
  id: string;
  type: 'rule-of-thumb' | 'incident' | 'pitfall' | 'takeaways';
  badge: string;
  badgeTone: 'accent' | 'warning' | 'danger' | 'success';
  title: string;
  subtitle?: string;
  content?: string;
  quote?: string;
  bulletItems?: FlashcardBullet[];
  domain: string;
  domainTitle: string;
  level: string;
  url: string;
  lessonTitle: string;
}

export interface LessonFlashcardDeck {
  lessonTitle: string;
  lessonUrl: string;
  domainTitle: string;
  locale: 'en' | 'vi';
  cards: Flashcard[];
}

export const domainTitleMap: Record<string, { en: string; vi: string }> = {
  'start-here': { en: 'Start Here', vi: 'Khởi đầu' },
  'computing-foundations': { en: 'Computing Foundations', vi: 'Nền tảng Điện toán' },
  programming: { en: 'Programming & Runtimes', vi: 'Lập trình & Runtimes' },
  'web-platform': { en: 'Web Platform', vi: 'Nền tảng Web' },
  'frontend-engineering': { en: 'Frontend Engineering', vi: 'Kỹ thuật Frontend' },
  'backend-engineering': { en: 'Backend Engineering', vi: 'Kỹ thuật Backend' },
  'data-systems': { en: 'Data Systems', vi: 'Hệ thống Dữ liệu' },
  'software-architecture': { en: 'Software Architecture', vi: 'Kiến trúc Phần mềm' },
  'distributed-systems': { en: 'Distributed Systems', vi: 'Hệ thống Phân tán' },
  'cloud-infrastructure': { en: 'Cloud & Infrastructure', vi: 'Hạ tầng Đám mây' },
  'testing-quality': { en: 'Testing & Quality', vi: 'Kiểm thử & Chất lượng' },
  'delivery-operations': { en: 'Delivery & Operations', vi: 'Phát hành & Vận hành' },
  security: { en: 'Security', vi: 'Bảo mật Hệ thống' },
  'ai-native-engineering': { en: 'AI-Native Engineering', vi: 'Kỹ thuật Thời đại AI' },
  'engineering-judgment': { en: 'Engineering Judgment', vi: 'Tư duy Đánh đổi Kỹ thuật' },
};

export function getDomainTitle(category: string, locale: 'en' | 'vi'): string {
  const mapping = domainTitleMap[category];
  if (mapping) return mapping[locale];
  return category
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function extractFlashcards(
  markdown: string,
  meta: {
    title: string;
    description: string;
    category?: string;
    level?: string;
    url: string;
  },
  locale: 'en' | 'vi' = 'en',
): LessonFlashcardDeck {
  const category = meta.category || 'general';
  const domainTitle = getDomainTitle(category, locale);
  const level = meta.level || 'intermediate';
  const cards: Flashcard[] = [];

  const isVi = locale === 'vi';

  // 1. Locate TL;DR / Summary section (supports English and all Vietnamese variants)
  const tldrHeaderMatch = markdown.match(
    /(?:^|\n)##\s+(?:TL;DR|Tóm tắt)[^\n]*\n+([\s\S]*?)(?=(?:\n##\s+)|$)/i,
  );
  const tldrContent = tldrHeaderMatch ? tldrHeaderMatch[1].trim() : '';

  // 2. Extract Rule of Thumb
  let ruleOfThumbMotto: string | undefined;
  let ruleOfThumbDetails: string | undefined;
  const rotMatch = tldrContent.match(
    />\s*💡\s*\*\*(?:Rule of thumb|Quy tắc bỏ túi)[:\s]*\*\*\s*([^\n]+(?:\n>[^\n]+)*)/i,
  );
  if (rotMatch) {
    const rawRot = rotMatch[1]
      .replace(/\n>\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Check if starts with a bolded motto: **Motto.** Details...
    const boldMottoMatch = rawRot.match(/^\*\*([^*]+)\*\*[:\s]*([\s\S]*)/);
    if (boldMottoMatch) {
      ruleOfThumbMotto = boldMottoMatch[1].trim();
      ruleOfThumbDetails = boldMottoMatch[2].trim() || undefined;
    } else {
      ruleOfThumbMotto = rawRot;
    }
  }

  // 3. Extract Incident Story (Paragraph right before Rule of Thumb)
  let incidentStory: string | undefined;
  if (tldrContent) {
    const parts = tldrContent.split(/\n\n+/);
    for (const part of parts) {
      const cleanPart = part.trim();
      if (
        cleanPart &&
        !cleanPart.startsWith('>') &&
        !cleanPart.startsWith('-') &&
        !cleanPart.startsWith('*') &&
        cleanPart.length > 50
      ) {
        incidentStory = cleanPart.replace(/\s+/g, ' ');
        break;
      }
    }
  }

  // 4. Extract Bullets and Fatal Pitfall
  const bullets: FlashcardBullet[] = [];
  let fatalPitfall: { title: string; text: string } | undefined;

  const bulletLines = tldrContent.match(
    /^[-*]\s+\*\*([^*]+)\*\*[:\s]*([\s\S]*?)(?=\n[-*]\s+\*\*|\n\n|$)/gm,
  );

  if (bulletLines) {
    for (const rawBullet of bulletLines) {
      const parsed = rawBullet.match(
        /^[-*]\s+\*\*([^*]+)\*\*[:\s]*([\s\S]*)/,
      );
      if (!parsed) continue;

      const rawLabel = parsed[1].replace(/[:\s]+$/, '').trim();
      const rawText = parsed[2]
        .replace(/^[:\s]+/, '')
        .replace(/\s+/g, ' ')
        .trim();
      const labelLower = rawLabel.toLowerCase();

      if (
        labelLower.includes('fatal pitfall') ||
        labelLower.includes('cạm bẫy chết người') ||
        labelLower.includes('sai lầm chí mạng')
      ) {
        const pitfallTitleMatch = rawLabel.match(/\(([^)]+)\)/);
        const pitfallTitle = pitfallTitleMatch
          ? pitfallTitleMatch[1].trim()
          : isVi
            ? 'Cạm bẫy chết người'
            : 'Fatal Pitfall';
        fatalPitfall = {
          title: pitfallTitle,
          text: rawText,
        };
      } else {
        bullets.push({
          label: rawLabel,
          text: rawText,
        });
      }
    }
  }

  // Card 1: Rule of Thumb & Mental Model
  cards.push({
    id: 'card-1-rule-of-thumb',
    type: 'rule-of-thumb',
    badge: isVi ? 'Quy tắc vàng' : 'Rule of Thumb',
    badgeTone: 'accent',
    title: meta.title,
    subtitle: isVi ? 'Mô hình tư duy chuẩn xác' : 'Core Mental Model',
    content: ruleOfThumbDetails || meta.description,
    quote: ruleOfThumbMotto || meta.description,
    domain: category,
    domainTitle,
    level,
    url: meta.url,
    lessonTitle: meta.title,
  });

  // Card 2: Production Incident Hook (if available)
  if (incidentStory) {
    cards.push({
      id: 'card-2-incident',
      type: 'incident',
      badge: isVi ? 'Thực tế Production' : 'Production Reality',
      badgeTone: 'warning',
      title: isVi ? 'Bài học từ sự cố thực tế' : 'When Theory Meets Reality',
      subtitle: isVi ? 'Cái giá của sự hiểu sai mô hình' : 'The cost of broken mental models',
      content: incidentStory,
      domain: category,
      domainTitle,
      level,
      url: meta.url,
      lessonTitle: meta.title,
    });
  }

  // Card 3: Fatal Pitfall (if available)
  if (fatalPitfall) {
    cards.push({
      id: 'card-3-pitfall',
      type: 'pitfall',
      badge: isVi ? 'Cạm bẫy chết người' : 'Fatal Pitfall',
      badgeTone: 'danger',
      title: fatalPitfall.title,
      subtitle: isVi ? 'Antipattern cần tránh tuyệt đối' : 'Antipattern to avoid at all costs',
      content: fatalPitfall.text,
      domain: category,
      domainTitle,
      level,
      url: meta.url,
      lessonTitle: meta.title,
    });
  }

  // Card 4: Key Takeaways
  if (bullets.length > 0) {
    cards.push({
      id: 'card-4-takeaways',
      type: 'takeaways',
      badge: isVi ? 'Tóm lược 60 giây' : '60-Second Core',
      badgeTone: 'success',
      title: isVi ? 'Điểm mấu chốt cần nhớ' : 'Key Takeaways',
      subtitle: isVi ? 'Đúc kết kỹ thuật quan trọng' : 'Essential engineering takeaways',
      bulletItems: bullets.slice(0, 5),
      domain: category,
      domainTitle,
      level,
      url: meta.url,
      lessonTitle: meta.title,
    });
  }

  return {
    lessonTitle: meta.title,
    lessonUrl: meta.url,
    domainTitle,
    locale,
    cards,
  };
}
