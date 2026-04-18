import type { LucideIcon } from 'lucide-react';

export interface TeamIconEntry {
  name: string;
  label: string;
  icon: LucideIcon;
}

export interface TeamIconPickerProps {
  value: string | null | undefined;
  onChange: (name: string | null) => void;
  label?: string;
}
