'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileImage, Upload, X, CheckCircle2, AlertCircle,
  RefreshCw, XCircle, User, ExternalLink,
} from 'lucide-react';
import Button from '@/components/Button';
import PersonService from '@/services/api/PersonService';
import { useImportStatus } from '@/lib/query/hooks/usePersons';

type OcrStep = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

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
  // New common fields
  nickname?: string | null;
  address?: string | null;
  birthplace?: string | null;
  church_movement?: string | null;
  received_at?: string | null;
  encounter_details?: string | null;
  encounter_year?: number | null;
  // Youth-only
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
  // Couple-only
  partner_nickname?: string | null;
  partner_birthplace?: string | null;
  partner_email?: string | null;
  partner_phones?: string[];
  home_phones?: string[];
}

interface Duplicate {
  id: string;
  name: string;
}

export interface OcrImportProps {
  onClose: () => void;
}

const VALID_EXTS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

const OcrImport: SafeFC<OcrImportProps> = ({ onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState<OcrStep>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [extracted, setExtracted] = useState<OcrData | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: importStatus } = useImportStatus(cacheKey);

  useEffect(() => {
    if (!importStatus) return;
    const payload = importStatus as {
      status: string;
      data?: OcrData;
      potential_duplicates?: Duplicate[];
      message?: string;
    };
    if (payload.status === 'done') {
      setExtracted(payload.data ?? null);
      setDuplicates(payload.potential_duplicates ?? []);
      setStep('done');
    } else if (payload.status === 'failed') {
      setErrorMsg(payload.message ?? 'Falha ao processar o arquivo.');
      setStep('error');
    }
  }, [importStatus]);

  function pickFile(f: File) {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!VALID_EXTS.includes(ext)) {
      setErrorMsg('Formato inválido. Use PDF, JPG, PNG ou WEBP');
      return;
    }
    setFile(f);
    setErrorMsg('');
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }, []);

  async function handleUpload() {
    if (!file) return;
    setStep('uploading');
    setErrorMsg('');
    try {
      const res = await PersonService.importScan(file);
      setCacheKey(res.data.cache_key);
      setStep('processing');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Erro ao enviar arquivo.';
      setErrorMsg(msg);
      setStep('error');
    }
  }

  function handlePrefillForm() {
    if (!extracted) return;
    sessionStorage.setItem('ocr_prefill', JSON.stringify(extracted));
    router.push('/app/people/new');
    onClose();
  }

  const isProcessing = step === 'uploading' || step === 'processing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm !mt-0">
      <div className="bg-panel border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-panel z-10">
          <div className="flex items-center gap-2.5">
            <FileImage size={18} className="text-primary" />
            <h2 className="font-semibold text-text">Importar via OCR</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Upload area */}
          {(step === 'idle' || step === 'error') && (
            <>
              <p className="text-xs text-text-muted">
                Envie uma foto ou PDF da ficha de inscrição. A IA extrai os dados automaticamente.
              </p>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragging
                    ? 'border-primary bg-primary/5'
                    : file
                      ? 'border-green-400 bg-green-50/50'
                      : 'border-border hover:border-primary/50 hover:bg-hover/30'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
                />
                <Upload size={28} className={`mx-auto mb-2 ${file ? 'text-green-500' : 'text-text-muted/40'}`} />
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-text">{file.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-text">Arraste a ficha aqui</p>
                    <p className="text-xs text-text-muted mt-0.5">ou clique para selecionar (PDF, JPG, PNG, WEBP)</p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{errorMsg}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button
                  leftIcon={<Upload size={14} />}
                  disabled={!file}
                  onClick={handleUpload}
                >
                  Analisar
                </Button>
              </div>
            </>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="flex flex-col items-center gap-3 py-6">
              <RefreshCw size={28} className="animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-text">
                  {step === 'uploading' ? 'Enviando arquivo...' : 'Analisando com IA...'}
                </p>
                <p className="text-xs text-text-muted mt-0.5">Isso pode levar alguns segundos</p>
              </div>
            </div>
          )}

          {/* Done */}
          {step === 'done' && extracted && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                <p className="text-sm font-medium text-green-800">Dados extraídos com sucesso</p>
              </div>

              {/* Extracted data preview */}
              <div className="bg-hover/30 rounded-xl p-4 space-y-2">
                {extracted.name && <Row label="Nome" value={extracted.name} />}
                {extracted.nickname && <Row label="Apelido" value={extracted.nickname} />}
                {extracted.type && (
                  <Row label="Tipo" value={extracted.type === 'couple' ? 'Casal' : 'Jovem'} />
                )}
                {extracted.partner_name && <Row label="Cônjuge" value={extracted.partner_name} />}
                {extracted.partner_nickname && <Row label="Apelido cônjuge" value={extracted.partner_nickname} />}
                {extracted.birth_date && <Row label="Nascimento" value={extracted.birth_date} />}
                {extracted.partner_birth_date && (
                  <Row label="Nasc. cônjuge" value={extracted.partner_birth_date} />
                )}
                {extracted.wedding_date && <Row label="Casamento" value={extracted.wedding_date} />}
                {extracted.received_at && <Row label="Data ficha" value={extracted.received_at} />}
                {extracted.phones && extracted.phones.length > 0 && (
                  <Row label="Telefone(s)" value={extracted.phones.join(', ')} />
                )}
                {extracted.email && <Row label="E-mail" value={extracted.email} />}
                {extracted.partner_email && <Row label="E-mail cônjuge" value={extracted.partner_email} />}
                {extracted.partner_phones && extracted.partner_phones.length > 0 && (
                  <Row label="Tel. cônjuge" value={extracted.partner_phones.join(', ')} />
                )}
                {extracted.home_phones && extracted.home_phones.length > 0 && (
                  <Row label="Tel. residencial" value={extracted.home_phones.join(', ')} />
                )}
                {extracted.address && <Row label="Endereço" value={extracted.address} />}
                {extracted.birthplace && <Row label="Naturalidade" value={extracted.birthplace} />}
                {extracted.partner_birthplace && <Row label="Natur. cônjuge" value={extracted.partner_birthplace} />}
                {extracted.father_name && <Row label="Pai" value={extracted.father_name} />}
                {extracted.mother_name && <Row label="Mãe" value={extracted.mother_name} />}
                {extracted.education_level && <Row label="Escolaridade" value={extracted.education_level} />}
                {extracted.education_status && <Row label="Status" value={extracted.education_status} />}
                {extracted.course && <Row label="Curso" value={extracted.course} />}
                {extracted.institution && <Row label="Instituição" value={extracted.institution} />}
                {extracted.sacraments && extracted.sacraments.length > 0 && (
                  <Row label="Sacramentos" value={extracted.sacraments.join(', ')} />
                )}
                {extracted.church_movement && <Row label="Mov. Igreja" value={extracted.church_movement} />}
                {extracted.available_schedule && <Row label="Disponibilidade" value={extracted.available_schedule} />}
                {extracted.musical_instruments && <Row label="Instrumentos" value={extracted.musical_instruments} />}
                {extracted.talks_testimony && <Row label="Palestras/Test." value={extracted.talks_testimony} />}
                {extracted.encounter_year && <Row label="Ano encontro" value={String(extracted.encounter_year)} />}
                {extracted.encounter_details && <Row label="Det. encontro" value={extracted.encounter_details} />}
                {extracted.skills && extracted.skills.length > 0 && (
                  <Row label="Habilidades" value={extracted.skills.join(', ')} />
                )}
                {extracted.notes && <Row label="Observações" value={extracted.notes} />}
              </div>

              {/* Potential duplicates */}
              {duplicates.length > 0 && (
                <div className="border border-amber-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 border-b border-amber-200">
                    <AlertCircle size={14} className="text-amber-600" />
                    <p className="text-xs font-semibold text-amber-800">
                      {duplicates.length === 1
                        ? 'Possível duplicata encontrada'
                        : `${duplicates.length} possíveis duplicatas encontradas`}
                    </p>
                  </div>
                  <div className="divide-y divide-amber-100">
                    {duplicates.map((d) => (
                      <a
                        key={d.id}
                        href={`/app/people/${d.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-amber-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">{d.name}</span>
                        </div>
                        <ExternalLink size={12} className="text-amber-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>Fechar</Button>
                <Button onClick={handlePrefillForm}>Preencher formulário</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-text-muted w-28 shrink-0">{label}</span>
      <span className="text-text font-medium">{value}</span>
    </div>
  );
}

export default OcrImport;
