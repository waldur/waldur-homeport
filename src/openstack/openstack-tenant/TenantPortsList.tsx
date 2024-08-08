import { FunctionComponent, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceRowActions } from '@waldur/resource/actions/ResourceRowActions';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { Port } from '../types';

import { ExpandablePortRow } from './ExpandablePortRow';

export const TenantPortsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    () => ({
      tenant_uuid: resourceScope.uuid,
      field: [
        'uuid',
        'url',
        'name',
        'description',
        'created',
        'error_message',
        'resource_type',
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
      o: 'network_name',
    }),
    [resourceScope],
  );
  const props = useTable({
    table: 'openstack-ports',
    fetchData: createFetcher('openstack-ports'),
    filter,
  });
  return (
    <Table<Port>
      {...props}
      columns={[
        {
          title: translate('IP address'),
          render: ({ row }) => (
            <>
              {row.fixed_ips.map((fip) => fip.ip_address).join(', ') || 'N/A'}
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
      ]}
      rowActions={({ row }) => (
        <ResourceRowActions resource={row} refetch={props.fetch} />
      )}
      expandableRow={ExpandablePortRow}
      verboseName={translate('ports')}
    />
  );
};
