'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { DrawerProps } from './types';

const Drawer: SafeFC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  width = 'w-80',
  side = 'right',
}) => {
  // `rendered` controls whether the portal is in the DOM.
  // `visible` drives the CSS transition class (slightly delayed so the
  // browser has a frame to paint the initial off-screen position first).
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  // Step 1: mount/unmount the portal based on `open`
  useEffect(() => {
    if (open) {
      setRendered(true);
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Step 2: once React has committed the portal to the DOM (`rendered` is true),
  // schedule a RAF to trigger the CSS transition. useLayoutEffect fires after the
  // DOM commit but before the browser paints, so the RAF fires on the very next
  // paint — guaranteeing the element starts from its off-screen position.
  useLayoutEffect(() => {
    if (!rendered || !open) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [rendered, open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!rendered) return null;

  const translateHidden = side === 'right' ? 'translate-x-full' : '-translate-x-full';
  const anchor = side === 'right' ? 'right-0' : 'left-0';

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 h-full z-50 bg-panel border-border shadow-2xl flex flex-col',
          'transition-transform duration-300 ease-in-out',
          side === 'right' ? 'border-l' : 'border-r',
          anchor,
          width,
          visible ? 'translate-x-0' : translateHidden,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          {title ? (
            <div className="text-sm font-semibold text-text">{title}</div>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-hover hover:text-text transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default Drawer;
