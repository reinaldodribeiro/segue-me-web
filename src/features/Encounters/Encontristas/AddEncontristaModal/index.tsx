'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import DateInput from '@/components/DateInput';
import Select from '@/components/Select';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { PersonType } from '@/interfaces/Person';
import EncounterService from '@/services/api/EncounterService';
import { AddEncontristaModalProps } from '../types';

const AddEncontristaModal: React.FC<AddEncontristaModalProps> = ({ encounterId, onClose, onAdded }) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [type, setType] = useState<PersonType>('youth');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [saving, setSaving] = useState(false);

  const isCouple = type === 'couple';

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Informe o nome do encontrista.', variant: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await EncounterService.addParticipant(encounterId, {
        name: name.trim(),
        partner_name: isCouple ? partnerName.trim() || null : null,
        type,
        phone: phone.trim() || null,
        email: email.trim() || null,
        birth_date: birthDate || null,
        partner_birth_date: isCouple ? partnerBirthDate || null : null,
      });
      onAdded(res.data.data);
      toast({ title: 'Encontrista adicionado.', variant: 'success' });
      onClose();
    } catch (err: unknown) {
      handleError(err, 'handleSubmit()');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 !mt-0">
      <div className="bg-panel border border-border rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">Adicionar Encontrista</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
            <Button type="submit" loading={saving}>Adicionar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEncontristaModal;
