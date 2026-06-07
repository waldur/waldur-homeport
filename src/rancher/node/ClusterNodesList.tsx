import { FunctionComponent, useMemo } from 'react';
import {
  RancherCluster,
  RancherNode,
  rancherNodesList,
  RancherNodesListData,
} from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { INSTANCE_TYPE } from '@/openstack/constants';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

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
    fetchData: createFetcher(rancherNodesList),
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
                state="marketplace-resource-details"
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
