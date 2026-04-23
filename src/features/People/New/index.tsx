'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParishSkills } from '@/lib/query/hooks/usePersons';
import { useMovementList, useMovementTeams } from '@/lib/query/hooks/useMovements';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Camera, Crown, FileImage, Loader2, Plus, Users, X } from 'lucide-react';
import { resolveTeamIcon } from '@/components/TeamIconPicker';
import Button from '@/components/Button';
import Input from '@/components/Input';
import DateInput from '@/components/DateInput';
import Select from '@/components/Select';
import SectionCard from '@/components/SectionCard';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuth } from '@/hooks/useAuth';
import { PersonPayload, PersonType, PersonTeamExperience, TeamExperienceRole } from '@/interfaces/Person';
import PersonService from '@/services/api/PersonService';
import { queryKeys } from '@/lib/query/keys';
import { cn } from '@/utils/helpers';
import { useTutorial } from '@/hooks/useTutorial';

interface Duplicate { id: string; name: string }

interface OcrData {
  name?: string | null;
  partner_name?: string | null;
  type?: 'youth' | 'couple';
  birth_date?: string | null;
  partner_birth_date?: string | null;
  wedding_date?: string | null;
  phones?: string[];
  email?: string | null;
  skills?: string[];
  notes?: string | null;
  nickname?: string | null;
  address?: string | null;
  birthplace?: string | null;
  church_movement?: string | null;
  received_at?: string | null;
  encounter_details?: string | null;
  encounter_year?: number | null;
  father_name?: string | null;
  mother_name?: string | null;
  education_level?: string | null;
  education_status?: string | null;
  course?: string | null;
  institution?: string | null;
  sacraments?: string[];
  available_schedule?: string | null;
  musical_instruments?: string | null;
  talks_testimony?: string | null;
  partner_nickname?: string | null;
  partner_birthplace?: string | null;
  partner_email?: string | null;
  partner_phones?: string[];
  home_phones?: string[];
}

const SACRAMENT_LABELS: Record<string, string> = {
  batismo: 'Batismo',
  eucaristia: 'Eucaristia',
  crisma: 'Crisma',
};

const NewPerson: SafeFC = () => {
  useTutorial();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { user } = useAuth();

  // Basic fields
  const [type, setType] = useState<PersonType>('youth');
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [encounterYear, setEncounterYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);

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

  // Photo
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const parishId = user?.parish_id ?? user?.parish?.id ?? null;

  // Team experiences (queued — saved after person creation)
  const [experiences, setExperiences] = useState<{ movement_team_id: string | null; team_name: string; role: TeamExperienceRole; year: number | null; team_icon?: string | null }[]>([]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [expMovementId, setExpMovementId] = useState('');
  const [expTeamId, setExpTeamId] = useState('');
  const [expTeamName, setExpTeamName] = useState('');
  const [expRole, setExpRole] = useState<TeamExperienceRole>('member');
  const [expYear, setExpYear] = useState('');

  const { data: parishSkills = [] } = useParishSkills(parishId);
  const { data: movementsData } = useMovementList({ per_page: 100 }, { enabled: showExpForm });
  const expMovements = movementsData?.data ?? [];
  const { data: expTeams = [], isLoading: loadingTeams } = useMovementTeams(expMovementId);

  // Reset team selection when movement changes
  useEffect(() => {
    setExpTeamId('');
    setExpTeamName('');
  }, [expMovementId]);

  const [ocrPrefilled, setOcrPrefilled] = useState(false);

  const isCouple = type === 'couple';

  // Pre-fill from OCR scan result stored in sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('ocr_prefill');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as OcrData;
      if (data.type) setType(data.type);
      if (data.name) setName(data.name);
      if (data.partner_name) setPartnerName(data.partner_name);
      if (data.birth_date) setBirthDate(data.birth_date);
      if (data.partner_birth_date) setPartnerBirthDate(data.partner_birth_date);
      if (data.wedding_date) setWeddingDate(data.wedding_date);
      if (data.phones?.length) setPhones(data.phones);
      if (data.email) setEmail(data.email);
      if (data.skills?.length) setSkills(data.skills);
      if (data.notes) setNotes(data.notes);
      if (data.nickname) setNickname(data.nickname);
      if (data.address) setAddress(data.address);
      if (data.birthplace) setBirthplace(data.birthplace);
      if (data.church_movement) setChurchMovement(data.church_movement);
      if (data.encounter_details) setEncounterDetails(data.encounter_details);
      if (data.received_at) setReceivedAt(data.received_at);
      if (data.father_name) setFatherName(data.father_name);
      if (data.mother_name) setMotherName(data.mother_name);
      if (data.education_level) setEducationLevel(data.education_level);
      if (data.education_status) setEducationStatus(data.education_status);
      if (data.course) setCourse(data.course);
      if (data.institution) setInstitution(data.institution);
      if (data.sacraments?.length) setSacraments(data.sacraments);
      if (data.available_schedule) setAvailableSchedule(data.available_schedule);
      if (data.musical_instruments) setMusicalInstruments(data.musical_instruments);
      if (data.talks_testimony) setTalksTestimony(data.talks_testimony);
      if (data.partner_nickname) setPartnerNickname(data.partner_nickname);
      if (data.partner_birthplace) setPartnerBirthplace(data.partner_birthplace);
      if (data.partner_email) setPartnerEmail(data.partner_email);
      if (data.partner_phones?.length) setPartnerPhones(data.partner_phones);
      if (data.home_phones?.length) setHomePhones(data.home_phones);
      setOcrPrefilled(true);
    } catch {
      // malformed data — ignore
    }
    sessionStorage.removeItem('ocr_prefill');
  }, []);

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function toggleSkill(skill: string) {
    setSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  }

  function handleAddCustomSkill() {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) setSkills((prev) => [...prev, trimmed]);
    setNewSkillInput('');
  }

  function toggleSacrament(s: string) {
    setSacraments((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function handleAddExperience() {
    if (!expTeamName.trim() && !expTeamId) {
      toast({ title: 'Selecione ou informe uma equipe.', variant: 'error' });
      return;
    }
    const selectedTeam = expTeamId ? expTeams.find((t) => t.id === expTeamId) : null;
    setExperiences((prev) => [...prev, {
      movement_team_id: expTeamId || null,
      team_name: expTeamName.trim() || selectedTeam?.name || '',
      role: expRole,
      year: expYear ? parseInt(expYear, 10) : null,
      team_icon: selectedTeam?.icon ?? null,
    }]);
    resetExpForm();
  }

  function removeExperience(index: number) {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  }

  function resetExpForm() {
    setExpMovementId(''); setExpTeamId(''); setExpTeamName('');
    setExpRole('member'); setExpYear(''); setShowExpForm(false);
  }

  async function handleSubmit(e: React.SyntheticEvent, force = false) {
    e.preventDefault();
    setLoading(true);
    setDuplicates([]);

    const payload: PersonPayload & { force?: boolean; skills?: string[] } = {
      type,
      name: name.trim(),
      partner_name: isCouple ? partnerName.trim() || null : null,
      birth_date: birthDate || null,
      partner_birth_date: isCouple ? partnerBirthDate || null : null,
      wedding_date: isCouple ? weddingDate || null : null,
      phones: phones.filter((p) => p.trim()),
      email: email.trim() || null,
      notes: notes.trim() || null,
      encounter_year: encounterYear ? Number(encounterYear) : null,
      skills: skills.length > 0 ? skills : undefined,
      // Common new fields
      nickname: nickname.trim() || null,
      address: address.trim() || null,
      birthplace: birthplace.trim() || null,
      church_movement: churchMovement.trim() || null,
      received_at: receivedAt || null,
      encounter_details: encounterDetails.trim() || null,
    };

    if (!isCouple) {
      // Youth-only
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
      // Couple-only
      payload.partner_nickname = partnerNickname.trim() || null;
      payload.partner_birthplace = partnerBirthplace.trim() || null;
      payload.partner_email = partnerEmail.trim() || null;
      payload.partner_phones = partnerPhones.filter((p) => p.trim());
      payload.home_phones = homePhones.filter((p) => p.trim());
    }

    if (force) payload.force = true;

    try {
      const res = await PersonService.save(payload as PersonPayload);
      const personId = res.data.data.id;

      // Upload photo if selected
      if (photoFile) {
        try {
          await PersonService.uploadPhoto(personId, photoFile);
        } catch {
          toast({ title: 'Ficha criada, mas erro ao enviar foto.', variant: 'warning' });
        }
      }

      // Add team experiences
      for (const exp of experiences) {
        try {
          await PersonService.addTeamExperience(personId, exp);
        } catch {
          // continue adding others even if one fails
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
      toast({ title: 'Ficha cadastrada com sucesso.', variant: 'success' });
      router.push('/app/people');
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string; duplicates?: Duplicate[] } };
      if (e?.status === 409 && e.data?.duplicates) {
        setDuplicates(e.data.duplicates);
      } else {
        handleError(err, 'handleSubmit()');
      }
    } finally {
      setLoading(false);
    }
  }

  const allSkillOptions = Array.from(new Set([...parishSkills, ...skills])).sort();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text">Nova Ficha</h1>
        <p className="text-sm text-text-muted mt-0.5">Preencha os dados para cadastrar</p>
      </div>

      {ocrPrefilled && (
        <div className="flex items-center gap-2.5 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <FileImage size={15} className="text-primary shrink-0" />
          <p className="text-xs text-primary font-medium">
            Dados preenchidos via OCR — revise antes de salvar.
          </p>
        </div>
      )}

      {duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Possível duplicata detectada</p>
              <ul className="mt-1 text-sm text-amber-700 space-y-0.5">
                {duplicates.map((d) => (
                  <li key={d.id}>• {d.name}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setDuplicates([])}>Cancelar</Button>
                <Button size="sm" onClick={(e) => handleSubmit(e, true)} loading={loading}>Cadastrar mesmo assim</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
        {/* Photo */}
        <SectionCard title="Foto" data-tutorial="new-person-photo">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                  <Camera size={24} className="text-primary/40" />
                </div>
              )}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow hover:bg-primary/80 transition-colors"
                title="Selecionar foto"
              >
                <Camera size={12} />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
            </div>
            <div className="text-sm text-text-muted">
              {photoFile ? (
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[200px]">{photoFile.name}</span>
                  <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="text-red-500 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p>Opcional. Será enviada ao salvar.</p>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Tipo e Identificação" data-tutorial="new-person-type">
          <div className="space-y-4">
            <Select name="type" label="Tipo" value={type} onChange={(e) => setType(e.target.value as PersonType)} required>
              <option value="youth">Jovem</option>
              <option value="couple">Casal</option>
            </Select>
            <Input name="name" label={isCouple ? 'Nome (cônjuge 1)' : 'Nome'} value={name} onChange={(e) => setName(e.target.value)} required />
            <Input name="nickname" label={isCouple ? 'Apelido (cônjuge 1)' : 'Apelido'} value={nickname} onChange={(e) => setNickname(e.target.value)} />
            {isCouple && (
              <>
                <Input name="partner_name" label="Nome (cônjuge 2)" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
                <Input name="partner_nickname" label="Apelido (cônjuge 2)" value={partnerNickname} onChange={(e) => setPartnerNickname(e.target.value)} />
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Datas" data-tutorial="new-person-basic-fields">
          <div className="space-y-4">
            <DateInput name="birth_date" label={isCouple ? 'Data de nascimento (cônjuge 1)' : 'Data de nascimento'} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            {isCouple && (
              <>
                <DateInput name="partner_birth_date" label="Data de nascimento (cônjuge 2)" value={partnerBirthDate} onChange={(e) => setPartnerBirthDate(e.target.value)} />
                <DateInput name="wedding_date" label="Data de casamento" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
              </>
            )}
            <DateInput name="received_at" label="Data de recebimento da ficha" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
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
                    onChange={(e) => {
                      const newPhones = [...phones];
                      newPhones[idx] = e.target.value;
                      setPhones(newPhones);
                    }}
                  />
                </div>
                {phones.length > 1 && (
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
            {phones.length < (isCouple ? 2 : 4) && (
              <button
                type="button"
                onClick={() => setPhones([...phones, ''])}
                className="text-sm text-primary hover:text-primary/80"
              >
                + Adicionar telefone
              </button>
            )}
            <Input name="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {isCouple && (
              <>
                <Input name="partner_email" label="E-mail (cônjuge 2)" type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
                {partnerPhones.map((ph, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        name={`partner_phone_${idx}`}
                        label={`Telefone cônjuge 2 — ${idx + 1}`}
                        type="tel"
                        value={ph}
                        onChange={(e) => {
                          const np = [...partnerPhones];
                          np[idx] = e.target.value;
                          setPartnerPhones(np);
                        }}
                      />
                    </div>
                    {partnerPhones.length > 1 && (
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
                {partnerPhones.length < 2 && (
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
            <Input name="address" label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input name="birthplace" label={isCouple ? 'Naturalidade (cônjuge 1)' : 'Naturalidade'} value={birthplace} onChange={(e) => setBirthplace(e.target.value)} />
            {isCouple && (
              <>
                <Input name="partner_birthplace" label="Naturalidade (cônjuge 2)" value={partnerBirthplace} onChange={(e) => setPartnerBirthplace(e.target.value)} />
                {homePhones.map((ph, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        name={`home_phone_${idx}`}
                        label={`Telefone residencial ${idx + 1}`}
                        type="tel"
                        value={ph}
                        onChange={(e) => {
                          const nh = [...homePhones];
                          nh[idx] = e.target.value;
                          setHomePhones(nh);
                        }}
                      />
                    </div>
                    {homePhones.length > 1 && (
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
                {homePhones.length < 2 && (
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

        {!isCouple && (
          <SectionCard title="Filiação">
            <div className="space-y-4">
              <Input name="father_name" label="Nome do pai" value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
              <Input name="mother_name" label="Nome da mãe" value={motherName} onChange={(e) => setMotherName(e.target.value)} />
            </div>
          </SectionCard>
        )}

        {!isCouple && (
          <SectionCard title="Educação">
            <div className="space-y-4">
              <Input name="education_level" label="Nível de escolaridade" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} />
              <Select name="education_status" label="Status" value={educationStatus} onChange={(e) => setEducationStatus(e.target.value)}>
                <option value="">Selecionar</option>
                <option value="Cursando">Cursando</option>
                <option value="Concluído">Concluído</option>
                <option value="Trancado">Trancado</option>
              </Select>
              <Input name="course" label="Curso" value={course} onChange={(e) => setCourse(e.target.value)} />
              <Input name="institution" label="Instituição" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </div>
          </SectionCard>
        )}

        <SectionCard title={isCouple ? 'Igreja' : 'Sacramentos e Igreja'}>
          <div className="space-y-4">
            {!isCouple && (
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Sacramentos recebidos</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SACRAMENT_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSacrament(key)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                        sacraments.includes(key)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-hover text-text-muted border-border hover:border-primary/40',
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
                rows={2}
                placeholder="Ex: Encontro de Jovens, Crisma..."
                className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              />
            </div>
          </div>
        </SectionCard>

        {!isCouple && (
          <SectionCard title="Atividades SEGUE-ME">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Disponibilidade de horário</label>
                <textarea
                  name="available_schedule"
                  value={availableSchedule}
                  onChange={(e) => setAvailableSchedule(e.target.value)}
                  rows={2}
                  placeholder="Manhã, tarde, noite..."
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Instrumentos musicais</label>
                <textarea
                  name="musical_instruments"
                  value={musicalInstruments}
                  onChange={(e) => setMusicalInstruments(e.target.value)}
                  rows={2}
                  placeholder="Violão, teclado..."
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Palestras / Testemunhos</label>
                <textarea
                  name="talks_testimony"
                  value={talksTestimony}
                  onChange={(e) => setTalksTestimony(e.target.value)}
                  rows={2}
                  placeholder="Temas ou experiências..."
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                />
              </div>
            </div>
          </SectionCard>
        )}

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

        {/* Skills */}
        <SectionCard title="Habilidades" data-tutorial="new-person-skills">
          <div className="space-y-3">
            {allSkillOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allSkillOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                      skills.includes(skill)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-hover text-text-muted border-border hover:border-primary/40',
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Nenhuma habilidade cadastrada para esta paróquia.</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSkill(); } }}
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
          </div>
        </SectionCard>

        {/* Team Experiences */}
        <SectionCard title="Equipes Anteriores" data-tutorial="new-person-experiences">
          <div className="space-y-3">
            {experiences.length > 0 && (
              <div className="space-y-2">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {(() => {
                        const TeamIcon = resolveTeamIcon(exp.team_icon);
                        if (TeamIcon)
                          return <TeamIcon size={14} className="shrink-0 text-primary" />;
                        return exp.role === 'coordinator'
                          ? <Crown size={14} className="shrink-0 text-primary" />
                          : <Users size={14} className="shrink-0 text-text-muted" />;
                      })()}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{exp.team_name}</p>
                        <p className="text-xs text-text-muted">
                          {exp.role === 'coordinator' ? 'Coordenador' : 'Integrante'}
                          {exp.year ? ` · ${exp.year}` : ''}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeExperience(idx)} className="shrink-0 text-text-muted hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!showExpForm && (
              <button type="button" onClick={() => setShowExpForm(true)} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mt-1">
                <Plus size={14} /> Adicionar experiência
              </button>
            )}

            {showExpForm && (
              <div className="border border-border rounded-xl p-4 space-y-3 bg-panel mt-2">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Movimento</label>
                  <select
                    value={expMovementId}
                    onChange={(e) => setExpMovementId(e.target.value)}
                    className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  >
                    <option value="">Selecionar movimento (opcional)</option>
                    {expMovements.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                {expMovementId ? (
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Equipe</label>
                    {loadingTeams ? (
                      <div className="flex items-center gap-2 text-sm text-text-muted py-2">
                        <Loader2 size={13} className="animate-spin" /> Carregando equipes...
                      </div>
                    ) : (
                      <select
                        value={expTeamId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const team = expTeams.find((t) => t.id === id);
                          setExpTeamId(id);
                          setExpTeamName(team?.name ?? '');
                        }}
                        className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      >
                        <option value="">Selecionar equipe</option>
                        {expTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">Nome da equipe</label>
                    <input
                      type="text"
                      value={expTeamName}
                      onChange={(e) => setExpTeamName(e.target.value)}
                      placeholder="Ex: Equipe de Liturgia"
                      className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Ano (opcional)</label>
                  <input
                    type="number"
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    placeholder={String(new Date().getFullYear())}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Função</label>
                  <div className="flex gap-2">
                    {(['member', 'coordinator'] as TeamExperienceRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setExpRole(r)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                          expRole === r
                            ? 'bg-primary text-white border-primary'
                            : 'bg-hover text-text-muted border-border hover:border-primary/40',
                        )}
                      >
                        {r === 'coordinator' ? 'Coordenador' : 'Integrante'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="secondary" type="button" onClick={resetExpForm}>Cancelar</Button>
                  <Button size="sm" type="button" onClick={handleAddExperience}>Adicionar</Button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Observações">
          <textarea
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notas internas..."
            className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
          />
        </SectionCard>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={loading}>Cadastrar</Button>
        </div>
      </form>
    </div>
  );
};

export default NewPerson;
