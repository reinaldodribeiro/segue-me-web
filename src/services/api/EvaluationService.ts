import api from '@/config/api';
import Axios from 'axios';
import { AxiosResponse } from 'axios';
import {
  TeamEvaluationToken,
  EvaluationFormData,
  EvaluationSubmission,
  EncounterAnalysis,
  EvaluationProgress,
} from '@/interfaces/Evaluation';

// Public axios instance (no auth headers)
const publicApi = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.isAxiosError && error.response?.data) {
      throw error.response;
    }
    throw error;
  },
);

class EvaluationService {
  // ─── Public endpoints (no auth) ───

  /** POST /avaliacao/{token}/verify — verify PIN, returns session_token + form data */
  verifyPin(
    token: string,
    pin: string,
  ): Promise<AxiosResponse<{ data: { session_token: string; form: EvaluationFormData } }>> {
    return publicApi.post(`avaliacao/${token}/verify`, { pin });
  }

  /** POST /avaliacao/{token}/submit — submit completed evaluation */
  submitEvaluation(
    token: string,
    data: EvaluationSubmission,
  ): Promise<AxiosResponse<{ message: string }>> {
    return publicApi.post(`avaliacao/${token}/submit`, data);
  }

  // ─── Authenticated endpoints ───

  /** GET /encounters/{encounter}/evaluations — list tokens for all teams */
  getTokens(encounterId: string): Promise<AxiosResponse<{ data: TeamEvaluationToken[] }>> {
    return api.get(`encounters/${encounterId}/evaluations`);
  }

  /** POST /encounters/{encounter}/evaluations/generate — generate tokens for all teams */
  generateTokens(encounterId: string): Promise<AxiosResponse<{ data: TeamEvaluationToken[] }>> {
    return api.post(`encounters/${encounterId}/evaluations/generate`);
  }

  /** POST /encounters/{encounter}/evaluations/{team}/regenerate — regenerate single team token */
  regenerateToken(
    encounterId: string,
    teamId: string,
  ): Promise<AxiosResponse<{ data: TeamEvaluationToken }>> {
    return api.post(`encounters/${encounterId}/evaluations/${teamId}/regenerate`);
  }

  /** GET /encounters/{encounter}/analysis — get analysis (general + per-team) */
  getAnalysis(encounterId: string): Promise<AxiosResponse<{ data: EncounterAnalysis | null }>> {
    return api.get(`encounters/${encounterId}/analysis`);
  }

  /** POST /encounters/{encounter}/analysis/generate — trigger AI analysis generation */
  generateAnalysis(encounterId: string): Promise<AxiosResponse<{ message: string }>> {
    return api.post(`encounters/${encounterId}/analysis/generate`);
  }

  /** GET /encounters/{encounter}/analysis/progress — evaluation submission progress */
  getProgress(encounterId: string): Promise<AxiosResponse<{ data: EvaluationProgress }>> {
    return api.get(`encounters/${encounterId}/analysis/progress`);
  }

  /** Download analysis PDF */
  async downloadAnalysisPdf(encounterId: string, filename: string): Promise<void> {
    const response = await api.get(`encounters/${encounterId}/analysis/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data as BlobPart], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default new EvaluationService();
