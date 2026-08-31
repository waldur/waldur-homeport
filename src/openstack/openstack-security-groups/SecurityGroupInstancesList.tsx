import { FC, useCallback, useMemo } from 'react';
import {
  OpenStackInstance,
  OpenStackNestedPort,
  OpenStackSecurityGroup,
  openstackInstancesList,
  OpenstackInstancesListData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ModalActionsRouter } from '@/marketplace/resources/actions/ModalActionsRouter';
import { IPList } from '@/resource/IPList';
import { ResourceName } from '@/resource/ResourceName';
import { ResourceState } from '@/resource/state/ResourceState';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { INSTANCE_TYPE } from '../constants';

const formatSubnet = (port: OpenStackNestedPort) =>
  port.subnet_cidr
    ? `${port.subnet_name} (${port.subnet_cidr})`
    : port.subnet_name;

const InternalIps: FC<{ ports: OpenStackNestedPort[] }> = ({ ports }) => {
  const portsWithIps = ports.filter((port) => port.fixed_ips?.length);
  if (!portsWithIps.length) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  return (
    <>
      {portsWithIps.map((port) => (
        <div key={port.url}>
          <IPList value={port.fixed_ips.map((fixedIp) => fixedIp.ip_address)} />
          {port.subnet_name ? (
            <span className="text-muted ms-1 text-nowrap">
              {formatSubnet(port)}
            </span>
          ) : null}
        </div>
      ))}
    </>
  );
};

export const SecurityGroupInstancesList: FC<{
  row: OpenStackSecurityGroup;
  /** Refreshes the groups table, whose instance count this list can change. */
  refetchGroups?: (force?: boolean) => void;
}> = ({ row, refetchGroups }) => {
  const filter = useMemo(
    (): OpenstackInstancesListData['query'] => ({
      security_group_uuid: row.uuid,
      field: [
        'uuid',
        'url',
        'name',
        'state',
        'runtime_state',
        'resource_type',
        'error_message',
        'ports',
        'external_ips',
        'marketplace_resource_uuid',
        'project_uuid',
      ],
    }),
    [row.uuid],
  );
  const props = useTable({
    table: `security-group-instances-${row.uuid}`,
    fetchData: createFetcher(openstackInstancesList),
    filter,
  });
  const refetch = useCallback(() => {
    props.fetch();
    refetchGroups?.();
  }, [props.fetch, refetchGroups]);
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
          title: translate('Internal IPs'),
          render: ({ row }) => <InternalIps ports={row.ports} />,
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
      rowActions={({ row }) => (
        <ModalActionsRouter
          url={row.url}
          name={row.name}
          offering_type={INSTANCE_TYPE}
          refetch={refetch}
        />
      )}
      verboseName={translate('instances')}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
    />
  );
};
