import api from '@/config/api';
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/interfaces/App';
import { Sector } from '@/interfaces/Parish';
import { CrudService } from './CrudService';

export interface SectorPayload {
  name: string;
  active?: boolean;
}

class SectorService extends CrudService<Sector, SectorPayload> {
  protected baseUrl(): string {
    return 'sectors';
  }

  /** Alias for search() — backward compatibility */
  show(id: string): Promise<AxiosResponse<{ data: Sector }>> {
    return this.search(id);
  }

  /** POST /dioceses/{diocese}/sectors — custom nested route */
  create(dioceseId: string, data: SectorPayload): Promise<AxiosResponse<{ data: Sector }>> {
    return api.post(`dioceses/${dioceseId}/sectors`, data);
  }

  /** PUT /sectors/{sector} — backend expects PUT, not PATCH */
  update(id: string, data: Partial<SectorPayload>): Promise<AxiosResponse<{ data: Sector }>> {
    return api.put(`sectors/${id}`, data);
  }

  /** GET /dioceses/{diocese}/sectors */
  listByDiocese(dioceseId: string, params?: Record<string, unknown>): Promise<AxiosResponse<PaginatedResponse<Sector>>> {
    return api.get(`dioceses/${dioceseId}/sectors`, { params });
  }
}

export default new SectorService();
