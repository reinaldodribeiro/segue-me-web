import { EngagementLevel } from '@/interfaces/Person';

export const ENGAGEMENT_LEVEL_CONFIG: Record<string, {
  label: string;
  barColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
}> = {
  baixo:    { label: 'Baixo',    barColor: 'bg-slate-300',  textColor: 'text-slate-500',  badgeBg: 'bg-slate-100',  badgeText: 'text-slate-600'  },
  medio:    { label: 'Médio',    barColor: 'bg-blue-400',   textColor: 'text-blue-600',   badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700'   },
  alto:     { label: 'Alto',     barColor: 'bg-violet-500', textColor: 'text-violet-600', badgeBg: 'bg-violet-100', badgeText: 'text-violet-700' },
  destaque: { label: 'Destaque', barColor: 'bg-amber-400',  textColor: 'text-amber-600',  badgeBg: 'bg-amber-100',  badgeText: 'text-amber-700'  },
};

export const ENGAGEMENT_LEVELS_ORDER: EngagementLevel[] = ['baixo', 'medio', 'alto', 'destaque'];
