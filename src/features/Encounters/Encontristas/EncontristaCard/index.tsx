'use client';

import { useState } from 'react';
import { Trash2, CheckCircle2, Pencil, Phone, Mail, Calendar } from 'lucide-react';
import Button from '@/components/Button';
import { storageUrl } from '@/utils/helpers';
import { EncontristaCardProps } from '../types';

const EncontristaCard: SafeFC<EncontristaCardProps> = ({ participant, canEdit, onRemove, onEdit }) => {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const initials = participant.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-hover/40 transition-colors">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full shrink-0 mt-0.5 overflow-hidden">
        {participant.photo ? (
          <img src={storageUrl(participant.photo) ?? ''} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${participant.type === 'couple' ? 'bg-violet-100' : 'bg-blue-100'}`}>
            <span className={`text-xs font-bold ${participant.type === 'couple' ? 'text-violet-700' : 'text-blue-700'}`}>{initials}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-text">
            {participant.name}
            {participant.partner_name && (
              <span className="text-text-muted font-normal"> &amp; {participant.partner_name}</span>
            )}
          </p>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${participant.type === 'couple' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
            {participant.type_label}
          </span>
          {participant.is_converted && (
            <span className="inline-flex items-center gap-0.5 text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
              <CheckCircle2 size={11} />
              Pessoa
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {participant.phone && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Phone size={11} />
              {participant.phone}
            </span>
          )}
          {participant.email && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Mail size={11} />
              {participant.email}
            </span>
          )}
          {participant.birth_date && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Calendar size={11} />
              {participant.birth_date}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="shrink-0 flex items-center gap-1">
          {confirmRemove ? (
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => setConfirmRemove(false)}>Não</Button>
              <Button size="sm" variant="danger" onClick={() => onRemove(participant.id)}>Remover</Button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onEdit(participant)}
                className="text-text-muted hover:text-primary transition-colors p-1.5 rounded"
                title="Editar"
              >
                <Pencil size={14} />
              </button>
              {!participant.is_converted && (
                <button
                  onClick={() => setConfirmRemove(true)}
                  className="text-text-muted hover:text-red-500 transition-colors p-1.5 rounded"
                  title="Remover"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EncontristaCard;
