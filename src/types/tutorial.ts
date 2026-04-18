import { UserRole } from '@/types/roles';

/** A single highlighted step in a tutorial. */
export interface TutorialStep {
  /**
   * Must match a `data-tutorial="<id>"` attribute in the DOM.
   * If the element is not found at runtime, this step is skipped.
   */
  id: string;
  /** Short title shown in the tooltip header. */
  title: string;
  /** Paragraph(s) of explanation rendered in the tooltip body. */
  content: string;
  /**
   * If provided, this step is only shown to users who have at least one
   * of these roles. Omit to show to all roles that can access the route.
   */
  roles?: UserRole[];
  /**
   * Controls where the tooltip appears relative to the highlighted element.
   * Defaults to 'bottom'. The overlay auto-flips if the tooltip would overflow
   * the viewport.
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/** Configuration for a single route's tutorial. */
export interface TutorialConfig {
  /** Human-readable name for the tutorial (used in "?" tooltip). */
  name: string;
  /** Ordered list of steps. */
  steps: TutorialStep[];
}

/** Props for TutorialProvider. */
export interface TutorialProviderProps {
  children: React.ReactNode;
}

/** Shape exposed by TutorialContext. */
export interface TutorialContextValue {
  /** Whether the tutorial overlay is currently active. */
  isActive: boolean;
  /** Route currently being tutorialized (e.g. '/app/people'). */
  activeRoute: string | null;
  /** Index of the current step (0-based) within filteredSteps. */
  currentStep: number;
  /** Steps after role-filtering for the active route. */
  filteredSteps: TutorialStep[];
  /** Bounding rect of the current target element (null when not resolved). */
  targetRect: DOMRect | null;
  /** Start tutorial for a given canonical route. */
  startTutorial: (route: string) => void;
  /** Advance to the next step; auto-dismisses on last step. */
  nextStep: () => void;
  /** Go back to the previous step. */
  prevStep: () => void;
  /** Close without marking as seen (e.g. user pressed Escape). */
  dismiss: () => void;
  /** Mark the current route as seen and close. */
  markSeenAndDismiss: () => void;
  /** Reset the "seen" flag — pass a route to reset just that one, or omit to reset all. */
  resetTutorial: (route?: string) => void;
  /** Returns true if the user has already completed the tutorial for this route. */
  hasSeenTutorial: (route: string) => boolean;
  /** Returns true if any non-empty tutorial exists for a route, after role filtering. */
  hasTutorialForRoute: (route: string) => boolean;
  /** True once the backend "seen" list has been loaded (prevents premature auto-trigger). */
  seenLoaded: boolean;
}
