import { FunctionComponent, memo, useMemo } from 'react';
import {
  OpenStackNetwork,
  openstackNetworksList,
  OpenstackNetworksListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

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
        'backend_id',
        'type',
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
    fetchData: createFetcher(openstackNetworksList),
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
            renderFieldOrDash(
              row.subnets
                .map((subnet) => `${subnet.name}: ${subnet.cidr}`)
                .join(', '),
            ),
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
        <ActionButtonResource
          url={row.url}
          refetch={props.fetch}
          nestedResource
        />
      )}
      expandableRow={ExpandableRowMemo}
    />
  );
};
