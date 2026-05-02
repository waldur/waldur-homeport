# API Integration Guide

This guide covers data loading patterns, API client usage, and refresh mechanisms for integrating with the Waldur MasterMind backend.

## API Data Loading and Refresh Patterns

The application utilizes React Query efficiently for loading data from REST APIs, rendering forms, and handling real-time data refresh operations.

## Data Loading Patterns

### React Query/TanStack Query (Modern Approach)

The preferred pattern for new components uses React Query for efficient data fetching:

```typescript
const {
  data: projects,
  isLoading,
  error,
  refetch: refetchProjects,
} = useQuery({
  queryKey: ['CustomerProjects', selectedCustomer?.uuid],
  queryFn: () => fetchCustomerProjects(selectedCustomer.uuid),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

**Key Features:**

- **Automatic Caching**: 5-minute stale time for most queries
- **Built-in Loading States**: `isLoading`, `error`, `data`
- **Manual Refresh**: `refetch()` function for explicit updates
- **Query Invalidation**: Cache invalidation through query keys
- **Background Refetching**: Automatic background updates

### Custom Hook Pattern

Centralized data fetching logic wrapped in reusable hooks:

```typescript
export const useOrganizationGroups = () => {
  const user = useSelector(getUser);
  const query = useQuery({
    queryKey: ['organizationGroups'],
    queryFn: () => getAllPages((page) =>
      organizationGroupsList({ query: { page } })
    ).then(items => items.map(item => ({ ...item, value: item.url }))),
    staleTime: 5 * 60 * 1000,
  });

  const disabled = query.data?.length === 0 && !user.is_staff;
  const tooltip = disabled ? translate('Access policies cannot be configured...') : undefined;

  return { ...query, disabled, tooltip };
};
```

**Benefits:**

- **Business Logic Integration**: Transforms data for UI consumption
- **Computed Properties**: Adds disabled states and tooltips
- **Reusability**: Shared across multiple components
- **Centralized Error Handling**: Consistent error management

## Data Refresh Mechanisms

## Mutations with Notifications and Table Reload

For form and modal mutations (CRUD operations) that need to display notifications, update data caches, and potentially close dialogs, use the custom `useManagedMutation` hook.

### Best Practice: `useManagedMutation`

This hook encapsulates the try-catch block, notification logic (`useNotify`), and modal closure (`useModal`) in a declarative API. It is the preferred way to handle mutations in Waldur.

For detailed documentation, examples, and edge cases, see the [useManagedMutation Guide](./useManagedMutation.md).

```typescript
import { useManagedMutation } from '@/modal/useManagedMutation';

const saveProjectMutation = useManagedMutation({
  mutationFn: (formData: ProjectFormData) =>
    projectsCreate({
      body: {
        name: formData.name,
        customer: formData.customer.url,
      },
    }),
  successMessage: translate('Project has been created.'),
  errorMessage: translate('Unable to create project.'),
  refetch, // Option 1: Pass a refetch callback directly
  // Option 2: Provide an array of query filters to automatically invalidate
  invalidateQueries: [
    { queryKey: ['CustomerProjects'] },
  ],
});

// Use .mutateAsync for form submission
const onSubmit = (formData) => saveProjectMutation.mutateAsync(formData);

// Use .mutate for simple action buttons
const onDelete = () => deleteMutation.mutate({});
```

**Benefits:**

- **Automatic modal closure** upon successful completion.
- **Declarative notifications** for success/error handling.
- **Easy state sync** with table reloads using `refetch` or `invalidateQueries`.
- **Integrated confirmation** dialog support.

### Refresh Strategies

| Strategy | Implementation | Use Case |
|----------|----------------|----------|
| **Explicit Refetch** | `const { refetch } = useQuery(...); await refetch();` | Manual refresh after CRUD operations |
| **Table Refresh Button** | `<TableRefreshButton onClick={() => props.fetch(true)} />` | User-initiated refresh |
| **Automatic Polling** | `refetchInterval` in React Query | Real-time data updates |
| **Query Invalidation** | `queryClient.invalidateQueries(['queryKey'])` | Cache invalidation |

## Error Handling and Loading States

### Consistent Error Display

```typescript
{groupsLoading ? (
  <LoadingSpinner />
) : groupsError ? (
  <LoadingErred
    loadData={refetchGroups}
    message={translate('Unable to load organization groups.')}
  />
) : (
  <SelectField options={organizationGroups} />
)}
```

### Global Error Handling

```typescript
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.response?.status == 404) {
        router.stateService.go('errorPage.notFound');
      }
    },
  }),
});
```

## API Integration Patterns

### Waldur JS Client Integration

Primary API client with typed endpoints:

```typescript
import {
  projectsCreate,
  projectsList,
  customersList
} from 'waldur-js-client';

// Typed API calls with request/response types
const response = await projectsCreate({
  body: {
    name: formData.name,
    customer: formData.customer.url,
  },
});
```

### Async Form Field Loading

Dynamic data loading for form fields:

```typescript
<Field
  component={Select}
  name="customer"
  loadOptions={(query, prevOptions, page) =>
    organizationAutocomplete(query, prevOptions, page, {
      field: ['uuid', 'name', 'url'],
      o: 'name',
    })
  }
  getOptionLabel={(option) => option.name}
  getOptionValue={(option) => option.url}
/>
```

## Caching Strategies

### React Query Cache

- **Query-based caching**: Uses query keys for cache management
- **Automatic background refetching**: Keeps data fresh
- **Configurable stale time**: Typically 5 minutes for most queries
- **Request deduplication**: Prevents duplicate requests

### Redux Store Cache

- **Table data cached**: In Redux state for tables
- **Manual cache invalidation**: Explicit cache clearing
- **Optimistic updates**: Immediate UI updates for CRUD operations

## Best Practices

1. **New Components**: Use React Query with custom hooks
2. **Error Handling**: Consistent use of `LoadingErred` component with retry functionality
3. **Caching**: 5-minute stale time for most queries, longer for static data
4. **Refresh Strategy**: Always call `refetch()` after successful CRUD operations
5. **Loading States**: Use `isLoading` state for UI feedback
6. **API Integration**: Prefer `waldur-js-client` over direct fetch calls
7. **Form Validation**: Use async validation with API dependency checking

This data loading architecture demonstrates the application's comprehensive utilization of modern React patterns for seamless API integrations.
