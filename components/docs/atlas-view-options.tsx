import { createAiPageActionUrls, type PageActionLocale } from '@/lib/page-actions';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';

type AtlasViewOptionsProps = {
  pageUrl: string;
  markdownUrl: string;
  githubUrl: string;
  locale: PageActionLocale;
};

const labels = {
  en: {
    open: 'Open',
    github: 'Open in GitHub',
    markdown: 'View as Markdown',
    scira: 'Open in Scira AI',
    chatgpt: 'Open in ChatGPT',
    claude: 'Open in Claude',
    cursor: 'Open in Cursor',
  },
  vi: {
    open: 'Mở',
    github: 'Mở trong GitHub',
    markdown: 'Xem dạng Markdown',
    scira: 'Mở trong Scira AI',
    chatgpt: 'Mở trong ChatGPT',
    claude: 'Mở trong Claude',
    cursor: 'Mở trong Cursor',
  },
} as const;

export function AtlasViewOptions({
  pageUrl,
  markdownUrl,
  githubUrl,
  locale,
}: AtlasViewOptionsProps) {
  const ai = createAiPageActionUrls(pageUrl, locale);
  const t = labels[locale];

  const items = [
    { title: t.github, href: githubUrl, icon: <GitHubIcon /> },
    { title: t.markdown, href: markdownUrl, icon: <DocumentIcon /> },
    { title: t.scira, href: ai.scira, icon: <SparklesIcon /> },
    { title: t.chatgpt, href: ai.chatgpt, icon: <ChatIcon /> },
    { title: t.claude, href: ai.claude, icon: <AIIcon /> },
    { title: t.cursor, href: ai.cursor, icon: <CursorIcon /> },
  ];

  return (
    <details className="group relative inline-block">
      <summary
        className={buttonVariants({
          color: 'secondary',
          size: 'sm',
          className:
            'cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden',
        })}
      >
        {t.open}
        <ChevronIcon />
      </summary>

      <div className="absolute right-0 z-50 mt-2 flex min-w-56 flex-col rounded-xl border bg-fd-popover p-1 shadow-md">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            rel="noreferrer noopener"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4"
          >
            {item.icon}
            {item.title}
            <ExternalLinkIcon />
          </a>
        ))}
      </div>
    </details>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="ms-auto text-fd-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 5h5v5M10 14 19 5M19 13v6H5V5h6" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 text-fd-muted-foreground transition-transform group-open:rotate-180"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m7 9 5 5 5-5" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2A11.4 11.4 0 0 1 12 6.8c1 0 2 .1 3 .4 2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v2.6c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="m12 3 1.2 3.1L16 7.5l-2.8 1.4L12 12l-1.2-3.1L8 7.5l2.8-1.4zM18 13l.9 2.1L21 16l-2.1.9L18 19l-.9-2.1L15 16l2.1-.9zM6 13l.9 2.1L9 16l-2.1.9L6 19l-.9-2.1L3 16l2.1-.9z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18 12 4l6 14h-3l-1.2-3H10.2L9 18zm5.2-6h1.6L12 9.9z" />
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="m5 3 13 8-6 2-2 6z" />
    </svg>
  );
}
