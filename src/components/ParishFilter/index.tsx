'use client';

import { Building2, ChevronRight, Globe, Loader2, MapPin } from 'lucide-react';
import type { ParishFilterProps } from './types';

const sel =
  'text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[160px]';

const ParishFilter: React.FC<ParishFilterProps> = ({
  dioceseId, sectorId, parishId,
  setDioceseId, setSectorId, setParishId,
  dioceses, sectors, parishes,
  loadingCascade, loadingScope,
  scopedParishIds,
  isSuperAdmin, isDioceseAdmin, isSectorAdmin,
  selectedParishName,
}) => {
  const scopeLabel = (() => {
    if (selectedParishName) return null;
    if (loadingScope) return null;
    if (scopedParishIds.length === 0) return null;
    if (scopedParishIds.length === 1) return null;
    if (isSuperAdmin && !dioceseId) return `Todas as dioceses · ${scopedParishIds.length} paróquias`;
    return `${scopedParishIds.length} paróquias`;
  })();

  return (
    <div className="flex flex-wrap items-center gap-2 bg-panel border border-border rounded-xl px-4 py-3">
      <MapPin size={14} className="text-primary shrink-0" />
      <span className="text-xs font-medium text-text-muted shrink-0">Filtrar por:</span>

      {/* Diocese selector — only super_admin */}
      {isSuperAdmin && (
        <>
          <select value={dioceseId} onChange={(e) => setDioceseId(e.target.value)} className={sel}>
            <option value="">Todas as dioceses</option>
            {dioceses.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {(dioceseId || sectors.length > 0) && <ChevronRight size={13} className="text-text-muted/50 shrink-0" />}
        </>
      )}

      {/* Sector selector — super_admin + diocese_admin */}
      {(isSuperAdmin || isDioceseAdmin) && (
        <>
          <select
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value)}
            disabled={!sectors.length}
            className={`${sel} disabled:opacity-50`}
          >
            <option value="">Todos os setores</option>
            {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {(sectorId || parishes.length > 0) && <ChevronRight size={13} className="text-text-muted/50 shrink-0" />}
        </>
      )}

      {/* Parish selector — all admins */}
      <select
        value={parishId}
        onChange={(e) => setParishId(e.target.value)}
        disabled={!parishes.length && !isSectorAdmin}
        className={`${sel} disabled:opacity-50`}
      >
        <option value="">Todas as paróquias</option>
        {parishes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      {(loadingCascade || loadingScope) && (
        <Loader2 size={14} className="animate-spin text-text-muted shrink-0" />
      )}

      {/* Scope / selection badge */}
      <div className="ml-auto flex items-center gap-1.5">
        {selectedParishName ? (
          <span className="flex items-center gap-1 text-xs text-primary font-medium">
            <Building2 size={13} />
            {selectedParishName}
          </span>
        ) : scopeLabel ? (
          <span className="flex items-center gap-1 text-xs text-text-muted font-medium bg-hover px-2 py-1 rounded-lg">
            <Globe size={12} />
            Agregado · {scopeLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ParishFilter;
