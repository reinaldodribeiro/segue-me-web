---
name: frontend-form-pattern
description: "Pattern for forms in the segue-me frontend. Covers local state management (form, errors, submitting),
  validation function, error clearing on change, delete confirmation state, and the initializedRef guard.
  Use when building a create or edit form, adding form validation, handling submit errors,
  showing a delete confirmation, or the user says 'add form', 'create form', 'validate input',
  'form with errors', 'submit handler', 'delete confirmation'."
---
<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Form Pattern

Forms use three local state variables: field values (individual `useState` per field), `errors` record, and `submitting` boolean. A `validate()` function populates `errors` and returns a boolean. Delete confirmations use a separate `confirmDelete` boolean.

## Pattern

Rules:
- Clear individual field error on change: `setErrors(p => ({ ...p, fieldName: undefined }))`
- Disable submit button while `submitting` is true
- Use `useErrorHandler().handleError(err)` in catch to map HTTP errors to toasts
- Use `useToast()` for success notifications
- Use `initializedRef` guard in Detail forms to prevent re-init after cache invalidation
- Use `confirmDelete` boolean state (not `window.confirm()`) for delete confirmations
- Validate before submit: `if (!validate()) return`

## Example

```tsx
const [name, setName] = useState('');
const [errors, setErrors] = useState<Record<string, string | undefined>>({});
const [submitting, setSubmitting] = useState(false);

function validate(): boolean {
  const e: typeof errors = {};
  if (!name.trim()) e.name = 'Nome obrigatorio';
  setErrors(e);
  return Object.keys(e).length === 0;
}

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!validate()) return;
  setSubmitting(true);
  try {
    await PersonService.save({ name });
    toast({ title: 'Salvo!', variant: 'success' });
    router.push('/app/people');
  } catch (err) { handleError(err, 'NewPerson'); }
  finally { setSubmitting(false); }
}
```
Ref: `src/features/People/New/index.tsx`

## References

For full code examples with variants:
-> Read `references/examples.md`
