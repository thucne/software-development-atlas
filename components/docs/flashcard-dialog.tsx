'use client';

import { FlashcardView } from '@/components/docs/flashcard-view';
import type { LessonFlashcardDeck } from '@/lib/content/flashcards';
import {
  type CardAspectRatio,
  copyCardToClipboard,
  downloadCardPng,
  exportCardAsBlob,
  shareCardNative,
} from '@/lib/export-card';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface FlashcardDialogProps {
  deck: LessonFlashcardDeck;
  locale?: 'en' | 'vi';
}

const CARD_SPECS: Record<CardAspectRatio, { width: number; height: number }> = {
  '9:16': { width: 342, height: 608 },
  '1:1': { width: 480, height: 480 },
  '16:9': { width: 760, height: 428 },
};

function getCardScale(ratio: CardAspectRatio): number {
  if (typeof window === 'undefined') return 1;
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  const isMobile = vw < 640;
  // Modal target max height is 88vh to ensure generous clearance from browser viewport edges.
  // Chrome overhead budget inside modal:
  // modal padding (20px) + header (~36px) + display padding/margins (~16px) +
  // dots row (~24px) + bottom action buttons (~40px) + safety clearance buffer (~30px) = ~166px.
  const chromeHeight = isMobile ? 180 : 166;
  const availableHeight = Math.max(180, Math.floor(vh * 0.88 - chromeHeight));

  // Horizontal space budget (backdrop padding + modal padding + nav buttons flanking card)
  const horizontalPadding = isMobile ? 32 : 112;
  const availableWidth = Math.max(240, Math.floor(vw * 0.90 - horizontalPadding));

  const spec = CARD_SPECS[ratio];
  const scaleY = availableHeight / spec.height;
  const scaleX = availableWidth / spec.width;

  const computedScale = Math.min(1, Math.min(scaleX, scaleY));
  return Math.max(0.35, Number(computedScale.toFixed(3)));
}

export function FlashcardDialog({ deck, locale = 'en' }: FlashcardDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ratio, setRatio] = useState<CardAspectRatio>('9:16');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const scale = useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => getCardScale(ratio),
    () => 1,
  );

  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    () => false,
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const isVi = locale === 'vi';
  const totalCards = deck.cards.length;
  const currentCard = deck.cards[currentIndex] || deck.cards[0];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
  }, [totalCards]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
  }, [totalCards]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext]);

  const handleDownload = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const blob = await exportCardAsBlob(cardRef.current, ratio);
      if (blob) {
        const slug = deck.lessonTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        downloadCardPng(
          blob,
          `${slug}-card-${currentIndex + 1}-${ratio.replace(':', 'x')}.png`,
        );
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const blob = await exportCardAsBlob(cardRef.current, ratio);
      if (blob) {
        const success = await copyCardToClipboard(blob);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const blob = await exportCardAsBlob(cardRef.current, ratio);
      if (blob) {
        await shareCardNative(blob, {
          title: `${deck.lessonTitle} · SD Atlas`,
          text: currentCard.quote || currentCard.content || deck.lessonTitle,
          filename: `atlas-card-${currentIndex + 1}.png`,
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentCard) return null;

  return (
    <>
      {/* Trigger Button in Docs Action Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-secondary/50 px-2.5 py-1 text-xs font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        title={isVi ? 'Xem thẻ tóm tắt và chia sẻ' : 'View quick flashcards and share'}
      >
        <span className="text-sm">🃏</span>
        <span>{isVi ? 'Thẻ tóm tắt' : 'Flashcards'}</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="flashcard-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className={`relative flex max-h-[92vh] w-auto max-w-[96vw] ${
              ratio === '9:16'
                ? 'min-w-[300px] sm:min-w-[340px] max-w-[400px]'
                : ratio === '1:1'
                  ? 'min-w-[340px] sm:min-w-[400px] max-w-[520px]'
                  : 'min-w-[360px] sm:min-w-[480px] max-w-4xl'
            } flex-col items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-2 sm:p-2.5 shadow-2xl overflow-hidden transition-all duration-300`}
          >
            {/* Top Toolbar */}
            <div className="flex w-full shrink-0 items-center justify-between border-b border-slate-800/80 pb-1.5 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🃏</span>
                <h2
                  id="flashcard-dialog-title"
                  className="text-xs font-semibold text-white tracking-wide"
                >
                  {isVi ? 'Thẻ Tóm Tắt' : 'Flashcards'}
                </h2>
              </div>

              {/* Aspect Ratio Switcher */}
              <div className="flex items-center rounded-lg bg-slate-900 p-0.5 text-xs">
                {(['9:16', '1:1', '16:9'] as CardAspectRatio[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRatio(r)}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium transition-all ${
                      ratio === r
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
                aria-label={isVi ? 'Đóng' : 'Close'}
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Interactive Card Display Area */}
            <div className="my-1 sm:my-1.5 flex w-full flex-1 min-h-0 items-center justify-center gap-2 sm:gap-3 py-1">
              {/* Previous Button (Desktop/Tablet) */}
              <button
                type="button"
                onClick={handlePrev}
                className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 shadow-lg hover:bg-slate-800 hover:text-white transition-all focus:outline-none"
                aria-label={isVi ? 'Thẻ trước' : 'Previous card'}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Scaled Card Canvas Box */}
              <div
                className="relative shrink-0 overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  width: `${Math.round(CARD_SPECS[ratio].width * scale)}px`,
                  height: `${Math.round(CARD_SPECS[ratio].height * scale)}px`,
                }}
              >
                <div
                  style={{
                    width: `${CARD_SPECS[ratio].width}px`,
                    height: `${CARD_SPECS[ratio].height}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: '0 0',
                  }}
                >
                  <FlashcardView
                    ref={cardRef}
                    card={currentCard}
                    ratio={ratio}
                    currentIndex={currentIndex}
                    totalCards={totalCards}
                    locale={locale}
                  />
                </div>
              </div>

              {/* Next Button (Desktop/Tablet) */}
              <button
                type="button"
                onClick={handleNext}
                className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-slate-300 shadow-lg hover:bg-slate-800 hover:text-white transition-all focus:outline-none"
                aria-label={isVi ? 'Thẻ tiếp theo' : 'Next card'}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Card Dots Indicator & Mobile Controls */}
            <div className="flex items-center justify-center gap-2 mb-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                className="flex sm:hidden h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label={isVi ? 'Thẻ trước' : 'Previous card'}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="flex items-center gap-1.5">
                {deck.cards.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-5 bg-blue-500'
                        : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={isVi ? `Thẻ ${idx + 1}` : `Card ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="flex sm:hidden h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label={isVi ? 'Thẻ tiếp theo' : 'Next card'}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Bottom Actions: Download, Copy, Share */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-800/80 pt-2 w-full shrink-0">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white shadow hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>
                  {isExporting
                    ? isVi
                      ? 'Đang tạo...'
                      : 'Exporting...'
                    : isVi
                      ? 'Tải ảnh PNG'
                      : 'Download PNG'}
                </span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {copied ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </>
                  )}
                </svg>
                <span>
                  {copied
                    ? isVi
                      ? 'Đã sao chép!'
                      : 'Copied!'
                    : isVi
                      ? 'Sao chép ảnh'
                      : 'Copy Image'}
                </span>
              </button>

              {canShare && (
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  <span>{isVi ? 'Chia sẻ' : 'Share'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
