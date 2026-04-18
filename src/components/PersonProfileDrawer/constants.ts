import { TrendingUp, Zap, Star, Crown } from 'lucide-react';
import { EngagementLevel } from '@/interfaces/Person';

export const PROFILE_TYPE_COLOR: Record<string, { solid: string; gradient: string }> = {
  youth:  { solid: 'bg-secondary', gradient: 'from-secondary to-primary' },
  couple: { solid: 'bg-secondary', gradient: 'from-secondary to-primary' },
};

export const PROFILE_ENGAGEMENT_CONFIG: Record<EngagementLevel, { classes: string; Icon: React.ElementType; label: string }> = {
  baixo:    { classes: 'text-slate-500 bg-slate-100',  Icon: TrendingUp, label: 'Baixo' },
  medio:    { classes: 'text-amber-600 bg-amber-50',   Icon: Zap,        label: 'Médio' },
  alto:     { classes: 'text-blue-600 bg-blue-50',     Icon: Star,       label: 'Alto' },
  destaque: { classes: 'text-primary bg-primary/10',   Icon: Crown,      label: 'Destaque' },
};
