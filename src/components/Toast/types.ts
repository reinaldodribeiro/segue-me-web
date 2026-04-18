import { Toast } from '@/interfaces/Toast';

export interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}
