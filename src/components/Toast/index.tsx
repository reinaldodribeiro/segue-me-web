'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { ToastItemProps, ToastViewportProps } from './types';
import { variantStyles } from './styles';
import { DEFAULT_DURATION_MS } from './constants';

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { id, title, description, variant = 'info', durationMs = DEFAULT_DURATION_MS } = toast;
  const styles = variantStyles[variant];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), durationMs);
    return () => clearTimeout(timer);
  }, [id, durationMs, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 w-80 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all ${styles.bg}`}
      role="alert"
    >
      {styles.icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">{title}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-text-muted hover:text-text transition-colors shrink-0"
        aria-label="Fechar notificação"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ToastViewport: React.FC<ToastViewportProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default ToastViewport;
