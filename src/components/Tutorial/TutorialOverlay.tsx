'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTutorialContext } from '@/context/TutorialContext';
import { cn } from '@/utils/helpers';

// ── Spotlight ─────────────────────────────────────────────────────────────────

const PADDING = 8;

interface SpotlightProps {
  rect: DOMRect;
}

function Spotlight({ rect }: SpotlightProps) {
  const top = rect.top - PADDING;
  const left = rect.left - PADDING;
  const width = rect.width + PADDING * 2;
  const height = rect.height + PADDING * 2;

  return (
    <>
      {/* Top panel */}
      <div
        className="fixed inset-x-0 top-0 bg-black/60 transition-all duration-300"
        style={{ height: Math.max(0, top) }}
      />
      {/* Left panel */}
      <div
        className="fixed left-0 bg-black/60 transition-all duration-300"
        style={{ top, width: Math.max(0, left), height }}
      />
      {/* Right panel */}
      <div
        className="fixed right-0 bg-black/60 transition-all duration-300"
        style={{
          top,
          left: left + width,
          height,
          width: `calc(100vw - ${left + width}px)`,
        }}
      />
      {/* Bottom panel */}
      <div
        className="fixed inset-x-0 bg-black/60 transition-all duration-300"
        style={{ top: top + height, bottom: 0 }}
      />
    </>
  );
}

// ── Tooltip placement ─────────────────────────────────────────────────────────

const TOOLTIP_WIDTH = 320;
const TOOLTIP_MARGIN = 12;
const TOOLTIP_APPROX_HEIGHT = 200;

function computeTooltipStyle(
  rect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right',
): React.CSSProperties {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  let effectivePlacement = placement;

  const spaceBottom = vh - rect.bottom;
  const spaceTop = rect.top;

  // Auto-flip when not enough space
  if (placement === 'bottom' && spaceBottom < TOOLTIP_APPROX_HEIGHT + TOOLTIP_MARGIN && spaceTop > spaceBottom) {
    effectivePlacement = 'top';
  } else if (placement === 'top' && spaceTop < TOOLTIP_APPROX_HEIGHT + TOOLTIP_MARGIN && spaceBottom > spaceTop) {
    effectivePlacement = 'bottom';
  } else if (placement === 'left' && rect.left < TOOLTIP_WIDTH + TOOLTIP_MARGIN) {
    effectivePlacement = 'right';
  } else if (placement === 'right' && vw - rect.right < TOOLTIP_WIDTH + TOOLTIP_MARGIN) {
    effectivePlacement = 'left';
  }

  let top: number;
  let left: number;

  switch (effectivePlacement) {
    case 'top':
      top = rect.top - PADDING - TOOLTIP_MARGIN - TOOLTIP_APPROX_HEIGHT;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - TOOLTIP_APPROX_HEIGHT / 2;
      left = rect.left - PADDING - TOOLTIP_MARGIN - TOOLTIP_WIDTH;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - TOOLTIP_APPROX_HEIGHT / 2;
      left = rect.right + PADDING + TOOLTIP_MARGIN;
      break;
    case 'bottom':
    default:
      top = rect.bottom + PADDING + TOOLTIP_MARGIN;
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, vw - TOOLTIP_WIDTH - 12));
  top = Math.max(12, Math.min(top, vh - TOOLTIP_APPROX_HEIGHT - 12));

  return { position: 'fixed', top, left, width: TOOLTIP_WIDTH };
}

// ── Main overlay ──────────────────────────────────────────────────────────────

export default function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    filteredSteps,
    targetRect,
    nextStep,
    prevStep,
    dismiss,
    markSeenAndDismiss,
  } = useTutorialContext();

  const isLastStep = currentStep === filteredSteps.length - 1;
  const step = filteredSteps[currentStep];

  // Scroll target into view when step changes
  const scrolledRef = useRef<number>(-1);
  useEffect(() => {
    if (!isActive || !step || scrolledRef.current === currentStep) return;
    scrolledRef.current = currentStep;
    const el = document.querySelector<HTMLElement>(`[data-tutorial="${step.id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isActive, currentStep, step]);

  if (!isActive || !step) return null;

  const placement = step.placement ?? 'bottom';
  const tooltipStyle = targetRect ? computeTooltipStyle(targetRect, placement) : { position: 'fixed' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: TOOLTIP_WIDTH };

  const overlay = (
    <div
      className="fixed inset-0 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-label={`Tutorial: ${step.title}`}
    >
      {/* Backdrop panels (spotlight cutout) */}
      {targetRect ? (
        <Spotlight rect={targetRect} />
      ) : (
        <div className="fixed inset-0 bg-black/60" />
      )}

      {/* Highlighted ring around target */}
      {targetRect && (
        <div
          className="fixed rounded-lg ring-2 ring-primary ring-offset-2 pointer-events-none transition-all duration-300"
          style={{
            top: targetRect.top - PADDING,
            left: targetRect.left - PADDING,
            width: targetRect.width + PADDING * 2,
            height: targetRect.height + PADDING * 2,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className={cn(
          'bg-panel border border-border rounded-2xl shadow-2xl z-[10000]',
          'flex flex-col gap-3 p-5 transition-all duration-300',
        )}
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text leading-snug">{step.title}</h3>
          <button
            onClick={dismiss}
            aria-label="Fechar tutorial"
            className="shrink-0 text-text-muted hover:text-text transition-colors mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <p className="text-xs text-text-muted leading-relaxed">{step.content}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1">
          {/* Step counter */}
          <span className="text-[11px] text-text-muted">
            {currentStep + 1} de {filteredSteps.length}
          </span>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors px-2 py-1"
                aria-label="Passo anterior"
              >
                <ChevronLeft size={14} />
                Anterior
              </button>
            )}
            <button
              onClick={isLastStep ? markSeenAndDismiss : nextStep}
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                'bg-primary text-white hover:bg-primary/90',
              )}
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
              {!isLastStep && <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        {/* Step dots */}
        {filteredSteps.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-1">
            {filteredSteps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === currentStep ? 'bg-primary w-3' : 'bg-border w-1.5',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
