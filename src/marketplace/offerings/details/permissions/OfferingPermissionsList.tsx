import { useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { OfferingPermissionActions } from './OfferingPermissionActions';
import { OfferingPermissionCreateButton } from './OfferingPermissionCreateButton';

export const OfferingPermissionsList = ({ offering }) => {
  const filter = useMemo(() => ({ offering: offering.uuid }), [offering]);
  const tableProps = useTable({
    table: 'marketplace-offering-permissions',
    fetchData: createFetcher(`marketplace-offering-permissions`),
    filter,
  });
  const columns = [
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name || row.user_email,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Expires at'),
      render: ({ row }) =>
        row.expiration_time ? formatDateTime(row.expiration_time) : 'N/A',
    },
  ];
  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Offering permissions')}
      verboseName={translate('Offering permissions')}
      showPageSizeSelector={true}
      tableActions={
        <OfferingPermissionCreateButton
          offering={offering}
          refetch={tableProps.fetch}
        />
      }
      rowActions={OfferingPermissionActions}
    />
  );
};
