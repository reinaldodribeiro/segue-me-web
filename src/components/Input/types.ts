import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconClick?: () => void;
}
