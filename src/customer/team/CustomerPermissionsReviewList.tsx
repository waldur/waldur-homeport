import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ReviewCloseButton } from './ReviewCloseButton';

const mapStateToProps = createSelector(getCustomer, (customer) => ({
  customer_uuid: customer.uuid,
  o: '-created',
}));

export const CustomerPermissionsReviewList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToProps);
  const props = useTable({
    table: 'customer-permissions-reviews',
    fetchData: createFetcher('customer-permissions-reviews'),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
          export: (row) => formatDateTime(row.created),
        },
        {
          title: translate('Performed'),
          render: ({ row }) => (
            <>{row.closed ? formatDateTime(row.closed) : 'N/A'}</>
          ),
          export: (row) => (row.closed ? formatDateTime(row.closed) : 'N/A'),
        },
        {
          title: translate('Performed by'),
          render: ({ row }) => <>{row.reviewer_full_name || 'N/A'}</>,
          export: (row) => row.reviewer_full_name || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <>
              {row.is_pending ? translate('Pending') : translate('Performed')}
            </>
          ),
          export: (row) =>
            row.is_pending ? translate('Pending') : translate('Performed'),
        },
      ]}
      verboseName={translate('permission reviews')}
      hoverableRow={({ row }) => (
        <>
          {row.is_pending ? <ReviewCloseButton reviewId={row.uuid} /> : 'N/A'}
        </>
      )}
      enableExport
    />
  );
};
