'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import Drawer from '@/components/Drawer';
import PersonProfileDrawer from '@/components/PersonProfileDrawer';
import PersonService from '@/services/api/PersonService';
import type { Person, PersonHistory, PersonTeamExperience } from '@/interfaces/Person';
import type { TopEngagedListProps } from './types';

const MEDALS = ['🥇', '🥈', '🥉'];

const LEVEL_STYLE: Record<string, { textColor: string; badgeBg: string; badgeText: string; label: string }> = {
  baixo:    { label: 'Baixo',    textColor: 'text-slate-500',  badgeBg: 'bg-slate-100',  badgeText: 'text-slate-600'  },
  medio:    { label: 'Médio',    textColor: 'text-blue-600',   badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700'   },
  alto:     { label: 'Alto',     textColor: 'text-violet-600', badgeBg: 'bg-violet-100', badgeText: 'text-violet-700' },
  destaque: { label: 'Destaque', textColor: 'text-amber-600',  badgeBg: 'bg-amber-100',  badgeText: 'text-amber-700'  },
};

const TopEngagedList: React.FC<TopEngagedListProps> = ({
  people,
  limit = 5,
  loading = false,
  showGauge = false,
  avgScore = 0,
  viewAllHref,
}) => {
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [drawerPerson, setDrawerPerson] = useState<Person | null>(null);
  const [loadingExps, setLoadingExps] = useState(false);
  const [experiences, setExperiences] = useState<PersonTeamExperience[]>([]);
  const [historyData, setHistoryData] = useState<PersonHistory[]>([]);

  /* Fetch full person + history/experiences when drawer opens */
  useEffect(() => {
    if (!drawerOpen || !drawerPerson) return;
    async function load() {
      setLoadingExps(true);
      try {
        const res = await PersonService.search(drawerPerson!.id);
        const p = res.data.data;
        setDrawerPerson(p);
        setExperiences(p.team_experiences ?? []);
        setHistoryData(p.history ?? []);
      } finally {
        setLoadingExps(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, drawerPerson?.id]);

  function openProfile(id: string, name: string, engagementLevel: string, engagementScore: number) {
    /* Pre-populate with the minimal data we already have so the drawer
       opens immediately with a name while the full fetch runs. */
    setDrawerPerson({
      id,
      name,
      engagement_level: engagementLevel as Person['engagement_level'],
      engagement_score: engagementScore,
    } as Person);
    setExperiences([]);
    setHistoryData([]);
    setDrawerOpen(true);
  }

  function closeProfile() {
    setDrawerOpen(false);
    setTimeout(() => setDrawerPerson(null), 300);
  }

  const rows = people.slice(0, limit);

  return (
    <>
      {/* ── List ── */}
      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-10 bg-hover rounded-lg animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-8">Nenhuma pessoa cadastrada.</p>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((person, i) => {
            const cfg = LEVEL_STYLE[person.engagement_level] ?? LEVEL_STYLE['baixo'];
            return (
              <button
                key={person.id}
                onClick={() => openProfile(person.id, person.name, person.engagement_level, person.engagement_score)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-hover transition-colors text-left group"
              >
                <span className="text-sm w-5 text-center shrink-0">
                  {i < MEDALS.length
                    ? MEDALS[i]
                    : <span className="text-xs text-text-muted/50">{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
                    {person.name}
                  </p>
                  <p className={`text-[10px] font-medium mt-0.5 ${cfg.textColor}`}>{cfg.label}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>
                  {person.engagement_score}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Score gauge (optional) ── */}
      {showGauge && !loading && (
        <div className="px-5 py-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Score médio geral</span>
            <span className="text-sm font-bold text-text">{avgScore}</span>
          </div>
          <div className="h-2 bg-hover rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all"
              style={{ width: `${Math.min(100, avgScore)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-text-muted/50">0</span>
            <span className="text-[10px] text-text-muted/50">100</span>
          </div>
        </div>
      )}

      {/* ── View all link (optional) ── */}
      {viewAllHref && !loading && (
        <div className="px-5 py-3 border-t border-border">
          <Link href={viewAllHref} className="text-xs text-primary hover:underline">
            Ver todas as pessoas →
          </Link>
        </div>
      )}

      {/* ── Profile Drawer ── */}
      <Drawer open={drawerOpen} onClose={closeProfile} width="w-[420px]">
        {!drawerPerson ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-text-muted" />
          </div>
        ) : (
          <PersonProfileDrawer
            person={drawerPerson}
            experiences={experiences}
            historyData={historyData}
            loadingExps={loadingExps}
            onClose={closeProfile}
          />
        )}
      </Drawer>
    </>
  );
};

export default TopEngagedList;
