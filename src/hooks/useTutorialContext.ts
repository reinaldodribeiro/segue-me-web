import { useContext } from 'react';
import { TutorialContext } from '@/context/TutorialContext';
import { TutorialContextValue } from '@/types/tutorial';

export function useTutorialContext(): TutorialContextValue {
  const context = useContext(TutorialContext);
  if (!context) throw new Error('useTutorialContext must be used within TutorialProvider');
  return context;
}
