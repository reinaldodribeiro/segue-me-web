import {
  LayoutDashboard, CalendarDays, Users, Building2, Settings,
  Layers, UserCog, Landmark, Map, BarChart2, ClipboardList, UserCircle, BotMessageSquare,
} from 'lucide-react';
import { NavItemConfig, NavSection } from './types';

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard',   icon: LayoutDashboard, href: '/app' },
      { label: 'Relatórios',  icon: BarChart2,        href: '/app/reports' },
    ],
  },
  {
    label: 'Pastoral',
    items: [
      { label: 'Fichas',     icon: Users,       href: '/app/people' },
      { label: 'Encontros',  icon: CalendarDays, href: '/app/encounters' },
      { label: 'Movimentos', icon: Layers,       href: '/app/movements' },
    ],
  },
  {
    label: 'Administração',
    items: [
      { label: 'Usuários',   icon: UserCog,      href: '/app/users' },
      { label: 'Dioceses',   icon: Landmark,     href: '/app/dioceses' },
      { label: 'Setores',    icon: Map,          href: '/app/sectors' },
      { label: 'Paróquias',  icon: Building2,    href: '/app/parishes' },
      { label: 'Auditoria',  icon: ClipboardList,     href: '/app/audit' },
      { label: 'Logs de IA', icon: BotMessageSquare,  href: '/app/ai-logs' },
    ],
  },
];

export const BOTTOM_NAV: NavItemConfig[] = [
  { label: 'Config. Paróquia', icon: Settings,    href: '/app/settings/parish' },
  { label: 'Meu Perfil',       icon: UserCircle,  href: '/app/profile' },
];
