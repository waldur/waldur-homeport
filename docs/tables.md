# Table Component Documentation

Waldur Homeport uses a unified table structure to display list data, grids, search queries, and custom filters.

To make table integration rules, properties, and layouts easier to navigate, the documentation is divided into **8 modular pillars**:

---

## Documentation Pillars

| Pillar | Description |
| :--- | :--- |
| **[Pillar 1: Getting Started](./table/getting-started.md)** | Core import rules, Null/Empty wrappers (`renderFieldOrDash`), and a basic example. |
| **[Pillar 2: Data Fetching & Type Safety](./table/fetching.md)** | `fetchData` handlers, `createFetcher` (SDK functions), custom mock fetchers, `createClientPaginatedFetcher` (static lists), search query input (`queryField`), and type safety. |
| **[Pillar 3: Column Setup & Configuration](./table/column-setup.md)** | Column parameters (width, alignment, copying, ellipsis, click blocking), sorting, optional columns, and key fetching. |
| **[Pillar 4: Row Actions & Selection](./table/row-actions.md)** | 3-dots action menus (`ActionsDropdown` + `ActionItem`), row expansion (`isRowExpandable`), multi-select, and bulk toolbars. |
| **[Pillar 5: Filters & URL Sync](./table/filters.md)** | OpenAPI generated filters, Redux caching, syncing to URL query formatting (`uuid::name`), and cell inline filtering. |
| **[Pillar 6: Visual Customizations](./table/visual-customizations.md)** | Grid layouts (`gridItem` + `gridSize` + `gridSpace`), custom empty placeholders, header titles, styling class triggers, and standalone mode. |
| **[Pillar 7: Layout Wrappers & Portals](./table/layout-wrappers.md)** | Rendering multiple tables within tabs (`TableWithTabs`) and forwarding rendering portals (`portal`). |
| **[Pillar 8: Form Integration](./table/form-integration.md)** | Embedding tables as input fields in `react-final-form` (`fieldType`, `fieldName`, `rowValidate`). |

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
import { Badge } from 'react-bootstrap';
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
            <small className="text-muted">{row.reviewer_email}</small>
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
        <button className="btn btn-primary btn-sm" onClick={handleInvite}>
          {translate('Invite reviewer')}
        </button>
      }
    />
  );
};
```
