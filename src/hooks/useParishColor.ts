import { useContext } from 'react';
import { ParishColorContext } from '@/context/ParishColorContext';

export function useParishColor() {
  const context = useContext(ParishColorContext);
  if (!context) throw new Error('useParishColor must be used within a ParishColorProvider');
  return context;
}
