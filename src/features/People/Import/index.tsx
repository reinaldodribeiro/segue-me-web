'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Upload, X, CheckCircle2, AlertCircle, RefreshCw, FileSpreadsheet, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import PersonService from '@/services/api/PersonService';
import { useImportStatus } from '@/lib/query/hooks/usePersons';

import { ImportStep, ImportResult, ImportError, PeopleImportProps } from './types';

const PeopleImport: React.FC<PeopleImportProps> = ({ parishId, onClose, onSuccess }) => {
  const [step, setStep] = useState<ImportStep>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: importStatus } = useImportStatus(cacheKey);

  useEffect(() => {
    if (!importStatus) return;
    const { status, imported, errors, message } = importStatus as {
      status: string; imported?: number; errors?: ImportError[]; message?: string;
    };
    if (status === 'done') {
      setResult({ imported: imported ?? 0, errors: errors ?? [] });
      setStep('done');
      if ((imported ?? 0) > 0) onSuccess();
    } else if (status === 'failed') {
      setErrorMsg(message ?? 'Falha ao processar a planilha.');
      setStep('error');
    }
  }, [importStatus, onSuccess]);

  function pickFile(f: File) {
    const valid = ['xlsx', 'xls', 'csv'];
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!valid.includes(ext)) {
      setErrorMsg('Formato inválido. Use .xlsx, .xls ou .csv');
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
      const res = await PersonService.importSpreadsheet(file, parishId);
      setCacheKey(res.data.cache_key);
      setStep('processing');
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Erro ao enviar arquivo.';
      setErrorMsg(msg);
      setStep('error');
    }
  }

  function handleRetry() {
    setStep('idle');
    setResult(null);
    setErrorMsg('');
  }

  const isProcessing = step === 'uploading' || step === 'processing';
  const allFailed = step === 'done' && result && result.imported === 0 && result.errors.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-panel border border-border rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet size={18} className="text-primary" />
            <h2 className="font-semibold text-text">Importar planilha</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Download template */}
          <div className="flex items-center justify-between bg-hover/40 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-medium text-text">Planilha modelo</p>
              <p className="text-xs text-text-muted mt-0.5">Baixe e preencha o modelo oficial</p>
            </div>
            <div className="flex gap-2">
              <a href="/samples/pessoas_exemplo.csv" download>
                <Button size="sm" variant="secondary" leftIcon={<Download size={13} />}>Exemplo</Button>
              </a>
              <a href={PersonService.importTemplateUrl()} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary" leftIcon={<Download size={13} />}>Modelo</Button>
              </a>
            </div>
          </div>

          {/* Upload area */}
          {(step === 'idle' || step === 'error') && (
            <>
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
                  accept=".xlsx,.xls,.csv"
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
                    <p className="text-sm font-medium text-text">Arraste a planilha aqui</p>
                    <p className="text-xs text-text-muted mt-0.5">ou clique para selecionar (.xlsx, .xls, .csv)</p>
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
                  loading={isProcessing}
                  onClick={handleUpload}
                >
                  Importar
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
                  {step === 'uploading' ? 'Enviando arquivo...' : 'Processando planilha...'}
                </p>
                <p className="text-xs text-text-muted mt-0.5">Isso pode levar alguns segundos</p>
              </div>
            </div>
          )}

          {/* Done */}
          {step === 'done' && result && (
            <div className="space-y-3">
              {/* Success summary — only when at least 1 imported */}
              {result.imported > 0 && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                  <p className="text-sm font-semibold text-green-800">
                    {result.imported} {result.imported === 1 ? 'pessoa importada' : 'pessoas importadas'} com sucesso
                  </p>
                </div>
              )}

              {/* All-failed state */}
              {allFailed && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <XCircle size={18} className="text-red-500 shrink-0" />
                  <p className="text-sm font-semibold text-red-700">
                    Nenhuma pessoa foi importada. Corrija os erros abaixo e tente novamente.
                  </p>
                </div>
              )}

              {/* Errors list */}
              {result.errors.length > 0 && (
                <div className="border border-amber-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between bg-amber-50 px-4 py-2.5 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-600" />
                      <p className="text-xs font-semibold text-amber-800">
                        {result.errors.length} {result.errors.length === 1 ? 'linha ignorada' : 'linhas ignoradas'}
                      </p>
                    </div>
                    {result.imported > 0 && (
                      <p className="text-xs text-amber-600">
                        {result.imported} de {result.imported + result.errors.length} importadas
                      </p>
                    )}
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-amber-100">
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs text-amber-700 px-4 py-2 leading-relaxed">
                        <span className="font-medium">Linha {e.linha}:</span> {e.motivo}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                {allFailed && (
                  <Button variant="secondary" onClick={handleRetry}>Tentar novamente</Button>
                )}
                <Button onClick={onClose}>Fechar</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeopleImport;
