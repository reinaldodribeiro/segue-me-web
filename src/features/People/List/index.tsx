"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Star,
  Upload,
  Trophy,
  FileImage,
} from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Pagination from "@/components/Pagination";
import SortableTable from "@/components/SortableTable";
import type { ColumnDef } from "@/components/SortableTable/types";
import {
  Person,
  PERSON_TYPE_LABELS,
  EngagementLevel,
} from "@/interfaces/Person";
import { usePersonList } from "@/lib/query/hooks/usePersons";
import { useHierarchyDioceses, useHierarchySectors, useHierarchyParishes } from "@/lib/query/hooks/useHierarchy";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/hooks/usePermissions";
import { storageUrl } from "@/utils/helpers";
import { personDisplayName, personInitials } from "@/utils/personDisplay";
import PeopleImport from "@/features/People/Import";
import OcrImport from "@/features/People/OcrImport";
import { useTutorial } from "@/hooks/useTutorial";

const ENGAGEMENT_COLORS: Record<EngagementLevel, string> = {
  baixo: "text-text-muted bg-hover",
  medio: "text-amber-600 bg-amber-50",
  alto: "text-blue-600 bg-blue-50",
  destaque: "text-primary bg-primary/10",
};

const ENGAGEMENT_LABELS: Record<EngagementLevel, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  destaque: "Destaque",
};

const PeopleList: React.FC = () => {
  useTutorial();
  const { isSuperAdmin, isDioceseAdmin } = usePermissions();
  const isAdmin = isSuperAdmin || isDioceseAdmin;
  const queryClient = useQueryClient();

  const columns = useMemo((): ColumnDef<Person>[] => [
    {
      key: "name",
      header: "Nome",
      sortKey: "name",
      cell: (person) => (
        <div className="flex items-center gap-2.5">
          {person.photo ? (
            <img
              src={storageUrl(person.photo) ?? ""}
              alt=""
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {personInitials(person)}
              </span>
            </div>
          )}
          <p className="font-medium text-text">
            {personDisplayName(person)}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      cell: (person) => (
        <span className="text-xs text-text-muted">
          {PERSON_TYPE_LABELS[person.type]}
        </span>
      ),
    },
    {
      key: "contact",
      header: "Contato",
      className: "text-xs text-text-muted",
      cell: (person) => person.phones?.[0] ?? person.email ?? "—",
    },
    {
      key: "engagement",
      header: "Engajamento",
      sortKey: "engagement_score",
      cell: (person) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${ENGAGEMENT_COLORS[person.engagement_level]}`}
          >
            <Star size={11} />
            {ENGAGEMENT_LABELS[person.engagement_level]}
          </span>
          {person.encounter_year && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <Trophy size={10} />
              {person.encounter_year}
            </span>
          )}
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "parish" as const,
            header: "Paróquia",
            cell: (person: Person) => (
              <span className="text-xs text-text-muted">
                {person.parish?.name ?? "—"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "status",
      header: "Status",
      cell: (person) =>
        person.active ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
            <CheckCircle2 size={13} /> Ativa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <XCircle size={13} /> Inativa
          </span>
        ),
    },
    {
      key: "actions",
      header: "",
      cell: (person) => (
        <div className="text-right">
          <Link href={`/app/people/${person.id}`}>
            <Button variant="ghost" size="sm">
              Ver
            </Button>
          </Link>
        </div>
      ),
    },
  ], [isAdmin]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDiocese, setFilterDiocese] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterParish, setFilterParish] = useState("");
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);
  const [showOcr, setShowOcr] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "engagement_score">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebounce(search, 400);

  const { data: dioceses = [] } = useHierarchyDioceses(isAdmin);
  const { data: sectors = [] } = useHierarchySectors(isAdmin ? filterDiocese : '');
  const { data: parishes = [] } = useHierarchyParishes(isAdmin ? filterSector : '');

  const listParams: Record<string, unknown> = { per_page: 30, page, sort_by: sortBy, sort_dir: sortDir };
  if (debouncedSearch) listParams.search = debouncedSearch;
  if (filterType) listParams.type = filterType;
  if (filterParish) listParams.parish_id = filterParish;
  else if (filterSector) listParams.sector_id = filterSector;
  else if (filterDiocese) listParams.diocese_id = filterDiocese;

  const { data: listData, isLoading: loading, isError } = usePersonList(listParams);
  const people = listData?.data ?? [];
  const meta = listData?.meta ?? null;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }
  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterType(e.target.value);
    setPage(1);
  }
  function handleDioceseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterDiocese(e.target.value);
    setFilterSector("");
    setFilterParish("");
    setPage(1);
  }
  function handleSectorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterSector(e.target.value);
    setFilterParish("");
    setPage(1);
  }
  function handleParishChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterParish(e.target.value);
    setPage(1);
  }
  const hasFilters =
    search || filterType || filterDiocese || filterSector || filterParish;
  function clearFilters() {
    setSearch("");
    setFilterType("");
    setFilterDiocese("");
    setFilterSector("");
    setFilterParish("");
    setPage(1);
  }

  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4" data-tutorial="people-header">
        <div>
          <h1 className="text-xl font-bold text-text">Fichas de Cadastro</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {loading
              ? "Carregando fichas..."
              : `${total} ficha${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <div data-tutorial="people-import-btn">
            <Button
              variant="secondary"
              leftIcon={<Upload size={15} />}
              onClick={() => setShowImport(true)}
            >
              Importar
            </Button>
          </div>
          <div data-tutorial="people-ocr-btn">
            <Button
              variant="secondary"
              leftIcon={<FileImage size={15} />}
              onClick={() => setShowOcr(true)}
            >
              OCR
            </Button>
          </div>
          <Link href="/app/people/new" data-tutorial="people-new-btn">
            <Button leftIcon={<Plus size={16} />}>Nova Ficha</Button>
          </Link>
        </div>
      </div>

      {showOcr && (
        <OcrImport onClose={() => setShowOcr(false)} />
      )}

      {showImport && (
        <PeopleImport
          parishId={filterParish || undefined}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setPage(1);
            queryClient.invalidateQueries({ queryKey: queryKeys.persons.lists() });
            setShowImport(false);
          }}
        />
      )}

      <div className="bg-panel border border-border rounded-xl p-4" data-tutorial="people-filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            name="search"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={handleSearchChange}
            startIcon={<Search size={15} />}
          />
          <Select
            name="filterType"
            value={filterType}
            onChange={handleTypeChange}
          >
            <option value="">Todos os tipos</option>
            <option value="youth">Jovem</option>
            <option value="couple">Casal</option>
          </Select>
        </div>
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
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
            <Select
              name="filterSector"
              value={filterSector}
              onChange={handleSectorChange}
              disabled={!filterDiocese}
            >
              <option value="">Todos os setores</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Select
              name="filterParish"
              value={filterParish}
              onChange={handleParishChange}
              disabled={!filterSector}
            >
              <option value="">Todas as paróquias</option>
              {parishes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        )}
        {hasFilters && (
          <div className="mt-3">
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="people-table">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando fichas...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar pessoas.</div>
        ) : people.length === 0 ? (
          <div className="py-20 text-center">
            {hasFilters ? (
              <>
                <Search size={36} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-sm font-medium text-text-muted">
                  Nenhuma ficha encontrada
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
                <Users size={40} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-sm font-medium text-text-muted">
                  Nenhuma ficha cadastrada
                </p>
                <Link href="/app/people/new">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    leftIcon={<Plus size={14} />}
                  >
                    Nova Ficha
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <SortableTable<Person>
              columns={columns}
              rows={people}
              rowKey={(p) => p.id}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={(key, dir) => {
                setSortBy(key as typeof sortBy);
                setSortDir(dir);
                setPage(1);
              }}
            />
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
};

export default PeopleList;
