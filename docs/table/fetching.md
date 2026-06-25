# Table Component: Data Fetching & Type Safety

Data retrieval is configured via the `fetchData` option of the `useTable` hook.

---

## The `fetchData` Property

The `fetchData` function is responsible for retrieving and returning paginated/filtered data for the table. It must return a promise that resolves to an object containing:

- `rows` (array): The rows to render for the current page.
- `resultCount` (number, optional): The total count of rows across all pages (required for pagination).
- `nextPage` (number, optional): Page number of the next page of results.

### 1. Using `createFetcher` with SDK Functions (Recommended)

The standard approach is to pass an API client list function from `waldur-js-client` to `createFetcher`:

```ts
import { usersList } from 'waldur-js-client';
import { createFetcher } from '@/table/api';

const tableProps = useTable({
  table: 'UsersList',
  fetchData: createFetcher(usersList),
});
```

#### Customizing Query and Path Parameters

You can pass query overrides and path parameters for nested API endpoints:

```ts
import { projectsList } from 'waldur-js-client';

const tableProps = useTable({
  table: 'ProjectsList',
  fetchData: createFetcher(projectsList, {
    // Permanent query parameters
    query: { is_active: true },
    // Path parameters mapped to nested endpoints, e.g. /customers/{customer_uuid}/projects/
    path: { customer_uuid: customerId },
  }),
});
```

#### Mapping Nested Arrays via `parser`

If the API returns a nested response (an object instead of a direct array), use `parser` to extract the rows array:

```ts
import { checklistRetrieve } from 'waldur-js-client';

const tableProps = useTable({
  table: 'QuestionsList',
  fetchData: createFetcher(checklistRetrieve, {
    path: { uuid: checklistId },
    // Extract array from nested checklist object response
    parser: (data) => data.questions,
  }),
});
```

---

### 2. Custom fetchData Implementation

For custom client-side mock-ups or custom HTTP requests:

```ts
const fetchData = (request) => {
  // request contains tableKey, currentPage, pageSize, filter, sorting, query
  return Promise.resolve({
    rows: localItems.slice(0, 10),
    resultCount: localItems.length,
  });
};

const tableProps = useTable({
  table: 'CustomList',
  fetchData,
});
```

---

### 3. Client-Side Paginated Fetcher for Static Data

For static or local arrays that require full pagination, client-side sorting, and search matching, use `createClientPaginatedFetcher`:

```ts
import { createClientPaginatedFetcher } from '@/table/api';

const myStaticItems = [
  { uuid: '1', name: 'Item A', value: 10 },
  { uuid: '2', name: 'Item B', value: 20 },
];

const tableProps = useTable({
  table: 'StaticList',
  fetchData: createClientPaginatedFetcher(myStaticItems, {
    queryField: 'name', // Enables search query matching on the 'name' field
  }),
});
```

---

### 4. Search Query Input (`queryField`)

If you enable text-based search queries on the table (by passing the `hasQuery` prop to the `Table` component), you **must** specify `queryField` in the `useTable` options. This instructs `useTable` which query parameter name to use when passing the search term in the API request:

```ts
const tableProps = useTable({
  table: 'UsersList',
  fetchData: createFetcher(usersList),
  queryField: 'name', // Maps search term to '?name=<search_term>'
});
```

---

## Type Safety

The Table component supports TypeScript type inference.

### 1. Automatic Type Inference

When using `createFetcher` with SDK functions, the row type is automatically inferred from the SDK function's return type:

```ts
import { Project, projectsList } from 'waldur-js-client';

const tableProps = useTable({
  table: 'ProjectsList',
  fetchData: createFetcher(projectsList),
});

// columns are automatically type-checked against the Project type
<Table
  {...tableProps}
  columns={[
    {
      title: 'Name',
      render: ({ row }) => renderFieldOrDash(row.name), // row is typed as Project
    },
    {
      title: 'Invalid',
      render: ({ row }) => row.non_existent_field, // TypeScript error!
    },
  ]}
/>
```

### 2. Explicit Type Parameter

For custom fetchers or when you need explicit control, pass the generic row type directly to `Table`:

```ts
interface MyRow {
  id: string;
  name: string;
}

<Table<MyRow>
  {...tableProps}
  columns={[
    {
      title: 'Name',
      render: ({ row }) => renderFieldOrDash(row.name), // row is typed as MyRow
    },
  ]}
/>
```
