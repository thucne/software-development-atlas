import { generateLlmsManifest } from '@/lib/llms-txt';
import { source } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const pages = source.getPages('en');
  const manifest = generateLlmsManifest(pages);

  return new Response(manifest, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
