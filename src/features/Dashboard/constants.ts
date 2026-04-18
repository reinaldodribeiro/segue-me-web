import { EngagementLevel } from '@/interfaces/Person';
import { EncounterStatus } from '@/interfaces/Encounter';
import { BarChart2, Calendar, Shield, UserPlus } from 'lucide-react';

export const ENGAGEMENT_LEVELS: EngagementLevel[] = ['baixo', 'medio', 'alto', 'destaque'];

export const ENGAGEMENT_CONFIG: Record<EngagementLevel, {
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

export const ENCOUNTER_STATUS_BADGE: Record<EncounterStatus, string> = {
  draft:     'bg-slate-100 text-slate-600',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-primary/10 text-primary',
};

export const QUICK_ACTIONS = [
  { label: 'Cadastrar Pessoa', href: '/app/people/new',      Icon: UserPlus  },
  { label: 'Novo Encontro',   href: '/app/encounters/new',  Icon: Calendar  },
  { label: 'Relatórios',      href: '/app/reports',         Icon: BarChart2 },
  { label: 'Auditoria',       href: '/app/audit',           Icon: Shield    },
] as const;
