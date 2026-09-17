'use client';

import { useSyncExternalStore } from 'react';

export type LearningMode = 'deep-dive' | 'flash-brief' | 'visual' | 'practice';

const STORAGE_KEY = 'atlas-preferred-learning-mode';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): LearningMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'flash-brief' || saved === 'visual' || saved === 'practice' || saved === 'deep-dive') {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }
  return 'deep-dive';
}

function getServerSnapshot(): LearningMode {
  return 'deep-dive';
}

interface LearningModeSwitcherProps {
  currentMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
  locale?: string;
  counts?: {
    diagrams?: number;
    challenges?: number;
    hasLab?: boolean;
  };
}

export function LearningModeSwitcher({
  currentMode,
  onModeChange,
  locale = 'en',
  counts = {},
}: LearningModeSwitcherProps) {
  const isVi = locale === 'vi';

  const modes: Array<{
    id: LearningMode;
    shortLabel: string;
    fullLabel: string;
    description: string;
    icon: string;
    count?: number | string;
  }> = [
    {
      id: 'deep-dive',
      shortLabel: isVi ? 'Chuyên sâu' : 'Deep Dive',
      fullLabel: isVi ? 'Chuyên sâu' : 'Deep Dive',
      description: isVi ? 'Toàn văn bài học, phân tích và code chi tiết' : 'Complete lesson, code walkthroughs, and in-depth analysis',
      icon: '📖',
    },
    {
      id: 'flash-brief',
      shortLabel: isVi ? 'Tóm tắt' : '60s Brief',
      fullLabel: isVi ? 'Thẻ tóm tắt' : 'Flash Brief',
      description: isVi ? 'Nắm trọn sự cố, rule of thumb và cạm bẫy trong 60s' : '60-second incident hook, rule of thumb, and fatal pitfalls',
      icon: '⚡',
    },
    {
      id: 'visual',
      shortLabel: isVi ? 'Mô hình' : 'Visual',
      fullLabel: isVi ? 'Mô hình trực quan' : 'Visual Map',
      description: isVi ? 'Toàn bộ sơ đồ kiến trúc và minh họa trực quan' : 'Architecture diagrams, flowcharts, and visual anchors',
      icon: '🗺️',
      count: counts.diagrams && counts.diagrams > 0 ? counts.diagrams : undefined,
    },
    {
      id: 'practice',
      shortLabel: isVi ? 'Thử thách' : 'Practice',
      fullLabel: isVi ? (counts.hasLab ? 'Thử thách & Lab' : 'Thử thách') : (counts.hasLab ? 'Practice & Lab' : 'Practice'),
      description: isVi ? 'Tự kiểm tra phản xạ kiến thức và lab tương tác' : 'Active recall challenges, failure scenarios, and labs',
      icon: '🎯',
      count: counts.hasLab
        ? 'Lab'
        : counts.challenges && counts.challenges > 0
          ? counts.challenges
          : undefined,
    },
  ];

  const handleSelect = (mode: LearningMode) => {
    onModeChange(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <nav
      aria-label={isVi ? 'Chế độ học tập thích ứng' : 'Adaptive learning modes'}
      className="w-full"
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="grid grid-cols-4 gap-1 rounded-xl border border-fd-border/70 bg-fd-card/90 p-1 shadow-sm backdrop-blur-md"
      >
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              role="tab"
              type="button"
              id={`tab-${mode.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${mode.id}`}
              title={mode.description}
              onClick={() => handleSelect(mode.id)}
              className={`group relative flex items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-xs font-semibold transition-all sm:gap-1.5 sm:px-2.5 sm:py-2 ${
                isActive
                  ? 'bg-fd-background text-fd-foreground shadow-sm ring-1 ring-fd-border/80'
                  : 'text-fd-muted-foreground hover:bg-fd-accent/40 hover:text-fd-foreground'
              }`}
            >
              <span className="shrink-0 text-xs sm:text-sm" aria-hidden="true">
                {mode.icon}
              </span>
              <span className="truncate">
                <span className="sm:hidden">{mode.shortLabel}</span>
                <span className="hidden sm:inline">{mode.fullLabel}</span>
              </span>
              {mode.count !== undefined && (
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    isActive
                      ? 'bg-fd-primary/15 text-fd-primary'
                      : 'bg-fd-muted text-fd-muted-foreground group-hover:bg-fd-accent'
                  }`}
                >
                  {mode.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function usePreferredLearningMode(): [LearningMode, (mode: LearningMode) => void] {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMode = (newMode: LearningMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore
    }
  };

  return [mode, setMode];
}
