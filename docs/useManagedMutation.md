# useManagedMutation Hook

The `useManagedMutation` hook is a standardized wrapper around TanStack Query's `useMutation`. It provides a consistent way to handle API mutations, particularly those occurring within modal dialogs or triggered by action buttons.

## Motivation

Standardizing mutations across the application ensures:

- **Consistent User Feedback**: Success and error notifications follow the same patterns.
- **Reduced Boilerplate**: Manual handling of `try/catch`, notifications, and loading states is eliminated.
- **Automated Workflow**: Common tasks like closing the active modal (optional) and refetching data are handled automatically.
- **Centralized Invalidation**: Easy integration with React Query's cache management.

## API Reference

```typescript
function useManagedMutation<TData, TError, TVariables>(options: ModalMutationOptions): UseMutationResult;
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `mutationFn` | `(variables: TVariables) => Promise<TData>` | **Required**. The function that performs the API call. |
| `successMessage` | `string` | Optional message to display upon successful mutation. |
| `errorMessage` | `string` | Optional message to display upon mutation failure. |
| `refetch` | `() => void \| Promise<void>` | Optional callback to refetch data after success. |
| `invalidateQueries` | `InvalidateQueryFilters[]` | Optional array of query filters to invalidate upon success. |
| `confirmation` | `MutationConfirmationConfig` | Optional configuration for a confirmation dialog before execution. |
| `closeModal` | `boolean` | Whether to close the active modal dialog upon success. Defaults to `true`. |
| `onSuccess` | `(data, variables, context) => void` | Optional callback executed after standard success actions. |
| `onError` | `(error, variables, context) => void` | Optional callback executed after standard error actions. |

## Examples

### 1. Simple Action Button (e.g., Delete)

For simple actions, use `.mutate()` as it doesn't return a promise and is safer for standard event handlers.

```tsx
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

const DeleteButton = ({ resource, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => deleteResource(resource.uuid),
    successMessage: translate('Resource has been deleted.'),
    errorMessage: translate('Unable to delete resource.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete this resource?'),
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
```

### 2. Form Submission

For forms (e.g., using React Final Form), use `.mutateAsync()` to allow the form handler to track the submission state.

```tsx
const CreateProjectDialog = ({ resolve }) => {
  const { mutateAsync } = useManagedMutation({
    mutationFn: (values) => projectsCreate({ body: values }),
    successMessage: translate('Project created.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => mutateAsync(values)}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          {/* ... fields ... */}
        </form>
      )}
    />
  );
};
```

### 3. Complex Cache Invalidation

Use `invalidateQueries` to refresh multiple parts of the application state.

```tsx
const updateMutation = useManagedMutation({
  mutationFn: updateData,
  invalidateQueries: [
    { queryKey: ['ResourcesList'] },
    { queryKey: ['UserStats', userId] },
  ],
});
```

## Best Practices & Edge Cases

### `mutate` vs `mutateAsync`

> [!IMPORTANT]
>
> - Use **`.mutate()`** in buttons, `ActionItem`, and `onClick` handlers. It is safer as it doesn't require manual promise handling or error catching in the caller.
> - Use **`.mutateAsync()`** in forms (like `onSubmit` in React Final Form) where the parent needs to know when the mutation resolves to manage local state or lifecycle.

### Modal Closure

`useManagedMutation` automatically calls `closeDialog()` on success.

- If the mutation is triggered from a standalone page (not a modal), `closeDialog()` will safely do nothing.
- If you need to keep the modal open after success, use a standard `useMutation` instead.

### Confirmation Dialog Integration

If a `confirmation` config is provided, `useManagedMutation` will:

1. Intercept the call to `mutate` or `mutateAsync`.
2. Show the confirmation dialog.
3. Only execute the `mutationFn` if the user confirms.
4. If cancelled, it returns immediately without error.

### Error Handling

The hook automatically handles `showErrorResponse`. You don't need to manually catch errors unless you have additional logging or specific UI logic to perform upon failure.

```tsx
const mutation = useManagedMutation({
  // ...
  onError: (error) => {
    console.error('Custom logging:', error);
  }
});
```
