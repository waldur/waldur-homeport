import { FunctionComponent, memo, useMemo } from 'react';
import { OpenStackNetwork, OpenstackNetworksListData } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CreateNetworkAction } from '../openstack-tenant/actions/CreateNetworkAction';

import { NetworkRBACList } from './NetworkRBACList';

const ExpandableRow = ({ row }) => (
  <ResourceSummary
    resource={row}
    extraTabs={[
      {
        title: translate('Network sharing (RBAC)'),
        eventKey: 'rbac',
        component: () => <NetworkRBACList network={row} />,
      },
    ]}
  />
);

const ExpandableRowMemo = memo(ExpandableRow);

export const TenantNetworksList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackNetworksListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'is_external',
        'type',
        // @ts-ignore
        'segmentation_id',
        'mtu',
        'subnets',
        'state',
        'error_message',
        'resource_type',
        'service_name',
        'service_settings',
        'service_settings_uuid',
        'service_settings_state',
        'service_settings_error_message',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-networks',
    fetchData: createFetcher('openstack-networks'),
    filter,
  });
  return (
    <Table<OpenStackNetwork>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name,
        },
        {
          title: translate('Subnets'),
          render: ({ row }) =>
            row.subnets
              .map((subnet) => `${subnet.name}: ${subnet.cidr}`)
              .join(', ') || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Is external'),
          render: ({ row }) => <BooleanField value={row.is_external} />,
        },
      ]}
      verboseName={translate('networks')}
      title={translate('Networks')}
      showPageSizeSelector
      tableActions={
        <CreateNetworkAction resource={resourceScope} refetch={props.fetch} />
      }
      rowActions={({ row }) => (
        <ActionButtonResource url={row.url} refetch={props.fetch} />
      )}
      expandableRow={ExpandableRowMemo}
    />
  );
};
