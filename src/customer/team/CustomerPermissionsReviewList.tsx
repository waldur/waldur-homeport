import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer } from '@waldur/workspace/selectors';

import { ReviewCloseButton } from './ReviewCloseButton';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Created'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
        {
          title: translate('Performed'),
          render: ({ row }) =>
            row.closed ? formatDateTime(row.closed) : 'N/A',
        },
        {
          title: translate('Performed by'),
          render: ({ row }) => row.reviewer_full_name || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) =>
            row.is_pending ? translate('Pending') : translate('Performed'),
        },
        {
          title: translate('Actions'),
          render: ({ row }) =>
            row.is_pending ? <ReviewCloseButton reviewId={row.uuid} /> : 'N/A',
        },
      ]}
      verboseName={translate('permission reviews')}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'customer-permissions-reviews',
  fetchData: createFetcher('customer-permissions-reviews'),
  mapPropsToFilter: (props) => ({
    customer_uuid: props.customer.uuid,
    o: '-created',
  }),
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const CustomerPermissionsReviewList = enhance(TableComponent);
