import { EvaluationFormData } from '@/interfaces/Evaluation';

export interface PinVerificationProps {
  token: string;
  onVerified: (sessionToken: string, formData: EvaluationFormData) => void;
}
