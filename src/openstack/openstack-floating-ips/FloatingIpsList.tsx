import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import {
  OpenStackFloatingIp,
  openstackFloatingIpsList,
  OpenstackFloatingIpsListData,
} from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { ResourceState } from '@/resource/state/ResourceState';
import { ResourceSummary } from '@/resource/summary/ResourceSummary';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { INSTANCE_TYPE } from '../constants';
import { CreateFloatingIpAction } from '../openstack-tenant/actions/CreateFloatingIpAction';
import { PullFloatingIpsAction } from '../openstack-tenant/actions/PullFloatingIpsAction';

import { DestroyBulkFloatingIpsAction } from './DestroyBulkFloatingIpsAction';

export const FloatingIpsList: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const filter = useMemo(
    (): OpenstackFloatingIpsListData['query'] => ({
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
        'runtime_state',
        'address',
        'instance_uuid',
        'instance_name',
        'project_uuid',
        'port_fixed_ips',
        'backend_id',
      ],
    }),
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'openstack-floating-ips',
    fetchData: createFetcher(openstackFloatingIpsList),
    filter,
  });
  return (
    <Table<OpenStackFloatingIp>
      {...tableProps}
      columns={[
        {
          title: translate('Floating IP'),
          render: ({ row }) => <>{row.name}</>,
          copyField: (row) => row.name || '',
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
        {
          title: translate('Internal address'),
          render: ({ row }) => (
            <>
              {row.port_fixed_ips && row.port_fixed_ips.length > 0
                ? row.port_fixed_ips.map((fip) => fip.ip_address).join(', ')
                : 'N/A'}
            </>
          ),
          copyField: (row) =>
            row.port_fixed_ips && row.port_fixed_ips.length > 0
              ? row.port_fixed_ips.map((fip) => fip.ip_address).join(', ')
              : '',
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
      verboseName={translate('floating IPs')}
      title={translate('Floating IPs')}
      showPageSizeSelector
      tableActions={
        <ButtonGroup>
          <PullFloatingIpsAction resource={resourceScope} />
          <CreateFloatingIpAction
            resource={resourceScope}
            refetch={tableProps.fetch}
          />
        </ButtonGroup>
      }
      rowActions={({ row }) => (
        <ActionButtonResource url={row.url} refetch={tableProps.fetch} />
      )}
      enableMultiSelect
      multiSelectActions={DestroyBulkFloatingIpsAction}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};
