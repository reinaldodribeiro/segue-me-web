'use client';

import {
  Phone, Mail, Calendar, Heart,
  History, Loader2, ExternalLink, Users, Tag, FileText,
  ShieldCheck, ShieldOff, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  PERSON_TYPE_LABELS,
  TEAM_MEMBER_STATUS_LABELS,
} from '@/interfaces/Person';
import { personDisplayName, personInitials } from '@/utils/personDisplay';
import { storageUrl } from '@/utils/helpers';
import { resolveTeamIcon } from '@/components/TeamIconPicker';
import { PersonProfileDrawerProps } from './types';
import { PROFILE_TYPE_COLOR, PROFILE_ENGAGEMENT_CONFIG } from './constants';

const PersonProfileDrawer: SafeFC<PersonProfileDrawerProps> = ({
  person,
  experiences,
  historyData,
  loadingExps,
  onClose,
  memberStatus,
}) => {
  const photo = person.photo ? storageUrl(person.photo) : null;
  const initials = personInitials(person);
  const displayName = personDisplayName(person);
  const isCouple = person.type === 'couple';
  const colors = PROFILE_TYPE_COLOR[person.type] ?? PROFILE_TYPE_COLOR.youth;
  const eng = PROFILE_ENGAGEMENT_CONFIG[person.engagement_level];
  const EngIcon = eng.Icon;

  const systemEntries = historyData
    .filter((h) => h.status === 'confirmed' && h.team && h.encounter)
    .map((h) => ({
      key: `sys-${h.id}`,
      icon: null as string | null,
      label: h.team!.name,
      sub: h.encounter!.name,
      role: null as string | null,
      year: h.encounter!.date
        ? new Date(h.encounter!.date.split('/').reverse().join('-')).getFullYear()
        : null,
      isSystem: true,
    }));

  const manualEntries = experiences.map((e) => ({
    key: `man-${e.id}`,
    icon: e.team_icon,
    label: e.team_name,
    sub: null as string | null,
    role: e.role_label,
    year: e.year,
    isSystem: false,
  }));

  const allEntries = [...systemEntries, ...manualEntries].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );

  return (
    <div>
      {/* Hero */}
      <div className={`bg-gradient-to-br ${colors.gradient} px-5 pt-6 pb-5`}>
        <div className="flex items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 shrink-0 flex items-center justify-center text-2xl font-bold text-white ${!photo ? colors.solid : ''}`}>
            {photo
              ? <img src={photo} alt={displayName} className="w-full h-full object-cover" />
              : initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-lg leading-tight">{person.name}</p>
            {isCouple && person.partner_name && (
              <p className="text-white/80 text-sm leading-tight">& {person.partner_name}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">
                {PERSON_TYPE_LABELS[person.type]}
              </span>
              {person.active ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-400/20 text-green-100">
                  <ShieldCheck size={10} /> Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/20 text-white/60">
                  <ShieldOff size={10} /> Inativo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="mt-4 rounded-xl bg-white/10 border border-white/20 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold mb-0.5">Engajamento</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
              <EngIcon size={14} /> {eng.label}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{person.engagement_score}</p>
            <p className="text-[10px] text-white/60">pontos</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-4">

        {/* Status no encontro (somente quando passado via prop) */}
        {memberStatus && (
          <div className="rounded-xl bg-hover/40 border border-border px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-text-muted">Status no encontro</p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold
              ${memberStatus === 'confirmed' ? 'text-green-600' : memberStatus === 'refused' ? 'text-red-500' : 'text-amber-600'}`}>
              {memberStatus === 'confirmed'
                ? <CheckCircle2 size={12} />
                : memberStatus === 'refused'
                  ? <XCircle size={12} />
                  : <Clock size={12} />}
              {TEAM_MEMBER_STATUS_LABELS[memberStatus]}
            </span>
          </div>
        )}

        {/* Contato */}
        {((person.phones?.length ?? 0) > 0 || person.email) && (
          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Contato</p>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {(person.phones ?? []).map((phone, idx) => (
                <a
                  key={idx}
                  href={`https://wa.me/55${phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover transition-colors"
                >
                  <Phone size={13} className="text-text-muted shrink-0" />
                  <span className="text-xs text-text">{phone}</span>
                </a>
              ))}
              {person.email && (
                <a href={`mailto:${person.email}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover transition-colors">
                  <Mail size={13} className="text-text-muted shrink-0" />
                  <span className="text-xs text-text truncate">{person.email}</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Datas */}
        {(person.birth_date || (isCouple && (person.partner_birth_date || person.wedding_date))) && (
          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Datas</p>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {person.birth_date && (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Calendar size={13} className="text-text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-text-muted">
                      {isCouple ? `Nascimento — ${person.name.split(' ')[0]}` : 'Nascimento'}
                    </p>
                    <p className="text-xs text-text">{person.birth_date}</p>
                  </div>
                </div>
              )}
              {isCouple && person.partner_birth_date && (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Calendar size={13} className="text-text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-text-muted">Nascimento — {person.partner_name?.split(' ')[0]}</p>
                    <p className="text-xs text-text">{person.partner_birth_date}</p>
                  </div>
                </div>
              )}
              {isCouple && person.wedding_date && (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <Heart size={13} className="text-rose-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-text-muted">Casamento</p>
                    <p className="text-xs text-text">{person.wedding_date}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Habilidades */}
        {(person.skills?.length ?? 0) > 0 && (
          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Tag size={10} /> Habilidades
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(person.skills ?? []).map((s) => (
                <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Equipes trabalhadas */}
        <section className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <History size={10} /> Equipes trabalhadas
          </p>
          {loadingExps ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="animate-spin text-text-muted" />
            </div>
          ) : allEntries.length === 0 ? (
            <p className="text-xs text-text-muted italic px-1">Nenhuma participação registrada.</p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {allEntries.map((entry) => {
                const IconComp = (entry.icon ? resolveTeamIcon(entry.icon) : null) ?? Users;
                return (
                  <div key={entry.key} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComp size={13} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text font-medium truncate">{entry.label}</p>
                      {entry.sub && <p className="text-[10px] text-text-muted truncate">{entry.sub}</p>}
                      {entry.role && <p className="text-[10px] text-text-muted">{entry.role}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {entry.year && <p className="text-[11px] text-text-muted">{entry.year}</p>}
                      {entry.isSystem && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">sistema</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Observações */}
        {person.notes && (
          <section className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <FileText size={10} /> Observações
            </p>
            <p className="text-xs text-text-muted leading-relaxed bg-hover/40 rounded-xl px-4 py-3 border border-border">
              {person.notes}
            </p>
          </section>
        )}

      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-panel px-4 pb-4 pt-2 border-t border-border">
        <Link
          href={`/app/people/${person.id}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          onClick={onClose}
        >
          <ExternalLink size={13} /> Ver perfil completo
        </Link>
      </div>
    </div>
  );
};

export default PersonProfileDrawer;
