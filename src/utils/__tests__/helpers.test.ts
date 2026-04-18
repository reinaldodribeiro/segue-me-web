import { cn, slugify, formatDate } from '../helpers';

describe('cn', () => {
  it('joins truthy class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });

  it('returns empty string when all values are falsy', () => {
    expect(cn(null, undefined, false)).toBe('');
  });

  it('returns single class when only one truthy value', () => {
    expect(cn('only')).toBe('only');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes accents (NFD normalization)', () => {
    expect(slugify('Ação')).toBe('acao');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('collapses multiple separators into one hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('handles already lowercase strings without accents', () => {
    expect(slugify('simple')).toBe('simple');
  });
});

describe('formatDate', () => {
  it('returns em dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('returns em dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('returns a non-empty string for a valid date string', () => {
    const result = formatDate('2024-01-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('—');
  });

  it('accepts custom Intl options', () => {
    const result = formatDate('2024-01-15', { year: 'numeric' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('storageUrl', () => {
  // STORAGE_BASE is captured at module load time from process.env.
  // We use jest.isolateModules to re-require helpers with the env var set.
  const BASE = 'http://storage.test';

  it('returns null for null input', () => {
    const { storageUrl } = require('../helpers') as typeof import('../helpers');
    expect(storageUrl(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    const { storageUrl } = require('../helpers') as typeof import('../helpers');
    expect(storageUrl(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    const { storageUrl } = require('../helpers') as typeof import('../helpers');
    expect(storageUrl('')).toBeNull();
  });

  it('prepends base URL to path', () => {
    let storageUrl!: (path: string | null | undefined) => string | null;
    jest.isolateModules(() => {
      process.env.NEXT_PUBLIC_STORAGE_URL = BASE;
      ({ storageUrl } = require('../helpers'));
    });
    expect(storageUrl('parishes/logo/file.png')).toBe(`${BASE}/parishes/logo/file.png`);
  });

  it('strips leading slash from path before prepending', () => {
    let storageUrl!: (path: string | null | undefined) => string | null;
    jest.isolateModules(() => {
      process.env.NEXT_PUBLIC_STORAGE_URL = BASE;
      ({ storageUrl } = require('../helpers'));
    });
    expect(storageUrl('/parishes/logo/file.png')).toBe(`${BASE}/parishes/logo/file.png`);
  });
});
