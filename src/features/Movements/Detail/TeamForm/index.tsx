'use client';

import { useState } from 'react';
import { AcceptedType } from '@/interfaces/Movement';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import TeamIconPicker from '@/components/TeamIconPicker';
import { TeamFormProps } from './types';

const TeamForm: React.FC<TeamFormProps> = ({ initial, onSave, onCancel, saving }) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState<string | null>(initial?.icon ?? null);
  const [coordYouth, setCoordYouth] = useState(String(initial?.coordinators_youth ?? 0));
  const [coordCouples, setCoordCouples] = useState(String(initial?.coordinators_couples ?? 0));
  const [minMembers, setMinMembers] = useState(String(initial?.min_members ?? 2));
  const [maxMembers, setMaxMembers] = useState(String(initial?.max_members ?? 10));
  const [acceptedType, setAcceptedType] = useState<AcceptedType>(initial?.accepted_type ?? 'all');

  return (
    <div className="bg-hover/30 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
        <Input name="name" label="Nome da equipe" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="min-w-[160px]">
          <TeamIconPicker value={icon} onChange={setIcon} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input name="coord_youth" label="Coordenadores jovens" type="number" min={0} value={coordYouth} onChange={(e) => setCoordYouth(e.target.value)} />
        <Input name="coord_couples" label="Coordenadores casais" type="number" min={0} value={coordCouples} onChange={(e) => setCoordCouples(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input name="min" label="Mín. integrantes" type="number" min={1} value={minMembers} onChange={(e) => setMinMembers(e.target.value)} />
        <Input name="max" label="Máx. integrantes" type="number" min={1} value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} />
      </div>
      <Select name="accepted_type" label="Aceita" value={acceptedType} onChange={(e) => setAcceptedType(e.target.value as AcceptedType)}>
        <option value="all">Todos</option>
        <option value="youth">Jovens</option>
        <option value="couple">Casais</option>
      </Select>
      <div className="flex justify-end gap-2 pt-1">
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" loading={saving} onClick={() => onSave({
          name,
          icon: icon ?? null,
          coordinators_youth: Number(coordYouth),
          coordinators_couples: Number(coordCouples),
          min_members: Number(minMembers),
          max_members: Number(maxMembers),
          accepted_type: acceptedType,
        })}>
          Salvar
        </Button>
      </div>
    </div>
  );
};

export default TeamForm;
