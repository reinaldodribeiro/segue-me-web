'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { TooltipProps, TooltipPosition } from './types';
import { GAP, ARROW, ARROW_WRAPPER } from './constants';

function calcPos(rect: DOMRect, position: TooltipPosition) {
  switch (position) {
    case 'bottom':
      return {
        top:       rect.bottom + GAP,
        left:      rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        top:       rect.top + rect.height / 2,
        left:      rect.left - GAP,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        top:       rect.top + rect.height / 2,
        left:      rect.right + GAP,
        transform: 'translateY(-50%)',
      };
    case 'top':
    default:
      return {
        top:       rect.top - GAP,
        left:      rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
      };
  }
}

const Tooltip: SafeFC<TooltipProps> = ({ content, children, position = 'top', maxWidth = 280 }) => {
  const [visible, setVisible] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const { top, left, transform } = calcPos(rect, position);
    setStyle({ top, left, transform, maxWidth, position: 'fixed', zIndex: 9999 });
  }, [visible, position, maxWidth]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="inline-flex"
      >
        {children}
      </span>

      {visible && createPortal(
        <div className="pointer-events-none" style={style}>
          <div className={ARROW_WRAPPER[position]}>
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed">
              {content}
            </div>
            <div className={ARROW[position]} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default Tooltip;
