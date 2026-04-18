import React from 'react';
import { cn } from '@/utils/helpers';
import { InputProps } from './types';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, startIcon, endIcon, onEndIconClick, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <span className="absolute left-3 text-text-muted pointer-events-none">{startIcon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 rounded-lg border bg-input-bg text-input-text text-sm outline-none transition-all',
              'placeholder:text-input-placeholder',
              'focus:ring-2 focus:ring-primary/40 focus:border-primary',
              error ? 'border-red-500 focus:ring-red-500/30' : 'border-input-border',
              startIcon ? 'pl-10' : 'pl-3',
              endIcon ? 'pr-10' : 'pr-3',
              className,
            )}
            {...props}
          />

          {endIcon && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onEndIconClick}
              className={cn(
                'absolute right-3 text-text-muted transition-colors',
                onEndIconClick ? 'cursor-pointer hover:text-text' : 'cursor-default pointer-events-none',
              )}
            >
              {endIcon}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
