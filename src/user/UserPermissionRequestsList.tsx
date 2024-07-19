import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { RoleField } from '@waldur/invitations/RoleField';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import {
  USER_PERMISSION_REQUESTS_FILTER_FORM_ID,
  USER_PERMISSION_REQUESTS_TABLE_ID,
} from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

import { UserPermissionRequestsListFilter } from './UserPermissionRequestsListFilter';

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
  useTitle(translate('Permission requests'));
  const filter = useSelector(mapStateToProps);
  const props = useTable({
    table: USER_PERMISSION_REQUESTS_TABLE_ID,
    fetchData: createFetcher('user-permission-requests'),
    filter,
  });
  const columns = [
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
    {
      title: translate('Organization'),
      render: ({ row }) => row.customer_name,
    },
    {
      title: translate('Scope'),
      render: ({ row }) => row.scope_name || 'N/A',
    },
    {
      title: translate('Role'),
      render: ({ row }) => <RoleField invitation={row} />,
    },
    {
      title: translate('Reviewed by'),
      render: ({ row }) => row.reviewed_by_full_name || 'N/A',
    },
    {
      title: translate('Reviewed at'),
      render: ({ row }) =>
        row.reviewed_at ? formatDateTime(row.reviewed_at) : 'N/A',
    },
    {
      title: translate('Comment'),
      render: ({ row }) => row.review_comment || 'N/A',
    },
    {
      title: translate('State'),
      render: PermissionRequestStateField,
      filter: 'state',
    },
  ];
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('user permission requests')}
      showPageSizeSelector={true}
      filters={<UserPermissionRequestsListFilter />}
    />
  );
};
