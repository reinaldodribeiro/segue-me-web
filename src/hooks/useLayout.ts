import { useContext } from 'react';
import { LayoutContext, LayoutContextData } from '@/context/LayoutContext';

export function useLayout(): LayoutContextData {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayout must be used within a LayoutProvider');
  return context;
}
