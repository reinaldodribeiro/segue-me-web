<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Form Pattern Examples

## New entity form structure
Ref: `src/features/People/New/index.tsx`
```tsx
const [name, setName] = useState('');
const [type, setType] = useState<PersonType>('youth');
const [errors, setErrors] = useState<Record<string, string | undefined>>({});
const [submitting, setSubmitting] = useState(false);
const { toast } = useToast();
const { handleError } = useErrorHandler();

async function handleSubmit(e: React.SyntheticEvent, force = false) {
  e.preventDefault();
  setSubmitting(true);
  const payload = { type, name: name.trim() };
  if (force) payload.force = true;
  try {
    await PersonService.save(payload);
    toast({ title: 'Pessoa cadastrada.', variant: 'success' });
    router.push('/app/people');
  } catch (err) {
    const e = err as { status?: number; data?: { duplicates?: Duplicate[] } };
    if (e?.status === 409 && e.data?.duplicates) {
      setDuplicates(e.data.duplicates);  // Show duplicate warning modal
    } else {
      handleError(err, 'handleSubmit()');
    }
  } finally { setSubmitting(false); }
}
```

## Detail form with initializedRef guard
Ref: `src/features/People/Detail/index.tsx`
```tsx
const { data: person } = usePerson(id);
const initializedRef = useRef<string | null>(null);

useEffect(() => {
  if (!person || initializedRef.current === id) return;
  initializedRef.current = id;
  setType(person.type);
  setName(person.name);
  setEmail(person.email ?? '');
  setActive(person.active);
}, [person, id]);
```

## Delete confirmation state
Ref: `src/features/People/Detail/index.tsx`
```tsx
const [confirmDelete, setConfirmDelete] = useState(false);
const [deleting, setDeleting] = useState(false);

async function handleDelete() {
  setDeleting(true);
  try {
    await PersonService.delete(id);
    toast({ title: 'Pessoa removida.', variant: 'success' });
    router.push('/app/people');
  } catch (err) { handleError(err, 'handleDelete()'); setDeleting(false); }
}

// In JSX: render confirm panel instead of window.confirm()
{confirmDelete && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
    <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
    <Button size="sm" variant="danger" onClick={handleDelete} loading={deleting}>Confirmar</Button>
  </div>
)}
```

## Error clearing on field change
```tsx
<Input
  value={name}
  onChange={(e) => {
    setName(e.target.value);
    setErrors((p) => ({ ...p, name: undefined }));
  }}
  error={errors.name}
/>
```
