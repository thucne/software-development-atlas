'use client';

import { withBasePath } from '@/lib/base-path';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { fetchClient } from 'fumadocs-core/search/client/fetch';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

interface DomainSuggestion {
  slug: string;
  titleEn: string;
  titleVi: string;
  descEn: string;
  descVi: string;
  icon: ReactNode;
}

const CORE_DOMAINS: DomainSuggestion[] = [
  {
    slug: '/software-architecture/layered-architecture',
    titleEn: 'Software Architecture',
    titleVi: 'Kiến trúc phần mềm',
    descEn: 'Coupling, modularity, layered, hexagonal & clean architecture',
    descVi: 'Ghép nối, mô-đun, phân tầng, kiến trúc lục giác & clean architecture',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      </svg>
    ),
  },
  {
    slug: '/data-systems/database-indexes-and-query-plans',
    titleEn: 'Data Systems',
    titleVi: 'Hệ thống dữ liệu',
    descEn: 'B-Tree indexes, ACID transactions, MVCC, replication & caching',
    descVi: 'Chỉ mục B-Tree, giao dịch ACID, MVCC, nhân bản & bộ nhớ đệm',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14a9 3 0 0 0 18 0V5" />
        <path d="M3 12a9 3 0 0 0 18 0" />
      </svg>
    ),
  },
  {
    slug: '/testing-quality/test-strategy',
    titleEn: 'Testing & Quality',
    titleVi: 'Kiểm thử & Chất lượng',
    descEn: 'Risk-driven testing, deterministic checks & contract boundaries',
    descVi: 'Chiến lược kiểm thử theo rủi ro, kiểm tra hành vi & hợp đồng',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    slug: '/distributed-systems/timeouts-retries-and-backoff',
    titleEn: 'Distributed Systems',
    titleVi: 'Hệ thống phân tán',
    descEn: 'Timeouts, backoff with jitter, circuit breakers & outbox pattern',
    descVi: 'Thời gian chờ, backoff ngẫu nhiên, ngắt mạch & transactional outbox',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="16" y="16" width="6" height="6" rx="1" />
        <rect x="2" y="16" width="6" height="6" rx="1" />
        <rect x="9" y="2" width="6" height="6" rx="1" />
        <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
        <path d="M12 12V8" />
      </svg>
    ),
  },
  {
    slug: '/engineering-judgment/decision-guides/containers-vs-serverless',
    titleEn: 'Engineering Judgment',
    titleVi: 'Phán đoán kỹ thuật',
    descEn: 'Architecture decision guides, trade-offs & reference designs',
    descVi: 'Hướng dẫn ra quyết định kiến trúc, đánh đổi & thiết kế tham chiếu',
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
];

export default function AtlasSearchDialog(props: SharedProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const isVi = pathname.includes('/vi/docs') || pathname.endsWith('/vi');

  const [isDebouncing, setIsDebouncing] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const baseClient = useMemo(
    () => fetchClient({ api: withBasePath('/api/search') }),
    [],
  );

  const optimizedClient = useMemo(
    () => ({
      deps: baseClient.deps,
      async search(query: string) {
        // Skip network request entirely if query is shorter than 2 characters
        if (query.trim().length < 2) {
          return [];
        }
        return baseClient.search(query);
      },
    }),
    [baseClient],
  );

  const { search, setSearch, query } = useDocsSearch({
    delayMs: 300,
    client: optimizedClient,
  });

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim().length >= 2) {
      setIsDebouncing(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setIsDebouncing(false);
      }, 300);
    } else {
      setIsDebouncing(false);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    }
  };

  const isPending = isDebouncing || query.isLoading;
  const isSearching = search.trim().length >= 2;
  const displayItems = isSearching && query.data !== 'empty' ? query.data : null;

  const handleNavigateToSuggestion = (suggestion: DomainSuggestion) => {
    const targetPath = isVi ? `/vi/docs${suggestion.slug}` : `/docs${suggestion.slug}`;
    router.push(targetPath);
    props.onOpenChange?.(false);
  };

  // Keyboard navigation for Quick Suggestions when not searching
  useEffect(() => {
    if (isSearching || !props.open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev + 1) % CORE_DOMAINS.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(
          (prev) => (prev - 1 + CORE_DOMAINS.length) % CORE_DOMAINS.length,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = CORE_DOMAINS[selectedSuggestionIndex];
        if (target) {
          handleNavigateToSuggestion(target);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching, props.open, selectedSuggestionIndex, isVi]);

  return (
    <SearchDialog
      search={search}
      onSearchChange={handleSearchChange}
      isLoading={isPending}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent className="border-fd-primary/30 ring-1 ring-fd-primary/30 shadow-[0_0_50px_-10px_rgba(59,130,246,0.22)] dark:border-fd-primary/40 dark:ring-fd-primary/40 dark:shadow-[0_0_60px_-10px_rgba(59,130,246,0.28)]">
        <SearchDialogHeader className="p-3.5">
          <SearchDialogIcon className="size-5 text-fd-primary" />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>

        <div
          role="progressbar"
          aria-label={isVi ? 'Đang tìm kiếm' : 'Searching'}
          aria-hidden={!isPending}
          className="relative h-0.5 w-full overflow-hidden bg-transparent"
        >
          {isPending && (
            <div className="animate-progress-indeterminate h-full w-1/3 rounded-full bg-fd-primary" />
          )}
        </div>

        {/* Quick Domain Suggestions shown before typing */}
        {!isSearching ? (
          <div className="flex flex-col p-2">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-fd-muted-foreground">
              {isVi ? 'Khám phá các lĩnh vực chính' : 'Explore Core Domains'}
            </div>
            <div className="flex flex-col gap-1" role="listbox">
              {CORE_DOMAINS.map((domain, index) => {
                const isSelected = selectedSuggestionIndex === index;
                return (
                  <button
                    key={domain.slug}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleNavigateToSuggestion(domain)}
                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      isSelected
                        ? 'bg-fd-accent text-fd-accent-foreground ring-1 ring-fd-primary/30'
                        : 'text-fd-foreground hover:bg-fd-accent/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
                            : 'border-fd-primary/20 bg-fd-primary/10 text-fd-primary'
                        }`}
                      >
                        {domain.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium leading-snug">
                          {isVi ? domain.titleVi : domain.titleEn}
                        </span>
                        <span className="text-xs text-fd-muted-foreground line-clamp-1">
                          {isVi ? domain.descVi : domain.descEn}
                        </span>
                      </div>
                    </div>
                    <span className="ml-2 shrink-0 text-xs font-medium text-fd-muted-foreground">
                      ↵
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <SearchDialogList items={displayItems} />
        )}

        {/* Keyboard hints footer */}
        <div className="flex items-center justify-between border-t border-fd-border/60 bg-fd-secondary/30 px-3.5 py-2 text-[11px] text-fd-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-fd-border bg-fd-secondary px-1 py-0.5 font-mono text-[10px] text-fd-foreground">
                ↑↓
              </kbd>
              <span>{isVi ? 'Điều hướng' : 'Navigate'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-fd-border bg-fd-secondary px-1 py-0.5 font-mono text-[10px] text-fd-foreground">
                ↵
              </kbd>
              <span>{isVi ? 'Mở' : 'Select'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-fd-border bg-fd-secondary px-1 py-0.5 font-mono text-[10px] text-fd-foreground">
                ESC
              </kbd>
              <span>{isVi ? 'Đóng' : 'Close'}</span>
            </span>
          </div>
          <span className="font-mono text-[10px] font-semibold tracking-wider text-fd-primary/80">
            ATLAS SEARCH
          </span>
        </div>
      </SearchDialogContent>
    </SearchDialog>
  );
}
