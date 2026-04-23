'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { TutorialContextValue, TutorialProviderProps, TutorialStep } from '@/types/tutorial';
import { TUTORIALS, normalizeTutorialRoute } from '@/constants/tutorials';
import UserService from '@/services/api/UserService';

export const TutorialContext = createContext<TutorialContextValue | null>(null);

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { hasAnyRole } = usePermissions();

  const [isActive, setIsActive] = useState(false);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // ── Seen set (loaded from backend) ───────────────────────────────────────

  const [seenRoutes, setSeenRoutes] = useState<Set<string>>(new Set());
  const [seenLoaded, setSeenLoaded] = useState(false);
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id || loadedRef.current === user.id) return;
    loadedRef.current = user.id;

    UserService.getTutorialSeen()
      .then((res) => {
        setSeenRoutes(new Set(res.data.data ?? []));
      })
      .catch(() => {
        // silently fail — tutorials will just auto-trigger again
      })
      .finally(() => {
        setSeenLoaded(true);
      });
  }, [user?.id]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const hasSeenTutorial = useCallback(
    (route: string): boolean => seenRoutes.has(normalizeTutorialRoute(route)),
    [seenRoutes],
  );

  // ── Step filtering ────────────────────────────────────────────────────────

  const getFilteredSteps = useCallback(
    (route: string): TutorialStep[] => {
      const config = TUTORIALS[route];
      if (!config) return [];
      return config.steps.filter(
        (step) => !step.roles || hasAnyRole(step.roles),
      );
    },
    [hasAnyRole],
  );

  const filteredSteps = useMemo(
    () => (activeRoute ? getFilteredSteps(activeRoute) : []),
    [activeRoute, getFilteredSteps],
  );

  // ── hasTutorialForRoute ───────────────────────────────────────────────────

  const hasTutorialForRoute = useCallback(
    (route: string): boolean => {
      const normalized = normalizeTutorialRoute(route);
      return getFilteredSteps(normalized).length > 0;
    },
    [getFilteredSteps],
  );

  // ── Target rect resolution ────────────────────────────────────────────────

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const resolveTargetRect = useCallback((step: TutorialStep | undefined) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    if (!step) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tutorial="${step.id}"]`);
    if (!el) {
      setTargetRect(null);
      return;
    }
    setTargetRect(el.getBoundingClientRect());
    const ro = new ResizeObserver(() => {
      setTargetRect(el.getBoundingClientRect());
    });
    ro.observe(el);
    resizeObserverRef.current = ro;
  }, []);

  // Resolve rect whenever active step changes
  useEffect(() => {
    if (!isActive || filteredSteps.length === 0) {
      setTargetRect(null);
      return;
    }
    let idx = currentStep;
    // Skip steps whose target element does not exist in DOM
    while (idx < filteredSteps.length) {
      const el = document.querySelector(`[data-tutorial="${filteredSteps[idx].id}"]`);
      if (el) break;
      idx++;
    }
    if (idx !== currentStep) {
      if (idx >= filteredSteps.length) {
        // All remaining steps have no DOM element — close gracefully.
        // If at least one step was already shown, mark the route as seen so
        // the tutorial does not fire again on the next visit.
        if (currentStep > 0 && activeRoute) {
          markRouteAsSeen(activeRoute);
        }
        setIsActive(false);
      } else {
        setCurrentStep(idx);
      }
      return;
    }
    resolveTargetRect(filteredSteps[currentStep]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, currentStep, filteredSteps]);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const startTutorial = useCallback(
    (route: string) => {
      const normalized = normalizeTutorialRoute(route);
      const steps = getFilteredSteps(normalized);
      if (steps.length === 0) return;
      setActiveRoute(normalized);
      setCurrentStep(0);
      setIsActive(true);
    },
    [getFilteredSteps],
  );

  const markRouteAsSeen = useCallback((route: string) => {
    setSeenRoutes((prev) => {
      if (prev.has(route)) return prev;
      const next = new Set(prev);
      next.add(route);
      return next;
    });
    UserService.markTutorialSeen(route).catch(() => {/* fire-and-forget */});
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next >= filteredSteps.length) {
        // Completed all steps — mark seen and close.
        setIsActive(false);
        if (activeRoute) markRouteAsSeen(activeRoute);
        return prev;
      }
      // Advance; if the next step has no DOM element the useEffect above will
      // continue skipping until it finds one or exhausts all steps (where it
      // will call markRouteAsSeen because currentStep > 0).
      return next;
    });
  }, [filteredSteps.length, activeRoute, markRouteAsSeen]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const dismiss = useCallback(() => {
    setIsActive(false);
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
  }, []);

  const markSeenAndDismiss = useCallback(() => {
    if (activeRoute) markRouteAsSeen(activeRoute);
    setIsActive(false);
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
  }, [activeRoute, markRouteAsSeen]);

  const resetTutorial = useCallback(
    (route?: string) => {
      if (route) {
        const normalized = normalizeTutorialRoute(route);
        setSeenRoutes((prev) => {
          const next = new Set(prev);
          next.delete(normalized);
          return next;
        });
        // Single-route reset: re-fetch fresh state from backend to stay in sync
        UserService.getTutorialSeen()
          .then((res) => setSeenRoutes(new Set(res.data.data ?? [])))
          .catch(() => {/* ignored */});
      } else {
        // Reset all
        setSeenRoutes(new Set());
        UserService.resetTutorial().catch(() => {/* ignored */});
      }
    },
    [],
  );

  // ── Keyboard: Escape to dismiss ───────────────────────────────────────────

  useEffect(() => {
    if (!isActive) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, dismiss]);

  // ── Context value ─────────────────────────────────────────────────────────

  const valueData: TutorialContextValue = useMemo(
    () => ({
      isActive,
      activeRoute,
      currentStep,
      filteredSteps,
      targetRect,
      startTutorial,
      nextStep,
      prevStep,
      dismiss,
      markSeenAndDismiss,
      resetTutorial,
      hasSeenTutorial,
      hasTutorialForRoute,
      seenLoaded,
    }),
    [
      isActive, activeRoute, currentStep, filteredSteps, targetRect,
      startTutorial, nextStep, prevStep, dismiss, markSeenAndDismiss,
      resetTutorial, hasSeenTutorial, hasTutorialForRoute, seenLoaded,
    ],
  );

  return (
    <TutorialContext.Provider value={valueData}>
      {children}
    </TutorialContext.Provider>
  );
};

