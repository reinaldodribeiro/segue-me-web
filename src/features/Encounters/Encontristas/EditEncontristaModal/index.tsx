'use client';

import { useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import DateInput from '@/components/DateInput';
import Select from '@/components/Select';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { PersonType } from '@/interfaces/Person';
import { storageUrl } from '@/utils/helpers';
import EncounterService from '@/services/api/EncounterService';
import { EditEncontristaModalProps } from '../types';

/** Convert 'd/m/Y' → 'Y-m-d' for date inputs; return '' if falsy */
function toInputDate(val: string | null): string {
  if (!val) return '';
  const [d, m, y] = val.split('/');
  if (!d || !m || !y) return val;
  return `${y}-${m}-${d}`;
}

const EditEncontristaModal: React.FC<EditEncontristaModalProps> = ({ encounterId, participant, onClose, onSaved }) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(participant.name);
  const [partnerName, setPartnerName] = useState(participant.partner_name ?? '');
  const [type, setType] = useState<PersonType>(participant.type);
  const [phone, setPhone] = useState(participant.phone ?? '');
  const [email, setEmail] = useState(participant.email ?? '');
  const [birthDate, setBirthDate] = useState(toInputDate(participant.birth_date));
  const [partnerBirthDate, setPartnerBirthDate] = useState(toInputDate(participant.partner_birth_date));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    participant.photo ? (storageUrl(participant.photo) ?? null) : null
  );
  const [saving, setSaving] = useState(false);

  const isCouple = type === 'couple';

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  const initials = participant.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Informe o nome do encontrista.', variant: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await EncounterService.updateParticipant(encounterId, participant.id, {
        name: name.trim(),
        partner_name: isCouple ? partnerName.trim() || null : null,
        type,
        phone: phone.trim() || null,
        email: email.trim() || null,
        birth_date: birthDate || null,
        partner_birth_date: isCouple ? partnerBirthDate || null : null,
      });

      let updated = res.data.data;

      if (photoFile) {
        const photoRes = await EncounterService.uploadParticipantPhoto(encounterId, participant.id, photoFile);
        updated = photoRes.data.data;
      }

      onSaved(updated);
      toast({ title: 'Encontrista atualizado.', variant: 'success' });
      onClose();
    } catch (err: unknown) {
      handleError(err, 'handleSubmit()');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 !mt-0">
      <div className="bg-panel border border-border rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-panel z-10">
          <h2 className="text-base font-semibold text-text">Editar Encontrista</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-full overflow-hidden ${!photoPreview ? (type === 'couple' ? 'bg-violet-100' : 'bg-blue-100') : ''}`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className={`text-lg font-bold ${type === 'couple' ? 'text-violet-700' : 'text-blue-700'}`}>{initials}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                title="Alterar foto"
              >
                <Camera size={12} />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-text">Foto</p>
              <p className="text-xs text-text-muted">JPG, PNG ou WebP · máx. 2 MB</p>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-xs text-primary hover:underline mt-0.5"
              >
                {photoPreview ? 'Alterar foto' : 'Adicionar foto'}
              </button>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <Select name="type" label="Tipo" value={type} onChange={(e) => setType(e.target.value as PersonType)} required>
            <option value="youth">Jovem</option>
            <option value="couple">Casal</option>
          </Select>

          <Input name="name" label={isCouple ? 'Nome (cônjuge 1)' : 'Nome'} value={name} onChange={(e) => setName(e.target.value)} required />
          {isCouple && (
            <Input name="partner_name" label="Nome (cônjuge 2)" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input name="phone" label="Telefone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input name="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <DateInput name="birth_date" label={isCouple ? 'Nascimento (cônjuge 1)' : 'Data de nascimento'} value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          {isCouple && (
            <DateInput name="partner_birth_date" label="Nascimento (cônjuge 2)" value={partnerBirthDate} onChange={(e) => setPartnerBirthDate(e.target.value)} />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEncontristaModal;
