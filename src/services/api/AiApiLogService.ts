import api from '@/config/api';
import { AxiosResponse } from 'axios';
import { AiApiLog, AiApiLogStats } from '@/interfaces/AiApiLog';
import { PaginationMeta } from '@/components/Pagination/types';

interface AiApiLogListResponse {
  data: AiApiLog[];
  meta: PaginationMeta;
}

class AiApiLogService {
  list(params?: Record<string, unknown>): Promise<AxiosResponse<AiApiLogListResponse>> {
    return api.get('ai-logs', { params });
  }

  stats(params?: { from?: string; to?: string }): Promise<AxiosResponse<AiApiLogStats>> {
    return api.get('ai-logs/stats', { params });
  }
}

export default new AiApiLogService();
