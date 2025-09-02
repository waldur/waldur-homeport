# API Integration Guide

This guide covers data loading patterns, API client usage, and refresh mechanisms for integrating with the Waldur MasterMind backend.

## API Data Loading and Refresh Patterns

The application uses multiple approaches for loading data from REST APIs in forms and handling data refresh operations, showing evolution from legacy Redux patterns to modern React Query implementations.

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

### Redux/Redux Saga Pattern (Legacy)

Used primarily for table data management:

```typescript
function* fetchList(action) {
  const { table, extraFilter, pullInterval, force } = action.payload;

  try {
    const state = yield select(getTableState(table));
    const request = {
      currentPage: state.pagination.currentPage,
      pageSize: state.pagination.pageSize,
      filter: { ...extraFilter, field: fields },
    };

    const { rows, resultCount } = yield call(options.fetchData, request);
    yield put(actions.fetchListDone(table, entities, order, resultCount));
  } catch (error) {
    yield put(actions.fetchListError(table, error));
  }
}
```

**Characteristics:**

- **Centralized State**: Redux store for table data
- **Automatic Pagination**: Built-in pagination and filtering
- **Request Cancellation**: AbortController support
- **Periodic Polling**: Configurable refresh intervals

## Data Refresh Mechanisms

### CRUD Operations Refresh

**Create Operations:**

```typescript
const onSubmit = async (formData: ProjectFormData) => {
  try {
    const response = await projectsCreate({
      body: {
        name: formData.name,
        description: formData.description,
        customer: formData.customer.url,
      },
    });

    if (refetch) {
      await refetch(); // Refresh parent data
    }

    showSuccess(translate('Project has been created.'));
    closeDialog();
  } catch (e) {
    showErrorResponse(e, translate('Unable to create project.'));
  }
};
```

**Edit Operations:**

```typescript
// Optimistic updates in Redux
yield put(actions.entityUpdate(table, entity));

// Manual refresh after edit
await updateResource(resourceData);
refetch(); // Refresh data
```

**Delete Operations:**

```typescript
await marketplaceProviderOfferingsRemoveOfferingComponent({
  path: { uuid: offering.uuid },
  body: { uuid: component.uuid },
});
refetch(); // Refresh parent data
dispatch(showSuccess(translate('Component has been removed.')));
```

### Refresh Strategies

| Strategy | Implementation | Use Case |
|----------|----------------|----------|
| **Explicit Refetch** | `const { refetch } = useQuery(...); await refetch();` | Manual refresh after CRUD operations |
| **Table Refresh Button** | `<TableRefreshButton onClick={() => props.fetch(true)} />` | User-initiated refresh |
| **Automatic Polling** | `pullInterval` in Redux saga | Real-time data updates |
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

This data loading architecture demonstrates the application's evolution toward modern React patterns while maintaining backward compatibility with existing table infrastructure and Redux-based components.

## Migration Patterns

The application shows clear migration from Redux to React Query:

| Aspect | Redux Pattern | React Query Pattern |
|--------|---------------|---------------------|
| **Data Loading** | Redux actions + sagas | `useQuery` hooks |
| **Caching** | Redux store | Query cache |
| **Error Handling** | Redux error actions | Query error states |
| **Loading States** | Redux loading flags | `isLoading` state |
| **Refresh** | Dispatch actions | `refetch()` function |
| **Polling** | Saga intervals | Query refetch intervals |
