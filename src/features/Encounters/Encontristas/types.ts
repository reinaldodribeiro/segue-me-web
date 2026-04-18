import { EncounterParticipant, EncounterParticipantPayload } from '@/interfaces/Encounter';

export interface EncontristasProps {
  encounterId: string;
  encounterName: string;
  maxParticipants: number | null;
  isCompleted: boolean;
}

export interface AddEncontristaModalProps {
  encounterId: string;
  onClose: () => void;
  onAdded: (participant: EncounterParticipant) => void;
}

export interface ImportModalProps {
  encounterId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EncontristaCardProps {
  participant: EncounterParticipant;
  canEdit: boolean;
  onRemove: (id: string) => void;
  onEdit: (participant: EncounterParticipant) => void;
}

export interface EditEncontristaModalProps {
  encounterId: string;
  participant: EncounterParticipant;
  onClose: () => void;
  onSaved: (participant: EncounterParticipant) => void;
}

export type { EncounterParticipant, EncounterParticipantPayload };
