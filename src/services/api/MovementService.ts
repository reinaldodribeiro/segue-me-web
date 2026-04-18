import api from '@/config/api';
import { AxiosResponse } from 'axios';
import { Movement, MovementPayload, MovementTeam, MovementTeamPayload } from '@/interfaces/Movement';
import { CrudService } from './CrudService';

class MovementService extends CrudService<Movement, MovementPayload> {
  protected baseUrl(): string {
    return 'movements';
  }

  /** PUT /movements/{movement} — override PATCH with PUT */
  put(id: string, data: Partial<MovementPayload>): Promise<AxiosResponse<{ data: Movement }>> {
    return api.put(`movements/${id}`, data);
  }

  /** GET /movements/{movement}/teams */
  getTeams(movementId: string): Promise<AxiosResponse<{ data: MovementTeam[] }>> {
    return api.get(`movements/${movementId}/teams`);
  }

  /** POST /movements/{movement}/teams */
  createTeam(movementId: string, data: MovementTeamPayload): Promise<AxiosResponse<{ data: MovementTeam }>> {
    return api.post(`movements/${movementId}/teams`, data);
  }

  /** PUT /movements/{movement}/teams/{team} */
  updateTeam(movementId: string, teamId: string, data: MovementTeamPayload): Promise<AxiosResponse<{ data: MovementTeam }>> {
    return api.put(`movements/${movementId}/teams/${teamId}`, data);
  }

  /** DELETE /movements/{movement}/teams/{team} */
  deleteTeam(movementId: string, teamId: string): Promise<AxiosResponse<void>> {
    return api.delete(`movements/${movementId}/teams/${teamId}`);
  }

  /** POST /movements/{movement}/teams/reorder */
  reorderTeams(movementId: string, order: string[]): Promise<AxiosResponse<void>> {
    return api.post(`movements/${movementId}/teams/reorder`, { order });
  }
}

export default new MovementService();
