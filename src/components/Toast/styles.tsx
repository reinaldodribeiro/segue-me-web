import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const variantStyles: Record<string, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'border-green-500/30 bg-green-500/10',
    icon: <CheckCircle size={16} className="text-green-400 shrink-0" />,
  },
  error: {
    bg: 'border-red-500/30 bg-red-500/10',
    icon: <AlertCircle size={16} className="text-red-400 shrink-0" />,
  },
  warning: {
    bg: 'border-yellow-500/30 bg-yellow-500/10',
    icon: <AlertTriangle size={16} className="text-yellow-400 shrink-0" />,
  },
  info: {
    bg: 'border-primary/30 bg-primary/10',
    icon: <Info size={16} className="text-primary shrink-0" />,
  },
};
