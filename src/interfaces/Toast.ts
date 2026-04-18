export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

export interface Toast extends ToastOptions {
  id: string;
}
