"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Pagination from "@/components/Pagination";
import { usePermissions } from "@/hooks/usePermissions";
import { useDebounce } from "@/hooks/useDebounce";
import { storageUrl } from "@/utils/helpers";
import { Parish } from "@/interfaces/Parish";
import { useParishList } from "@/lib/query/hooks/useParishes";
import { useHierarchyDioceses } from "@/lib/query/hooks/useHierarchy";
import { useSectorList } from "@/lib/query/hooks/useSectors";
import { useTutorial } from "@/hooks/useTutorial";

type StatusFilter = "all" | "active" | "inactive";

const ParishesList: SafeFC = () => {
  useTutorial();
  const { isSuperAdmin, isDioceseAdmin } = usePermissions();

  const [search, setSearch] = useState("");
  const [filterDiocese, setFilterDiocese] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  // Dropdown data via TanStack Query
  const { data: dioceses = [] } = useHierarchyDioceses(isSuperAdmin);
  const { data: sectorData } = useSectorList(
    isSuperAdmin || isDioceseAdmin ? { per_page: 200 } : {},
  );
  const allSectors = sectorData?.data ?? [];

  const visibleSectors = useMemo(() => {
    if (!filterDiocese) return allSectors;
    return allSectors.filter((s) => s.diocese_id === filterDiocese);
  }, [allSectors, filterDiocese]);

  // Parish list params
  const parishParams = useMemo(() => {
    const p: Record<string, unknown> = { per_page: 20, page };
    if (debouncedSearch) p.name = debouncedSearch;
    if (filterSector) p.sector_id = filterSector;
    else if (filterDiocese) p.diocese_id = filterDiocese;
    if (filterStatus === "active") p.active = 1;
    if (filterStatus === "inactive") p.active = 0;
    return p;
  }, [page, debouncedSearch, filterDiocese, filterSector, filterStatus]);

  const { data: parishData, isLoading: loading, isError } = useParishList(parishParams);
  const parishes: Parish[] = parishData?.data ?? [];
  const meta = parishData?.meta ?? null;

  function handleDioceseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterDiocese(e.target.value);
    setFilterSector("");
    setPage(1);
  }

  function handleSectorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterSector(e.target.value);
    setPage(1);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterStatus(e.target.value as StatusFilter);
    setPage(1);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  const hasFilters =
    search || filterDiocese || filterSector || filterStatus !== "all";

  function clearFilters() {
    setSearch("");
    setFilterDiocese("");
    setFilterSector("");
    setFilterStatus("all");
    setPage(1);
  }

  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">Paróquias</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {loading
              ? "Carregando..."
              : `${total} paróquia${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/app/parishes/new">
          <Button leftIcon={<Plus size={16} />}>Nova Paróquia</Button>
        </Link>
      </div>

      <div className="bg-panel border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            name="search"
            placeholder="Buscar pelo nome..."
            value={search}
            onChange={handleSearchChange}
            startIcon={<Search size={15} />}
          />
          {isSuperAdmin && (
            <Select
              name="filterDiocese"
              value={filterDiocese}
              onChange={handleDioceseChange}
            >
              <option value="">Todas as dioceses</option>
              {dioceses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          )}
          {(isSuperAdmin || isDioceseAdmin) && (
            <Select
              name="filterSector"
              value={filterSector}
              onChange={handleSectorChange}
              disabled={isSuperAdmin && !filterDiocese && allSectors.length > 0}
            >
              <option value="">Todos os setores</option>
              {visibleSectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          )}
          <Select
            name="filterStatus"
            value={filterStatus}
            onChange={handleStatusChange}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </Select>
        </div>
        {hasFilters && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando paróquias...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar paróquias.</div>
        ) : parishes.length === 0 ? (
          <div className="py-20 text-center">
            {hasFilters ? (
              <>
                <Search size={36} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-sm font-medium text-text-muted">
                  Nenhuma paróquia encontrada
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Limpar filtros
                </button>
              </>
            ) : (
              <>
                <Building2
                  size={40}
                  className="mx-auto mb-3 text-text-muted/30"
                />
                <p className="text-sm font-medium text-text-muted">
                  Nenhuma paróquia cadastrada
                </p>
                <Link href="/app/parishes/new">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    leftIcon={<Plus size={14} />}
                  >
                    Criar paróquia
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-hover/30">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">
                    Paróquia
                  </th>
                  {(isSuperAdmin || isDioceseAdmin) && (
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">
                      Setor
                    </th>
                  )}
                  {isSuperAdmin && (
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">
                      Diocese
                    </th>
                  )}
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parishes.map((parish) => (
                  <tr
                    key={parish.id}
                    className="hover:bg-hover/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {parish.logo ? (
                          <img
                            src={storageUrl(parish.logo) ?? ""}
                            alt=""
                            className="w-6 h-6 rounded object-contain shrink-0"
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor:
                                parish.primary_color ?? "#e5e7eb",
                            }}
                          >
                            <Building2 size={12} className="text-white/80" />
                          </div>
                        )}
                        <span className="font-medium text-text">
                          {parish.name}
                        </span>
                      </div>
                    </td>
                    {(isSuperAdmin || isDioceseAdmin) && (
                      <td className="px-4 py-3 text-text-muted">
                        {parish.sector?.name ?? "—"}
                      </td>
                    )}
                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-text-muted">
                        {parish.sector?.diocese?.name ?? "—"}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      {parish.active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                          <CheckCircle2 size={13} /> Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
                          <XCircle size={13} /> Inativa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/app/parishes/${parish.id}`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
};

export default ParishesList;
