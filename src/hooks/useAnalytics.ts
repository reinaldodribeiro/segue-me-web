import { useContext } from 'react';
import { AnalyticsContext, AnalyticsContextData } from '@/context/AnalyticsContext';

export function useAnalytics(): AnalyticsContextData {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used inside <AnalyticsProvider>');
  return context;
}
