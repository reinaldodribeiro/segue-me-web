"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Upload,
  Download,
  FileText,
  Users,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Camera,
  ArrowUpDown,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { useClientPagination } from "@/hooks/useClientPagination";
import Button from "@/components/Button";
import Input from "@/components/Input";
import DateInput from "@/components/DateInput";
import Select from "@/components/Select";
import { useToast } from "@/hooks/useToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { usePermissions } from "@/hooks/usePermissions";
import { EncounterParticipant } from "@/interfaces/Encounter";
import { PersonType } from "@/interfaces/Person";
import EncounterService from "@/services/api/EncounterService";
import { slugify } from "@/utils/helpers";
import ImportModal from "./ImportModal";
import EncontristaCard from "./EncontristaCard";
import EditEncontristaModal from "./EditEncontristaModal";
import { EncontristasProps } from "./types";

const EMPTY_FORM = {
  name: "",
  partnerName: "",
  type: "youth" as PersonType,
  phone: "",
  email: "",
  birthDate: "",
  partnerBirthDate: "",
  photoFile: null as File | null,
  photoPreview: null as string | null,
};

const Encontristas: React.FC<EncontristasProps> = ({
  encounterId,
  encounterName,
  maxParticipants,
  isCompleted,
}) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { isParishAdmin, isSuperAdmin, isCoordinator } = usePermissions();
  const canEdit =
    (isParishAdmin || isSuperAdmin || isCoordinator) && !isCompleted;

  const [participants, setParticipants] = useState<EncounterParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [editingParticipant, setEditingParticipant] =
    useState<EncounterParticipant | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [downloading, setDownloading] = useState<"excel" | "pdf" | null>(null);

  // Inline quick-add form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    EncounterService.listParticipants(encounterId)
      .then((res) => setParticipants(res.data.data))
      .catch((err: unknown) => handleError(err, "load()"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [encounterId]);

  function openForm() {
    setShowForm(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setTimeout(() => nameRef.current?.focus(), 50);
  }

  async function handleAdd(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Informe o nome do encontrista.", variant: "error" });
      return;
    }
    const isCouple = form.type === "couple";
    setSaving(true);
    try {
      const res = await EncounterService.addParticipant(encounterId, {
        name: form.name.trim(),
        partner_name: isCouple ? form.partnerName.trim() || null : null,
        type: form.type,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        birth_date: form.birthDate || null,
        partner_birth_date: isCouple ? form.partnerBirthDate || null : null,
      });
      let newParticipant = res.data.data;
      if (form.photoFile) {
        const photoRes = await EncounterService.uploadParticipantPhoto(
          encounterId,
          newParticipant.id,
          form.photoFile,
        );
        newParticipant = photoRes.data.data;
      }
      setParticipants((prev) => [...prev, newParticipant]);
      toast({ title: "Encontrista adicionado.", variant: "success" });
      resetForm();
    } catch (err: unknown) {
      handleError(err, "handleAdd()");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await EncounterService.removeParticipant(encounterId, id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Encontrista removido.", variant: "success" });
    } catch (err: unknown) {
      handleError(err, "handleRemove()");
    }
  }

  function handleSaved(updated: EncounterParticipant) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
    setEditingParticipant(null);
  }

  async function handleDownload(type: "excel" | "pdf") {
    setDownloading(type);
    try {
      const name = `encontristas-${slugify(encounterName)}`;
      if (type === "excel") {
        await EncounterService.downloadParticipantsExcel(
          encounterId,
          `${name}.xlsx`,
        );
      } else {
        await EncounterService.downloadParticipantsPdf(
          encounterId,
          `${name}.pdf`,
        );
      }
    } catch (err: unknown) {
      handleError(err, "handleDownload()");
    } finally {
      setDownloading(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = participants.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.partner_name?.toLowerCase().includes(q) ?? false) ||
        (p.phone?.includes(q) ?? false) ||
        (p.email?.toLowerCase().includes(q) ?? false)
      );
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = a.name.localeCompare(b.name, "pt-BR");
      } else {
        cmp = a.created_at.localeCompare(b.created_at);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [participants, search, sortBy, sortDir]);

  const { paginated, meta, setPage } = useClientPagination(
    filtered,
    [search, sortBy, sortDir],
    { perPage: 10 },
  );

  const count = participants.length;
  const youthCount = participants.filter((p) => p.type === "youth").length;
  const coupleCount = participants.filter((p) => p.type === "couple").length;
  const convertedCount = participants.filter((p) => p.is_converted).length;
  const isFull = maxParticipants !== null && count >= maxParticipants;
  const isCouple = form.type === "couple";

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-text">
            <Users size={15} className="text-text-muted" />
            <span>{count}</span>
            {maxParticipants !== null && (
              <span className="text-text-muted font-normal">
                / {maxParticipants}
              </span>
            )}
          </div>
          {maxParticipants !== null && (
            <div className="w-24 bg-hover rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? "bg-green-500" : "bg-primary"}`}
                style={{
                  width: `${Math.min(100, (count / maxParticipants) * 100)}%`,
                }}
              />
            </div>
          )}
          {isFull && (
            <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              Completo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          {youthCount > 0 && (
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
              {youthCount} jovens
            </span>
          )}
          {coupleCount > 0 && (
            <span className="bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-medium">
              {coupleCount} casais
            </span>
          )}
          {convertedCount > 0 && (
            <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 size={11} />
              {convertedCount} convertido{convertedCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="ml-auto flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={13} />}
            loading={downloading === "excel"}
            onClick={() => handleDownload("excel")}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileText size={13} />}
            loading={downloading === "pdf"}
            onClick={() => handleDownload("pdf")}
          >
            PDF
          </Button>
          {canEdit && (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload size={13} />}
                onClick={() => setShowImport(true)}
              >
                Importar
              </Button>
              {!showForm && (
                <Button
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  disabled={isFull}
                  onClick={openForm}
                >
                  Adicionar
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inline quick-add form */}
      {canEdit && showForm && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text">Novo encontrista</p>
            <button
              onClick={() => setShowForm(false)}
              className="text-text-muted hover:text-text"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                name="type"
                label="Tipo"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as PersonType }))
                }
                required
              >
                <option value="youth">Jovem</option>
                <option value="couple">Casal</option>
              </Select>
              <Input
                ref={nameRef}
                name="name"
                label={isCouple ? "Nome (cônjuge 1)" : "Nome"}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
              {isCouple ? (
                <Input
                  name="partner_name"
                  label="Nome (cônjuge 2)"
                  value={form.partnerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, partnerName: e.target.value }))
                  }
                />
              ) : (
                <Input
                  name="phone"
                  label="Telefone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                name="email"
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              <DateInput
                name="birth_date"
                label={
                  isCouple ? "Nascimento (cônjuge 1)" : "Data de nascimento"
                }
                value={form.birthDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthDate: e.target.value }))
                }
              />
              {isCouple && (
                <DateInput
                  name="partner_birth_date"
                  label="Nascimento (cônjuge 2)"
                  value={form.partnerBirthDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, partnerBirthDate: e.target.value }))
                  }
                />
              )}
              {isCouple && (
                <Input
                  name="phone"
                  label="Telefone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              )}
            </div>

            {/* Photo upload */}
            <div className="flex items-center gap-3 pt-1">
              <div
                className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 cursor-pointer group"
                onClick={() => photoRef.current?.click()}
              >
                {form.photoPreview ? (
                  <img
                    src={form.photoPreview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${isCouple ? "bg-violet-100" : "bg-blue-100"}`}
                  >
                    <Camera
                      size={16}
                      className={isCouple ? "text-violet-400" : "text-blue-400"}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} className="text-white" />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="text-xs text-primary hover:underline"
                >
                  {form.photoPreview
                    ? "Alterar foto"
                    : "Adicionar foto (opcional)"}
                </button>
                {form.photoPreview && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        photoFile: null,
                        photoPreview: null,
                      }))
                    }
                    className="ml-2 text-xs text-text-muted hover:text-red-500"
                  >
                    Remover
                  </button>
                )}
              </div>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    setForm((f) => ({
                      ...f,
                      photoFile: file,
                      photoPreview: ev.target?.result as string,
                    }));
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            <div className="flex items-center gap-2 justify-end pt-1">
              <p className="text-xs text-text-muted mr-auto">
                Após salvar, o formulário permanece aberto para o próximo
                cadastro.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Fechar
              </Button>
              <Button
                type="submit"
                size="sm"
                loading={saving}
                disabled={isFull}
              >
                Adicionar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search + sort */}
      {participants.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Buscar encontrista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input-border bg-input-bg text-input-text outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ArrowUpDown size={13} className="text-text-muted" />
            {(
              [
                { key: "created_at", label: "Cadastro" },
                { key: "name", label: "A–Z" },
              ] as { key: typeof sortBy; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  if (sortBy === key) {
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                  } else {
                    setSortBy(key);
                    setSortDir("asc");
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  sortBy === key
                    ? "bg-primary text-white border-primary"
                    : "bg-panel text-text-muted border-border hover:text-text"
                }`}
              >
                {label}
                {sortBy === key && (
                  <span className="ml-1 opacity-80">
                    {sortDir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-panel border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-text-muted">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <Users size={32} className="mx-auto mb-2 text-text-muted/30" />
            <p className="text-sm text-text-muted">
              {search
                ? "Nenhum encontrista encontrado."
                : "Nenhum encontrista cadastrado."}
            </p>
            {canEdit && !search && !showForm && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                leftIcon={<Plus size={13} />}
                disabled={isFull}
                onClick={openForm}
              >
                Adicionar encontrista
              </Button>
            )}
          </div>
        ) : (
          paginated.map((p) => (
            <EncontristaCard
              key={p.id}
              participant={p}
              canEdit={canEdit}
              onRemove={handleRemove}
              onEdit={setEditingParticipant}
            />
          ))
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      {isCompleted && convertedCount > 0 && (
        <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ {convertedCount} encontrista
          {convertedCount !== 1 ? "s foram" : " foi"} automaticamente cadastrado
          {convertedCount !== 1 ? "s" : ""} como Pessoa ao finalizar o encontro.
        </p>
      )}

      {showImport && (
        <ImportModal
          encounterId={encounterId}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            load();
          }}
        />
      )}

      {editingParticipant && (
        <EditEncontristaModal
          encounterId={encounterId}
          participant={editingParticipant}
          onClose={() => setEditingParticipant(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Encontristas;
