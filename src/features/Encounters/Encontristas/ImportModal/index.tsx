'use client';

import { useRef, useState } from 'react';
import { X, Upload, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import Button from '@/components/Button';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import EncounterService from '@/services/api/EncounterService';
import { ImportModalProps } from '../types';

const ImportModal: React.FC<ImportModalProps> = ({ encounterId, onClose, onSuccess }) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    try {
      const res = await EncounterService.importParticipants(encounterId, file);
      setResult({ imported: res.data.imported, errors: res.data.errors });
      if (res.data.imported > 0) {
        toast({ title: `${res.data.imported} encontristas importados.`, variant: 'success' });
        onSuccess();
      }
    } catch (err: unknown) {
      handleError(err, 'handleImport()');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 !mt-0">
      <div className="bg-panel border border-border rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">Importar Encontristas</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-text-muted">
              Planilha <strong>.xlsx / .xls / .csv</strong> com as colunas: <strong>nome</strong>, tipo, nome_conjuge, telefone, email, nascimento.
            </p>
            <a
              href={EncounterService.participantsTemplateUrl()}
              download="modelo-encontristas.xlsx"
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Download size={13} />
              Baixar modelo
            </a>
          </div>

          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={24} className="mx-auto mb-2 text-text-muted" />
            {file ? (
              <p className="text-sm font-medium text-text">{file.name}</p>
            ) : (
              <p className="text-sm text-text-muted">Clique para selecionar um arquivo</p>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />

          {result && (
            <div className={`rounded-lg p-3 text-sm space-y-1 ${result.imported > 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="flex items-center gap-1.5 font-medium text-green-700">
                <CheckCircle2 size={14} />
                {result.imported} encontristas importados
              </p>
              {result.errors.length > 0 && (
                <div className="text-amber-700">
                  <p className="flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={14} />
                    {result.errors.length} linha(s) com erro:
                  </p>
                  <ul className="pl-4 mt-1 space-y-0.5">
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
                    {result.errors.length > 5 && <li>... e mais {result.errors.length - 5}</li>}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Fechar</Button>
            <Button leftIcon={<Upload size={14} />} disabled={!file} loading={importing} onClick={handleImport}>
              Importar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
