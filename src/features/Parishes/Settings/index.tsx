'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Building2, RefreshCw, Upload, X, Plus, Tag, CheckCircle2, Eye, Settings } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import SectionCard from '@/components/SectionCard';
import ColorPicker from '@/components/ColorPicker';
import FeedbackMsg from '@/components/FeedbackMsg';
import ParishService from '@/services/api/ParishService';
import { useParish } from '@/lib/query/hooks/useParishes';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { storageUrl } from '@/utils/helpers';
import { useParishColor } from '@/hooks/useParishColor';
import { useAuth } from '@/hooks/useAuth';

const ParishSettings: React.FC = () => {
  const { user } = useAuth();
  const parishId = user?.parish_id ?? '';
  const { toast } = useToast();
  const { applyParishColors, previewColors } = useParishColor();
  const queryClient = useQueryClient();

  const { data: parish, isLoading: loading } = useParish(parishId);

  // Brand/appearance
  const [brandForm, setBrandForm] = useState({ primary_color: '#4f46e5', secondary_color: '#7c3aed' });
  const [brandError, setBrandError] = useState('');
  const [brandSuccess, setBrandSuccess] = useState('');
  const [savingBrand, setSavingBrand] = useState(false);

  // Logo
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState('');

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState('');

  // initializedRef guard to prevent re-init after cache invalidation
  const initializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!parish || initializedRef.current === parishId) return;
    initializedRef.current = parishId;
    setBrandForm({
      primary_color: parish.primary_color ?? '#4f46e5',
      secondary_color: parish.secondary_color ?? '#7c3aed',
    });
    setSkills(parish.skills ?? []);
  }, [parish, parishId]);

  async function saveBrand(e: React.SyntheticEvent) {
    e.preventDefault();
    setSavingBrand(true); setBrandError(''); setBrandSuccess('');
    try {
      await ParishService.put(parishId, {
        primary_color: brandForm.primary_color,
        secondary_color: brandForm.secondary_color,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes.detail(parishId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      applyParishColors(brandForm.primary_color, brandForm.secondary_color);
      setBrandSuccess('Aparência salva com sucesso.');
      setTimeout(() => setBrandSuccess(''), 3000);
    } catch (err: unknown) {
      setBrandError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao salvar.');
    } finally { setSavingBrand(false); }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true); setLogoError('');
    try {
      await ParishService.uploadLogo(parishId, file);
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes.detail(parishId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      toast({ title: 'Logo atualizada com sucesso!', variant: 'success' });
    } catch (err: unknown) {
      setLogoError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao enviar logo.');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  async function handleAddSkill(e: React.SyntheticEvent) {
    e.preventDefault();
    const skill = newSkill.trim();
    if (!skill || skills.includes(skill)) return;
    setAddingSkill(true); setSkillsError('');
    try {
      const res = await ParishService.addSkill(parishId, skill);
      setSkills(res.data.data);
      setNewSkill('');
    } catch (err: unknown) {
      setSkillsError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao adicionar skill.');
    } finally { setAddingSkill(false); }
  }

  async function handleRemoveSkill(skill: string) {
    setRemovingSkill(skill); setSkillsError('');
    try {
      const res = await ParishService.removeSkill(parishId, skill);
      setSkills(res.data.data);
    } catch (err: unknown) {
      setSkillsError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao remover skill.');
    } finally { setRemovingSkill(null); }
  }

  if (!parishId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-text-muted gap-2">
        <Building2 size={32} className="opacity-40" />
        <p className="text-sm">Você não está vinculado a uma paróquia.</p>
      </div>
    );
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text flex items-center gap-2">
          <Settings size={20} />
          Configurações da Paróquia
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          {parish.name} · {parish.sector?.name} · {parish.sector?.diocese?.name}
        </p>
      </div>

      {/* Aparência */}
      <SectionCard title="Aparência">
        <form onSubmit={saveBrand} noValidate className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-border bg-hover flex items-center justify-center overflow-hidden shrink-0">
              {parish?.logo ? (
                <img src={storageUrl(parish.logo) || ''} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 size={24} className="text-text-muted/40" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-text">Logo da Paróquia</p>
              <p className="text-xs text-text-muted">PNG ou SVG recomendado. Máx. 2 MB.</p>
              <div className="flex items-center gap-2 mt-2">
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <Button variant="secondary" size="sm" type="button" loading={uploadingLogo}
                  leftIcon={<Upload size={14} />} onClick={() => logoInputRef.current?.click()}>
                  {uploadingLogo ? 'Enviando...' : 'Enviar Logo'}
                </Button>
              </div>
              {logoError && <p className="text-xs text-red-500">{logoError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPicker label="Cor primária" id="primary_color"
              value={brandForm.primary_color} onChange={(v) => setBrandForm((p) => ({ ...p, primary_color: v }))} />
            <ColorPicker label="Cor secundária" id="secondary_color"
              value={brandForm.secondary_color} onChange={(v) => setBrandForm((p) => ({ ...p, secondary_color: v }))} />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: brandForm.primary_color }} />
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: brandForm.secondary_color }} />
            <span className="text-xs text-text-muted flex-1">Prévia das cores</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Eye size={14} />}
              onClick={() => previewColors(brandForm.primary_color, brandForm.secondary_color)}
            >
              Pre-visualizar
            </Button>
          </div>

          <FeedbackMsg error={brandError} success={brandSuccess} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={savingBrand}>Salvar Aparência</Button>
          </div>
        </form>
      </SectionCard>

      {/* Skills Disponíveis */}
      <SectionCard title="Skills Disponíveis">
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Skills que podem ser atribuídas às pessoas desta paróquia (ex: música, canto, pregação).
          </p>
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <Input name="newSkill" placeholder="Nova skill..." value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)} startIcon={<Tag size={14} />} className="flex-1" />
            <Button type="submit" size="sm" loading={addingSkill}
              disabled={!newSkill.trim() || skills.includes(newSkill.trim())} leftIcon={<Plus size={14} />}>
              Adicionar
            </Button>
          </form>
          {skills.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Nenhuma skill cadastrada.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  <CheckCircle2 size={13} />
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)}
                    disabled={removingSkill === skill}
                    className="ml-1 hover:text-red-500 transition-colors disabled:opacity-40">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {skillsError && <p className="text-sm text-red-500">{skillsError}</p>}
        </div>
      </SectionCard>

      {/* Informações (read-only) */}
      <SectionCard title="Informações">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-text-muted">Paróquia</p>
            <p className="text-sm font-medium text-text mt-0.5">{parish.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Setor</p>
            <p className="text-sm font-medium text-text mt-0.5">{parish.sector?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Diocese</p>
            <p className="text-sm font-medium text-text mt-0.5">{parish.sector?.diocese?.name ?? '—'}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default ParishSettings;
