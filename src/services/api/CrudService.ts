import api from '@/config/api';
import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/interfaces/App';
import {
  ListService,
  SearchService,
  SaveService,
  UpdateService,
  DeleteService,
} from '@/interfaces/CrudService';

export abstract class CrudService<T, P>
  implements ListService<T>, SearchService<T>, SaveService<T, P>, UpdateService<T>, DeleteService
{
  protected abstract baseUrl(): string;

  list(params?: Record<string, unknown>): Promise<AxiosResponse<PaginatedResponse<T>>> {
    return api.get<PaginatedResponse<T>>(this.baseUrl(), { params });
  }

  search(id: string, params?: Record<string, unknown>): Promise<AxiosResponse<{ data: T }>> {
    return api.get<{ data: T }>(`${this.baseUrl()}/${id}`, { params });
  }

  save(data: P): Promise<AxiosResponse<{ data: T; status: boolean }>> {
    return api.post<P, { data: T; status: boolean }>(this.baseUrl(), data);
  }

  update(id: string, data: Partial<T>): Promise<AxiosResponse<{ data: T }>> {
    return api.patch<Partial<T>, { data: T }>(`${this.baseUrl()}/${id}`, data);
  }

  updateFormData(id: string | null, data: FormData): Promise<AxiosResponse<{ data: T }>> {
    const url = id ? `${this.baseUrl()}/${id}` : this.baseUrl();
    return api.post<FormData, { data: T }>(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  delete(id: string): Promise<AxiosResponse<void>> {
    return api.delete(`${this.baseUrl()}/${id}`);
  }
}
