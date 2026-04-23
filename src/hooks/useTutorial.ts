'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTutorialContext } from '@/hooks/useTutorialContext';

/**
 * Call once at the top of any feature component to enable auto-triggering.
 *
 * Behaviour:
 * 1. Waits 800ms for the page to finish rendering (elements need to be in DOM).
 * 2. If the current route has a tutorial AND the user hasn't seen it yet,
 *    calls startTutorial automatically.
 * 3. Does nothing if the tutorial was already seen or has no steps for this role.
 *
 * Usage:
 *   const PeopleList = () => {
 *     useTutorial();
 *     // ...
 *   };
 */
export function useTutorial(): void {
  const pathname = usePathname();
  const { startTutorial, hasSeenTutorial, hasTutorialForRoute, isActive, seenLoaded } = useTutorialContext();
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!seenLoaded) return;
    if (firedRef.current) return;
    if (isActive) return;
    if (!hasTutorialForRoute(pathname)) return;
    if (hasSeenTutorial(pathname)) return;

    firedRef.current = true;

    const timer = setTimeout(() => {
      startTutorial(pathname);
    }, 800);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isActive, seenLoaded]);
}
