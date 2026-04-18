import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { TeamMemberStatus } from '@/interfaces/Person';

export const TYPE_COLOR: Record<string, { solid: string; light: string; text: string }> = {
  youth:  { solid: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-600' },
  couple: { solid: 'bg-violet-500', light: 'bg-violet-100', text: 'text-violet-600' },
};

export const STATUS_DOT: Record<TeamMemberStatus, string> = {
  confirmed: 'bg-green-500',
  pending:   'bg-amber-400',
  refused:   'bg-red-500',
};

export const STATUS_ICON: Record<TeamMemberStatus, React.ReactNode> = {
  confirmed: <CheckCircle2 size={11} className="text-green-600" />,
  pending:   <Clock        size={11} className="text-amber-500" />,
  refused:   <XCircle      size={11} className="text-red-500"   />,
};
