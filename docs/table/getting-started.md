# Table Component: Getting Started

Waldur Homeport uses a unified table structure to display lists and grid data.

- State management and API integration are handled via the `useTable` React hook.
- Table rendering is done using the `Table` component.

---

## Core Guidelines

To maintain UI/UX consistency and code quality across the application, always follow these core principles:

1. **Imports from subpaths**: Do not use the barrel `@/table` import for core table components. Always import them from their specific subpaths.

   ```ts
   import Table from '@/table/Table';
   import { useTable } from '@/table/useTable';
   import { createFetcher } from '@/table/api';
   import { ActionsDropdown } from '@/table/ActionsDropdown';
   ```

   *Note: Filter components (like `StringFilter`, `SelectFilter`) are barrel-exported and can be imported from `@/table`, but manual filter creation is deprecated in favor of generated filters.*

2. **Null/Empty Values**: Never display raw null/undefined/empty string values or fallbacks like `|| 'N/A'`. Always wrap cell outputs with the `renderFieldOrDash` utility from `@/table/utils`.

   ```ts
   import { renderFieldOrDash } from '@/table/utils';
   // ...
   render: ({ row }) => renderFieldOrDash(row.description)
   ```

3. **Memoize Filters**: Always wrap filter objects in `useMemo` to prevent infinite re-renders when passing them to `useTable`.

4. **Generated Table Filters**: Never write manual filter components. Always define and generate filters based on the OpenAPI schema.

5. **3-Dots Row Actions**: Use the standard `ActionsDropdown` + `ActionItem` pattern for all row actions. Standalone inline buttons are discouraged.

---

## Basic Table Example

Here is a standard implementation of a resource list showing simple text fields:

```ts
import { rolesList } from 'waldur-js-client';

import { translate } from '@/i18n';
import Table from '@/table/Table';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

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
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
        },
        {
          title: translate('Assigned users count'),
          render: ({ row }) => renderFieldOrDash(row.users_count),
        },
      ]}
    />
  );
};
```

Column definitions require two mandatory fields: `title` (column header label) and `render` (cell content rendering component/function).
