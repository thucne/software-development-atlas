/**
 * Mount path for the Atlas app when reverse-proxied (e.g. https://thucde.dev/learn).
 * Keep in sync with `basePath` in `next.config.mjs`.
 */
export const basePath = '/learn';

/**
 * Prefix an app-absolute path with `basePath`.
 * Leaves protocol-relative and absolute URLs unchanged. Idempotent if already prefixed.
 */
export function withBasePath(path: string): string {
  if (!path || /^\w+:/.test(path) || path.startsWith('//')) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (normalized === basePath || normalized.startsWith(`${basePath}/`)) {
    return normalized;
  }

  return `${basePath}${normalized}`;
}
