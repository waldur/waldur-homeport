import { FunctionComponent, useMemo } from 'react';
import { OpenStackPort, OpenstackPortsListData } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CreatePortAction } from './actions/CreatePortAction';

export const TenantPortsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackPortsListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'error_message',
        'resource_type',
        'admin_state_up',
        'status',
        'state',
        'service_name',
        'service_settings',
        'service_settings_uuid',
        'service_settings_state',
        'service_settings_error_message',
        'device_id',
        'device_owner',
        'mac_address',
        'network_name',
        'network_uuid',
        'fixed_ips',
        'port_security_enabled',
        'allowed_address_pairs',
        'security_groups',
        'project_uuid',
      ],

      o: ['network_name'],
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-ports',
    fetchData: createFetcher('openstack-ports'),
    queryField: 'query',
    filter,
  });
  return (
    <Table<OpenStackPort>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) => (
            <>
              {row.fixed_ips && row.fixed_ips.length > 0
                ? row.fixed_ips.map((fip) => fip.ip_address).join(', ')
                : 'N/A'}
            </>
          ),
        },
        {
          title: translate('MAC address'),
          render: ({ row }) => <>{row.mac_address || 'N/A'}</>,
        },
        {
          title: translate('Network name'),
          render: ({ row }) => <>{row.network_name || 'N/A'}</>,
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <Badge
              variant={row.status === 'ACTIVE' ? 'success' : 'warning'}
              pill
              outline
            >
              {row.status}
            </Badge>
          ),
        },
        {
          title: translate('Admin state'),
          render: ({ row }) => (
            <Badge
              variant={row.admin_state_up ? 'success' : 'warning'}
              pill
              outline
            >
              {row.admin_state_up ? translate('Active') : translate('Inactive')}
            </Badge>
          ),
        },
        {
          title: translate('Port security enabled'),
          render: ({ row }) => (
            <Badge
              variant={row.port_security_enabled ? 'success' : 'danger'}
              pill
              outline
            >
              {row.port_security_enabled ? translate('Yes') : translate('No')}
            </Badge>
          ),
        },
      ]}
      tableActions={
        <CreatePortAction resource={resourceScope} refetch={props.fetch} />
      }
      rowActions={({ row }) => (
        <ResourceRowActions resource={row} refetch={props.fetch} />
      )}
      hasQuery={true}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
      title={translate('Ports')}
      verboseName={translate('ports')}
      showPageSizeSelector
    />
  );
};
