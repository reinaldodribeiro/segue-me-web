'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SidebarTooltipProps } from './types';

const SidebarTooltip: SafeFC<SidebarTooltipProps> = ({ children, label }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const show = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({ top: rect.top + rect.height / 2, left: rect.right + 10 });
    setVisible(true);
  };

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        className="w-full"
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            className="fixed z-[9999] px-2.5 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in duration-150"
            style={{
              top: coords.top,
              left: coords.left,
              transform: 'translateY(-50%)',
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
};

export default SidebarTooltip;
