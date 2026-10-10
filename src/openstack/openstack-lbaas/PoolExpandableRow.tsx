import { FC, useMemo } from 'react';
import {
  OpenStackHealthMonitor,
  OpenStackPool,
  OpenStackPoolMember,
  openstackHealthMonitorsList,
  openstackPoolMembersList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceState } from '@/resource/state/ResourceState';
import { createFetcher } from '@/table/api';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { HealthMonitorRowActions } from './HealthMonitorRowActions';
import { MemberRowActions } from './MemberRowActions';
import { OperatingStatusBadge } from './OperatingStatusBadge';

interface PoolExpandableRowProps {
  row: OpenStackPool;
}

const MembersTable: FC<{ poolUuid: string }> = ({ poolUuid }) => {
  const filter = useMemo(() => ({ pool_uuid: poolUuid }), [poolUuid]);
  const tableProps = useTable({
    table: `pool-members-${poolUuid}`,
    fetchData: createFetcher(openstackPoolMembersList),
    filter,
  });

  return (
    <Table<OpenStackPoolMember>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Address'),
          render: ({ row }) => renderFieldOrDash(row.address),
        },
        {
          title: translate('Port'),
          render: ({ row }) => renderFieldOrDash(row.protocol_port),
        },
        {
          title: translate('Weight'),
          render: ({ row }) => renderFieldOrDash((row as any).weight),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <OperatingStatusBadge status={row.operating_status} />
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('members')}
      rowActions={MemberRowActions}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
    />
  );
};

const HealthMonitorTable: FC<{ poolUuid: string }> = ({ poolUuid }) => {
  const filter = useMemo(() => ({ pool_uuid: poolUuid }), [poolUuid]);
  const tableProps = useTable({
    table: `pool-healthmonitors-${poolUuid}`,
    fetchData: createFetcher(openstackHealthMonitorsList),
    filter,
  });

  return (
    <Table<OpenStackHealthMonitor>
      {...tableProps}
      columns={[
        {
          title: translate('Type'),
          render: ({ row }) => renderFieldOrDash(row.type),
        },
        {
          title: translate('Delay (s)'),
          render: ({ row }) => renderFieldOrDash(row.delay),
        },
        {
          title: translate('Timeout (s)'),
          render: ({ row }) => renderFieldOrDash(row.timeout),
        },
        {
          title: translate('Max retries'),
          render: ({ row }) => renderFieldOrDash(row.max_retries),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <OperatingStatusBadge status={row.operating_status} />
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceState resource={row} />,
        },
      ]}
      verboseName={translate('health monitors')}
      rowActions={HealthMonitorRowActions}
      hasActionBar={false}
      minHeight="auto"
      initialPageSize={5}
    />
  );
};

export const PoolExpandableRow: FC<PoolExpandableRowProps> = ({ row }) => {
  return (
    <ExpandableContainer>
      <EmbeddedTabs
        defaultValue="members"
        listClassName="mb-4"
        tabs={[
          {
            key: 'members',
            title: translate('Members'),
            content: <MembersTable poolUuid={row.uuid} />,
          },
          {
            key: 'health-monitor',
            title: translate('Health Monitor'),
            content: <HealthMonitorTable poolUuid={row.uuid} />,
          },
        ]}
      />
    </ExpandableContainer>
  );
};
