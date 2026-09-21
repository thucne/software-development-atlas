export type PageActionLocale = 'en' | 'vi';

export function createAiPagePrompt(pageUrl: string, locale: PageActionLocale) {
  return locale === 'vi'
    ? `Đọc ${pageUrl} và giúp tôi trả lời các câu hỏi về nội dung này.`
    : `Read ${pageUrl}. I want to ask questions about its content.`;
}

export function createAiPageActionUrls(
  pageUrl: string,
  locale: PageActionLocale,
) {
  const prompt = createAiPagePrompt(pageUrl, locale);

  return {
    prompt,
    scira: `https://scira.ai/?${new URLSearchParams({ q: prompt })}`,
    chatgpt: `https://chatgpt.com/?${new URLSearchParams({
      prompt,
      hints: 'search',
    })}`,
    claude: `https://claude.ai/new?${new URLSearchParams({ q: prompt })}`,
    cursor: `https://cursor.com/link/prompt?${new URLSearchParams({
      text: prompt,
    })}`,
  };
}
