"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  RefreshCw,
  Trash2,
  Upload,
  X,
  Plus,
  Tag,
  CheckCircle2,
  Eye,
} from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import SectionCard from "@/components/SectionCard";
import Toggle from "@/components/Toggle";
import ColorPicker from "@/components/ColorPicker";
import FeedbackMsg from "@/components/FeedbackMsg";
import ParishService from "@/services/api/ParishService";
import { useParish } from "@/lib/query/hooks/useParishes";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { storageUrl } from "@/utils/helpers";
import { useParishColor } from "@/hooks/useParishColor";
import { useAuth } from "@/hooks/useAuth";

const ParishDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const { applyParishColors, previewColors } = useParishColor();
  const queryClient = useQueryClient();

  const { data: parish, isLoading: loading, isError } = useParish(id);

  const [infoForm, setInfoForm] = useState({ name: "", active: true });
  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  const [brandForm, setBrandForm] = useState({
    primary_color: "#4f46e5",
    secondary_color: "#7c3aed",
  });
  const [brandError, setBrandError] = useState("");
  const [brandSuccess, setBrandSuccess] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [addingSkill, setAddingSkill] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const initializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!parish || initializedRef.current === id) return;
    initializedRef.current = id;
    setInfoForm({ name: parish.name, active: parish.active });
    setBrandForm({
      primary_color: parish.primary_color ?? "#4f46e5",
      secondary_color: parish.secondary_color ?? "#7c3aed",
    });
    setSkills(parish.skills ?? []);
  }, [parish, id]);

  useEffect(() => {
    if (isError) router.replace("/app/parishes");
  }, [isError, router]);

  async function saveInfo(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!infoForm.name.trim()) {
      setInfoError("Nome é obrigatório");
      return;
    }
    setSavingInfo(true);
    setInfoError("");
    setInfoSuccess("");
    try {
      await ParishService.put(id, {
        name: infoForm.name.trim(),
        active: infoForm.active,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.parishes.detail(id),
      });
      setInfoSuccess("Informações salvas com sucesso.");
      setTimeout(() => setInfoSuccess(""), 3000);
    } catch (err: unknown) {
      setInfoError(
        (err as { data?: { message?: string } })?.data?.message ??
          "Erro ao salvar.",
      );
    } finally {
      setSavingInfo(false);
    }
  }

  async function saveBrand(e: React.SyntheticEvent) {
    e.preventDefault();
    setSavingBrand(true);
    setBrandError("");
    setBrandSuccess("");
    try {
      await ParishService.put(id, {
        primary_color: brandForm.primary_color,
        secondary_color: brandForm.secondary_color,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.parishes.detail(id),
      });
      applyParishColors(brandForm.primary_color, brandForm.secondary_color);
      setBrandSuccess("Aparência salva com sucesso.");
      setTimeout(() => setBrandSuccess(""), 3000);
    } catch (err: unknown) {
      setBrandError(
        (err as { data?: { message?: string } })?.data?.message ??
          "Erro ao salvar.",
      );
    } finally {
      setSavingBrand(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setLogoError("");
    try {
      const res = await ParishService.uploadLogo(id, file);
      queryClient.invalidateQueries({
        queryKey: queryKeys.parishes.detail(id),
      });

      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          parish: prev.parish
            ? { ...prev.parish, logo: res.data?.data?.logo }
            : prev.parish,
        };
      });
      toast({ title: "Logo atualizada com sucesso!", variant: "success" });
    } catch (err: unknown) {
      setLogoError(
        (err as { data?: { message?: string } })?.data?.message ??
          "Erro ao enviar logo.",
      );
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleAddSkill(e: React.SyntheticEvent) {
    e.preventDefault();
    const skill = newSkill.trim();
    if (!skill || skills.includes(skill)) return;
    setAddingSkill(true);
    setSkillsError("");
    try {
      const res = await ParishService.addSkill(id, skill);
      setSkills(res.data.data);
      setNewSkill("");
    } catch (err: unknown) {
      setSkillsError(
        (err as { data?: { message?: string } })?.data?.message ??
          "Erro ao adicionar skill.",
      );
    } finally {
      setAddingSkill(false);
    }
  }

  async function handleRemoveSkill(skill: string) {
    setRemovingSkill(skill);
    setSkillsError("");
    try {
      const res = await ParishService.removeSkill(id, skill);
      setSkills(res.data.data);
    } catch (err: unknown) {
      setSkillsError(
        (err as { data?: { message?: string } })?.data?.message ??
          "Erro ao remover skill.",
      );
    } finally {
      setRemovingSkill(null);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await ParishService.delete(id);
      router.push(
        parish?.sector_id
          ? `/app/sectors/${parish?.sector_id}`
          : "/app/parishes",
      );
    } catch (err: unknown) {
      setDeleteError(
        (err as { data?: { message?: string } })?.data?.message ??
          "Erro ao excluir paróquia.",
      );
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-text-muted">
        <RefreshCw size={18} className="animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (!parish) return null;

  const backHref = parish.sector_id
    ? `/app/sectors/${parish.sector_id}`
    : "/app/parishes";

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft size={16} />}
            >
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text">{parish.name}</h1>
            <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
              <span>{parish.sector?.diocese?.name}</span>
              {parish.sector && (
                <>
                  <span>·</span>
                  <span>{parish.sector.name}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<Trash2 size={14} />}
          onClick={() => setConfirmDelete(true)}
        >
          Excluir
        </Button>
      </div>

      <SectionCard title="Informações Básicas">
        <form onSubmit={saveInfo} noValidate className="space-y-5">
          <Input
            label="Nome *"
            name="name"
            placeholder="Nome da paróquia"
            value={infoForm.name}
            onChange={(e) =>
              setInfoForm((p) => ({ ...p, name: e.target.value }))
            }
            startIcon={<Building2 size={16} />}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Paróquia ativa</p>
              <p className="text-xs text-text-muted mt-0.5">
                Paróquias inativas não aparecem para seleção
              </p>
            </div>
            <Toggle
              checked={infoForm.active}
              onChange={() => setInfoForm((p) => ({ ...p, active: !p.active }))}
            />
          </div>
          <FeedbackMsg error={infoError} success={infoSuccess} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={savingInfo}>
              Salvar Informações
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Aparência">
        <form onSubmit={saveBrand} noValidate className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-border bg-hover flex items-center justify-center overflow-hidden shrink-0">
              {parish?.logo ? (
                <img
                  src={storageUrl(parish.logo) || ""}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 size={24} className="text-text-muted/40" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-text">Logo da Paróquia</p>
              <p className="text-xs text-text-muted">
                PNG ou SVG recomendado. Máx. 2 MB.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  loading={uploadingLogo}
                  leftIcon={<Upload size={14} />}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? "Enviando..." : "Enviar Logo"}
                </Button>
              </div>
              {logoError && <p className="text-xs text-red-500">{logoError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPicker
              label="Cor primária"
              id="primary_color"
              value={brandForm.primary_color}
              onChange={(v) =>
                setBrandForm((p) => ({ ...p, primary_color: v }))
              }
            />
            <ColorPicker
              label="Cor secundária"
              id="secondary_color"
              value={brandForm.secondary_color}
              onChange={(v) =>
                setBrandForm((p) => ({ ...p, secondary_color: v }))
              }
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div
              className="w-8 h-8 rounded-lg shrink-0"
              style={{ backgroundColor: brandForm.primary_color }}
            />
            <div
              className="w-8 h-8 rounded-lg shrink-0"
              style={{ backgroundColor: brandForm.secondary_color }}
            />
            <span className="text-xs text-text-muted flex-1">
              Prévia das cores
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Eye size={14} />}
              onClick={() =>
                previewColors(
                  brandForm.primary_color,
                  brandForm.secondary_color,
                )
              }
            >
              Pre-visualizar
            </Button>
          </div>

          <FeedbackMsg error={brandError} success={brandSuccess} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={savingBrand}>
              Salvar Aparência
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Skills Disponíveis">
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Skills que podem ser atribuídas às pessoas desta paróquia (ex:
            música, canto, pregação).
          </p>
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <Input
              name="newSkill"
              placeholder="Nova skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              startIcon={<Tag size={14} />}
              className="flex-1"
            />
            <Button
              type="submit"
              size="sm"
              loading={addingSkill}
              disabled={!newSkill.trim() || skills.includes(newSkill.trim())}
              leftIcon={<Plus size={14} />}
            >
              Adicionar
            </Button>
          </form>
          {skills.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              Nenhuma skill cadastrada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  <CheckCircle2 size={13} />
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={removingSkill === skill}
                    className="ml-1 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {skillsError && <p className="text-sm text-red-500">{skillsError}</p>}
        </div>
      </SectionCard>

      {deleteError && <FeedbackMsg error={deleteError} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-xl p-6 w-full max-w-sm mx-4 space-y-4">
            <div>
              <h3 className="text-base font-bold text-text">
                Excluir paróquia?
              </h3>
              <p className="text-sm text-text-muted mt-1">
                Esta ação é irreversível. Todos os usuários, pessoas e encontros
                vinculados serão afetados.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                loading={deleting}
                onClick={handleDelete}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParishDetail;
