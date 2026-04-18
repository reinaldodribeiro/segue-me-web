import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { ButtonProps } from './types';
import { baseStyles, variantStyles, sizeStyles } from './styles';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
