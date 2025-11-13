import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { userPermissionRequestsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import {
  USER_PERMISSION_REQUESTS_FILTER_FORM_ID,
  USER_PERMISSION_REQUESTS_TABLE_ID,
} from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

import { UserPermissionRequestActions } from './UserPermissionRequestActions';
import { UserPermissionRequestExpandableRow } from './UserPermissionRequestExpandableRow';
import { UserPermissionRequestsListFilter } from './UserPermissionRequestsListFilter';
import { getStates } from './UserPermissionRequestsStateFilter';

const mapStateToProps = createSelector(
  getUser,
  getFormValues(USER_PERMISSION_REQUESTS_FILTER_FORM_ID),
  (user, filterValues: any) => {
    const filter: Record<string, string> = {
      created_by: user?.uuid,
    };
    if (filterValues && filterValues.state) {
      filter.state = filterValues.state.map((option) => option.value);
    }
    return filter;
  },
);

export const UserPermissionRequestsList = () => {
  const filter = useSelector(mapStateToProps);
  const props = useTable({
    table: USER_PERMISSION_REQUESTS_TABLE_ID,
    fetchData: createFetcher(userPermissionRequestsList),
    filter,
  });
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Date of request'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Type'),
      render: ({ row }) =>
        row.role_name.startsWith('PROJECT')
          ? translate('Project')
          : row.role_name.startsWith('CUSTOMER')
            ? translate('Organization')
            : row.role_name,
    },
    {
      title: translate('Status'),
      render: PermissionRequestStateField,
      filter: 'state',
      inlineFilter: (row) => getStates().filter((s) => s.value === row.state),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('user permission requests')}
      showPageSizeSelector={true}
      filters={<UserPermissionRequestsListFilter />}
      rowActions={UserPermissionRequestActions}
      expandableRow={UserPermissionRequestExpandableRow}
    />
  );
};
