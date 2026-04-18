import { CrudService } from './CrudService';
import { Diocese } from '@/interfaces/Parish';

export interface DiocesePayload {
  name: string;
  active?: boolean;
}

class DioceseService extends CrudService<Diocese, DiocesePayload> {
  protected baseUrl(): string {
    return 'dioceses';
  }
}

export default new DioceseService();
