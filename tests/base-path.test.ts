import { withBasePath } from '@/lib/base-path';
import { describe, expect, it } from 'vitest';

describe('withBasePath', () => {
  it('prefixes app-absolute paths once', () => {
    expect(withBasePath('/docs')).toBe('/learn/docs');
    expect(withBasePath('/learn/docs')).toBe('/learn/docs');
    expect(withBasePath('docs')).toBe('/learn/docs');
  });

  it('leaves external URLs unchanged', () => {
    expect(withBasePath('https://example.com/docs')).toBe(
      'https://example.com/docs',
    );
    expect(withBasePath('//cdn.example.com/x')).toBe('//cdn.example.com/x');
  });
});
