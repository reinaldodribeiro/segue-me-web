'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Input from '@/components/Input';
import { InputProps } from '@/components/Input/types';

/** yyyy-mm-dd → dd/mm/yyyy */
function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** dd/mm/yyyy → yyyy-mm-dd */
function displayToIso(display: string): string {
  const clean = display.replace(/\D/g, '');
  if (clean.length !== 8) return '';
  const d = clean.slice(0, 2);
  const m = clean.slice(2, 4);
  const y = clean.slice(4, 8);
  return `${y}-${m}-${d}`;
}

/** Apply dd/mm/yyyy mask to raw digits */
function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export interface DateInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  value: string;           // yyyy-mm-dd (ISO)
  onChange: (e: { target: { name?: string; value: string } }) => void;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, name, ...rest }) => {
  const [display, setDisplay] = useState(() => isoToDisplay(value));

  // Sync when external value changes (e.g. form reset or data load)
  useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = applyMask(e.target.value);
      setDisplay(masked);

      // Emit ISO value when complete, empty string otherwise
      const iso = masked.length === 10 ? displayToIso(masked) : '';
      onChange({ target: { name, value: iso } });
    },
    [name, onChange],
  );

  return (
    <Input
      name={name}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      value={display}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default DateInput;
