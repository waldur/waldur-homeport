import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { marketplaceOfferingPermissionsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { getCustomer } from '@/workspace/selectors';

import { OfferingPermissionActions } from '../offerings/details/permissions/OfferingPermissionActions';

import { OFFERING_PERMISSIONS_LIST_ID } from './constants';
import { OfferingPermissionCreateButton } from './OfferingPermissionCreateButton';

const getFilter = createSelector(getCustomer, (customer) => ({
  customer: customer.uuid,
}));

export const OfferingPermissionsList: FunctionComponent = () => {
  const filter = useSelector(getFilter);

  const tableProps = useTable({
    table: OFFERING_PERMISSIONS_LIST_ID,
    fetchData: createFetcher(marketplaceOfferingPermissionsList),
    filter,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Offering'),
          render: ({ row }) => row.offering_name,
        },
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
      ]}
      rowActions={OfferingPermissionActions}
      verboseName={translate('offering permissions')}
      tableActions={<OfferingPermissionCreateButton fetch={tableProps.fetch} />}
    />
  );
};
