import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { AddResourceButton } from '@waldur/marketplace/resources/actions/AddResourceButton';
import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import { IPList } from '@waldur/resource/IPList';
import { ResourceName } from '@waldur/resource/ResourceName';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { ResourceSummaryField } from '@waldur/resource/summary/VirtualMachineSummary';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { INSTANCE_TYPE } from '../constants';

export const TenantInstancesList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      service_settings_uuid: resourceScope.child_settings,
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'internal_ips',
        'external_ips',
        'state',
        'runtime_state',
        'resource_type',
        'error_message',
        'image_name',
        'flavor_name',
        'cores',
        'ram',
        'start_time',
        'resource_state',
        'volumes',
        'security_groups',
        'backend_id',
        'marketplace_resource_uuid',
        'key_name',
        'project_uuid',
      ],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstacktenant-instances',
    fetchData: createFetcher('openstacktenant-instances'),
    queryField: 'name',
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <ResourceName resource={row} />,
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
      verboseName={translate('instances')}
      tableActions={
        <AddResourceButton
          resource={resourceScope}
          offeringType={INSTANCE_TYPE}
        />
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
