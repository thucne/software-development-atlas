import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Lightweight inline markdown formatter that converts:
 * - **bold** to <strong>
 * - `code` to <code>
 * - strips leading blockquote `>` and bullet marks
 * - renders paragraphs with clean typography
 */
export function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  // Clean lines: strip leading blockquote markers '>'
  const cleanedText = text
    .split('\n')
    .map((line) => line.replace(/^>\s*/, '').trimEnd())
    .join('\n')
    .trim();

  const paragraphs = cleanedText.split(/\n\n+/).filter(Boolean);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {paragraphs.map((para, pIdx) => (
        <p key={pIdx} className="leading-relaxed text-fd-foreground">
          {formatInline(para)}
        </p>
      ))}
    </div>
  );
}

function formatInline(content: string): React.ReactNode[] {
  // Regex to match **bold** and `code`
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = content.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      // Highlight special prefixes
      const isNegative = /^(?:Impact|Hậu quả|Root cause|Nguyên nhân cốt lõi|Fatal pitfall|Cạm bẫy chết người):?/i.test(inner);
      const isPositive = /^(?:Correct pattern|Cách khắc phục chuẩn|Rule of thumb|Quy tắc bỏ túi):?/i.test(inner);
      const isScenario = /^(?:Scenario|Tình huống):?/i.test(inner);

      let colorClass = 'font-semibold text-fd-foreground';
      if (isNegative) colorClass = 'font-bold text-red-600 dark:text-red-400';
      else if (isPositive) colorClass = 'font-bold text-emerald-600 dark:text-emerald-400';
      else if (isScenario) colorClass = 'font-bold text-indigo-600 dark:text-indigo-400';

      return (
        <strong key={index} className={colorClass}>
          {inner}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="rounded-md border border-fd-border/70 bg-fd-muted/70 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-fd-foreground"
        >
          {inner}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
