import { Variant, Size } from './types';

export const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-primary-fg focus:ring-2 focus:ring-primary/40',
  secondary: 'bg-panel hover:bg-hover text-text border border-border focus:ring-2 focus:ring-primary/30',
  ghost: 'bg-transparent hover:bg-hover text-text focus:ring-2 focus:ring-primary/30',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-400/40',
};

export const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const baseStyles =
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100';
