import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { USER_PERMISSION_REQUESTS_TABLE_ID } from '@waldur/invitations/constants';
import { PermissionRequestStateField } from '@waldur/invitations/PermissionRequestStateField';
import { UserPermissionRequestRowActions } from '@waldur/invitations/UserPermissionRequestRowActions';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

interface OwnProps {
  groupInvitationUuid: string;
}

const TableComponent = (props: any) => {
  const columns = [
    {
      title: translate('Created by'),
      render: ({ row }) => row.created_by_full_name,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
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
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <UserPermissionRequestRowActions row={row} refreshList={props.fetch} />
      ),
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

const TableOptions: TableOptionsType = {
  table: USER_PERMISSION_REQUESTS_TABLE_ID,
  fetchData: createFetcher('user-permission-requests'),
  mapPropsToFilter: (props: OwnProps) => ({
    invitation: props.groupInvitationUuid,
  }),
  mapPropsToTableId: (props: OwnProps) => [props.groupInvitationUuid],
};

const enhance = compose(
  connect<{}, {}, OwnProps>(null),
  connectTable(TableOptions),
);

export const UserPermissionRequestsList = enhance(TableComponent);
