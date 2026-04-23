import { useContext } from 'react';
import { ParishColorContext, ParishColorContextData } from '@/context/ParishColorContext';

export function useParishColor(): ParishColorContextData {
  const context = useContext(ParishColorContext);
  if (!context) throw new Error('useParishColor must be used within a ParishColorProvider');
  return context;
}
