---
name: frontend-crud-service
description: "Pattern for creating API service classes by extending CrudService<T, P> in the segue-me frontend.
  Use when adding a new entity service, creating API methods, adding a new endpoint to an existing service,
  or the user says 'add service', 'new API class', 'call the backend', 'add endpoint to service'.
  Also covers the important override: use api.put() instead of PATCH when the Laravel backend expects PUT."
---
<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# CrudService Extension Pattern

Extend `CrudService<T, P>` and implement `baseUrl()`. The base class provides `list()`, `search()`, `save()`, `update()` (PATCH), `updateFormData()`, and `delete()`.

## Pattern

File: `src/services/api/{Name}Service.ts`

Key rules:
- `baseUrl()` returns the bare endpoint string (no leading slash, no trailing slash)
- Laravel backend expects **PUT** for updates, not PATCH. Override with `api.put()` when needed
- `updateFormData()` handles multipart/form-data -- do not set Content-Type manually
- Export as singleton: `export default new XService()`
- Type all return values: `Promise<AxiosResponse<{ data: T }>>`
- Add JSDoc comment with HTTP method and endpoint path

## Example

```ts
class PersonService extends CrudService<Person, PersonPayload> {
  protected baseUrl() { return 'people'; }

  /** PUT /people/{person} -- backend expects PUT, not PATCH */
  put(id: string, data: Partial<PersonPayload>) {
    return api.put(`people/${id}`, data);
  }

  /** POST /people/{person}/photo */
  uploadPhoto(id: string, file: File) {
    const form = new FormData();
    form.append('photo', file);
    return api.post(`people/${id}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}
export default new PersonService();
```
Ref: `src/services/api/PersonService.ts`

## References

For full code examples with variants:
-> Read `references/examples.md`
