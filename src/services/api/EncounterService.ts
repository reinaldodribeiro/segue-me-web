import api from '@/config/api';
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/interfaces/App';
import { Encounter, EncounterParticipant, EncounterParticipantPayload, EncounterPayload, EncounterSummary, Team, TeamMember } from '@/interfaces/Encounter';
import { Person } from '@/interfaces/Person';
import { CrudService } from './CrudService';

class EncounterService extends CrudService<Encounter, EncounterPayload> {
  protected baseUrl(): string {
    return 'encounters';
  }

  /** PUT /encounters/{encounter} — override PATCH with PUT */
  put(id: string, data: Partial<EncounterPayload> & { status?: string }): Promise<AxiosResponse<{ data: Encounter }>> {
    return api.put(`encounters/${id}`, data);
  }

  /** GET /encounters/{encounter}/summary */
  summary(id: string): Promise<AxiosResponse<{ data: EncounterSummary }>> {
    return api.get(`encounters/${id}/summary`);
  }

  /** GET /encounters/{encounter}/teams */
  getTeams(id: string): Promise<AxiosResponse<{ data: Team[] }>> {
    return api.get(`encounters/${id}/teams`);
  }

  /** POST /encounters/{encounter}/sync-teams */
  syncTeams(id: string): Promise<AxiosResponse<{ data: Team[] }>> {
    return api.post(`encounters/${id}/sync-teams`);
  }

  /** GET /encounters/{encounter}/available-people */
  availablePeople(id: string, params?: Record<string, unknown>): Promise<AxiosResponse<{ data: Person[] }>> {
    return api.get(`encounters/${id}/available-people`, { params });
  }

  /** DELETE /encounters/{encounter}/members */
  resetMembers(id: string): Promise<AxiosResponse<void>> {
    return api.delete(`encounters/${id}/members`);
  }

  /** POST /teams/{team}/members */
  addMember(teamId: string, personId: string, role: 'coordinator' | 'member' = 'member'): Promise<AxiosResponse<{ data: TeamMember }>> {
    return api.post(`teams/${teamId}/members`, { person_id: personId, role });
  }

  /** DELETE /team-members/{teamMember} */
  removeMember(memberId: string, reason?: string): Promise<AxiosResponse<void>> {
    return api.delete(`team-members/${memberId}`, { data: { reason } });
  }

  /** PATCH /team-members/{teamMember}/status */
  updateMemberStatus(memberId: string, status: string, refusal_reason?: string): Promise<AxiosResponse<{ data: TeamMember }>> {
    return api.patch(`team-members/${memberId}/status`, { status, refusal_reason });
  }

  /** GET /team-members/{teamMember}/suggest-replacement */
  suggestReplacement(memberId: string): Promise<AxiosResponse<{ data: Person[] }>> {
    return api.get(`team-members/${memberId}/suggest-replacement`);
  }

  /** GET /teams/{team}/suggest-members?role=member|coordinator */
  suggestMembers(teamId: string, role: 'member' | 'coordinator' = 'member'): Promise<AxiosResponse<{ data: { person_id: string; reason: string }[] }>> {
    return api.get(`teams/${teamId}/suggest-members`, { params: { role } });
  }

  /** GET /encounters/{encounter}/report/pdf — returns blob for authenticated download */
  async downloadPdf(id: string, filename: string): Promise<void> {
    const response = await api.get<BlobPart>(`encounters/${id}/report/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** GET /encounters/{encounter}/report/refusals */
  reportRefusals(id: string): Promise<AxiosResponse<{ data: unknown }>> {
    return api.get(`encounters/${id}/report/refusals`);
  }

  /** GET /encounters/{encounter}/participants */
  listParticipants(encounterId: string): Promise<AxiosResponse<{ data: EncounterParticipant[] }>> {
    return api.get(`encounters/${encounterId}/participants`);
  }

  /** POST /encounters/{encounter}/participants */
  addParticipant(encounterId: string, data: EncounterParticipantPayload): Promise<AxiosResponse<{ data: EncounterParticipant }>> {
    return api.post(`encounters/${encounterId}/participants`, data);
  }

  /** POST /encounters/{encounter}/participants/{participant}/photo */
  uploadParticipantPhoto(encounterId: string, participantId: string, file: File): Promise<AxiosResponse<{ data: EncounterParticipant }>> {
    const form = new FormData();
    form.append('photo', file);
    return api.post(`encounters/${encounterId}/participants/${participantId}/photo`, form);
  }

  /** PATCH /encounters/{encounter}/participants/{participant} */
  updateParticipant(encounterId: string, participantId: string, data: EncounterParticipantPayload): Promise<AxiosResponse<{ data: EncounterParticipant }>> {
    return api.patch(`encounters/${encounterId}/participants/${participantId}`, data);
  }

  /** DELETE /encounters/{encounter}/participants/{participant} */
  removeParticipant(encounterId: string, participantId: string): Promise<AxiosResponse<void>> {
    return api.delete(`encounters/${encounterId}/participants/${participantId}`);
  }

  /** GET /encounters/participants/import/template — public URL for download link */
  participantsTemplateUrl(): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/encounters/participants/import/template`;
  }

  /** POST /encounters/{encounter}/participants/import */
  importParticipants(encounterId: string, file: File): Promise<AxiosResponse<{ message: string; imported: number; errors: string[] }>> {
    const form = new FormData();
    form.append('file', file);
    return api.post(`encounters/${encounterId}/participants/import`, form);
  }

  /** GET /encounters/{encounter}/participants/export/excel — returns blob download */
  async downloadParticipantsExcel(encounterId: string, filename: string): Promise<void> {
    const response = await api.get<BlobPart>(`encounters/${encounterId}/participants/export/excel`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** GET /encounters/{encounter}/participants/export/pdf — returns blob download */
  async downloadParticipantsPdf(encounterId: string, filename: string): Promise<void> {
    const response = await api.get<BlobPart>(`encounters/${encounterId}/participants/export/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Paginated list */
  paginated(params?: Record<string, unknown>): Promise<AxiosResponse<PaginatedResponse<Encounter>>> {
    return api.get('encounters', { params });
  }
}

export default new EncounterService();
