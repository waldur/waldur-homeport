import { FunctionComponent, useMemo } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { INSTANCE_TYPE } from '../constants';
import { CreateFloatingIpAction } from '../openstack-tenant/actions/CreateFloatingIpAction';
import { PullFloatingIpsAction } from '../openstack-tenant/actions/PullFloatingIpsAction';

export const FloatingIpsList: FunctionComponent<{ resourceScope }> = ({
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
        'runtime_state',
        'address',
        'instance_uuid',
        'instance_name',
        'project_uuid',
      ],
    }),
    [resourceScope],
  );
  const tableProps = useTable({
    table: 'openstack-floating-ips',
    fetchData: createFetcher('openstack-floating-ips'),
    filter,
  });
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Floating IP'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
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
      verboseName={translate('floating IPs')}
      tableActions={
        <ButtonGroup>
          <PullFloatingIpsAction resource={resourceScope} />
          <CreateFloatingIpAction resource={resourceScope} />
        </ButtonGroup>
      }
      rowActions={({ row }) => (
        <ActionButtonResource url={row.url} refetch={tableProps.fetch} />
      )}
      expandableRow={({ row }) => <ResourceSummary resource={row} />}
    />
  );
};
