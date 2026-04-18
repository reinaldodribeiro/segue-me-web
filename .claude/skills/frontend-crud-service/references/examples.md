<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# CrudService Examples

## Simple service (no overrides)
Ref: `src/services/api/DioceseService.ts`
```ts
import { CrudService } from './CrudService';
import { Diocese, DiocesePayload } from '@/interfaces/Parish';

class DioceseService extends CrudService<Diocese, DiocesePayload> {
  protected baseUrl() { return 'dioceses'; }
}
export default new DioceseService();
```

## Service with PUT override and custom methods
Ref: `src/services/api/PersonService.ts`
```ts
class PersonService extends CrudService<Person, PersonPayload> {
  protected baseUrl() { return 'people'; }

  /** PUT /people/{person} -- backend expects PUT */
  put(id: string, data: Partial<PersonPayload>) { return api.put(`people/${id}`, data); }

  /** GET /people/{person}/history */
  history(id: string) { return api.get(`people/${id}/history`); }

  /** POST /people/import/spreadsheet */
  importSpreadsheet(file: File, parishId?: string) {
    const form = new FormData();
    form.append('file', file);
    if (parishId) form.append('parish_id', parishId);
    return api.post('people/import/spreadsheet', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}
```

## Complex service with many endpoints
Ref: `src/services/api/EncounterService.ts`
```ts
class EncounterService extends CrudService<Encounter, EncounterPayload> {
  protected baseUrl() { return 'encounters'; }

  put(id: string, data: Partial<EncounterPayload> & { status?: string }) {
    return api.put(`encounters/${id}`, data);
  }

  // Sub-resource: teams
  getTeams(id: string) { return api.get(`encounters/${id}/teams`); }
  syncTeams(id: string) { return api.post(`encounters/${id}/sync-teams`); }

  // Sub-resource: members (different base path)
  addMember(teamId: string, personId: string, role: 'coordinator' | 'member') {
    return api.post(`teams/${teamId}/members`, { person_id: personId, role });
  }

  // Blob download pattern
  async downloadPdf(id: string, filename: string): Promise<void> {
    const response = await api.get(`encounters/${id}/report/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}
```

## CrudService base interface
Ref: `src/services/api/CrudService.ts`
```ts
// Provides: list(params?), search(id, params?), save(data), update(id, data) [PATCH],
//           updateFormData(id, formData), delete(id)
// update() uses PATCH -- override with api.put() when backend expects PUT
export abstract class CrudService<T, P> { ... }
```
