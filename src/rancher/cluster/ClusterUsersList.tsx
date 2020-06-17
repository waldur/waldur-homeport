import * as React from 'react';

import { RolesRenderer } from '@waldur/rancher/cluster/RolesRenderer';
import { UserDetailsButton } from '@waldur/rancher/cluster/UserDetailsButton';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { DASH_ESCAPE_CODE } from '@waldur/table-react/constants';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <span>{row.full_name}</span>,
        },
        {
          title: translate('Username'),
          render: ({ row }) => <span>{row.user_name}</span>,
        },
        {
          title: translate('Cluster roles'),
          render: ({ row }) =>
            row.cluster_roles.length ? (
              <RolesRenderer roles={row.cluster_roles} />
            ) : (
              DASH_ESCAPE_CODE
            ),
        },
        {
          title: translate('Project roles'),
          render: ({ row }) =>
            row.project_roles.length ? (
              <RolesRenderer roles={row.project_roles} />
            ) : (
              DASH_ESCAPE_CODE
            ),
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <UserDetailsButton user={row} />,
        },
      ]}
      verboseName={translate('users')}
      hasQuery={true}
    />
  );
};

const TableOptions = {
  table: 'rancher-cluster-users',
  fetchData: createFetcher('rancher-users'),
  exportFields: ['Full name', 'Username'],
  exportRow: row => [row.full_name, row.user_name],
  queryField: 'user_username',
};

export const ClusterUsersList = connectTable(TableOptions)(TableComponent);
