'use client';

import { usePathname } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { useTutorialContext } from '@/hooks/useTutorialContext';
import { cn } from '@/utils/helpers';

const TutorialButton: SafeFC = () => {
  const pathname = usePathname();
  const { startTutorial, hasTutorialForRoute, isActive } = useTutorialContext();

  if (!hasTutorialForRoute(pathname) || isActive) return null;

  return (
    <button
      onClick={() => startTutorial(pathname)}
      aria-label="Abrir tutorial desta página"
      title="Tutorial"
      className={cn(
        'fixed bottom-6 right-6 z-[9998]',
        'w-11 h-11 rounded-full shadow-lg',
        'bg-primary text-white',
        'flex items-center justify-center',
        'hover:bg-primary/90 active:scale-95 transition-all duration-150',
        'ring-2 ring-primary/20',
      )}
    >
      <HelpCircle size={20} />
    </button>
  );
};

export default TutorialButton;
