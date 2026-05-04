import { FunctionComponent, useMemo } from 'react';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersList,
  OpenstackLoadbalancersListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceRowActions } from '@/resource/actions/ResourceRowActions';
import { ResourceState } from '@/resource/state/ResourceState';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreateLoadBalancerAction } from './actions/CreateLoadBalancerAction';
import { LoadBalancerExpandableRow } from './LoadBalancerExpandableRow';
import { OperatingStatusBadge } from './OperatingStatusBadge';

export const TenantLoadBalancersList: FunctionComponent<{
  resourceScope;
}> = ({ resourceScope }) => {
  const filter = useMemo(
    (): OpenstackLoadbalancersListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'backend_id',
        'name',
        'description',
        'created',
        'state',
        'tenant_uuid',
        'error_message',
        'vip_address',
        'vip_port',
        'vip_subnet',
        'operating_status',
        'provisioning_status',
        'attached_floating_ip',
        'project_uuid',
        'resource_type',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-loadbalancers',
    fetchData: createFetcher(openstackLoadbalancersList),
    queryField: 'name',
    filter,
  });
  return (
    <Table<OpenStackLoadBalancer>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('VIP address'),
          render: ({ row }) => renderFieldOrDash(row.vip_address),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <OperatingStatusBadge status={row.operating_status} />
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceState
              resource={{
                ...row,
                resource_type: row.resource_type || 'OpenStack.LoadBalancer',
                state: row.state,
                runtime_state:
                  row.provisioning_status || row.operating_status || undefined,
              }}
            />
          ),
        },
      ]}
      verboseName={translate('load balancers')}
      title={translate('Load balancers')}
      tableActions={
        <CreateLoadBalancerAction
          resource={resourceScope}
          refetch={props.fetch}
        />
      }
      rowActions={({ row }) => (
        <ResourceRowActions resource={row} refetch={props.fetch} />
      )}
      expandableRow={LoadBalancerExpandableRow}
      hideExpandToggle
      hasQuery={true}
      showPageSizeSelector
    />
  );
};
