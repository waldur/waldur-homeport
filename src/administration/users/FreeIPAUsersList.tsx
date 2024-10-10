import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';

export const FreeIPAUsersList = () => {
  const tableProps = useTable({
    table: `FreeIPAUsersList`,
    fetchData: createFetcher('freeipa-profiles'),
    queryField: 'query',
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => row.user_full_name,
          keys: ['user_full_name'],
          id: 'user_full_name',
        },
        {
          title: translate('User UUID'),
          render: ({ row }) => row.user_uuid,
          copyField: (row) => row.user_uuid,
          optional: true,
          keys: ['user_uuid'],
          id: 'user_uuid',
        },
        {
          title: translate('UUID'),
          render: ({ row }) => row.uuid,
          copyField: (row) => row.uuid,
          optional: true,
          keys: ['uuid'],
          id: 'uuid',
        },
        {
          title: translate('User username'),
          render: ({ row }) => row.user_username,
          copyField: (row) => row.user_username,
          optional: true,
          keys: ['user_username'],
          id: 'user_username',
        },
        {
          title: translate('Username'),
          render: ({ row }) => row.username,
          copyField: (row) => row.username,
          keys: ['username'],
          id: 'username',
        },
        {
          title: translate('Active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
          keys: ['is_active'],
          id: 'is_active',
        },
        {
          title: translate('Agreement date'),
          render: ({ row }) => formatDateTime(row.agreement_date),
          keys: ['agreement_date'],
          id: 'agreement_date',
        },
      ]}
      verboseName={translate('FreeIPA Users')}
      title={translate('FreeIPA Users')}
      showPageSizeSelector={true}
      hasQuery
      hasOptionalColumns
    />
  );
};
