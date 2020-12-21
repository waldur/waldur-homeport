import { FunctionComponent } from 'react';

import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { RolesRenderer } from './RolesRenderer';
import { UserDetailsButton } from './UserDetailsButton';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <>{row.full_name}</>,
        },
        {
          title: translate('Username'),
          render: ({ row }) => <>{row.user_name}</>,
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
  mapPropsToFilter: (props) => ({
    cluster_uuid: props.resource.uuid,
  }),
  exportFields: ['Full name', 'Username'],
  exportRow: (row) => [row.full_name, row.user_name],
  queryField: 'user_username',
};

export const ClusterUsersList = connectTable(TableOptions)(TableComponent);
