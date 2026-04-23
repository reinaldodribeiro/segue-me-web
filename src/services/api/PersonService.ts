import api from '@/config/api';
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/interfaces/App';
import { Person, PersonHistory, PersonPayload, PersonTeamExperience, TeamExperienceRole } from '@/interfaces/Person';
import { CrudService } from './CrudService';

class PersonService extends CrudService<Person, PersonPayload> {
  protected baseUrl(): string {
    return 'people';
  }

  /** GET /people/{person}/history */
  history(id: string): Promise<AxiosResponse<{ data: PersonHistory[] }>> {
    return api.get(`people/${id}/history`);
  }

  /** GET /people/{person}/suggested-teams */
  suggestedTeams(id: string): Promise<AxiosResponse<{ data: unknown[] }>> {
    return api.get(`people/${id}/suggested-teams`);
  }

  /** POST /people/import/spreadsheet */
  importSpreadsheet(file: File, parishId?: string): Promise<AxiosResponse<{ message: string; cache_key: string }>> {
    const form = new FormData();
    form.append('file', file);
    if (parishId) form.append('parish_id', parishId);
    return api.post('people/import/spreadsheet', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** POST /people/import/scan */
  importScan(file: File): Promise<AxiosResponse<{ message: string; cache_key: string }>> {
    const form = new FormData();
    form.append('file', file);
    return api.post('people/import/scan', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** GET /people/import/status */
  importStatus(cacheKey: string): Promise<AxiosResponse<{ status: string; imported?: number; errors?: string[] }>> {
    return api.get('people/import/status', { params: { cache_key: cacheKey } });
  }

  /** GET /people/import/template?type=youth|couple */
  importTemplateUrl(type?: 'youth' | 'couple'): string {
    const base = `${process.env.NEXT_PUBLIC_API_URL}/people/import/template`;
    return type ? `${base}?type=${type}` : base;
  }

  /** GET /people/export/excel — returns blob for authenticated download */
  exportExcel(params?: Record<string, unknown>): Promise<AxiosResponse<Blob>> {
    return api.get('people/export/excel', { params, responseType: 'blob' });
  }

  /** PUT /people/{person} — override PATCH with PUT */
  put(id: string, data: Partial<PersonPayload>): Promise<AxiosResponse<{ data: Person }>> {
    return api.put(`people/${id}`, data);
  }

  /** POST /people/{person}/recalculate-score */
  recalculateScore(id: string): Promise<AxiosResponse<{ data: Person }>> {
    return api.post(`people/${id}/recalculate-score`);
  }

  /** GET /people/{person}/team-experiences */
  teamExperiences(id: string): Promise<AxiosResponse<{ data: PersonTeamExperience[] }>> {
    return api.get(`people/${id}/team-experiences`);
  }

  /** POST /people/{person}/team-experiences */
  addTeamExperience(id: string, data: {
    movement_team_id?: string | null;
    team_name: string;
    role: TeamExperienceRole;
    year?: number | null;
  }): Promise<AxiosResponse<{ data: PersonTeamExperience }>> {
    return api.post(`people/${id}/team-experiences`, data);
  }

  /** DELETE /people/{person}/team-experiences/{experience} */
  deleteTeamExperience(personId: string, experienceId: string): Promise<AxiosResponse<void>> {
    return api.delete(`people/${personId}/team-experiences/${experienceId}`);
  }

  /** POST /people/{person}/photo */
  uploadPhoto(id: string, file: File): Promise<AxiosResponse<{ data: { photo: string } }>> {
    const form = new FormData();
    form.append('photo', file);
    return api.post(`people/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /** GET /people — scoped list */
  paginated(params?: Record<string, unknown>): Promise<AxiosResponse<PaginatedResponse<Person>>> {
    return api.get('people', { params });
  }
}

export default new PersonService();
