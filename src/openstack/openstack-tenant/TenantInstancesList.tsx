import { FunctionComponent, useMemo } from 'react';
import {
  OpenStackInstance,
  openstackInstancesList,
  OpenstackInstancesListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { AddResourceButton } from '@/marketplace/resources/actions/AddResourceButton';
import { ModalActionsRouter } from '@/marketplace/resources/actions/ModalActionsRouter';
import { HypervisorPlacementMapButton } from '@/openstack/openstack-tenant/HypervisorPlacementMapButton';
import { IPList } from '@/resource/IPList';
import { ResourceName } from '@/resource/ResourceName';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { ResourceSummaryField } from '@/resource/summary/VirtualMachineSummary';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { INSTANCE_TYPE } from '../constants';

export const TenantInstancesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackInstancesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'ports',
        'internal_ips',
        'external_ips',
        'external_address',
        'state',
        'runtime_state',
        'resource_type',
        'error_message',
        'image_name',
        'flavor_name',
        'cores',
        'ram',
        'start_time',
        'volumes',
        'security_groups',
        'server_group',
        'backend_id',
        'marketplace_resource_uuid',
        'key_name',
        'project_uuid',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-instances',
    fetchData: createFetcher(openstackInstancesList),
    queryField: 'query',
    filter,
  });
  return (
    <Table<OpenStackInstance>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
          copyField: (row) => row.name,
        },
        {
          title: translate('Summary'),
          render: ({ row }) => <ResourceSummaryField resource={row} />,
        },
        {
          title: translate('Internal IPs'),
          render: ({ row }) => <IPList value={row.internal_ips} />,
        },
        {
          title: translate('External IPs'),
          render: ({ row }) => <IPList value={row.external_ips} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      title={translate('Instances')}
      verboseName={translate('instances')}
      tableActions={
        <>
          <HypervisorPlacementMapButton tenantUuid={resourceScope.uuid} />
          <AddResourceButton
            resource={resourceScope}
            offeringType={INSTANCE_TYPE}
          />
        </>
      }
      rowActions={({ row }) => (
        <ModalActionsRouter
          url={row.url}
          name={row.name}
          offering_type={INSTANCE_TYPE}
          refetch={props.fetch}
        />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      hasQuery={true}
      showPageSizeSelector={true}
    />
  );
};
