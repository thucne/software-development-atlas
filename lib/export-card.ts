import { toBlob, toPng } from 'html-to-image';

export type CardAspectRatio = '9:16' | '1:1' | '16:9';

export const CARD_DIMENSIONS: Record<
  CardAspectRatio,
  {
    width: number;
    height: number;
    aspectClass: string;
    labelEn: string;
    labelVi: string;
  }
> = {
  '9:16': {
    width: 1080,
    height: 1920,
    aspectClass: 'aspect-[9/16]',
    labelEn: '9:16 Story',
    labelVi: '9:16 Story',
  },
  '1:1': {
    width: 1080,
    height: 1080,
    aspectClass: 'aspect-square',
    labelEn: '1:1 Square',
    labelVi: '1:1 Vuông',
  },
  '16:9': {
    width: 1200,
    height: 675,
    aspectClass: 'aspect-[16/9]',
    labelEn: '16:9 Wide',
    labelVi: '16:9 Ngang',
  },
};

export async function exportCardAsBlob(
  node: HTMLElement,
  ratio: CardAspectRatio,
): Promise<Blob | null> {
  const { width, height } = CARD_DIMENSIONS[ratio];
  return toBlob(node, {
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: 2,
    cacheBust: true,
  });
}

export async function exportCardAsDataUrl(
  node: HTMLElement,
  ratio: CardAspectRatio,
): Promise<string> {
  const { width, height } = CARD_DIMENSIONS[ratio];
  return toPng(node, {
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: 2,
    cacheBust: true,
  });
}

export function downloadCardPng(dataUrlOrBlob: string | Blob, filename: string) {
  const url =
    typeof dataUrlOrBlob === 'string'
      ? dataUrlOrBlob
      : URL.createObjectURL(dataUrlOrBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof dataUrlOrBlob !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function copyCardToClipboard(blob: Blob): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard || !window.ClipboardItem) {
    return false;
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Failed to copy card to clipboard:', err);
    return false;
  }
}

export async function shareCardNative(
  blob: Blob,
  meta: { title: string; text?: string; filename?: string },
): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.share || !navigator.canShare) {
    return false;
  }

  const file = new File([blob], meta.filename || 'atlas-card.png', {
    type: 'image/png',
  });

  if (!navigator.canShare({ files: [file] })) {
    return false;
  }

  try {
    await navigator.share({
      title: meta.title,
      text: meta.text,
      files: [file],
    });
    return true;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return false;
    }
    console.error('Failed to invoke native share:', err);
    return false;
  }
}
