import api from '@/config/api';
import { AxiosResponse } from 'axios';
import { AuditLog } from '@/interfaces/Audit';
import { PaginationMeta } from '@/components/Pagination/types';

interface AuditListResponse {
  data: AuditLog[];
  meta: PaginationMeta;
}

class AuditService {
  list(params?: Record<string, unknown>): Promise<AxiosResponse<AuditListResponse>> {
    return api.get('audit-logs', { params });
  }
}

export default new AuditService();
