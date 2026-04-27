import { useMemo } from 'react';
import { marketplaceOfferingPermissionsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { OfferingPermissionActions } from './OfferingPermissionActions';
import { OfferingPermissionCreateButton } from './OfferingPermissionCreateButton';

export const OfferingPermissionsList = ({ offering }) => {
  const filter = useMemo(() => ({ offering: offering.uuid }), [offering]);
  const tableProps = useTable({
    table: 'marketplace-offering-permissions',
    fetchData: createFetcher(marketplaceOfferingPermissionsList),
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
