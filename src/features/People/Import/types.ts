export type ImportStep = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export interface ImportError {
  linha: number;
  motivo: string;
}

export interface ImportResult {
  imported: number;
  errors: ImportError[];
}

export interface PeopleImportProps {
  parishId?: string;
  onClose: () => void;
  onSuccess: () => void;
}
