const STORAGE_BASE = process.env.NEXT_PUBLIC_STORAGE_URL ?? '';

/**
 * Converts a backend storage path (e.g. "/parishes/.../logo/file.png")
 * to a full public URL using the API base URL.
 */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${STORAGE_BASE}/${path.replace(/^\//, '')}`;
}

/**
 * Clears auth-related keys from localStorage on logout.
 */
export function clearAuthStorage() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
}

/**
 * Returns class names joined, filtering falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date string to pt-BR locale.
 */
/**
 * Converts a string to a filename-safe slug (lowercase, no accents, spaces → hyphens).
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('pt-BR', options ?? { dateStyle: 'short' }).format(new Date(dateStr));
}
