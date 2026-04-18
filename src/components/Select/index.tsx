import React from 'react';
import { cn } from '@/utils/helpers';
import { SelectProps } from './types';

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id, name, children, ...props }, ref) => {
    const selectId = id ?? name;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          name={name}
          className={cn(
            'h-10 rounded-lg border bg-input-bg text-input-text text-sm px-3',
            'outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-500 focus:ring-red-500/30' : 'border-input-border',
            className,
          )}
          {...props}
        >
          {children}
        </select>

        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
