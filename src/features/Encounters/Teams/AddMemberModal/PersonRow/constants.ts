import { TrendingUp, Zap, Star, Crown } from 'lucide-react';
import { EngagementLevel } from '@/interfaces/Person';

export const ENGAGEMENT_CONFIG: Record<EngagementLevel, { classes: string; Icon: React.ElementType }> = {
  baixo:    { classes: 'bg-slate-100 text-slate-500',  Icon: TrendingUp },
  medio:    { classes: 'bg-amber-50 text-amber-600',   Icon: Zap },
  alto:     { classes: 'bg-blue-50 text-blue-600',     Icon: Star },
  destaque: { classes: 'bg-primary/10 text-primary',   Icon: Crown },
};
