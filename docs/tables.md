# Table component

1. State management is done via `useTable` React hook.
2. Table rendering is done using `Table` component.

```ts
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const RolesList = () => {
  const tableProps = useTable({
    table: `RolesList`,
    fetchData: createFetcher('roles'),
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
In order to be able to make column optional, please specify `hasOptionalColumns` property for table and ensure that `key` property is defined for columns.
