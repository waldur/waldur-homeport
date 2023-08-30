import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { RoleCreateButton } from './RoleCreateButton';
import { RoleDeleteButton } from './RoleDeleteButton';
import { RoleEditButton } from './RoleEditButton';

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
      ]}
      verboseName={translate('roles')}
      hoverableRow={({ row }) => (
        <>
          <RoleEditButton row={row} refetch={tableProps.fetch} />
          <RoleDeleteButton row={row} refetch={tableProps.fetch} />
        </>
      )}
      showPageSizeSelector={true}
      actions={<RoleCreateButton refetch={tableProps.fetch} />}
    />
  );
};
