import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { RootState } from '@waldur/store/reducers';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import {
  USER_PERMISSIONS_FILTER_FORM_ID,
  USER_PERMISSIONS_TABLE_ID,
} from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

const TableComponent = (props: any) => {
  const columns = [
    {
      title: translate('Scope'),
      render: ({ row }) => row.project_name || row.customer_name,
    },
    {
      title: translate('Role'),
      render: ({ row }) => row.project_role || row.customer_role,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
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
      render: ({ row }) => row.review_comment,
    },
    {
      title: translate('State'),
      render: PermissionRequestStateField,
    },
  ];
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('user permission requests')}
      showPageSizeSelector={true}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, string> = {
    created_by: props.user?.uuid,
  };
  if (props.filter && props.filter.state) {
    filter.state = props.filter.state.map((option) => option.value);
  }
  return filter;
};

const TableOptions: TableOptionsType = {
  table: USER_PERMISSIONS_TABLE_ID,
  fetchData: createFetcher('user-permission-requests'),
  mapPropsToFilter,
};

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
  filter: getFormValues(USER_PERMISSIONS_FILTER_FORM_ID)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const UserPermissionsList = enhance(TableComponent);
