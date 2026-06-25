# Table Agent Guide

This guide outlines constraints, checks, and rules for LLM agents implementing table views, grid layouts, filters, actions, and wrapper components.

---

## Specialization & Scope

Use this agent guide for:
- Implementing list and grid views using the standard `Table` component and `useTable` hook.
- Writing row action components (`ActionsDropdown` + `ActionItem`) and bulk select actions.
- Integrating auto-generated OpenAPI filters.
- Resolving rendering performance bugs, infinite re-render loops, and state-sync errors.

---

## Documentation Sitemap

For detailed specifications, options tables, callbacks, and integrations, **always read** the corresponding modular guide in the repository:

- **Getting Started & Core Rules**: [getting-started.md](../../docs/table/getting-started.md)
- **Data Integration & Fetching API**: [fetching.md](../../docs/table/fetching.md)
- **Columns Setup & Attributes**: [column-setup.md](../../docs/table/column-setup.md)
- **Row Actions, Expander, & Selection**: [row-actions.md](../../docs/table/row-actions.md)
- **OpenAPI Filters & URL Parameter Sync**: [filters.md](../../docs/table/filters.md)
- **Grid View, Placeholders, & Layout Options**: [visual-customizations.md](../../docs/table/visual-customizations.md)
- **TableWithTabs Layout & Portals**: [layout-wrappers.md](../../docs/table/layout-wrappers.md)
- **Final-Form & Validation Integration**: [form-integration.md](../../docs/table/form-integration.md)
- **Combined Complex Blueprint**: [tables.md](../../docs/tables.md)

---

## Critical Rules for LLM Agents

### 1. Core Component Imports (No Barrel Imports)
There is no barrel export for core table components. **NEVER** import them from `@/table`. Always import them from their exact subpaths:
```typescript
// ✅ CORRECT
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { createFetcher } from '@/table/api';
import { ActionsDropdown } from '@/table/ActionsDropdown';

// ❌ WRONG
import { Table, useTable, createFetcher, ActionsDropdown } from '@/table';
```

### 2. Preventing Infinite Re-render Loops (Memoize Filters)
The `filter` object passed to `useTable` **MUST** be wrapped in `useMemo`. If you pass a raw object literal, it will have a new identity on every render, triggering an endless fetch loop.
```typescript
// ❌ WRONG - Triggers infinite API requests
const filter = { customer_uuid: customer.uuid };
const tableProps = useTable({ table: 'list', fetchData, filter });

// ✅ CORRECT
const filter = useMemo(
  () => ({ customer_uuid: customer.uuid }),
  [customer.uuid],
);
const tableProps = useTable({ table: 'list', fetchData, filter });
```

### 3. Null and Empty Value Handling
Never display raw values directly, and do not use fallbacks like `|| 'N/A'`. **ALWAYS** wrap cell output renders with the `renderFieldOrDash` utility.
```typescript
import { renderFieldOrDash } from '@/table/utils';

// ✅ CORRECT
render: ({ row }) => renderFieldOrDash(row.description)

// ❌ WRONG
render: ({ row }) => row.description || 'N/A'
```

### 4. Row Action Patterns
All row actions **MUST** use the 3-dots dropdown menu pattern (`ActionsDropdown` + `ActionItem`). Individual inline buttons (e.g. `<ActionButton>`) are discouraged in standard row cells.
```typescript
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { ActionItem } from '@/resource/actions/ActionItem';

// ✅ CORRECT
rowActions={({ row }) => (
  <ActionsDropdown row={row} refetch={tableProps.fetch}>
    <ActionItem
      title={translate('Delete')}
      action={() => handleDelete(row)}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
    />
  </ActionsDropdown>
)}
```

### 5. Table Filters Creation
Do **NOT** write manual filter components. All filters must be generated from the OpenAPI schema.
1. Configure overrides in `generate-filters-config.yaml`.
2. Run `node generate-filters.cjs`.
3. Import the generated filter and selector from `@/table/generated/*`.

---

## Scaffolding Blueprint (Copy-Paste Template)

```tsx
import { useMemo } from 'react';
import { usersList } from 'waldur-js-client';

import { translate } from '@/i18n';
import Table from '@/table/Table';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { useFilterValues } from '@/table/useFilterValues';
import { renderFieldOrDash } from '@/table/utils';

import { UsersFilter, selectUsersFilter } from './generated/UsersFilter';
import { RowActions } from './RowActions';

export const UsersList = () => {
  const values = useFilterValues('users');

  // ALWAYS memoize filter objects to prevent infinite render loops!
  const filter = useMemo(() => selectUsersFilter(values), [values]);

  const tableProps = useTable({
    table: 'users',
    fetchData: createFetcher(usersList),
    filter,
    syncFiltersToURL: true,
  });

  const columns = useMemo(
    () => [
      {
        id: 'name',
        title: translate('Name'),
        render: ({ row }) => renderFieldOrDash(row.name),
        orderField: 'name',
      },
      {
        id: 'email',
        title: translate('Email'),
        render: ({ row }) => renderFieldOrDash(row.email),
        optional: true,
        keys: ['email'],
      },
    ],
    [],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Users')}
      filters={<UsersFilter />}
      hasQuery
      hasOptionalColumns
      rowActions={({ row }) => <RowActions row={row} refetch={tableProps.fetch} />}
    />
  );
};
```

---

## Agent Troubleshooting Checklist

- [ ] **Are there endless API calls?**
  *Check*: Ensure the `filter` object passed to `useTable` is memoized with `useMemo`. Ensure callbacks like `onFetch` or inline handlers are stable.
- [ ] **Are fields blank in optional columns or exports?**
  *Check*: When `hasOptionalColumns` is enabled, the Table component queries the API for specific fields to optimize payload size. If a column renders a nested field or uses properties not specified in `keys` (or `mandatoryFields` / `exportKeys`), those fields will be missing from the API response. Add all required fields to `keys` or `exportKeys`.
- [ ] **Do imports fail?**
  *Check*: Make sure `Table`, `useTable`, `createFetcher`, and `ActionsDropdown` are imported directly from subpaths, not barrel `@/table`.
- [ ] **Do subtabs lose context?**
  *Check*: Make sure parent URL parameters are explicitly preserved in nested tab `params`.
- [ ] **Does table actions portal display empty?**
  *Check*: Ensure the child table forwarded the `portal` prop passed by the parent `TableWithTabs` layout.
