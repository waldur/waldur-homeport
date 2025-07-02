import { FunctionComponent, useMemo } from 'react';
import {
  RancherCluster,
  RancherNode,
  RancherNodesListData,
} from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { CreateNodeAction } from '../cluster/actions/CreateNodeAction';

import { NodeRoleField } from './NodeRoleField';

export const ClusterNodesList: FunctionComponent<
  TableWithPortal<{ resourceScope: RancherCluster }>
> = ({ resourceScope, portal }) => {
  const filter = useMemo(
    () =>
      ({
        // ManagedRancher marketplace resource scope is a Rancher marketplace resource
        // and not a Rancher cluster directly because of uniqueness constraint.
        // We need to use resource_uuid from the scope to filter security groups.
        cluster_uuid: resourceScope['resource_uuid'] || resourceScope.uuid,
      }) satisfies RancherNodesListData['query'],
    [resourceScope],
  );
  const props = useTable({
    table: 'rancher-nodes',
    fetchData: createFetcher('rancher-nodes'),
    filter,
  });

  return (
    <Table<RancherNode>
      {...props}
      columns={[
        {
          title: translate('Node'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('Roles'),
          render: ({ row }) => <NodeRoleField node={row} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row as any} />,
        },
        {
          title: translate('Instance'),
          render: ({ row }) => {
            if (!row.instance_uuid) {
              return <>{translate('Not assigned')}</>;
            }
            return (
              <Link
                state="resource-details"
                params={{
                  uuid: row.project_uuid,
                  resource_uuid: row.instance_uuid,
                  resource_type: INSTANCE_TYPE,
                }}
                label={row.instance_name}
              />
            );
          },
        },
      ]}
      verboseName={translate('Kubernetes nodes')}
      showPageSizeSelector
      tableActions={<CreateNodeAction resource={resourceScope} />}
      rowActions={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
