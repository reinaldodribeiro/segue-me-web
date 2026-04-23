"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  TrendingUp,
  Zap,
  Trash2,
  CheckCircle2,
  XCircle,
  Camera,
  Loader2,
  Crown,
  Info,
  RefreshCw,
  X,
} from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import DateInput from "@/components/DateInput";
import Select from "@/components/Select";
import SectionCard from "@/components/SectionCard";
import { useToast } from "@/hooks/useToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import {
  PersonHistory,
  PersonPayload,
  PersonType,
  PersonTeamExperience,
  PERSON_TYPE_LABELS,
  EngagementLevel,
} from "@/interfaces/Person";
import PersonService from "@/services/api/PersonService";
import { usePerson } from "@/lib/query/hooks/usePersons";
import { useParishSkills } from "@/lib/query/hooks/useParishes";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import Tooltip from "@/components/Tooltip";
import { storageUrl, cn } from "@/utils/helpers";
import { useTutorial } from "@/hooks/useTutorial";

const ENGAGEMENT_CONFIG: Record<EngagementLevel, { classes: string; Icon: React.ElementType }> = {
  baixo:    { classes: "text-slate-500 bg-slate-100",   Icon: TrendingUp },
  medio:    { classes: "text-amber-600 bg-amber-50",    Icon: Zap },
  alto:     { classes: "text-blue-600 bg-blue-50",      Icon: Star },
  destaque: { classes: "text-primary bg-primary/10",    Icon: Crown },
};

const SACRAMENT_LABELS: Record<string, string> = {
  batismo: 'Batismo',
  eucaristia: 'Eucaristia',
  crisma: 'Crisma',
};

function apiDateToInput(date: string | null): string {
  if (!date) return "";
  const [d, m, y] = date.split("/");
  return `${y}-${m}-${d}`;
}

import { PersonDetailProps } from './types';
import HistorySection from './HistorySection';
import TeamExperiencesSection from './TeamExperiencesSection';

const PersonDetail: React.FC<PersonDetailProps> = ({ id }) => {
  useTutorial();
  const router = useRouter();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { isSuperAdmin, isParishAdmin, isCoordinator } = usePermissions();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const parishId = user?.parish_id ?? user?.parish?.id ?? null;

  const { data: person, isLoading: loading } = usePerson(id);
  const { data: parishSkills = [] } = useParishSkills(parishId ?? '');

  const history: PersonHistory[] = person?.history ?? [];

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Photo upload
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [recalculatingScore, setRecalculatingScore] = useState(false);

  // Edit form — basic fields
  const [type, setType] = useState<PersonType>("youth");
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [encounterYear, setEncounterYear] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [experiences, setExperiences] = useState<PersonTeamExperience[]>([]);

  // New common fields
  const [nickname, setNickname] = useState('');
  const [address, setAddress] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [churchMovement, setChurchMovement] = useState('');
  const [receivedAt, setReceivedAt] = useState('');
  const [encounterDetails, setEncounterDetails] = useState('');

  // Youth-only fields
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [educationStatus, setEducationStatus] = useState('');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState('');
  const [sacraments, setSacraments] = useState<string[]>([]);
  const [availableSchedule, setAvailableSchedule] = useState('');
  const [musicalInstruments, setMusicalInstruments] = useState('');
  const [talksTestimony, setTalksTestimony] = useState('');

  // Couple-only fields
  const [partnerNickname, setPartnerNickname] = useState('');
  const [partnerBirthplace, setPartnerBirthplace] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhones, setPartnerPhones] = useState<string[]>(['']);
  const [homePhones, setHomePhones] = useState<string[]>(['']);

  // Initialize form when person data first loads
  const initializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!person || initializedRef.current === id) return;
    initializedRef.current = id;
    setExperiences(person.team_experiences ?? []);
    setType(person.type);
    setName(person.name);
    setPartnerName(person.partner_name ?? "");
    setBirthDate(apiDateToInput(person.birth_date));
    setPartnerBirthDate(apiDateToInput(person.partner_birth_date));
    setWeddingDate(apiDateToInput(person.wedding_date));
    setPhones(person.phones?.length ? person.phones : ['']);
    setEmail(person.email ?? "");
    setNotes(person.notes ?? "");
    setActive(person.active);
    setSkills(person.skills ?? []);
    setEncounterYear(person.encounter_year ? String(person.encounter_year) : '');
    // Common new fields
    setNickname(person.nickname ?? '');
    setAddress(person.address ?? '');
    setBirthplace(person.birthplace ?? '');
    setChurchMovement(person.church_movement ?? '');
    setReceivedAt(apiDateToInput(person.received_at));
    setEncounterDetails(person.encounter_details ?? '');
    // Youth-only fields
    setFatherName(person.father_name ?? '');
    setMotherName(person.mother_name ?? '');
    setEducationLevel(person.education_level ?? '');
    setEducationStatus(person.education_status ?? '');
    setCourse(person.course ?? '');
    setInstitution(person.institution ?? '');
    setSacraments(person.sacraments ?? []);
    setAvailableSchedule(person.available_schedule ?? '');
    setMusicalInstruments(person.musical_instruments ?? '');
    setTalksTestimony(person.talks_testimony ?? '');
    // Couple-only fields
    setPartnerNickname(person.partner_nickname ?? '');
    setPartnerBirthplace(person.partner_birthplace ?? '');
    setPartnerEmail(person.partner_email ?? '');
    setPartnerPhones(person.partner_phones?.length ? person.partner_phones : ['']);
    setHomePhones(person.home_phones?.length ? person.home_phones : ['']);
  }, [person, id]);

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    const isCouple = type === "couple";
    const payload: Partial<PersonPayload> & {
      active: boolean;
      skills: string[];
    } = {
      type,
      name: name.trim(),
      active,
      partner_name: isCouple ? partnerName.trim() || null : null,
      birth_date: birthDate || null,
      partner_birth_date: isCouple ? partnerBirthDate || null : null,
      wedding_date: isCouple ? weddingDate || null : null,
      phones: phones.filter((p) => p.trim()),
      email: email.trim() || null,
      notes: notes.trim() || null,
      skills,
      encounter_year: encounterYear ? Number(encounterYear) : null,
      // Common new fields
      nickname: nickname.trim() || null,
      address: address.trim() || null,
      birthplace: birthplace.trim() || null,
      church_movement: churchMovement.trim() || null,
      received_at: receivedAt || null,
      encounter_details: encounterDetails.trim() || null,
    };

    if (!isCouple) {
      payload.father_name = fatherName.trim() || null;
      payload.mother_name = motherName.trim() || null;
      payload.education_level = educationLevel.trim() || null;
      payload.education_status = educationStatus || null;
      payload.course = course.trim() || null;
      payload.institution = institution.trim() || null;
      payload.sacraments = sacraments;
      payload.available_schedule = availableSchedule.trim() || null;
      payload.musical_instruments = musicalInstruments.trim() || null;
      payload.talks_testimony = talksTestimony.trim() || null;
    } else {
      payload.partner_nickname = partnerNickname.trim() || null;
      payload.partner_birthplace = partnerBirthplace.trim() || null;
      payload.partner_email = partnerEmail.trim() || null;
      payload.partner_phones = partnerPhones.filter((p) => p.trim());
      payload.home_phones = homePhones.filter((p) => p.trim());
    }

    try {
      await PersonService.put(id, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
      toast({ title: "Dados atualizados.", variant: "success" });
    } catch (err: unknown) {
      handleError(err, 'handleSave()');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await PersonService.delete(id);
      toast({ title: "Ficha removida.", variant: "success" });
      router.push("/app/people");
    } catch (err: unknown) {
      handleError(err, 'handleDelete()');
      setDeleting(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      await PersonService.uploadPhoto(id, file);
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
      toast({ title: "Foto atualizada.", variant: "success" });
    } catch (err: unknown) {
      handleError(err, 'handlePhotoChange()');
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }

  function handleAddCustomSkill() {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkillInput("");
  }

  function toggleSacrament(s: string) {
    setSacraments((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  if (loading)
    return (
      <div className="p-6 flex justify-center py-20 text-text-muted text-sm">
        Carregando...
      </div>
    );
  if (!person) return null;

  const isCouple = type === "couple";
  const canEdit = isSuperAdmin || isParishAdmin || isCoordinator;

  async function handleRecalculateScore() {
    setRecalculatingScore(true);
    try {
      await PersonService.recalculateScore(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
      toast({ title: "Pontuação recalculada.", variant: "success" });
    } catch (err: unknown) {
      handleError(err, 'handleRecalculateScore()');
    } finally {
      setRecalculatingScore(false);
    }
  }

  // Merge parish skills with any skills the person has that aren't in the parish list
  const allSkillOptions = Array.from(
    new Set([...parishSkills, ...skills]),
  ).sort();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header with photo upload */}
      <div className="flex items-center gap-4" data-tutorial="person-detail-header">
        <div className="relative shrink-0">
          {person.photo ? (
            <img
              src={storageUrl(person.photo) ?? ""}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {person.name[0]}
              </span>
            </div>
          )}
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md ring-2 ring-bg hover:bg-primary/80 transition-colors disabled:opacity-60"
                title="Alterar foto"
              >
                {uploadingPhoto ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-text">{person.name}</h1>
          <p className="text-sm text-text-muted">
            {PERSON_TYPE_LABELS[person.type]}
            {person.parish && (
              <span className="before:content-['·'] before:mx-1.5">
                {person.parish.name}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1" data-tutorial="person-detail-engagement-score">
            {(() => {
              const { classes, Icon } = ENGAGEMENT_CONFIG[person.engagement_level];
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
                  <Icon size={11} /> <span className="capitalize">{person.engagement_level}</span>
                </span>
              );
            })()}
            <Tooltip
              position="bottom"
              maxWidth={320}
              content={
                <div className="space-y-2">
                  <p className="font-semibold">Nível de engajamento</p>
                  <div className="space-y-1 text-white/90">
                    <p>+10 por encontro que trabalhou</p>
                    <p>+5 de bônus por cada tipo de equipe diferente</p>
                    <p>+2 por ano ativo no movimento (máx. +20)</p>
                    <p>−3 por convite recusado</p>
                  </div>
                  <hr className="border-white/20" />
                  <div className="space-y-0.5 text-white/80 text-[11px]">
                    <p>≥ 60 pts → Destaque &nbsp;·&nbsp; ≥ 30 → Alto</p>
                    <p>≥ 10 pts → Médio &nbsp;·&nbsp; &lt; 10 → Baixo</p>
                  </div>
                  <hr className="border-white/20" />
                  <p className="text-white/70 text-[11px]">
                    Pontuação atual: <span className="font-semibold text-white">{person.engagement_score} pts</span>
                  </p>
                </div>
              }
            >
              <Info size={13} className="text-text-muted cursor-help" />
            </Tooltip>
            {canEdit && (
              <button
                type="button"
                onClick={handleRecalculateScore}
                disabled={recalculatingScore}
                className="text-text-muted hover:text-text transition-colors disabled:opacity-50"
                title="Recalcular pontuação"
              >
                <RefreshCw size={13} className={recalculatingScore ? "animate-spin" : ""} />
              </button>
            )}
            {person.active ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 size={12} /> Ativa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <XCircle size={12} /> Inativa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form id="person-form" onSubmit={handleSave} className="space-y-5" data-tutorial="person-detail-edit-form">
        <SectionCard title="Dados Pessoais">
          <div className="space-y-4">
            <Select
              name="type"
              label="Tipo"
              value={type}
              onChange={(e) => setType(e.target.value as PersonType)}
              disabled={!canEdit}
            >
              <option value="youth">Jovem</option>
              <option value="couple">Casal</option>
            </Select>
            <Input
              name="name"
              label={isCouple ? "Nome (cônjuge 1)" : "Nome"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              required
            />
            <Input
              name="nickname"
              label={isCouple ? "Apelido (cônjuge 1)" : "Apelido"}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={!canEdit}
            />
            {isCouple && (
              <>
                <Input
                  name="partner_name"
                  label="Nome (cônjuge 2)"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  disabled={!canEdit}
                />
                <Input
                  name="partner_nickname"
                  label="Apelido (cônjuge 2)"
                  value={partnerNickname}
                  onChange={(e) => setPartnerNickname(e.target.value)}
                  disabled={!canEdit}
                />
              </>
            )}
            <DateInput
              name="birth_date"
              label={isCouple ? "Nascimento (cônjuge 1)" : "Data de nascimento"}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={!canEdit}
            />
            {isCouple && (
              <>
                <DateInput
                  name="partner_birth_date"
                  label="Nascimento (cônjuge 2)"
                  value={partnerBirthDate}
                  onChange={(e) => setPartnerBirthDate(e.target.value)}
                  disabled={!canEdit}
                />
                <DateInput
                  name="wedding_date"
                  label="Data de casamento"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  disabled={!canEdit}
                />
              </>
            )}
            <DateInput
              name="received_at"
              label="Data de recebimento da ficha"
              value={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </SectionCard>

        <SectionCard title="Contato">
          <div className="space-y-4">
            {phones.map((ph, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    name={`phone_${idx}`}
                    label={`Telefone ${idx + 1}`}
                    type="tel"
                    value={ph}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const newPhones = [...phones];
                      newPhones[idx] = e.target.value;
                      setPhones(newPhones);
                    }}
                  />
                </div>
                {canEdit && phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPhones(phones.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-600 mt-5 shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {canEdit && phones.length < (isCouple ? 2 : 4) && (
              <button
                type="button"
                onClick={() => setPhones([...phones, ''])}
                className="text-sm text-primary hover:text-primary/80"
              >
                + Adicionar telefone
              </button>
            )}
            <Input
              name="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!canEdit}
            />
            {isCouple && (
              <>
                <Input
                  name="partner_email"
                  label="E-mail (cônjuge 2)"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  disabled={!canEdit}
                />
                {partnerPhones.map((ph, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        name={`partner_phone_${idx}`}
                        label={`Telefone cônjuge 2 — ${idx + 1}`}
                        type="tel"
                        value={ph}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const np = [...partnerPhones];
                          np[idx] = e.target.value;
                          setPartnerPhones(np);
                        }}
                      />
                    </div>
                    {canEdit && partnerPhones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPartnerPhones(partnerPhones.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-600 mt-5 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {canEdit && partnerPhones.length < 2 && (
                  <button
                    type="button"
                    onClick={() => setPartnerPhones([...partnerPhones, ''])}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    + Telefone cônjuge 2
                  </button>
                )}
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Endereço">
          <div className="space-y-4">
            <Input name="address" label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!canEdit} />
            <Input name="birthplace" label={isCouple ? "Naturalidade (cônjuge 1)" : "Naturalidade"} value={birthplace} onChange={(e) => setBirthplace(e.target.value)} disabled={!canEdit} />
            {isCouple && (
              <>
                <Input name="partner_birthplace" label="Naturalidade (cônjuge 2)" value={partnerBirthplace} onChange={(e) => setPartnerBirthplace(e.target.value)} disabled={!canEdit} />
                {homePhones.map((ph, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        name={`home_phone_${idx}`}
                        label={`Telefone residencial ${idx + 1}`}
                        type="tel"
                        value={ph}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const nh = [...homePhones];
                          nh[idx] = e.target.value;
                          setHomePhones(nh);
                        }}
                      />
                    </div>
                    {canEdit && homePhones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setHomePhones(homePhones.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-600 mt-5 shrink-0"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {canEdit && homePhones.length < 2 && (
                  <button
                    type="button"
                    onClick={() => setHomePhones([...homePhones, ''])}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    + Telefone residencial
                  </button>
                )}
              </>
            )}
          </div>
        </SectionCard>

        {!isCouple && canEdit && (
          <SectionCard title="Filiação">
            <div className="space-y-4">
              <Input name="father_name" label="Nome do pai" value={fatherName} onChange={(e) => setFatherName(e.target.value)} disabled={!canEdit} />
              <Input name="mother_name" label="Nome da mãe" value={motherName} onChange={(e) => setMotherName(e.target.value)} disabled={!canEdit} />
            </div>
          </SectionCard>
        )}

        {!isCouple && canEdit && (
          <SectionCard title="Educação">
            <div className="space-y-4">
              <Input name="education_level" label="Nível de escolaridade" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} disabled={!canEdit} />
              <Select name="education_status" label="Status" value={educationStatus} onChange={(e) => setEducationStatus(e.target.value)} disabled={!canEdit}>
                <option value="">Selecionar</option>
                <option value="Cursando">Cursando</option>
                <option value="Concluído">Concluído</option>
                <option value="Trancado">Trancado</option>
              </Select>
              <Input name="course" label="Curso" value={course} onChange={(e) => setCourse(e.target.value)} disabled={!canEdit} />
              <Input name="institution" label="Instituição" value={institution} onChange={(e) => setInstitution(e.target.value)} disabled={!canEdit} />
            </div>
          </SectionCard>
        )}

        <SectionCard title={isCouple ? "Igreja" : "Sacramentos e Igreja"}>
          <div className="space-y-4">
            {!isCouple && (
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Sacramentos recebidos</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SACRAMENT_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => canEdit && toggleSacrament(key)}
                      disabled={!canEdit}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                        sacraments.includes(key)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-hover text-text-muted border-border hover:border-primary/40',
                        !canEdit && 'cursor-default',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Movimento na Igreja</label>
              <textarea
                name="church_movement"
                value={churchMovement}
                onChange={(e) => setChurchMovement(e.target.value)}
                disabled={!canEdit}
                rows={2}
                placeholder="Ex: Encontro de Jovens, Crisma..."
                className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none disabled:opacity-60"
              />
            </div>
          </div>
        </SectionCard>

        {!isCouple && canEdit && (
          <SectionCard title="Atividades SEGUE-ME">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Disponibilidade de horário</label>
                <textarea
                  name="available_schedule"
                  value={availableSchedule}
                  onChange={(e) => setAvailableSchedule(e.target.value)}
                  disabled={!canEdit}
                  rows={2}
                  placeholder="Manhã, tarde, noite..."
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Instrumentos musicais</label>
                <textarea
                  name="musical_instruments"
                  value={musicalInstruments}
                  onChange={(e) => setMusicalInstruments(e.target.value)}
                  disabled={!canEdit}
                  rows={2}
                  placeholder="Violão, teclado..."
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Palestras / Testemunhos</label>
                <textarea
                  name="talks_testimony"
                  value={talksTestimony}
                  onChange={(e) => setTalksTestimony(e.target.value)}
                  disabled={!canEdit}
                  rows={2}
                  placeholder="Temas ou experiências..."
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none disabled:opacity-60"
                />
              </div>
            </div>
          </SectionCard>
        )}

        {/* Skills section */}
        <SectionCard title="Habilidades">
          <div className="space-y-3">
            {allSkillOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allSkillOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => canEdit && toggleSkill(skill)}
                    disabled={!canEdit}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                      skills.includes(skill)
                        ? "bg-primary text-white border-primary"
                        : "bg-hover text-text-muted border-border hover:border-primary/40",
                      !canEdit && "cursor-default",
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                Nenhuma habilidade cadastrada para esta paróquia.
              </p>
            )}

            {canEdit && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  placeholder="Nova habilidade..."
                  className="flex-1 rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-1.5 rounded-lg bg-hover text-text-muted text-sm hover:bg-primary/10 hover:text-primary border border-border transition-colors"
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {canEdit && (
          <SectionCard title="Observações">
            <textarea
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
            />
          </SectionCard>
        )}

        {canEdit && (
          <SectionCard title="Encontro">
            <div className="space-y-4">
              <Input
                name="encounter_year"
                label="Ano em que vivenciou o encontro (opcional)"
                type="number"
                min={1900}
                max={2100}
                value={encounterYear}
                onChange={(e) => setEncounterYear(e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Detalhes do encontro</label>
                <textarea
                  name="encounter_details"
                  value={encounterDetails}
                  onChange={(e) => setEncounterDetails(e.target.value)}
                  rows={2}
                  placeholder="Equipe, função, observações..."
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                />
              </div>
            </div>
          </SectionCard>
        )}

        {canEdit && (
          <SectionCard title="Status">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-text">Ficha ativa</span>
            </label>
          </SectionCard>
        )}
      </form>

      <div data-tutorial="person-detail-experiences">
        <TeamExperiencesSection
          personId={id}
          initialExperiences={experiences}
          canEdit={canEdit}
        />
      </div>

      <div data-tutorial="person-detail-history">
        <HistorySection history={history} />
      </div>

      {/* Actions */}
      {canEdit && (
        <>
          {confirmDelete ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-medium text-red-800">
                Tem certeza que deseja remover esta ficha?
              </p>
              <p className="text-xs text-red-600 mt-1">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Confirmar remoção
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="danger"
                leftIcon={<Trash2 size={14} />}
                onClick={() => setConfirmDelete(true)}
              >
                Remover
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" form="person-form" loading={saving}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PersonDetail;
