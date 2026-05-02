# API Integration Agent

Use this agent for data fetching with React Query, API client usage, caching strategies, and CRUD operation patterns with the Waldur backend.

## Specialization

This agent specializes in:

- **React Query/TanStack Query**: Modern data fetching with caching
- **Waldur JS Client**: Typed API client integration
- **Caching Strategies**: Query-based caching and invalidation
- **CRUD Operations**: Create, read, update, delete patterns with refresh
- **Error Handling**: Consistent error display and retry mechanisms
- **Data Loading**: Custom hooks and async form field loading

## When to Use

Use this agent when:

- Implementing data fetching for new components
- Setting up React Query hooks and caching strategies
- Integrating with Waldur JS Client API endpoints
- Handling CRUD operations with proper refresh mechanisms
- Creating custom hooks for data fetching logic
- Debugging API integration issues and error handling

## Data Loading Patterns

### React Query (Modern Approach)

```typescript
const {
  data: projects,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: ['CustomerProjects', selectedCustomer?.uuid],
  queryFn: () => fetchCustomerProjects(selectedCustomer.uuid),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Custom Hook Pattern

```typescript
export const useOrganizationGroups = () => {
  const query = useQuery({
    queryKey: ['organizationGroups'],
    queryFn: () => getAllPages((page) => 
      organizationGroupsList({ query: { page } })
    ),
    staleTime: 5 * 60 * 1000,
  });
  
  // Add business logic and computed properties
  const disabled = query.data?.length === 0;
  return { ...query, disabled };
};
```

### Table Data Loading

Used for table data management with:

- Centralized state in Redux store
- Automatic pagination and filtering
- Periodic polling with `refetchInterval` in React Query

## CRUD Operation Patterns

### Create & Update Operations (Mutations)

Use the custom `useManagedMutation` hook for all mutation requests within modals to handle declarative notifications, table reload, and dialog closure.

```typescript
import { useManagedMutation } from '@/modal/useManagedMutation';

const mutation = useManagedMutation({
  mutationFn: (formData: any) => projectsCreate({ body: formData }),
  successMessage: translate('Created successfully.'),
  errorMessage: translate('Unable to create.'),
  refetch, // Automatically calls refetch() on success
  invalidateQueries: [{ queryKey: ['projects'] }],
});

const onSubmit = async (formData) => {
  await mutation.mutateAsync(formData);
};
```

### Refresh Strategies

- **Explicit Refetch**: `await refetch()` after CRUD operations
- **Table Refresh**: User-initiated refresh buttons
- **Query Invalidation**: `queryClient.invalidateQueries()`
- **Automatic Polling**: Background data updates

## API Client Integration

### Waldur JS Client

- Auto-generated TypeScript client
- Request/response type safety
- Authentication and error interceptors
- Token-based auth with auto-refresh

### Usage Pattern

```typescript
import { projectsCreate, projectsList } from 'waldur-js-client';

const response = await projectsCreate({
  body: {
    name: formData.name,
    customer: formData.customer.url,
  },
});
```

## Caching Strategies

### React Query Cache

- **Query Keys**: `['resource', id]` for cache management
- **Stale Time**: 5 minutes for most queries
- **Background Refetching**: Automatic updates
- **Request Deduplication**: Prevents duplicate requests

### Best Practices

- Use consistent query keys for invalidation
- Set appropriate stale times (5min default, longer for static data)
- Always call `refetch()` after successful CRUD operations
- Handle loading states with `LoadingErred` component

## Error Handling

### Consistent Error Display

```typescript
{loading ? (
  <LoadingSpinner />
) : error ? (
  <LoadingErred
    loadData={refetch}
    message={translate('Unable to load data.')}
  />
) : (
  <DataComponent data={data} />
)}
```

### Global Error Handling

```typescript
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error?.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    },
  }),
});
```
