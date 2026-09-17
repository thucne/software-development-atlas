'use client';

import { useSyncExternalStore, useRef } from 'react';
import type { LessonModeData } from '@/lib/content/extract-lesson-modes';
import {
  LearningModeSwitcher,
  type LearningMode,
} from '@/components/learning/learning-mode-switcher';
import { FlashBriefCard } from '@/components/learning/flash-brief-card';
import { VisualShowcase } from '@/components/learning/visual-showcase';
import { PracticeChallenges } from '@/components/learning/practice-challenges';

const STORAGE_KEY = 'atlas-preferred-learning-mode';

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
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

function setLearningMode(mode: LearningMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore localStorage errors
  }
  listeners.forEach((listener) => listener());
}

interface LearningModeContainerProps {
  data: LessonModeData;
  locale?: string;
  children: React.ReactNode;
}

export function LearningModeContainer({
  data,
  locale = 'en',
  children,
}: LearningModeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Subscribed mode from localStorage via useSyncExternalStore
  const activeMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleModeChange = (mode: LearningMode) => {
    setLearningMode(mode);
  };

  const hasModeContent = Boolean(
    data.ruleOfThumb ||
    data.takeaways.length > 0 ||
    data.diagrams.length > 0 ||
    data.practiceChallenges.length > 0 ||
    data.interactiveLab
  );

  // If page does not have structured mode content (e.g. pure meta guide), render children normally
  if (!hasModeContent) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Segmented Control Switcher */}
      <div className="sticky top-14 z-20 -mx-1 rounded-2xl bg-fd-background/80 p-1 backdrop-blur-md">
        <LearningModeSwitcher
          currentMode={activeMode}
          onModeChange={handleModeChange}
          locale={locale}
          counts={{
            diagrams: data.diagrams.length,
            challenges: data.practiceChallenges.length,
            hasLab: Boolean(data.interactiveLab),
          }}
        />
      </div>

      {/* Mode View Content */}
      <div className="pt-2">
        {activeMode === 'flash-brief' && (
          <div className="animate-in fade-in-50 duration-200">
            <FlashBriefCard
              data={data}
              locale={locale}
              onSwitchToDeepDive={() => handleModeChange('deep-dive')}
              onSwitchToPractice={() => handleModeChange('practice')}
            />
          </div>
        )}

        {activeMode === 'visual' && (
          <div className="animate-in fade-in-50 duration-200">
            <VisualShowcase
              diagrams={data.diagrams}
              locale={locale}
              onSwitchToDeepDive={() => handleModeChange('deep-dive')}
            />
          </div>
        )}

        {activeMode === 'practice' && (
          <div className="animate-in fade-in-50 duration-200">
            <PracticeChallenges
              challenges={data.practiceChallenges}
              interactiveLab={data.interactiveLab}
              locale={locale}
              onSwitchToDeepDive={() => handleModeChange('deep-dive')}
            />
          </div>
        )}

        {/* Deep Dive (Always kept in DOM or rendered when active) */}
        <div className={activeMode === 'deep-dive' ? 'block' : 'hidden'}>
          {children}
        </div>
      </div>
    </div>
  );
}
