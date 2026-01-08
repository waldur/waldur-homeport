# Table component

1. State management is done via `useTable` React hook.
2. Table rendering is done using `Table` component.

```ts
import { rolesList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

export const RolesList = () => {
  const tableProps = useTable({
    table: `RolesList`,
    fetchData: createFetcher(rolesList),
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
        },
        {
          title: translate('Assigned users count'),
          render: ({ row }) => row.users_count,
        },
      ]}
    />
  );
};
```

Column definition consists of two mandatory fields: `title` and `render`.

## fetchData property

The fetchData property is a function that retrieves data for the table. It should return a promise that resolves to an object containing `rows` (required) and optionally `resultCount` and `nextPage` for pagination.

### Using createFetcher with SDK functions

The recommended way is to use `createFetcher` with SDK functions from `waldur-js-client`:

```ts
import { usersList } from 'waldur-js-client';
import { createFetcher } from '@waldur/table/api';

const tableProps = useTable({
  table: 'UsersList',
  fetchData: createFetcher(usersList),
});
```

You can pass options to customize the request:

```ts
import { projectsList } from 'waldur-js-client';

const tableProps = useTable({
  table: 'ProjectsList',
  fetchData: createFetcher(projectsList, {
    // Additional query parameters
    query: { is_active: true },
    // Path parameters for nested resources
    path: { customer_uuid: customerId },
  }),
});
```

### Using a parser to transform response data

When the API returns data in a nested structure, use the `parser` option:

```ts
import { checklistRetrieve } from 'waldur-js-client';

const tableProps = useTable({
  table: 'QuestionsList',
  fetchData: createFetcher(checklistRetrieve, {
    path: { uuid: checklistId },
    // Extract questions array from the response object
    parser: (data) => data.questions,
  }),
});
```

### Custom fetchData function

For static data or custom data sources, create a custom fetcher:

```ts
const fetchData = () => Promise.resolve({
  rows: resource.items,
  resultCount: resource.items.length,
});

const tableProps = useTable({
  table: 'StaticList',
  fetchData,
});
```

## Type safety

The Table component supports TypeScript type inference. When using `createFetcher` with SDK functions, the row type is automatically inferred from the SDK function's return type.

### Automatic type inference

```ts
import { Project, projectsList } from 'waldur-js-client';

const tableProps = useTable({
  table: 'ProjectsList',
  fetchData: createFetcher(projectsList),
});

// columns are type-checked against Project type
<Table
  {...tableProps}
  columns={[
    {
      title: 'Name',
      render: ({ row }) => row.name, // row is typed as Project
    },
    {
      title: 'Invalid',
      render: ({ row }) => row.invalid_field, // TypeScript error!
    },
  ]}
/>
```

### Explicit type parameter

For custom fetchers or when you need explicit typing, use the generic parameter:

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
      render: ({ row }) => row.name, // row is typed as MyRow
    },
  ]}
/>
```

## Export feature

Table component supports data export functionality. To enable it:

1. Add `enableExport` prop to the Table component
2. Configure export options in column definitions:

```ts
{
  title: 'Name',
  render: ({ row }) => row.name,
  export: 'name' // Use field directly
}

{
  title: 'Status',
  render: ({ row }) => row.status,
  export: row => formatStatus(row.status) // Custom formatter
}

{
  title: 'Actions',
  render: ({ row }) => <Button/>,
  export: false // Exclude from export
}
```

Optionally, specify `exportTitle` property for columns to customize the header in the exported file:

```ts
{
  title: 'Name',
  render: ({ row }) => row.name,
  export: 'name',
  exportTitle: 'User Name' // Custom header for export
}
```

## Optional columns

Table component supports optional columns that can be toggled by users. Optional columns allow users to customize their view by showing/hiding specific columns.

1. Add `hasOptionalColumns` prop to enable optional columns functionality
2. Configure columns with:

    - `id` - unique column identifier
    - `keys` - defines which fields should be requested from API (allows optimization by fetching only needed fields)
    - `optional` - mark column as optional to allow toggling

3. For actions column, you can specify mandatory fields that should always be fetched from API using `mandatoryFields` prop.

Example:

```ts
export const UsersTable = () => {
  const tableProps = useTable({
    table: 'users',
    fetchData: createFetcher(usersList),
  });

  return (
    <Table
      {...tableProps}
      hasOptionalColumns
      mandatoryFields={['uuid', 'name']}
      columns={[
        {
          id: 'name',
          title: translate('Name'),
          render: ({ row }) => row.name,
          optional: true,
          keys: ['name'],
        },
        {
          id: 'email',
          title: translate('Email'),
          render: ({ row }) => row.email,
          optional: true,
          keys: ['email'],
        },
        {
          id: 'role',
          title: translate('Role'),
          render: ({ row }) => row.role,
          optional: true,
          keys: ['role', 'permissions'],
        },
      ]}
    />
  );
};
```

## Ordering feature

Table component supports column ordering. To enable it:

1. Add `orderField` property to columns that should be sortable
2. Clicking on column headers will toggle between ascending and descending order

Example:

```ts
export const UsersTable = () => {
  const tableProps = useTable({
    table: 'users',
    fetchData: createFetcher(usersList),
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Email'),
          render: ({ row }) => row.email,
          orderField: 'email',
        },
      ]}
    />
  );
};
```

## Filters feature

Filters are defined using the `filters` prop of the Table component. This prop accepts a React component that renders the filter UI.

Example:

```ts
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

const getFilterValues = getFormValues('FilterForm');

export const FilterSet = () => (
  <TableFilterItem title="Filter field" name="custom">
    <Field name="custom" component="input" />
  </TableFilterItem>
);

export const FilteredList = () => {
  const filter = useSelector(getFilterValues);
  const tableProps = useTable({
    table: 'FilteredList',
    fetchData: createFetcher(hooksList),
    filter,
  });

  return (
    <Table
      {...tableProps}
      filters={<FilterSet />}
    />
  );
};
```

### Filter positions

The `filterPosition` prop controls where filters are displayed:

| Position | Behavior |
|----------|----------|
| `header` | Filters always visible in card header |
| `menu` | Filters in dropdown menu, toggled with filter button |
| `sidebar` | Filters in drawer/sidebar panel |

### Filter storage and badges

When filters are applied, they are stored in `filtersStorage` (Redux state) which is used to:

- Display filter badges/chips in the filter bar
- Show filter count on the filter toggle button
- Auto-expand the filter bar when filters are loaded from URL

The flow:

```text
User changes filter field
    ↓
Redux Form stores value
    ↓
TableFilterItem calls setFilter() → updates filtersStorage[]
    ↓
Table re-fetches with new filter
    ↓
Filter badges rendered from filtersStorage
```

### URL query parameter sync

Filters can be synced to URL query parameters for shareable links. Use utilities from `@waldur/core/filters`:

```ts
import {
  syncFiltersToURL,
  useReinitializeFilterFromUrl,
  getQueryParams,
} from '@waldur/core/filters';

const FILTER_FORM_ID = 'MyFilterForm';

export const MyList = () => {
  // Load filters from URL on mount and route changes
  useReinitializeFilterFromUrl(FILTER_FORM_ID);

  const formValues = useSelector(getFormValues(FILTER_FORM_ID));

  // Sync filter changes to URL
  useEffect(() => {
    if (formValues) {
      syncFiltersToURL(formValues);
    }
  }, [formValues]);

  // ... rest of component
};
```

#### URL format

Filters are stored in URL query parameters with compact encoding:

| Value type | URL format | Example |
|------------|------------|---------|
| String | Direct value | `?name=test` |
| Object with uuid | `uuid::name` | `?org=abc123::My+Org` |
| Array | JSON encoded | `?tags=["a","b"]` |
| Boolean | `true`/`false` | `?active=true` |

The compact `uuid::name` format keeps URLs shorter while preserving display names for filter badges.

#### Navigation behavior

When navigating between pages in the SPA:

1. **URL params persist** - query string is preserved during navigation
2. **Form re-initialization** - `useReinitializeFilterFromUrl` re-populates the form when route changes
3. **Auto-show filter bar** - when `filtersStorage` has items, the filter bar auto-expands

```text
Page A with filter → Navigate to Page B → Navigate back to Page A
     ↓                      ↓                      ↓
URL updated            URL preserved         URL read, form populated
with filters           (SPA routing)         filtersStorage updated
                                             Table re-fetches
```

### Default/initial filters

To set default filter values that can be overridden by URL params:

```ts
const defaultValues = { status: 'active' };

// URL params take precedence over defaults
useReinitializeFilterFromUrl(FILTER_FORM_ID, defaultValues);
```

### Cross-page filters (Resources sidebar)

The Resources sidebar filter (`src/navigation/sidebar/resources-filter/`) is a special case that:

1. Syncs `organization` and `project` filters across multiple resource tables
2. Persists to **localStorage** for session persistence
3. Syncs to URL for shareable links

Priority order:

1. **URL params** (highest) - for shareable links
2. **localStorage** - for session persistence
3. **No filter** - shows all resources

### Inline filters

The feature allows users to quickly filter table data by clicking values directly in the table cells, without manually setting filters. When column has `inlineFilter` property enabled:

1. A filter icon appears when hovering over cells in that column
2. Clicking the icon adds a filter using the cell's value
3. The `inlineFilter` function transforms row data into the filter value format

Example:

```ts
{
  title: translate('Organization'),
  render: ({ row }) => row.customer_name,
  filter: 'organization',  // Enable filtering
  inlineFilter: (row) => ({
    // Transform row data into filter value
    name: row.customer_name,
    uuid: row.customer_uuid
  })
}
```

## Grid mode

Table component supports switching between table and grid views. In grid mode, data is displayed as cards in a responsive grid layout.

To enable grid mode:

1. Add `gridItem` prop to specify the component used to render each item in grid view
2. Optionally customize grid layout using `gridSize` prop which accepts Bootstrap column properties
3. Set `initialMode` to 'grid' if you want grid view by default (table view is default)

Example:

```ts
export const GridListItem = ({ row }) => (
  <Card>
    <CardHeader>{row.name}</CardHeader>
    <CardBody>
      <p>{row.description}</p>
      <small>Users: {row.users_count}</small>
    </CardBody>
  </Card>
);

export const GridList = () => {
  const tableProps = useTable({
    table: 'GridList',
    fetchData: createFetcher(itemsList),
  });

  return (
    <Table
      {...tableProps}
      gridItem={GridListItem}
      gridSize="col-sm-6 col-md-4"
      initialMode="grid"
    />
  );
};
```
