import { AxiosResponse } from 'axios';
import { PaginatedResponse } from '@/interfaces/App';

export interface ListService<T> {
  list(params?: Record<string, unknown>): Promise<AxiosResponse<PaginatedResponse<T>>>;
}

export interface SearchService<T> {
  search(id: string, params?: Record<string, unknown>): Promise<AxiosResponse<{ data: T }>>;
}

export interface SaveService<T, P> {
  save(data: P): Promise<AxiosResponse<{ data: T; status: boolean }>>;
}

export interface UpdateService<T> {
  update(id: string, data: Partial<T>): Promise<AxiosResponse<{ data: T }>>;
}

export interface DeleteService {
  delete(id: string): Promise<AxiosResponse<void>>;
}
