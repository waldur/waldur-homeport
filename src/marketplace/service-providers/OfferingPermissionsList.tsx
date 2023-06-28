import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { OfferingPermissionActions } from '../offerings/details/permissions/OfferingPermissionActions';

import { OFFERING_PERMISSIONS_LIST_ID } from './constants';
import { OfferingPermissionCreateButton } from './OfferingPermissionCreateButton';

const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
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
      hoverableRow={OfferingPermissionActions}
      verboseName={translate('offering permissions')}
      actions={props.isOwnerOrStaff ? <OfferingPermissionCreateButton /> : null}
    />
  );
};

const TableOptions = {
  table: OFFERING_PERMISSIONS_LIST_ID,
  fetchData: createFetcher('marketplace-offering-permissions'),
  mapPropsToFilter: (props) => ({
    customer_uuid: props.customer.uuid,
  }),
};

export const OfferingPermissionsList = connect((state: RootState) => ({
  customer: getCustomer(state),
  isOwnerOrStaff: isOwnerOrStaff(state),
}))(connectTable(TableOptions)(TableComponent));
