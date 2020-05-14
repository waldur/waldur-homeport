import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { NestedListActions } from '@waldur/resource/actions/NestedListActions';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Table, connectTable, createFetcher } from '@waldur/table-react';

import { NodeRoleField } from './NodeRoleField';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Node'),
          render: ({ row }) => <ResourceName resource={row} />,
        },
        {
          title: translate('Roles'),
          render: ({ row }) => <NodeRoleField node={row} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Instance'),
          render: ({ row }) => {
            if (!row.instance_uuid) {
              return translate('Not assigned');
            }
            return (
              <Link
                state="resources.details"
                params={{
                  uuid: row.instance_uuid,
                  resource_type: 'OpenStackTenant.Instance',
                }}
                label={row.instance_name}
              />
            );
          },
        },
        {
          title: translate('Actions'),
          render: ({ row }) => <ResourceRowActions resource={row} />,
        },
      ]}
      verboseName={translate('Kubernetes nodes')}
      actions={<NestedListActions resource={props.resource} tab="nodes" />}
    />
  );
};

const TableOptions = {
  table: 'rancher-nodes',
  fetchData: createFetcher('rancher-nodes'),
  mapPropsToFilter: props => ({
    cluster_uuid: props.resource.uuid,
  }),
};

export const ClusterNodesList = connectTable(TableOptions)(TableComponent);
