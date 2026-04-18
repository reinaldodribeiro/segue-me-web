'use client';

import React, { createContext, useCallback, useState } from 'react';
import { Toast, ToastOptions } from '@/interfaces/Toast';
import ToastViewport from '@/components/Toast';

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 3500;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({ title, description, variant = 'info', durationMs = DEFAULT_DURATION }: ToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((prev) => {
        const next = [{ id, title, description, variant, durationMs }, ...prev];
        return next.length > TOAST_LIMIT ? next.slice(0, TOAST_LIMIT) : next;
      });
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
