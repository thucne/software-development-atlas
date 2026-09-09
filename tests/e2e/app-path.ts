import { withBasePath } from '../../lib/base-path';

/** Browser URL under the app `basePath` (e.g. `/docs` → `/learn/docs`). */
export function appUrl(path: string): string {
  return withBasePath(path);
}
