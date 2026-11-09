# Table Component: Filters & URL Sync

Filters allow users to slice datasets and sync selections across page refreshes.

> [!IMPORTANT]
> **Schema-Driven Filters**: Table filters must be **generated automatically from the OpenAPI schema**. Manually writing filter components is deprecated.
> Refer to the [Migration to Generated Table Filters](filter-migration-guide.md) guide for details on configuring and running `node generate-filters.cjs`.

---

## Filter Integration Pattern

To integrate a generated filter:

1. Fetch the active values using `useFilterValues(tableId)`.
2. Map the Redux filter values to query params using the generated selector `select{Name}Filter`.
3. **Always memoize the filter object** to prevent unnecessary API fetches and infinite re-render loops.
4. Pass the filter object to `useTable` and the generated filter component to the `Table` component.

```ts
import { useMemo } from 'react';
import Table from '@/table/Table';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { useFilterValues } from '@/table/useFilterValues';
import { renderFieldOrDash } from '@/table/utils';
import { usersList } from 'waldur-js-client';

// Import generated component and selector
import { UsersFilter, selectUsersFilter } from './generated/UsersFilter';

export const FilteredUsersList = () => {
  const values = useFilterValues('users');

  // ALWAYS memoize the filter query parameters!
  const filter = useMemo(() => selectUsersFilter(values), [values]);

  const tableProps = useTable({
    table: 'users',
    fetchData: createFetcher(usersList),
    filter,
    syncFiltersToURL: true, // Enables deep linking
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
      ]}
      filters={<UsersFilter />}
    />
  );
};
```

---

## Filter Layout Positions

The `filterPosition` prop controls where the filter fields are displayed:

| Position  | Behavior                                                            |
| --------- | ------------------------------------------------------------------- |
| `header`  | Filters are always visible inside the Card Header area.             |
| `menu`    | Filters are housed in a dropdown menu, toggled via a filter button. |
| `sidebar` | Filters open inside a sliding side drawer/panel.                    |

---

## URL Synchronization

Filters can be synced to URL query parameters for shareable links by setting `syncFiltersToURL: true` inside `useTable` options:

```ts
const tableProps = useTable({
  table: 'MyList',
  fetchData: createFetcher(myList),
  syncFiltersToURL: true,
  initialFilters: { status: 'active' }, // Default fallback values
});
```

When enabled:

- Initial load populates the Redux store from URL search params.
- Filter badges/chips are automatically displayed in the filter bar.
- SPA navigation preserves query strings, restoring filter states on page reload or back navigation.

### URL Compact Serialization Format

Filters are stored in URL query parameters with compact encoding:

| Value Type       | URL Format                     | Example                     |
| ---------------- | ------------------------------ | --------------------------- |
| String           | Direct value                   | `?name=test`                |
| Object with UUID | `uuid::name`                   | `?org=abc123::My+Org`       |
| Array of objects | `[uuid1::name1, uuid2::name2]` | `?tags=["a1::T1","a2::T2"]` |
| Boolean          | `true`/`false`                 | `?active=true`              |

The compact `uuid::name` format keeps URLs shorter while preserving display names for filter badges without needing additional API lookup calls.

---

## Cross-Page Filters (Resources Sidebar)

The Resources sidebar filter (`src/navigation/sidebar/resources-filter/`) is a special case that:

1. Syncs `organization` and `project` filters across multiple resource tables.
2. Persists selections to `localStorage` for session persistence.
3. Syncs parameters to the URL for shareable links.

Priority resolution order:

1. **URL params** (highest) - for shareable links.
2. **localStorage** - for session persistence.
3. **No filter** - shows all resources.

---

## Inline Filters

Users can quickly filter table data by clicking values directly in the table cells, without opening filter menus. When a column configuration has `inlineFilter` and `filter` enabled:

1. A filter icon appears when hovering over cells in that column.
2. Clicking the icon adds a filter using the cell's value.
3. The `inlineFilter` function transforms row data into the required filter value format.

```ts
{
  title: translate('Organization'),
  render: ({ row }) => renderFieldOrDash(row.customer_name),
  filter: 'organization',  // The filter parameter name in Redux
  inlineFilter: (row) => ({
    name: row.customer_name,
    uuid: row.customer_uuid
  })
}
```

## Filter facets

A filter can offer only the values that still have rows under the table's
other filters and search, each with its count. The list endpoint has to
serve a `facets` action (mastermind's `FacetsMixin`, see
`waldur_core/core/facets.py`), which counts every facet under all filters
except its own, so a selection can always be changed.

Opt the table in by passing the SDK's `…FacetsList` function, and each
filter by naming its facet:

```tsx
// Module level, or memoized: it is part of the facet query key.
const offeringFacets = { fetch: marketplacePublicOfferingsFacetsList };

const props = useTable({
  table: 'PublicOfferingsList',
  fetchData: createFetcher(marketplacePublicOfferingsList),
  queryField: 'keyword',
  filter,
  facets: offeringFacets,
});

<SelectFilter name="state" facet="state" options={states} isMulti />
<AsyncSelectFilter
  name="category"
  facet="category"
  facetOption={facetOption('uuid', 'title')}
  getOptionValue={(option) => option.uuid}
  getOptionLabel={(option) => option.title}
  loadOptions={categoryAutocomplete()}
/>
```

- A filter asks for its own facet when it mounts, which is when it is
  opened, with exactly the params the table fetches its rows with (`filter`
  plus the search term). Fixed params that `createFetcher` adds itself go in
  `facets.query`, path params of a nested list in `facets.path`.
- `SelectFilter` keeps the options the facet has, plus the current selection.
  `AsyncSelectFilter` lists the facet's values instead of calling
  `loadOptions`: `facetOption(valueKey, labelKey)` builds its option shape
  from a facet value. A truncated facet is searched on the server.
- Counts show in the menu only, not in the chip, through
  `formatOptionLabel`; a filter that passes its own still draws the label,
  and the count follows it.
- A `SelectFilter` without `options` lists the facet's values themselves,
  built with `facetOption` (default `{ value, label }`): for values only the
  server knows, such as a status synced from a service desk.
- Without `facets` on the table, or without `facet` on the filter, the filter
  behaves as before, so a filter component shared by several tables can name
  its facet once.
- Generated filters take `facet: <name>` in `generate-filters-config.yaml`.
