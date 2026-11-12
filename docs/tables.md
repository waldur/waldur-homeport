# Table Component Documentation

Waldur Homeport uses a unified table structure to display list data, grids, search queries, and custom filters.

To make table integration rules, properties, and layouts easier to navigate, the documentation is divided into **8 modular pillars**:

---

## Documentation Pillars

| Pillar                                                                  | Description                                                                                                                                                                     |
| :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **[Pillar 1: Getting Started](./table/getting-started.md)**             | Core import rules, Null/Empty wrappers (`renderFieldOrDash`), and a basic example.                                                                                              |
| **[Pillar 2: Data Fetching & Type Safety](./table/fetching.md)**        | `fetchData` handlers, `createFetcher` (SDK functions), custom mock fetchers, `createClientPaginatedFetcher` (static lists), search query input (`queryField`), and type safety. |
| **[Pillar 3: Column Setup & Configuration](./table/column-setup.md)**   | Column parameters (width, alignment, copying, ellipsis, click blocking), sorting, optional columns, and key fetching.                                                           |
| **[Pillar 4: Row Actions & Selection](./table/row-actions.md)**         | 3-dots action menus (`ActionsDropdown` + `ActionItem`), row expansion (`isRowExpandable`), multi-select, and bulk toolbars.                                                     |
| **[Pillar 5: Filters & URL Sync](./table/filters.md)**                  | OpenAPI generated filters, Redux caching, syncing to URL query formatting (`uuid::name`), and cell inline filtering.                                                            |
| **[Pillar 6: Visual Customizations](./table/visual-customizations.md)** | Grid layouts (`gridItem` + `gridClassName`), custom empty placeholders, header titles, styling class triggers, and standalone mode.                                             |
| **[Pillar 7: Layout Wrappers & Portals](./table/layout-wrappers.md)**   | Rendering multiple tables within tabs (`TableWithTabs`) and forwarding rendering portals (`portal`).                                                                            |
| **[Pillar 8: Form Integration](./table/form-integration.md)**           | Embedding tables as input fields in `react-final-form` (`fieldType`, `fieldName`, `rowValidate`).                                                                               |

Replacing a raw `<table>`? Start with the
**[Migration guide](./table/migration-guide.md)**: it decides whether the list
becomes `Table`, `SimpleTable`, a form grid or a label/value block.

Changing how the table itself is drawn (cell padding, row backgrounds, pinned
columns, a table nested in something else)? Read
**[Table styling architecture](./table/styling-architecture.md)**: the design
decisions behind the table's markup and custom properties, and what checks them.

---

## Complex Table Example

Below is a complete, real-world example demonstrating how multiple advanced features (automatic titles, filters, subtabs, expandable rows, and optional columns) are combined:

```ts
import { useMemo } from 'react';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { createFetcher } from '@/table/api';
import { useFilterValues } from '@/table/useFilterValues';
import { renderFieldOrDash } from '@/table/utils';
import { Badge } from 'waldur-ui';
import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { ActionItem } from '@/resource/actions/ActionItem';
import { TableTab } from '@/table/types';

// 1. Filter component
const ReviewerPoolFilter = () => (
  <SelectFilter
    title={translate('Status')}
    name="status"
    options={[
      { label: translate('Accepted'), value: 'accepted' },
      { label: translate('Pending'), value: 'pending' },
    ]}
  />
);

// 2. Tabs hook - defines sub-navigation within the table
const usePoolTabs = (): TableTab[] => {
  return useMemo(
    () => [
      {
        key: 'pool',
        title: translate('Pool'),
        params: { tab: 'reviewer-pool', pool_tab: 'pool' },
        default: true,
      },
      {
        key: 'assignments',
        title: translate('Assignments'),
        params: { tab: 'reviewer-pool', pool_tab: 'assignments' },
      },
    ],
    [],
  );
};

// 3. Expandable row component
const ExpandableRow = ({ row }) => (
  <div className="p-4">
    <h6>{row.reviewer_name}</h6>
    <p>Email: {row.reviewer_email}</p>
    <p>Expertise: {row.expertise_areas?.join(', ')}</p>
  </div>
);

// 4. Main Section Component
export const ReviewerPoolSection = ({ call }) => {
  const values = useFilterValues('ReviewerPool');
  const tabs = usePoolTabs();

  // ALWAYS memoize filter queries to prevent infinite re-render loops!
  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      invitation_status: values.status?.value,
    }),
    [call.uuid, values.status],
  );

  const tableProps = useTable({
    table: 'ReviewerPool',
    fetchData: createFetcher(reviewerPoolList),
    filter,
    syncFiltersToURL: true,
  });

  const columns = useMemo(
    () => [
      {
        id: 'reviewer',
        title: translate('Reviewer'),
        render: ({ row }) => (
          <div>
            <div className="fw-bold">{row.reviewer_name}</div>
            <small className="text-quaternary">{row.reviewer_email}</small>
          </div>
        ),
        keys: ['reviewer_name', 'reviewer_email'],
      },
      {
        id: 'status',
        title: translate('Status'),
        render: ({ row }) => (
          <Badge variant={row.status === 'accepted' ? 'success' : 'warning'}>
            {row.status_display}
          </Badge>
        ),
        keys: ['status', 'status_display'],
      },
      {
        id: 'assignments',
        title: translate('Assignments'),
        render: ({ row }) => `${row.current} / ${row.max}`,
        keys: ['current_assignments', 'max_assignments'],
        optional: true,
      },
    ],
    [],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Reviewer pool')}
      tabs={tabs}
      verboseName={translate('reviewers')}
      hasQuery
      hasOptionalColumns
      showPageSizeSelector
      filters={<ReviewerPoolFilter />}
      expandableRow={ExpandableRow}
      tableActions={
        <BaseButton
          variant="primary"
          size="sm"
          onClick={handleInvite}
          label={translate('Invite reviewer')}
        />
      }
    />
  );
};
```

## Where the table lives

The table is the `waldur-table` package (`packages/table`), so micro-apps
([micro-apps.md](micro-apps.md)) use the same one. Inside homeport,
`src/table/<module>.ts` re-exports the package module of the same name, so
`@/table/useTable`, `@/table/api` and the rest import as before. What stays
in `src/table` is homeport's own layer: `Table.tsx` with `TableNav.tsx`
(UI-Router tabs), `TableWithTabs.tsx`, `useFilteredNavigation.ts` and the
generated filters.

A micro-app imports from the package entry point (`import { Table, useTable,
createFetcher } from 'waldur-table'`), puts `tables: tablesReducer` in its
Redux store or wraps itself in a `Provider` with `createTablesStore()`, and
adds `packages/table/src` to its Tailwind `@source` list.

What the package may import:

- Shared code comes from the other packages (`waldur-ui`, `waldur-form`,
  `waldur-api-client`, `waldur-i18n-runtime`, `waldur-notifications`), never
  from `@/…`.
- The table's visible states are waldur-ui components, the same ones the
  portal uses, so a table looks the same in every app: `NoResult` (no rows),
  `ErrorView` (the fetch failed), `CopyToClipboardButton` (a cell's copy
  button) and `MenuActionItem` (the export row; the portal's `ActionItem` is
  built on it).
- What only an app has goes through `TableHost`
  (`packages/table/src/host.tsx`), and that is environment, not UI: the URL,
  the default title, how a dialog's chunk loads, and the message a crashed
  table shows (the portal's has an illustration no package carries; without
  one the table catches nothing and the app's own error boundary does). The
  portal sets these in `src/core/tableHost.ts` (router) and
  `src/core/tableHostComponents.ts` (the other two, which Storybook uses too).
- Tests, stories and their support files sit beside the code in the package
  but run inside homeport, and may use its test harness (`@/test/harness`)
  and a few of its components.

ESLint enforces this (`no-restricted-imports` for `packages/table/src/**` in
`eslint.config.js`). When the table needs something new from an app, add a
member to `TableHost` if it is environment, and move it to a package if it
is a component: a host component would give micro-apps a second, different
version of it.

A test that replaces a table module mocks the package's file, which the
`@/table/…` re-export then passes on:
`vi.mock('waldur-table/src/useTableQuery', () => import('@/table/mockTableQuery'))`.
Mocking `@/table/useTableQuery` would replace only the re-export, and the
table itself would still run the real one.
